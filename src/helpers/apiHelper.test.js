import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  buildQuery,
  fetchApi,
} from "./apiHelper";

function mockFetch(json, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => json,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("apiHelper", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("token di localStorage", () => {
    it("mengembalikan null jika token belum ada", () => {
      expect(getAccessToken()).toBeNull();
    });

    it("menyimpan dan membaca token", () => {
      putAccessToken("abc123");

      expect(getAccessToken()).toBe("abc123");
    });

    it("menghapus token", () => {
      putAccessToken("abc123");
      removeAccessToken();

      expect(getAccessToken()).toBeNull();
    });
  });

  describe("buildQuery", () => {
    it("mengembalikan string kosong jika tidak ada params", () => {
      expect(buildQuery()).toBe("");
      expect(buildQuery({})).toBe("");
    });

    it("menyusun query string dari object", () => {
      expect(buildQuery({ status: "lost", is_me: 1 })).toBe("?status=lost&is_me=1");
    });

    it("melewati nilai kosong, null, dan undefined", () => {
      expect(buildQuery({ a: "", b: null, c: undefined, d: "ok" })).toBe("?d=ok");
    });

    it("tetap menyertakan nilai 0", () => {
      expect(buildQuery({ is_completed: 0 })).toBe("?is_completed=0");
    });
  });

  describe("fetchApi", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("memanggil URL dasar + path dan mengembalikan JSON", async () => {
      const fetchMock = mockFetch({ message: "ok", data: { id: 1 } });

      const result = await fetchApi("/users/me");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/users/me`);
      expect(fetchMock.mock.calls[0][1].method).toBe("GET");
      expect(result).toEqual({ message: "ok", data: { id: 1 } });
    });

    it("menambahkan query params ke URL", async () => {
      const fetchMock = mockFetch({ data: {} });

      await fetchApi("/lost-founds", { params: { status: "found" } });

      expect(fetchMock.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/lost-founds?status=found`);
    });

    it("menyertakan header Bearer jika token tersedia", async () => {
      putAccessToken("token-xyz");
      const fetchMock = mockFetch({ data: {} });

      await fetchApi("/users/me");

      expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer token-xyz");
    });

    it("tidak menyertakan Authorization jika token tidak ada", async () => {
      const fetchMock = mockFetch({ data: {} });

      await fetchApi("/users/me");

      expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
    });

    it("tidak menyertakan Authorization jika auth: false", async () => {
      putAccessToken("token-xyz");
      const fetchMock = mockFetch({ data: {} });

      await fetchApi("/auth/login", { method: "POST", body: { a: 1 }, auth: false });

      expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
    });

    it("mengirim body object sebagai JSON", async () => {
      const fetchMock = mockFetch({ data: {} });

      await fetchApi("/auth/login", {
        method: "POST",
        body: { email: "a@b.com", password: "123456" },
        auth: false,
      });

      const options = fetchMock.mock.calls[0][1];
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(options.body).toBe(JSON.stringify({ email: "a@b.com", password: "123456" }));
    });

    it("mengirim FormData apa adanya tanpa Content-Type", async () => {
      const fetchMock = mockFetch({ data: {} });
      const formData = new FormData();
      formData.append("cover", new File(["x"], "cover.png", { type: "image/png" }));

      await fetchApi("/lost-founds/1/cover", { method: "POST", body: formData });

      const options = fetchMock.mock.calls[0][1];
      expect(options.body).toBe(formData);
      expect(options.headers["Content-Type"]).toBeUndefined();
    });

    it("melempar Error dengan pesan server jika respons gagal", async () => {
      mockFetch({ message: "Email sudah terdaftar" }, false);

      await expect(fetchApi("/auth/register", { method: "POST", body: {} })).rejects.toThrow(
        "Email sudah terdaftar"
      );
    });

    it("memakai pesan bawaan jika server tidak mengirim pesan", async () => {
      mockFetch({}, false);

      await expect(fetchApi("/users")).rejects.toThrow("Terjadi kesalahan pada server");
    });
  });
});