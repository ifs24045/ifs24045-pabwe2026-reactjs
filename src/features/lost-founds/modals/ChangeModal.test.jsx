import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import ChangeModal from "./ChangeModal";
import { asyncSetIsLostFoundChange } from "../states/action";

vi.mock("../states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, asyncSetIsLostFoundChange: vi.fn(() => async () => {}) };
});

const lostFound = {
  id: "abc",
  title: "Dompet hitam",
  description: "Hilang di kantin",
  status: "found",
  is_completed: 1,
};

function renderModal({
  isOpen = true,
  item = lostFound,
  state,
  onClose = vi.fn(),
  onSuccess = vi.fn(),
} = {}) {
  const result = renderWithProviders(
    <ChangeModal isOpen={isOpen} lostFound={item} onClose={onClose} onSuccess={onSuccess} />,
    { preloadedState: state }
  );
  return { ...result, onClose, onSuccess };
}

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it("mengisi form dengan data laporan yang ada", () => {
      renderModal();

      expect(screen.getByRole("dialog", { name: "Ubah Laporan" })).toBeInTheDocument();
      expect(screen.getByLabelText("Judul")).toHaveValue("Dompet hitam");
      expect(screen.getByLabelText("Deskripsi")).toHaveValue("Hilang di kantin");
      expect(screen.getByLabelText("Jenis Laporan")).toHaveValue("found");
      expect(screen.getByRole("switch")).toBeChecked();
    });

    it("memakai nilai bawaan jika data laporan tidak lengkap", () => {
      renderModal({ item: { id: "x" } });

      expect(screen.getByLabelText("Judul")).toHaveValue("");
      expect(screen.getByLabelText("Deskripsi")).toHaveValue("");
      expect(screen.getByLabelText("Jenis Laporan")).toHaveValue("lost");
      expect(screen.getByRole("switch")).not.toBeChecked();
    });

    it.each([
      [0, false],
      ["0", false],
      ["1", true],
      [1, true],
    ])("membaca is_completed=%j sebagai %s", (value, expected) => {
      renderModal({ item: { ...lostFound, is_completed: value } });

      expect(screen.getByRole("switch").checked).toBe(expected);
    });

    it("menonaktifkan tombol simpan saat proses ubah berjalan", () => {
      renderModal({ state: { isLostFoundChange: true } });

      expect(screen.getByRole("button", { name: "Simpan Perubahan" })).toBeDisabled();
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

  describe("validasi", () => {
    it("menampilkan pesan jika judul dan deskripsi dikosongkan", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.clear(screen.getByLabelText("Judul"));
      await user.clear(screen.getByLabelText("Deskripsi"));
      await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

      expect(screen.getByText("Judul wajib diisi")).toBeInTheDocument();
      expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
      expect(asyncSetIsLostFoundChange).not.toHaveBeenCalled();
    });

    it("hanya menampilkan pesan untuk isian yang kosong", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.clear(screen.getByLabelText("Deskripsi"));
      await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

      expect(screen.queryByText("Judul wajib diisi")).not.toBeInTheDocument();
      expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
    });
  });

  describe("submit", () => {
    it("memanggil asyncSetIsLostFoundChange dengan id dan data terbaru", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.clear(screen.getByLabelText("Judul"));
      await user.type(screen.getByLabelText("Judul"), "Dompet coklat");
      await user.selectOptions(screen.getByLabelText("Jenis Laporan"), "lost");
      await user.click(screen.getByRole("switch")); // selesai -> belum selesai
      await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

      await waitFor(() =>
        expect(asyncSetIsLostFoundChange).toHaveBeenCalledWith("abc", {
          title: "Dompet coklat",
          description: "Hilang di kantin",
          status: "lost",
          isCompleted: false,
        })
      );
    });

    it("mengirim isCompleted true setelah switch dinyalakan", async () => {
      const user = userEvent.setup();
      renderModal({ item: { ...lostFound, is_completed: 0 } });

      await user.click(screen.getByRole("switch"));
      await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

      await waitFor(() =>
        expect(asyncSetIsLostFoundChange).toHaveBeenCalledWith(
          "abc",
          expect.objectContaining({ isCompleted: true })
        )
      );
    });

    it("menutup modal dan memanggil onSuccess jika berhasil diubah", async () => {
      asyncSetIsLostFoundChange.mockImplementationOnce(() => async (dispatch) => {
        dispatch({ type: "SET_IS_LOST_FOUND_CHANGED", payload: { status: true } });
      });
      const user = userEvent.setup();
      const { onClose, onSuccess } = renderModal();

      await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("tidak error jika onSuccess tidak diberikan", async () => {
      asyncSetIsLostFoundChange.mockImplementationOnce(() => async (dispatch) => {
        dispatch({ type: "SET_IS_LOST_FOUND_CHANGED", payload: { status: true } });
      });
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithProviders(<ChangeModal isOpen lostFound={lostFound} onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it("tidak menutup modal jika perubahan gagal", async () => {
      const user = userEvent.setup();
      const { onClose, onSuccess } = renderModal();

      await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

      await waitFor(() => expect(asyncSetIsLostFoundChange).toHaveBeenCalled());
      expect(onClose).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});