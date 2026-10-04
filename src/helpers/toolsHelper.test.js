import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("showSuccessDialog", () => {
    it("menampilkan dialog sukses dengan pesan yang diberikan", () => {
      showSuccessDialog("Data tersimpan");

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "success", text: "Data tersimpan" })
      );
    });
  });

  describe("showErrorDialog", () => {
    it("menampilkan dialog error dengan pesan yang diberikan", () => {
      showErrorDialog("Gagal menyimpan");

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error", text: "Gagal menyimpan" })
      );
    });
  });

  describe("showConfirmDialog", () => {
    it("mengembalikan true jika pengguna mengonfirmasi", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: true });

      await expect(showConfirmDialog("Hapus?")).resolves.toBe(true);
    });

    it("mengembalikan false jika pengguna membatalkan", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: false });

      await expect(showConfirmDialog("Hapus?")).resolves.toBe(false);
    });
  });

  describe("formatDate", () => {
    it("mengembalikan '-' untuk nilai kosong", () => {
      expect(formatDate("")).toBe("-");
      expect(formatDate(null)).toBe("-");
    });

    it("mengembalikan '-' untuk tanggal tidak valid", () => {
      expect(formatDate("bukan-tanggal")).toBe("-");
    });

    it("memformat tanggal valid ke bahasa Indonesia", () => {
      const result = formatDate("2026-10-04T10:00:00Z");

      expect(result).toContain("Oktober");
      expect(result).toContain("2026");
    });
  });
});