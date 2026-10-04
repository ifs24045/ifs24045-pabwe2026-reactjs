import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import NavbarComponent from "./NavbarComponent";
import { asyncSetIsAuthLogout } from "../../auth/states/action";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

vi.mock("../../auth/states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, asyncSetIsAuthLogout: vi.fn(() => async () => {}) };
});
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, showConfirmDialog: vi.fn() };
});

const profile = { id: "1", name: "Budi Santoso", email: "budi@mail.com", photo: null };

function renderNavbar({ state = { profile }, onMenuClick = vi.fn() } = {}) {
  const result = renderWithProviders(
    <Routes>
      <Route path="/" element={<NavbarComponent onMenuClick={onMenuClick} />} />
      <Route path="/profile" element={<p>Halaman Profil</p>} />
      <Route path="/auth/login" element={<p>Halaman Login</p>} />
    </Routes>,
    { preloadedState: state }
  );
  return { ...result, onMenuClick };
}

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan logo, judul, dan tautan ke beranda", () => {
    renderNavbar();

    expect(screen.getByRole("img", { name: "Logo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lost & Founds/ })).toHaveAttribute("href", "/");
    expect(screen.getByText("Sedang masuk")).toBeInTheDocument();
  });

  it("memanggil onMenuClick saat tombol menu ditekan", async () => {
    const user = userEvent.setup();
    const { onMenuClick } = renderNavbar();

    await user.click(screen.getByRole("button", { name: "Buka menu" }));

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  describe("avatar", () => {
    it("menampilkan inisial jika tidak ada foto", () => {
      renderNavbar();

      expect(screen.getByText("BS")).toBeInTheDocument();
    });

    it("menampilkan foto jika tersedia", () => {
      renderNavbar({ state: { profile: { ...profile, photo: "https://img.test/b.png" } } });

      expect(screen.getByRole("img", { name: "Budi Santoso" })).toHaveAttribute(
        "src",
        "https://img.test/b.png"
      );
    });

    it("tidak error jika profil belum dimuat", () => {
      renderNavbar({ state: { profile: null } });

      expect(screen.getByRole("button", { name: "Menu profil" })).toBeInTheDocument();
    });
  });

  describe("dropdown profil", () => {
    it("tertutup secara bawaan", () => {
      renderNavbar();

      expect(screen.getByRole("button", { name: "Menu profil" })).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(screen.queryByText("budi@mail.com")).not.toBeInTheDocument();
    });

    it("terbuka dan menampilkan nama serta email, lalu tertutup saat diklik lagi", async () => {
      const user = userEvent.setup();
      renderNavbar();
      const toggle = screen.getByRole("button", { name: "Menu profil" });

      await user.click(toggle);

      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
      expect(screen.getByText("budi@mail.com")).toBeInTheDocument();

      await user.click(toggle);

      expect(screen.queryByText("budi@mail.com")).not.toBeInTheDocument();
    });

    it("tertutup saat klik di luar area dropdown", async () => {
      const user = userEvent.setup();
      renderNavbar();

      await user.click(screen.getByRole("button", { name: "Menu profil" }));
      expect(screen.getByText("budi@mail.com")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      await waitFor(() =>
        expect(screen.queryByText("budi@mail.com")).not.toBeInTheDocument()
      );
    });

    it("tetap terbuka saat klik di dalam area dropdown", async () => {
      const user = userEvent.setup();
      renderNavbar();

      await user.click(screen.getByRole("button", { name: "Menu profil" }));
      fireEvent.mouseDown(screen.getByText("budi@mail.com"));

      expect(screen.getByText("budi@mail.com")).toBeInTheDocument();
    });

    it("berpindah ke halaman profil dan menutup dropdown saat 'Profil Saya' diklik", async () => {
      const user = userEvent.setup();
      renderNavbar();

      await user.click(screen.getByRole("button", { name: "Menu profil" }));
      await user.click(screen.getByRole("link", { name: /Profil Saya/ }));

      expect(screen.getByText("Halaman Profil")).toBeInTheDocument();
    });

    it("melepas listener mousedown saat komponen dilepas", () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");
      const { unmount } = renderNavbar();

      unmount();

      expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
      removeSpy.mockRestore();
    });
  });

  describe("logout", () => {
    it("tidak keluar jika konfirmasi dibatalkan", async () => {
      showConfirmDialog.mockResolvedValue(false);
      const user = userEvent.setup();
      renderNavbar();

      await user.click(screen.getByRole("button", { name: /Keluar/ }));

      await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
      expect(asyncSetIsAuthLogout).not.toHaveBeenCalled();
      expect(screen.queryByText("Halaman Login")).not.toBeInTheDocument();
    });

    it("keluar, mengosongkan profil, dan berpindah ke login jika dikonfirmasi", async () => {
      showConfirmDialog.mockResolvedValue(true);
      const user = userEvent.setup();
      const { store } = renderNavbar({
        state: { profile, isProfile: true },
      });

      await user.click(screen.getByRole("button", { name: /Keluar/ }));

      expect(await screen.findByText("Halaman Login")).toBeInTheDocument();
      expect(showConfirmDialog).toHaveBeenCalledWith(
        "Kamu akan keluar dari akun ini.",
        "Keluar?",
        "Ya, keluar"
      );
      expect(asyncSetIsAuthLogout).toHaveBeenCalledTimes(1);
      expect(store.getState().profile).toBeNull();
      expect(store.getState().isProfile).toBe(false);
    });

    it("tombol 'Keluar' di dalam dropdown juga memicu logout dan menutup dropdown", async () => {
      showConfirmDialog.mockResolvedValue(false);
      const user = userEvent.setup();
      renderNavbar();

      await user.click(screen.getByRole("button", { name: "Menu profil" }));
      const logoutButtons = screen.getAllByRole("button", { name: /Keluar/ });
      expect(logoutButtons).toHaveLength(2); // dropdown + tombol desktop

      await user.click(logoutButtons[0]);

      await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
      expect(screen.queryByText("budi@mail.com")).not.toBeInTheDocument();
    });
  });
});