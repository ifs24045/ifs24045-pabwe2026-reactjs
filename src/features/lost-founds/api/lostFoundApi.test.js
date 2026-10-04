import { describe, it, expect, vi, beforeEach } from "vitest";
import lostFoundApi from "./lostFoundApi";
import { fetchApi } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

describe("lostFoundApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLostFounds", () => {
    it("memanggil GET /lost-founds dengan params dan mengembalikan daftar laporan", async () => {
      fetchApi.mockResolvedValue({ data: { lost_founds: [{ id: 1 }, { id: 2 }] } });

      const result = await lostFoundApi.getLostFounds({ status: "lost", is_me: 1 });

      expect(fetchApi).toHaveBeenCalledWith("/lost-founds", {
        params: { status: "lost", is_me: 1 },
      });
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("memakai params kosong secara bawaan", async () => {
      fetchApi.mockResolvedValue({ data: { lost_founds: [] } });

      await lostFoundApi.getLostFounds();

      expect(fetchApi).toHaveBeenCalledWith("/lost-founds", { params: {} });
    });
  });

  it("getLostFound memanggil GET /lost-founds/:id dan mengembalikan detail laporan", async () => {
    fetchApi.mockResolvedValue({ data: { lost_found: { id: "abc", title: "Dompet" } } });

    const result = await lostFoundApi.getLostFound("abc");

    expect(fetchApi).toHaveBeenCalledWith("/lost-founds/abc");
    expect(result).toEqual({ id: "abc", title: "Dompet" });
  });

  it("postLostFound memanggil POST /lost-founds dan mengembalikan id serta pesan", async () => {
    fetchApi.mockResolvedValue({
      message: "Laporan ditambahkan",
      data: { lost_found_id: "xyz" },
    });

    const result = await lostFoundApi.postLostFound({
      title: "Dompet",
      description: "Hitam",
      status: "lost",
    });

    expect(fetchApi).toHaveBeenCalledWith("/lost-founds", {
      method: "POST",
      body: { title: "Dompet", description: "Hitam", status: "lost" },
    });
    expect(result).toEqual({ id: "xyz", message: "Laporan ditambahkan" });
  });

  describe("putLostFound", () => {
    it("memanggil PUT /lost-founds/:id dan mengubah isCompleted true menjadi 1", async () => {
      fetchApi.mockResolvedValue({ message: "Laporan diperbarui" });

      const message = await lostFoundApi.putLostFound("abc", {
        title: "Dompet",
        description: "Hitam",
        status: "found",
        isCompleted: true,
      });

      expect(fetchApi).toHaveBeenCalledWith("/lost-founds/abc", {
        method: "PUT",
        body: {
          title: "Dompet",
          description: "Hitam",
          status: "found",
          is_completed: 1,
        },
      });
      expect(message).toBe("Laporan diperbarui");
    });

    it("mengubah isCompleted false menjadi 0", async () => {
      fetchApi.mockResolvedValue({ message: "ok" });

      await lostFoundApi.putLostFound("abc", {
        title: "t",
        description: "d",
        status: "lost",
        isCompleted: false,
      });

      expect(fetchApi.mock.calls[0][1].body.is_completed).toBe(0);
    });
  });

  it("postLostFoundCover mengirim file sebagai FormData dengan field 'cover'", async () => {
    fetchApi.mockResolvedValue({ message: "Cover diperbarui" });
    const file = new File(["x"], "cover.png", { type: "image/png" });

    const message = await lostFoundApi.postLostFoundCover("abc", file);

    const [path, options] = fetchApi.mock.calls[0];
    expect(path).toBe("/lost-founds/abc/cover");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("cover").name).toBe("cover.png");
    expect(message).toBe("Cover diperbarui");
  });

  it("deleteLostFound memanggil DELETE /lost-founds/:id", async () => {
    fetchApi.mockResolvedValue({ message: "Laporan dihapus" });

    const message = await lostFoundApi.deleteLostFound("abc");

    expect(fetchApi).toHaveBeenCalledWith("/lost-founds/abc", { method: "DELETE" });
    expect(message).toBe("Laporan dihapus");
  });

  describe("statistik", () => {
    it("getStatsDaily memanggil GET /lost-founds/stats/daily", async () => {
      fetchApi.mockResolvedValue({ data: { stats: [1, 2] } });

      const result = await lostFoundApi.getStatsDaily({ total_data: 7 });

      expect(fetchApi).toHaveBeenCalledWith("/lost-founds/stats/daily", {
        params: { total_data: 7 },
      });
      expect(result).toEqual({ stats: [1, 2] });
    });

    it("getStatsMonthly memanggil GET /lost-founds/stats/monthly", async () => {
      fetchApi.mockResolvedValue({ data: { stats: [3] } });

      const result = await lostFoundApi.getStatsMonthly({ total_data: 6 });

      expect(fetchApi).toHaveBeenCalledWith("/lost-founds/stats/monthly", {
        params: { total_data: 6 },
      });
      expect(result).toEqual({ stats: [3] });
    });

    it("memakai params kosong secara bawaan", async () => {
      fetchApi.mockResolvedValue({ data: {} });

      await lostFoundApi.getStatsDaily();
      await lostFoundApi.getStatsMonthly();

      expect(fetchApi).toHaveBeenNthCalledWith(1, "/lost-founds/stats/daily", { params: {} });
      expect(fetchApi).toHaveBeenNthCalledWith(2, "/lost-founds/stats/monthly", { params: {} });
    });
  });

  it("meneruskan error dari fetchApi", async () => {
    fetchApi.mockRejectedValue(new Error("Tidak diizinkan"));

    await expect(lostFoundApi.getLostFounds()).rejects.toThrow("Tidak diizinkan");
  });
});