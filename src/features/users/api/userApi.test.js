import { describe, it, expect, vi, beforeEach } from "vitest";
import userApi from "./userApi";
import { fetchApi } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

describe("userApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getUsers memanggil GET /users dan mengembalikan daftar pengguna", async () => {
    fetchApi.mockResolvedValue({ data: { users: [{ id: 1 }, { id: 2 }] } });

    const users = await userApi.getUsers();

    expect(fetchApi).toHaveBeenCalledWith("/users");
    expect(users).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("getMe memanggil GET /users/me dan mengembalikan profil", async () => {
    fetchApi.mockResolvedValue({ data: { user: { id: 1, name: "Budi" } } });

    const user = await userApi.getMe();

    expect(fetchApi).toHaveBeenCalledWith("/users/me");
    expect(user).toEqual({ id: 1, name: "Budi" });
  });

  it("putMe memanggil PUT /users/me dengan nama dan email", async () => {
    fetchApi.mockResolvedValue({ message: "Profil diperbarui" });

    const message = await userApi.putMe({ name: "Budi", email: "budi@b.com" });

    expect(fetchApi).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "Budi", email: "budi@b.com" },
    });
    expect(message).toBe("Profil diperbarui");
  });

  it("postMePhoto mengirim file sebagai FormData dengan field 'photo'", async () => {
    fetchApi.mockResolvedValue({ message: "Foto diperbarui" });
    const file = new File(["x"], "foto.png", { type: "image/png" });

    const message = await userApi.postMePhoto(file);

    const [path, options] = fetchApi.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("photo").name).toBe("foto.png");
    expect(message).toBe("Foto diperbarui");
  });

  it("putMePassword mengubah newPassword menjadi new_password", async () => {
    fetchApi.mockResolvedValue({ message: "Kata sandi diperbarui" });

    const message = await userApi.putMePassword({
      password: "lama123",
      newPassword: "baru123",
    });

    expect(fetchApi).toHaveBeenCalledWith("/users/me/password", {
      method: "PUT",
      body: { password: "lama123", new_password: "baru123" },
    });
    expect(message).toBe("Kata sandi diperbarui");
  });

  it("meneruskan error dari fetchApi", async () => {
    fetchApi.mockRejectedValue(new Error("Tidak diizinkan"));

    await expect(userApi.getUsers()).rejects.toThrow("Tidak diizinkan");
  });
});