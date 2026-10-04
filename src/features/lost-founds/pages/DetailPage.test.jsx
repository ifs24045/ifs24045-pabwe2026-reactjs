import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import DetailPage from "./DetailPage";
import { asyncSetLostFound, asyncSetIsLostFoundDelete } from "../states/action";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

vi.mock("../states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    asyncSetLostFound: vi.fn(() => async () => {}),
    asyncSetIsLostFoundDelete: vi.fn(() => async () => {}),
  };
});
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, showConfirmDialog: vi.fn() };
});

const lostFound = {
  id: "abc",
  user_id: "u1",
  title: "Dompet hitam",
  description: "Hilang di kantin\nlantai 2",
  status: "lost",
  is_completed: 0,
  cover: "https://img.test/cover.png",
  author: { name: "Budi Santoso" },
  created_at: "2026-10-15T10:00:00Z",
};
const owner = { id: "u1", name: "Budi Santoso" };

function renderDetail({ state = {}, route = "/lost-founds/abc" } = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/lost-founds/:id" element={<DetailPage />} />
      <Route path="/" element={<p>Beranda</p>} />
    </Routes>,
    { route, preloadedState: { lostFound, profile: owner, ...state } }
  );
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("pemuatan data", () => {
    it("memuat detail laporan berdasarkan id pada URL", async () => {
      renderDetail();

      await waitFor(() => expect(asyncSetLostFound).toHaveBeenCalledWith("abc"));
    });

    it("menampilkan teks memuat selama data diambil", () => {
      asyncSetLostFound.mockImplementationOnce(() => () => new Promise(() => {}));

      renderDetail();

      expect(screen.getByText("Memuat detail laporan...")).toBeInTheDocument();
    });

    it("mengosongkan detail laporan saat halaman ditinggalkan", async () => {
      const { store, unmount } = renderDetail();
      await screen.findByRole("heading", { name: "Dompet hitam" });

      unmount();

      expect(store.getState().lostFound).toBeNull();
    });

    it("menampilkan pesan tidak ditemukan jika laporan kosong", async () => {
      renderDetail({ state: { lostFound: null } });

      expect(await screen.findByText("Laporan tidak ditemukan.")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Kembali ke Dashboard" })).toHaveAttribute("href", "/");
    });

    it("menampilkan pesan tidak ditemukan jika id laporan tidak cocok dengan URL", async () => {
      renderDetail({ state: { lostFound: { ...lostFound, id: "lain" } } });

      expect(await screen.findByText("Laporan tidak ditemukan.")).toBeInTheDocument();
    });

    it("membandingkan id sebagai string (angka vs teks)", async () => {
      renderDetail({
        route: "/lost-founds/12",
        state: { lostFound: { ...lostFound, id: 12 } },
      });

      expect(await screen.findByRole("heading", { name: "Dompet hitam" })).toBeInTheDocument();
    });
  });

  describe("rincian laporan", () => {
    it("menampilkan judul, deskripsi, pelapor, dan tanggal lapor", async () => {
      renderDetail();

      expect(await screen.findByRole("heading", { name: "Dompet hitam" })).toBeInTheDocument();
      expect(screen.getByText(/Hilang di kantin/)).toBeInTheDocument();
      expect(screen.getByText("Budi Santoso", { selector: "dd" })).toBeInTheDocument();
      expect(screen.getByText(/Oktober 2026/)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Kembali$/ })).toHaveAttribute("href", "/");
    });

    it("menampilkan gambar cover jika ada", async () => {
      renderDetail();

      expect(await screen.findByRole("img", { name: "Dompet hitam" })).toHaveAttribute(
        "src",
        "https://img.test/cover.png"
      );
    });

    it("menampilkan placeholder jika belum ada cover", async () => {
      renderDetail({ state: { lostFound: { ...lostFound, cover: null } } });

      expect(await screen.findByText("Belum ada cover")).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("menampilkan badge 'Barang Hilang' dan 'Dalam proses'", async () => {
      renderDetail();

      expect(await screen.findByText("Barang Hilang")).toBeInTheDocument();
      expect(screen.getByText("Dalam proses")).toBeInTheDocument();
    });

    it("menampilkan badge 'Barang Ditemukan' dan 'Selesai'", async () => {
      renderDetail({ state: { lostFound: { ...lostFound, status: "found", is_completed: "1" } } });

      expect(await screen.findByText("Barang Ditemukan")).toBeInTheDocument();
      expect(screen.getByText("Selesai")).toBeInTheDocument();
    });

    it.each([
      ["pelapor berupa teks", "Siti", "Siti"],
      ["pelapor tanpa nama", {}, "-"],
      ["pelapor kosong", null, "-"],
    ])("menampilkan nama pelapor untuk kasus %s", async (_name, author, expected) => {
      renderDetail({ state: { lostFound: { ...lostFound, author } } });

      await screen.findByRole("heading", { name: "Dompet hitam" });
      expect(screen.getByText("Pelapor").nextElementSibling).toHaveTextContent(expected);
    });

    it("menampilkan '-' jika tanggal lapor tidak tersedia", async () => {
      renderDetail({ state: { lostFound: { ...lostFound, created_at: null } } });

      await screen.findByRole("heading", { name: "Dompet hitam" });
      expect(screen.getByText("Tanggal lapor").nextElementSibling).toHaveTextContent("-");
    });
  });

  describe("hak akses pemilik", () => {
    it("menampilkan tombol aksi jika pengguna adalah pemilik laporan", async () => {
      renderDetail();

      expect(await screen.findByRole("button", { name: /Ubah Cover/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Ubah Data/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Hapus/ })).toBeEnabled();
    });

    it("mencocokkan id pengguna sebagai string (angka vs teks)", async () => {
      renderDetail({ state: { profile: { id: 7 }, lostFound: { ...lostFound, user_id: "7" } } });

      expect(await screen.findByRole("button", { name: /Hapus/ })).toBeInTheDocument();
    });

    it("menyembunyikan tombol aksi jika bukan pemilik", async () => {
      renderDetail({ state: { profile: { id: "u2" } } });

      await screen.findByRole("heading", { name: "Dompet hitam" });
      expect(screen.queryByRole("button", { name: /Hapus/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Ubah/ })).not.toBeInTheDocument();
    });

    it("menyembunyikan tombol aksi jika profil belum dimuat", async () => {
      renderDetail({ state: { profile: null } });

      await screen.findByRole("heading", { name: "Dompet hitam" });
      expect(screen.queryByRole("button", { name: /Hapus/ })).not.toBeInTheDocument();
    });
  });

  describe("modal", () => {
    it("membuka dan menutup modal ubah data", async () => {
      const user = userEvent.setup();
      renderDetail();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await user.click(await screen.findByRole("button", { name: /Ubah Data/ }));
      expect(screen.getByRole("dialog", { name: "Ubah Laporan" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Batal" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("membuka dan menutup modal ubah cover", async () => {
      const user = userEvent.setup();
      renderDetail();

      await user.click(await screen.findByRole("button", { name: /Ubah Cover/ }));
      expect(screen.getByRole("dialog", { name: "Ubah Cover" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Batal" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("hapus laporan", () => {
    it("tidak menghapus jika konfirmasi dibatalkan", async () => {
      showConfirmDialog.mockResolvedValue(false);
      const user = userEvent.setup();
      renderDetail();

      await user.click(await screen.findByRole("button", { name: /Hapus/ }));

      await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
      expect(asyncSetIsLostFoundDelete).not.toHaveBeenCalled();
    });

    it("meminta konfirmasi lalu menghapus laporan jika dikonfirmasi", async () => {
      showConfirmDialog.mockResolvedValue(true);
      const user = userEvent.setup();
      renderDetail();

      await user.click(await screen.findByRole("button", { name: /Hapus/ }));

      await waitFor(() => expect(asyncSetIsLostFoundDelete).toHaveBeenCalledWith("abc"));
      expect(showConfirmDialog).toHaveBeenCalledWith(
        "Laporan yang dihapus tidak dapat dikembalikan.",
        "Hapus laporan ini?",
        "Ya, hapus"
      );
    });

    it("kembali ke beranda jika laporan berhasil dihapus", async () => {
      showConfirmDialog.mockResolvedValue(true);
      asyncSetIsLostFoundDelete.mockImplementationOnce(() => async (dispatch) => {
        dispatch({ type: "SET_IS_LOST_FOUND_DELETED", payload: { status: true } });
      });
      const user = userEvent.setup();
      renderDetail();

      await user.click(await screen.findByRole("button", { name: /Hapus/ }));

      expect(await screen.findByText("Beranda")).toBeInTheDocument();
    });

    it("tetap di halaman detail jika penghapusan gagal", async () => {
      showConfirmDialog.mockResolvedValue(true);
      const user = userEvent.setup();
      renderDetail();

      await user.click(await screen.findByRole("button", { name: /Hapus/ }));

      await waitFor(() => expect(asyncSetIsLostFoundDelete).toHaveBeenCalled());
      expect(screen.queryByText("Beranda")).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Dompet hitam" })).toBeInTheDocument();
    });

    it("menonaktifkan tombol hapus saat penghapusan berjalan", async () => {
      renderDetail({ state: { isLostFoundDelete: true } });

      expect(await screen.findByRole("button", { name: /Hapus/ })).toBeDisabled();
    });
  });
});