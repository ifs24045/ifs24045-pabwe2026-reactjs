import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  setLostFoundsActionCreator,
  setLostFoundActionCreator,
  setIsLostFoundActionCreator,
  setIsLostFoundAddActionCreator,
  setIsLostFoundAddedActionCreator,
  setIsLostFoundChangeActionCreator,
  setIsLostFoundChangedActionCreator,
  setIsLostFoundChangeCoverActionCreator,
  setIsLostFoundChangedCoverActionCreator,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
  setLostFoundStatsActionCreator,
  asyncSetLostFounds,
  asyncSetLostFound,
  asyncSetIsLostFoundAdd,
  asyncSetIsLostFoundChange,
  asyncSetIsLostFoundChangeCover,
  asyncSetIsLostFoundDelete,
  asyncSetLostFoundStats,
} from "./action";
import lostFoundApi from "../api/lostFoundApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    getLostFound: vi.fn(),
    postLostFound: vi.fn(),
    putLostFound: vi.fn(),
    postLostFoundCover: vi.fn(),
    deleteLostFound: vi.fn(),
    getStatsDaily: vi.fn(),
    getStatsMonthly: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("lost-founds action", () => {
  let dispatch;

  beforeEach(() => {
    vi.clearAllMocks();
    dispatch = vi.fn();
  });

  describe("action creators", () => {
    it("setLostFoundsActionCreator", () => {
      expect(setLostFoundsActionCreator([{ id: 1 }])).toEqual({
        type: ActionType.SET_LOST_FOUNDS,
        payload: { lostFounds: [{ id: 1 }] },
      });
    });

    it("setLostFoundActionCreator", () => {
      expect(setLostFoundActionCreator({ id: 1 })).toEqual({
        type: ActionType.SET_LOST_FOUND,
        payload: { lostFound: { id: 1 } },
      });
    });

    it("setLostFoundStatsActionCreator", () => {
      expect(setLostFoundStatsActionCreator({ daily: [], monthly: [] })).toEqual({
        type: ActionType.SET_LOST_FOUND_STATS,
        payload: { stats: { daily: [], monthly: [] } },
      });
    });

    it.each([
      ["setIsLostFoundActionCreator", setIsLostFoundActionCreator, ActionType.SET_IS_LOST_FOUND],
      ["setIsLostFoundAddActionCreator", setIsLostFoundAddActionCreator, ActionType.SET_IS_LOST_FOUND_ADD],
      ["setIsLostFoundAddedActionCreator", setIsLostFoundAddedActionCreator, ActionType.SET_IS_LOST_FOUND_ADDED],
      ["setIsLostFoundChangeActionCreator", setIsLostFoundChangeActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGE],
      ["setIsLostFoundChangedActionCreator", setIsLostFoundChangedActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGED],
      ["setIsLostFoundChangeCoverActionCreator", setIsLostFoundChangeCoverActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGE_COVER],
      ["setIsLostFoundChangedCoverActionCreator", setIsLostFoundChangedCoverActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGED_COVER],
      ["setIsLostFoundDeleteActionCreator", setIsLostFoundDeleteActionCreator, ActionType.SET_IS_LOST_FOUND_DELETE],
      ["setIsLostFoundDeletedActionCreator", setIsLostFoundDeletedActionCreator, ActionType.SET_IS_LOST_FOUND_DELETED],
    ])("%s membuat action status", (_name, creator, type) => {
      expect(creator(true)).toEqual({ type, payload: { status: true } });
    });
  });

  describe("asyncSetLostFounds", () => {
    it("menyimpan daftar laporan jika berhasil", async () => {
      lostFoundApi.getLostFounds.mockResolvedValue([{ id: 1 }]);

      await asyncSetLostFounds({ status: "lost" })(dispatch);

      expect(lostFoundApi.getLostFounds).toHaveBeenCalledWith({ status: "lost" });
      expect(dispatch).toHaveBeenCalledWith(setLostFoundsActionCreator([{ id: 1 }]));
      expect(showErrorDialog).not.toHaveBeenCalled();
    });

    it("memakai params kosong secara bawaan", async () => {
      lostFoundApi.getLostFounds.mockResolvedValue([]);

      await asyncSetLostFounds()(dispatch);

      expect(lostFoundApi.getLostFounds).toHaveBeenCalledWith({});
    });

    it("menampilkan dialog error jika gagal", async () => {
      lostFoundApi.getLostFounds.mockRejectedValue(new Error("Gagal memuat"));

      await asyncSetLostFounds()(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat");
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe("asyncSetLostFound", () => {
    it("menyimpan detail laporan dan mengatur status loading", async () => {
      lostFoundApi.getLostFound.mockResolvedValue({ id: "abc" });

      await asyncSetLostFound("abc")(dispatch);

      expect(lostFoundApi.getLostFound).toHaveBeenCalledWith("abc");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsLostFoundActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(2, setLostFoundActionCreator({ id: "abc" }));
      expect(dispatch).toHaveBeenNthCalledWith(3, setIsLostFoundActionCreator(false));
    });

    it("mengosongkan detail, menampilkan error, dan tetap mematikan loading jika gagal", async () => {
      lostFoundApi.getLostFound.mockRejectedValue(new Error("Tidak ditemukan"));

      await asyncSetLostFound("abc")(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setLostFoundActionCreator(null));
      expect(showErrorDialog).toHaveBeenCalledWith("Tidak ditemukan");
      expect(dispatch).toHaveBeenLastCalledWith(setIsLostFoundActionCreator(false));
    });
  });

  describe("asyncSetIsLostFoundAdd", () => {
    const data = { title: "Dompet", description: "Hitam", status: "lost" };

    it("menambah laporan dan menandai berhasil ditambahkan", async () => {
      lostFoundApi.postLostFound.mockResolvedValue({ id: "xyz", message: "Laporan ditambahkan" });

      await asyncSetIsLostFoundAdd(data)(dispatch);

      expect(lostFoundApi.postLostFound).toHaveBeenCalledWith(data);
      expect(showSuccessDialog).toHaveBeenCalledWith("Laporan ditambahkan");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsLostFoundAddActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsLostFoundAddedActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(3, setIsLostFoundAddedActionCreator(true));
      expect(dispatch).toHaveBeenLastCalledWith(setIsLostFoundAddActionCreator(false));
    });

    it("menampilkan dialog error dan tidak menandai berhasil jika gagal", async () => {
      lostFoundApi.postLostFound.mockRejectedValue(new Error("Judul wajib diisi"));

      await asyncSetIsLostFoundAdd(data)(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Judul wajib diisi");
      expect(dispatch).not.toHaveBeenCalledWith(setIsLostFoundAddedActionCreator(true));
      expect(dispatch).toHaveBeenLastCalledWith(setIsLostFoundAddActionCreator(false));
    });
  });

  describe("asyncSetIsLostFoundChange", () => {
    const data = { title: "Dompet", description: "Hitam", status: "found", isCompleted: true };

    it("mengubah laporan, menampilkan pesan, dan memuat ulang detail", async () => {
      lostFoundApi.putLostFound.mockResolvedValue("Laporan diperbarui");

      await asyncSetIsLostFoundChange("abc", data)(dispatch);

      expect(lostFoundApi.putLostFound).toHaveBeenCalledWith("abc", data);
      expect(showSuccessDialog).toHaveBeenCalledWith("Laporan diperbarui");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsLostFoundChangeActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsLostFoundChangedActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(3, setIsLostFoundChangedActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(4, expect.any(Function)); // asyncSetLostFound
      expect(dispatch).toHaveBeenLastCalledWith(setIsLostFoundChangeActionCreator(false));
    });

    it("menampilkan dialog error jika gagal", async () => {
      lostFoundApi.putLostFound.mockRejectedValue(new Error("Gagal mengubah"));

      await asyncSetIsLostFoundChange("abc", data)(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengubah");
      expect(dispatch).not.toHaveBeenCalledWith(setIsLostFoundChangedActionCreator(true));
      expect(dispatch).toHaveBeenLastCalledWith(setIsLostFoundChangeActionCreator(false));
    });
  });

  describe("asyncSetIsLostFoundChangeCover", () => {
    const file = new File(["x"], "cover.png", { type: "image/png" });

    it("mengunggah cover, menampilkan pesan, dan memuat ulang detail", async () => {
      lostFoundApi.postLostFoundCover.mockResolvedValue("Cover diperbarui");

      await asyncSetIsLostFoundChangeCover("abc", file)(dispatch);

      expect(lostFoundApi.postLostFoundCover).toHaveBeenCalledWith("abc", file);
      expect(showSuccessDialog).toHaveBeenCalledWith("Cover diperbarui");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsLostFoundChangeCoverActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsLostFoundChangedCoverActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(3, setIsLostFoundChangedCoverActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(4, expect.any(Function));
      expect(dispatch).toHaveBeenLastCalledWith(setIsLostFoundChangeCoverActionCreator(false));
    });

    it("menampilkan dialog error jika gagal", async () => {
      lostFoundApi.postLostFoundCover.mockRejectedValue(new Error("File terlalu besar"));

      await asyncSetIsLostFoundChangeCover("abc", file)(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("File terlalu besar");
      expect(dispatch).not.toHaveBeenCalledWith(setIsLostFoundChangedCoverActionCreator(true));
      expect(dispatch).toHaveBeenLastCalledWith(setIsLostFoundChangeCoverActionCreator(false));
    });
  });

  describe("asyncSetIsLostFoundDelete", () => {
    it("menghapus laporan dan menandai berhasil dihapus", async () => {
      lostFoundApi.deleteLostFound.mockResolvedValue("Laporan dihapus");

      await asyncSetIsLostFoundDelete("abc")(dispatch);

      expect(lostFoundApi.deleteLostFound).toHaveBeenCalledWith("abc");
      expect(showSuccessDialog).toHaveBeenCalledWith("Laporan dihapus");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsLostFoundDeleteActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsLostFoundDeletedActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(3, setIsLostFoundDeletedActionCreator(true));
      expect(dispatch).toHaveBeenLastCalledWith(setIsLostFoundDeleteActionCreator(false));
    });

    it("menampilkan dialog error jika gagal", async () => {
      lostFoundApi.deleteLostFound.mockRejectedValue(new Error("Tidak diizinkan"));

      await asyncSetIsLostFoundDelete("abc")(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Tidak diizinkan");
      expect(dispatch).not.toHaveBeenCalledWith(setIsLostFoundDeletedActionCreator(true));
      expect(dispatch).toHaveBeenLastCalledWith(setIsLostFoundDeleteActionCreator(false));
    });
  });

  describe("asyncSetLostFoundStats", () => {
    it("memuat statistik harian dan bulanan sekaligus", async () => {
      lostFoundApi.getStatsDaily.mockResolvedValue({ d: 1 });
      lostFoundApi.getStatsMonthly.mockResolvedValue({ m: 2 });

      await asyncSetLostFoundStats({ total_data: 7 })(dispatch);

      expect(lostFoundApi.getStatsDaily).toHaveBeenCalledWith({ total_data: 7 });
      expect(lostFoundApi.getStatsMonthly).toHaveBeenCalledWith({ total_data: 7 });
      expect(dispatch).toHaveBeenCalledWith(
        setLostFoundStatsActionCreator({ daily: { d: 1 }, monthly: { m: 2 } })
      );
    });

    it("memakai params kosong secara bawaan", async () => {
      lostFoundApi.getStatsDaily.mockResolvedValue({});
      lostFoundApi.getStatsMonthly.mockResolvedValue({});

      await asyncSetLostFoundStats()(dispatch);

      expect(lostFoundApi.getStatsDaily).toHaveBeenCalledWith({});
      expect(lostFoundApi.getStatsMonthly).toHaveBeenCalledWith({});
    });

    it("menampilkan dialog error jika salah satu gagal", async () => {
      lostFoundApi.getStatsDaily.mockResolvedValue({});
      lostFoundApi.getStatsMonthly.mockRejectedValue(new Error("Gagal memuat statistik"));

      await asyncSetLostFoundStats()(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat statistik");
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});