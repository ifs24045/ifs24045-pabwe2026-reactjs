import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import StatsSection from "./StatsSection";
import { asyncSetLostFoundStats } from "../states/action";

vi.mock("../states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, asyncSetLostFoundStats: vi.fn(() => async () => {}) };
});

const stats = {
  daily: {
    stats_losts: { "2026-10-04": 5, "2026-10-03": 2 },
    stats_founds: { "2026-10-04": 3 },
    stats_losts_completed: { "2026-10-03": 1, "2026-10-04": 1 },
    stats_losts_process: { "2026-10-03": 1, "2026-10-04": 4 },
    stats_founds_completed: { "2026-10-04": "2" },
    stats_founds_process: { "2026-10-04": null },
  },
  monthly: {
    stats_losts: { "2026-09": 4 },
    stats_founds: { "2026-10": 1 },
    stats_losts_completed: { "2026-09": 3 },
    stats_losts_process: { "2026-09": 1 },
    stats_founds_completed: {},
    stats_founds_process: { "2026-10": 1 },
  },
};

function renderStats(lostFoundStats = stats) {
  return renderWithProviders(<StatsSection />, {
    preloadedState: { lostFoundStats },
  });
}

function totalOf(label) {
  return screen.getByText(label).nextElementSibling;
}

describe("StatsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("memuat statistik 7 data saat pertama kali tampil", () => {
    renderStats();

    expect(asyncSetLostFoundStats).toHaveBeenCalledWith({ total_data: 7 });
    expect(asyncSetLostFoundStats).toHaveBeenCalledTimes(1);
  });

  it("menampilkan judul, deskripsi, dan tombol periode", () => {
    renderStats();

    expect(screen.getByRole("heading", { name: "Statistik Laporan" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Periode statistik" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Harian" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Bulanan" })).toHaveAttribute("aria-pressed", "false");
  });

  describe("kondisi data", () => {
    it("menampilkan teks memuat jika statistik belum tersedia", () => {
      renderStats(null);

      expect(screen.getByText("Memuat statistik...")).toBeInTheDocument();
    });

    it("menampilkan pesan kosong jika periode tidak punya data", () => {
      renderStats({ daily: { stats_losts: {}, stats_founds: {} } });

      expect(screen.getByText("Belum ada data statistik.")).toBeInTheDocument();
    });

    it("menampilkan pesan kosong jika data periode terpilih tidak ada", async () => {
      const user = userEvent.setup();
      renderStats({ daily: stats.daily });

      await user.click(screen.getByRole("button", { name: "Bulanan" }));

      expect(screen.getByText("Belum ada data statistik.")).toBeInTheDocument();
    });

    it("tetap aman jika salah satu kelompok data tidak ada", () => {
      renderStats({ daily: { stats_founds: { "2026-10-04": 2 } } });

      expect(screen.getByRole("img", { name: "04/10: 0 hilang, 2 ditemukan" })).toBeInTheDocument();
      expect(totalOf("Hilang · selesai")).toHaveTextContent("0");
    });
  });

  describe("grafik harian", () => {
    it("menampilkan satu kolom per tanggal, terurut, dengan label yang benar", () => {
      renderStats();

      const bars = screen.getAllByRole("img");
      expect(bars.map((el) => el.getAttribute("aria-label"))).toEqual([
        "03/10: 2 hilang, 0 ditemukan",
        "04/10: 5 hilang, 3 ditemukan",
      ]);
      expect(screen.getAllByText("03/10")).toHaveLength(1);
      expect(screen.getAllByText("04/10")).toHaveLength(1);
    });

    it("menampilkan legenda Hilang dan Ditemukan", () => {
      renderStats();

      expect(screen.getByText("Hilang")).toBeInTheDocument();
      expect(screen.getByText("Ditemukan")).toBeInTheDocument();
    });

    it("menghitung tinggi batang relatif terhadap nilai terbesar", () => {
      renderStats();

      expect(screen.getByTitle("Hilang: 5")).toHaveStyle({ height: "80%" });
      expect(screen.getByTitle("Ditemukan: 3")).toHaveStyle({ height: "48%" });
      expect(screen.getByTitle("Hilang: 2")).toHaveStyle({ height: "32%" });
    });

    it("memberi tinggi minimum pada batang bernilai > 0 dan 0 pada batang kosong", () => {
      renderStats();

      expect(screen.getByTitle("Hilang: 2")).toHaveStyle({ minHeight: "4px" });
      expect(screen.getByTitle("Ditemukan: 0")).toHaveStyle({ minHeight: "0px" });
    });

    it("tidak membagi dengan nol jika semua nilai 0", () => {
      renderStats({ daily: { stats_losts: { "2026-10-04": 0 }, stats_founds: {} } });

      expect(screen.getByTitle("Hilang: 0")).toHaveStyle({ height: "0%" });
    });
  });

  describe("ringkasan total", () => {
    it("menjumlahkan total selesai dan proses per kelompok", () => {
      renderStats();

      expect(totalOf("Hilang · selesai")).toHaveTextContent("2");
      expect(totalOf("Hilang · proses")).toHaveTextContent("5");
      expect(totalOf("Ditemukan · selesai")).toHaveTextContent("2"); // nilai string "2"
      expect(totalOf("Ditemukan · proses")).toHaveTextContent("0"); // nilai null
    });
  });

  describe("pergantian periode", () => {
    it("menampilkan data bulanan dengan format bulan/tahun saat 'Bulanan' dipilih", async () => {
      const user = userEvent.setup();
      renderStats();

      await user.click(screen.getByRole("button", { name: "Bulanan" }));

      expect(screen.getByRole("button", { name: "Bulanan" })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: "Harian" })).toHaveAttribute("aria-pressed", "false");
      expect(
        screen.getAllByRole("img").map((el) => el.getAttribute("aria-label"))
      ).toEqual(["09/2026: 4 hilang, 0 ditemukan", "10/2026: 0 hilang, 1 ditemukan"]);
      expect(totalOf("Hilang · selesai")).toHaveTextContent("3");
      expect(totalOf("Ditemukan · proses")).toHaveTextContent("1");
    });

    it("kembali ke data harian saat 'Harian' dipilih lagi", async () => {
      const user = userEvent.setup();
      renderStats();

      await user.click(screen.getByRole("button", { name: "Bulanan" }));
      await user.click(screen.getByRole("button", { name: "Harian" }));

      expect(screen.getByRole("img", { name: "04/10: 5 hilang, 3 ditemukan" })).toBeInTheDocument();
    });

    it("tidak memuat ulang statistik saat periode diganti", async () => {
      const user = userEvent.setup();
      renderStats();

      await user.click(screen.getByRole("button", { name: "Bulanan" }));

      expect(asyncSetLostFoundStats).toHaveBeenCalledTimes(1);
    });
  });

  it("menampilkan kunci apa adanya jika formatnya tidak dikenali", () => {
    renderStats({ daily: { stats_losts: { minggu1: 1 }, stats_founds: {} } });

    expect(screen.getByRole("img", { name: "minggu1: 1 hilang, 0 ditemukan" })).toBeInTheDocument();
    expect(within(screen.getByRole("img")).getByText("1", { selector: "span" })).toBeInTheDocument();
  });
});