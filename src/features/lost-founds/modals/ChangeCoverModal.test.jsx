import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import ChangeCoverModal from "./ChangeCoverModal";
import { asyncSetIsLostFoundChangeCover } from "../states/action";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, asyncSetIsLostFoundChangeCover: vi.fn(() => async () => {}) };
});
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, showErrorDialog: vi.fn() };
});

const lostFound = { id: "abc", title: "Dompet", cover: "https://img.test/cover.png" };

function renderModal({
  isOpen = true,
  item = lostFound,
  state,
  onClose = vi.fn(),
  onSuccess = vi.fn(),
} = {}) {
  const result = renderWithProviders(
    <ChangeCoverModal isOpen={isOpen} lostFound={item} onClose={onClose} onSuccess={onSuccess} />,
    { preloadedState: state }
  );
  return { ...result, onClose, onSuccess };
}

function makeFile({ name = "cover.png", type = "image/png", size } = {}) {
  const file = new File(["x"], name, { type });
  if (size) Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
  });

  describe("tampilan", () => {
    it("tidak merender apa pun saat tertutup", () => {
      renderModal({ isOpen: false });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("tidak merender apa pun jika data laporan belum ada", () => {
      renderModal({ item: null });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("menampilkan cover saat ini dan tombol unggah nonaktif", () => {
      renderModal();

      expect(screen.getByRole("dialog", { name: "Ubah Cover" })).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Cover saat ini" })).toHaveAttribute(
        "src",
        "https://img.test/cover.png"
      );
      expect(screen.getByRole("button", { name: "Unggah Cover" })).toBeDisabled();
    });

    it("menampilkan placeholder jika laporan belum punya cover", () => {
      renderModal({ item: { id: "abc", cover: null } });

      expect(screen.getByText("Belum ada cover")).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
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

    it("memanggil onClose saat Escape ditekan, mengabaikan tombol lain", async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();

      await user.keyboard("a");
      expect(onClose).not.toHaveBeenCalled();

      await user.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("tidak memasang listener Escape saat tertutup", async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal({ isOpen: false });

      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });

    it("memanggil onClose saat latar belakang diklik, tetapi tidak saat dialog diklik", async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();

      await user.click(screen.getByRole("dialog"));
      expect(onClose).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "Tutup latar belakang" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("memilih file", () => {
    it("menampilkan pratinjau dan mengaktifkan tombol setelah memilih gambar", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.upload(screen.getByLabelText("Pilih gambar"), makeFile());

      expect(screen.getByRole("img", { name: "Pratinjau cover" })).toHaveAttribute(
        "src",
        "blob:preview"
      );
      expect(screen.getByRole("button", { name: "Unggah Cover" })).toBeEnabled();
    });

    it("membersihkan URL pratinjau saat komponen dilepas", async () => {
      const user = userEvent.setup();
      const { unmount } = renderModal();

      await user.upload(screen.getByLabelText("Pilih gambar"), makeFile());
      unmount();

      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    });

    it("menolak file yang bukan gambar", async () => {
      const user = userEvent.setup({ applyAccept: false });
      renderModal();

      await user.upload(
        screen.getByLabelText("Pilih gambar"),
        makeFile({ name: "dok.pdf", type: "application/pdf" })
      );

      expect(showErrorDialog).toHaveBeenCalledWith("File harus berupa gambar");
      expect(screen.getByRole("button", { name: "Unggah Cover" })).toBeDisabled();
      expect(screen.getByRole("img", { name: "Cover saat ini" })).toBeInTheDocument();
    });

    it("menolak gambar yang lebih dari 2 MB", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.upload(
        screen.getByLabelText("Pilih gambar"),
        makeFile({ size: 3 * 1024 * 1024 })
      );

      expect(showErrorDialog).toHaveBeenCalledWith("Ukuran gambar maksimal 2 MB");
      expect(screen.getByRole("button", { name: "Unggah Cover" })).toBeDisabled();
    });

    it("membatalkan pilihan dan kembali ke cover saat ini jika file dikosongkan", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.upload(screen.getByLabelText("Pilih gambar"), makeFile());
      expect(screen.getByRole("button", { name: "Unggah Cover" })).toBeEnabled();

      await act(async () => {
        const el = screen.getByLabelText("Pilih gambar");
        Object.defineProperty(el, "files", { value: [], configurable: true });
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });

      expect(screen.getByRole("button", { name: "Unggah Cover" })).toBeDisabled();
      expect(screen.getByRole("img", { name: "Cover saat ini" })).toBeInTheDocument();
    });
  });

  describe("submit", () => {
    it("menampilkan error jika submit tanpa memilih gambar", async () => {
      renderModal();
      const form = screen.getByRole("button", { name: "Unggah Cover" }).closest("form");

      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      expect(showErrorDialog).toHaveBeenCalledWith("Pilih gambar terlebih dahulu");
      expect(asyncSetIsLostFoundChangeCover).not.toHaveBeenCalled();
    });

    it("memanggil asyncSetIsLostFoundChangeCover dengan id dan file yang dipilih", async () => {
      const user = userEvent.setup();
      renderModal();
      const file = makeFile();

      await user.upload(screen.getByLabelText("Pilih gambar"), file);
      await user.click(screen.getByRole("button", { name: "Unggah Cover" }));

      await waitFor(() =>
        expect(asyncSetIsLostFoundChangeCover).toHaveBeenCalledWith("abc", file)
      );
    });

    it("menonaktifkan tombol saat proses unggah berjalan", async () => {
      const user = userEvent.setup();
      renderModal({ state: { isLostFoundChangeCover: true } });

      await user.upload(screen.getByLabelText("Pilih gambar"), makeFile());

      expect(screen.getByRole("button", { name: "Unggah Cover" })).toBeDisabled();
    });

    it("menutup modal dan memanggil onSuccess jika berhasil diunggah", async () => {
      asyncSetIsLostFoundChangeCover.mockImplementationOnce(() => async (dispatch) => {
        dispatch({ type: "SET_IS_LOST_FOUND_CHANGED_COVER", payload: { status: true } });
      });
      const user = userEvent.setup();
      const { onClose, onSuccess } = renderModal();

      await user.upload(screen.getByLabelText("Pilih gambar"), makeFile());
      await user.click(screen.getByRole("button", { name: "Unggah Cover" }));

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("tidak error jika onSuccess tidak diberikan", async () => {
      asyncSetIsLostFoundChangeCover.mockImplementationOnce(() => async (dispatch) => {
        dispatch({ type: "SET_IS_LOST_FOUND_CHANGED_COVER", payload: { status: true } });
      });
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithProviders(<ChangeCoverModal isOpen lostFound={lostFound} onClose={onClose} />);

      await user.upload(screen.getByLabelText("Pilih gambar"), makeFile());
      await user.click(screen.getByRole("button", { name: "Unggah Cover" }));

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it("tidak menutup modal jika unggah gagal", async () => {
      const user = userEvent.setup();
      const { onClose, onSuccess } = renderModal();

      await user.upload(screen.getByLabelText("Pilih gambar"), makeFile());
      await user.click(screen.getByRole("button", { name: "Unggah Cover" }));

      await waitFor(() => expect(asyncSetIsLostFoundChangeCover).toHaveBeenCalled());
      expect(onClose).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});