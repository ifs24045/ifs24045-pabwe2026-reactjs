import { describe, it, expect, vi, beforeEach } from "vitest";
import authApi from "./authApi";
import { fetchApi } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("postLogin", () => {
    it("memanggil POST /auth/login tanpa token dan mengembalikan token", async () => {
      fetchApi.mockResolvedValue({ data: { token: "token-123" } });

      const token = await authApi.postLogin({ email: "a@b.com", password: "123456" });

      expect(fetchApi).toHaveBeenCalledWith("/auth/login", {
        method: "POST",
        body: { email: "a@b.com", password: "123456" },
        auth: false,
      });
      expect(token).toBe("token-123");
    });

    it("meneruskan error dari fetchApi", async () => {
      fetchApi.mockRejectedValue(new Error("Email atau kata sandi salah"));

      await expect(
        authApi.postLogin({ email: "a@b.com", password: "salah" })
      ).rejects.toThrow("Email atau kata sandi salah");
    });
  });

  describe("postRegister", () => {
    it("memanggil POST /auth/register tanpa token dan mengembalikan pesan", async () => {
      fetchApi.mockResolvedValue({ message: "Akun berhasil dibuat" });

      const message = await authApi.postRegister({
        name: "Budi",
        email: "budi@b.com",
        password: "123456",
      });

      expect(fetchApi).toHaveBeenCalledWith("/auth/register", {
        method: "POST",
        body: { name: "Budi", email: "budi@b.com", password: "123456" },
        auth: false,
      });
      expect(message).toBe("Akun berhasil dibuat");
    });

    it("meneruskan error dari fetchApi", async () => {
      fetchApi.mockRejectedValue(new Error("Email sudah terdaftar"));

      await expect(
        authApi.postRegister({ name: "Budi", email: "budi@b.com", password: "123456" })
      ).rejects.toThrow("Email sudah terdaftar");
    });
  });
});