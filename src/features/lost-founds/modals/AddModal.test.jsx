import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import AddModal from "./AddModal";
import { asyncSetIsLostFoundAdd } from "../states/action";

vi.mock("../states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, asyncSetIsLostFoundAdd: vi.fn(() => async () => {}) };
});

function renderModal({ isOpen = true, state, onClose = vi.fn(), onSuccess = vi.fn() } = {}) {
  const result = renderWithProviders(
    <AddModal isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />,
    { preloadedState: state }
  );
  return { ...result, onClose, onSuccess };
}

async function fillForm(user, { title = "Dompet hitam", description = "Hilang di kantin" } = {}) {
  await user.type(screen.getByLabelText("Judul"), title);
  await user.type(screen.getByLabelText("Deskripsi"), description);
}

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("tampilan", () => {
    it("tidak merender apa pun saat tertutup", () => {
      renderModal({ isOpen: false });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("menampilkan dialog dengan judul dan seluruh isian saat terbuka", () => {
      renderModal();

      expect(screen.getByRole("dialog", { name: "Tambah Laporan" })).toBeInTheDocument();
      expect(screen.getByLabelText("Judul")).toHaveValue("");
      expect(screen.getByLabelText("Deskripsi")).toHaveValue("");
      expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled();
    });

    it("memilih jenis 'Barang Hilang' secara bawaan dan bisa diganti", async () => {
      const user = userEvent.setup();
      renderModal();

      expect(screen.getByLabelText("Barang Hilang")).toBeChecked();
      expect(screen.getByLabelText("Barang Ditemukan")).not.toBeChecked();

      await user.click(screen.getByLabelText("Barang Ditemukan"));

      expect(screen.getByLabelText("Barang Ditemukan")).toBeChecked();
      expect(screen.getByLabelText("Barang Hilang")).not.toBeChecked();
    });

    it("menonaktifkan tombol simpan saat proses tambah berjalan", () => {
      renderModal({ state: { isLostFoundAdd: true } });

      expect(screen.getByRole("button", { name: "Simpan" })).toBeDisabled();
    });
  });

  describe("menutup modal", () => {
    it("memanggil onClose saat tombol silang ditekan", async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();

      await user.click(screen.getByRole("button", { name: "Tutup" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("memanggil onClose saat tombol Batal ditekan", async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();

      await user.click(screen.getByRole("button", { name: "Batal" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("memanggil onClose saat tombol Escape ditekan", async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("mengabaikan tombol selain Escape", async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();

      await user.keyboard("a");

      expect(onClose).not.toHaveBeenCalled();
    });

    it("tidak memasang listener Escape saat modal tertutup", async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal({ isOpen: false });

      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });

    it("melepas listener Escape saat komponen dilepas", async () => {
      const user = userEvent.setup();
      const { onClose, unmount } = renderModal();

      unmount();
      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });

    it("memanggil onClose saat latar belakang diklik", () => {
      const { onClose } = renderModal();

      fireEvent.mouseDown(screen.getByRole("dialog").parentElement);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("tidak menutup modal saat klik di dalam dialog", () => {
      const { onClose } = renderModal();

      fireEvent.mouseDown(screen.getByRole("dialog"));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("validasi", () => {
    it("menampilkan pesan jika judul dan deskripsi kosong", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByRole("button", { name: "Simpan" }));

      expect(screen.getByText("Judul wajib diisi")).toBeInTheDocument();
      expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
      expect(asyncSetIsLostFoundAdd).not.toHaveBeenCalled();
    });

    it("menganggap isian yang hanya spasi sebagai kosong", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.type(screen.getByLabelText("Judul"), "   ");
      await user.type(screen.getByLabelText("Deskripsi"), "   ");
      await user.click(screen.getByRole("button", { name: "Simpan" }));

      expect(screen.getByText("Judul wajib diisi")).toBeInTheDocument();
      expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
      expect(asyncSetIsLostFoundAdd).not.toHaveBeenCalled();
    });

    it("hanya menampilkan pesan untuk isian yang kosong", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.type(screen.getByLabelText("Judul"), "Dompet");
      await user.click(screen.getByRole("button", { name: "Simpan" }));

      expect(screen.queryByText("Judul wajib diisi")).not.toBeInTheDocument();
      expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
    });
  });

  describe("submit", () => {
    it("memanggil asyncSetIsLostFoundAdd dengan data yang diisi", async () => {
      const user = userEvent.setup();
      renderModal();

      await fillForm(user);
      await user.click(screen.getByLabelText("Barang Ditemukan"));
      await user.click(screen.getByRole("button", { name: "Simpan" }));

      await waitFor(() =>
        expect(asyncSetIsLostFoundAdd).toHaveBeenCalledWith({
          title: "Dompet hitam",
          description: "Hilang di kantin",
          status: "found",
        })
      );
    });

    it("menutup modal dan memanggil onSuccess jika berhasil ditambahkan", async () => {
      asyncSetIsLostFoundAdd.mockImplementationOnce(() => async (dispatch) => {
        dispatch({ type: "SET_IS_LOST_FOUND_ADDED", payload: { status: true } });
      });
      const user = userEvent.setup();
      const { onClose, onSuccess } = renderModal();

      await fillForm(user);
      await user.click(screen.getByRole("button", { name: "Simpan" }));

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("tidak error jika onSuccess tidak diberikan", async () => {
      asyncSetIsLostFoundAdd.mockImplementationOnce(() => async (dispatch) => {
        dispatch({ type: "SET_IS_LOST_FOUND_ADDED", payload: { status: true } });
      });
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithProviders(<AddModal isOpen onClose={onClose} />);

      await fillForm(user);
      await user.click(screen.getByRole("button", { name: "Simpan" }));

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it("tidak menutup modal jika penambahan gagal", async () => {
      const user = userEvent.setup();
      const { onClose, onSuccess } = renderModal();

      await fillForm(user);
      await user.click(screen.getByRole("button", { name: "Simpan" }));

      await waitFor(() => expect(asyncSetIsLostFoundAdd).toHaveBeenCalled());
      expect(onClose).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});