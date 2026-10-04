import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import ProfilePage from "./ProfilePage";
import {
  asyncSetIsChangeProfile,
  asyncSetIsChangeProfilePhoto,
  asyncSetIsChangeProfilePassword,
} from "../states/action";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    asyncSetIsChangeProfile: vi.fn(() => async () => {}),
    asyncSetIsChangeProfilePhoto: vi.fn(() => async () => {}),
    asyncSetIsChangeProfilePassword: vi.fn(() => async () => {}),
  };
});

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, showErrorDialog: vi.fn() };
});

const profile = { id: "1", name: "Budi Santoso", email: "budi@mail.com", photo: null };

function renderProfile(state = { profile }) {
  return renderWithProviders(<ProfilePage />, { preloadedState: state });
}

function makeFile({ name = "foto.png", type = "image/png", size } = {}) {
  const file = new File(["x"], name, { type });
  if (size) Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
  });

  it("menampilkan teks memuat jika profil belum tersedia", () => {
    renderProfile({ profile: null });

    expect(screen.getByText("Memuat profil...")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Profil Saya" })).not.toBeInTheDocument();
  });

  it("menampilkan tiga kartu dan mengisi form dengan data profil", () => {
    renderProfile();

    expect(screen.getByRole("heading", { name: "Profil Saya" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Informasi Akun" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Foto Profil" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kata Sandi" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toHaveValue("Budi Santoso");
    expect(screen.getByLabelText("Email")).toHaveValue("budi@mail.com");
  });

  it("mengosongkan form jika profil tidak punya nama/email", () => {
    renderProfile({ profile: { id: "2", photo: null } });

    expect(screen.getByLabelText("Nama")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
  });

  /* ---------- Informasi akun ---------- */
  describe("form informasi akun", () => {
    it("menampilkan validasi jika nama dan email kosong", async () => {
      const user = userEvent.setup();
      renderProfile();

      await user.clear(screen.getByLabelText("Nama"));
      await user.clear(screen.getByLabelText("Email"));
      await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

      expect(screen.getByText("Nama wajib diisi")).toBeInTheDocument();
      expect(screen.getByText("Email wajib diisi")).toBeInTheDocument();
      expect(asyncSetIsChangeProfile).not.toHaveBeenCalled();
    });

    it("menolak format email yang tidak valid", async () => {
      const user = userEvent.setup();
      renderProfile();

      await user.clear(screen.getByLabelText("Email"));
      await user.type(screen.getByLabelText("Email"), "bukan-email");
      await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

      expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
      expect(asyncSetIsChangeProfile).not.toHaveBeenCalled();
    });

    it("memanggil asyncSetIsChangeProfile dengan data terbaru jika valid", async () => {
      const user = userEvent.setup();
      renderProfile();

      await user.clear(screen.getByLabelText("Nama"));
      await user.type(screen.getByLabelText("Nama"), "Budi Baru");
      await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

      await waitFor(() =>
        expect(asyncSetIsChangeProfile).toHaveBeenCalledWith({
          name: "Budi Baru",
          email: "budi@mail.com",
        })
      );
    });

    it("menonaktifkan tombol selama proses simpan berjalan", async () => {
      let finish;
      asyncSetIsChangeProfile.mockImplementationOnce(
        () => () => new Promise((resolve) => (finish = resolve))
      );
      const user = userEvent.setup();
      renderProfile();

      await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }));

      expect(screen.getByRole("button", { name: "Simpan Perubahan" })).toBeDisabled();

      await act(async () => finish());
      expect(screen.getByRole("button", { name: "Simpan Perubahan" })).toBeEnabled();
    });
  });

  /* ---------- Foto profil ---------- */
  describe("form foto profil", () => {
    it("menampilkan inisial jika belum ada foto dan tombol unggah nonaktif", () => {
      renderProfile();

      expect(screen.getByText("BS")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Unggah Foto" })).toBeDisabled();
    });

    it("menampilkan foto profil yang tersimpan", () => {
      renderProfile({ profile: { ...profile, photo: "https://img.test/budi.png" } });

      expect(screen.getByRole("img", { name: "Foto profil" })).toHaveAttribute(
        "src",
        "https://img.test/budi.png"
      );
    });

    it("menampilkan pratinjau dan mengaktifkan tombol setelah memilih gambar", async () => {
      const user = userEvent.setup();
      renderProfile();

      await user.upload(screen.getByLabelText("Pilih foto"), makeFile());

      expect(screen.getByRole("img", { name: "Foto profil" })).toHaveAttribute(
        "src",
        "blob:preview"
      );
      expect(screen.getByRole("button", { name: "Unggah Foto" })).toBeEnabled();
    });

    it("membersihkan URL pratinjau saat komponen dilepas", async () => {
      const user = userEvent.setup();
      const { unmount } = renderProfile();

      await user.upload(screen.getByLabelText("Pilih foto"), makeFile());
      unmount();

      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    });

    it("menolak file yang bukan gambar", async () => {
      const user = userEvent.setup({ applyAccept: false });
      renderProfile();

      await user.upload(
        screen.getByLabelText("Pilih foto"),
        makeFile({ name: "dok.pdf", type: "application/pdf" })
      );

      expect(showErrorDialog).toHaveBeenCalledWith("File harus berupa gambar");
      expect(screen.getByRole("button", { name: "Unggah Foto" })).toBeDisabled();
    });

    it("menolak gambar yang lebih dari 2 MB", async () => {
      const user = userEvent.setup();
      renderProfile();

      await user.upload(
        screen.getByLabelText("Pilih foto"),
        makeFile({ size: 3 * 1024 * 1024 })
      );

      expect(showErrorDialog).toHaveBeenCalledWith("Ukuran foto maksimal 2 MB");
      expect(screen.getByRole("button", { name: "Unggah Foto" })).toBeDisabled();
    });

    it("mengosongkan pilihan jika file dibatalkan", async () => {
      const user = userEvent.setup();
      renderProfile();
      const input = screen.getByLabelText("Pilih foto");

      await user.upload(input, makeFile());
      expect(screen.getByRole("button", { name: "Unggah Foto" })).toBeEnabled();

      await act(async () => {
        const el = screen.getByLabelText("Pilih foto");
        Object.defineProperty(el, "files", { value: [], configurable: true });
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });

      expect(screen.getByRole("button", { name: "Unggah Foto" })).toBeDisabled();
    });

    it("memanggil asyncSetIsChangeProfilePhoto dengan file yang dipilih", async () => {
      const user = userEvent.setup();
      renderProfile();
      const file = makeFile();

      await user.upload(screen.getByLabelText("Pilih foto"), file);
      await user.click(screen.getByRole("button", { name: "Unggah Foto" }));

      await waitFor(() => expect(asyncSetIsChangeProfilePhoto).toHaveBeenCalledWith(file));
    });

    it("mereset pilihan file jika unggah berhasil", async () => {
      asyncSetIsChangeProfilePhoto.mockImplementationOnce(() => async (dispatch) => {
        dispatch({ type: "SET_IS_CHANGE_PROFILE_PHOTO", payload: { status: true } });
      });
      const user = userEvent.setup();
      renderProfile();

      await user.upload(screen.getByLabelText("Pilih foto"), makeFile());
      await user.click(screen.getByRole("button", { name: "Unggah Foto" }));

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Unggah Foto" })).toBeDisabled()
      );
      expect(screen.getByText("BS")).toBeInTheDocument();
    });

    it("mempertahankan pilihan file jika unggah gagal", async () => {
      const user = userEvent.setup();
      renderProfile();

      await user.upload(screen.getByLabelText("Pilih foto"), makeFile());
      await user.click(screen.getByRole("button", { name: "Unggah Foto" }));

      await waitFor(() => expect(asyncSetIsChangeProfilePhoto).toHaveBeenCalled());
      expect(screen.getByRole("button", { name: "Unggah Foto" })).toBeEnabled();
    });

    it("menampilkan error jika submit tanpa memilih foto", async () => {
      renderProfile();
      const form = screen.getByRole("button", { name: "Unggah Foto" }).closest("form");

      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });

      expect(showErrorDialog).toHaveBeenCalledWith("Pilih foto terlebih dahulu");
      expect(asyncSetIsChangeProfilePhoto).not.toHaveBeenCalled();
    });
  });

  /* ---------- Kata sandi ---------- */
  describe("form kata sandi", () => {
    const submit = (user) =>
      user.click(screen.getByRole("button", { name: "Ganti Kata Sandi" }));

    it("menampilkan validasi jika form kosong", async () => {
      const user = userEvent.setup();
      renderProfile();

      await submit(user);

      expect(screen.getByText("Kata sandi saat ini wajib diisi")).toBeInTheDocument();
      expect(screen.getByText("Kata sandi baru wajib diisi")).toBeInTheDocument();
      expect(asyncSetIsChangeProfilePassword).not.toHaveBeenCalled();
    });

    it("menolak kata sandi baru kurang dari 6 karakter", async () => {
      const user = userEvent.setup();
      renderProfile();

      await user.type(screen.getByLabelText("Kata Sandi Saat Ini"), "lama123");
      await user.type(screen.getByLabelText("Kata Sandi Baru"), "123");
      await user.type(screen.getByLabelText("Konfirmasi Kata Sandi Baru"), "123");
      await submit(user);

      expect(screen.getByText("Kata sandi baru minimal 6 karakter")).toBeInTheDocument();
      expect(asyncSetIsChangeProfilePassword).not.toHaveBeenCalled();
    });

    it("menolak jika konfirmasi tidak sama", async () => {
      const user = userEvent.setup();
      renderProfile();

      await user.type(screen.getByLabelText("Kata Sandi Saat Ini"), "lama123");
      await user.type(screen.getByLabelText("Kata Sandi Baru"), "baru1234");
      await user.type(screen.getByLabelText("Konfirmasi Kata Sandi Baru"), "beda1234");
      await submit(user);

      expect(screen.getByText("Konfirmasi kata sandi tidak sama")).toBeInTheDocument();
      expect(asyncSetIsChangeProfilePassword).not.toHaveBeenCalled();
    });

    it("memanggil asyncSetIsChangeProfilePassword jika valid", async () => {
      const user = userEvent.setup();
      renderProfile();

      await user.type(screen.getByLabelText("Kata Sandi Saat Ini"), "lama123");
      await user.type(screen.getByLabelText("Kata Sandi Baru"), "baru1234");
      await user.type(screen.getByLabelText("Konfirmasi Kata Sandi Baru"), "baru1234");
      await submit(user);

      await waitFor(() =>
        expect(asyncSetIsChangeProfilePassword).toHaveBeenCalledWith({
          password: "lama123",
          newPassword: "baru1234",
        })
      );
    });

    it("mengosongkan form jika penggantian berhasil", async () => {
      asyncSetIsChangeProfilePassword.mockImplementationOnce(() => async (dispatch) => {
        dispatch({ type: "SET_IS_CHANGE_PROFILE_PASSWORD", payload: { status: true } });
      });
      const user = userEvent.setup();
      renderProfile();

      await user.type(screen.getByLabelText("Kata Sandi Saat Ini"), "lama123");
      await user.type(screen.getByLabelText("Kata Sandi Baru"), "baru1234");
      await user.type(screen.getByLabelText("Konfirmasi Kata Sandi Baru"), "baru1234");
      await submit(user);

      await waitFor(() =>
        expect(screen.getByLabelText("Kata Sandi Saat Ini")).toHaveValue("")
      );
      expect(screen.getByLabelText("Kata Sandi Baru")).toHaveValue("");
      expect(screen.getByLabelText("Konfirmasi Kata Sandi Baru")).toHaveValue("");
    });

    it("mempertahankan isian jika penggantian gagal", async () => {
      const user = userEvent.setup();
      renderProfile();

      await user.type(screen.getByLabelText("Kata Sandi Saat Ini"), "lama123");
      await user.type(screen.getByLabelText("Kata Sandi Baru"), "baru1234");
      await user.type(screen.getByLabelText("Konfirmasi Kata Sandi Baru"), "baru1234");
      await submit(user);

      await waitFor(() => expect(asyncSetIsChangeProfilePassword).toHaveBeenCalled());
      expect(screen.getByLabelText("Kata Sandi Saat Ini")).toHaveValue("lama123");
    });

    it("menonaktifkan tombol selama proses berjalan", async () => {
      let finish;
      asyncSetIsChangeProfilePassword.mockImplementationOnce(
        () => () => new Promise((resolve) => (finish = resolve))
      );
      const user = userEvent.setup();
      renderProfile();

      await user.type(screen.getByLabelText("Kata Sandi Saat Ini"), "lama123");
      await user.type(screen.getByLabelText("Kata Sandi Baru"), "baru1234");
      await user.type(screen.getByLabelText("Konfirmasi Kata Sandi Baru"), "baru1234");
      await submit(user);

      expect(screen.getByRole("button", { name: "Ganti Kata Sandi" })).toBeDisabled();

      await act(async () => finish());
      expect(screen.getByRole("button", { name: "Ganti Kata Sandi" })).toBeEnabled();
    });
  });
});