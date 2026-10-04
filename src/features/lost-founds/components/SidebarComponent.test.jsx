import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import SidebarComponent from "./SidebarComponent";

function renderSidebar({ route = "/", isOpen = false, onClose = vi.fn() } = {}) {
  const result = renderWithProviders(
    <SidebarComponent isOpen={isOpen} onClose={onClose} />,
    { route }
  );
  return { ...result, onClose };
}

describe("SidebarComponent", () => {
  it("menampilkan semua menu navigasi dengan tujuan yang benar", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Statistik" })).toHaveAttribute("href", "/#statistik");
    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveAttribute("href", "/users");
    expect(screen.getByRole("link", { name: "Profil Saya" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByLabelText("Navigasi utama")).toBeInTheDocument();
  });

  describe("menu aktif", () => {
    it.each([
      ["/", "Dashboard"],
      ["/#statistik", "Statistik"],
      ["/users", "Pengguna"],
      ["/profile", "Profil Saya"],
      ["/lost-founds/abc", "Dashboard"],
    ])("rute %s menandai menu %s sebagai aktif", (route, label) => {
      renderSidebar({ route });

      expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
      expect(screen.getAllByRole("link").filter((el) => el.hasAttribute("aria-current"))).toHaveLength(1);
    });

    it("Dashboard tidak aktif saat hash #statistik", () => {
      renderSidebar({ route: "/#statistik" });

      expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    });
  });

  describe("drawer mobile", () => {
    it("menyembunyikan overlay dan menggeser sidebar keluar saat tertutup", () => {
      renderSidebar({ isOpen: false });

      expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Navigasi utama")).toHaveClass("-translate-x-full");
    });

    it("menampilkan overlay dan sidebar saat terbuka", () => {
      renderSidebar({ isOpen: true });

      expect(screen.getByTestId("sidebar-overlay")).toBeInTheDocument();
      expect(screen.getByLabelText("Navigasi utama")).toHaveClass("translate-x-0");
    });

    it("memanggil onClose saat overlay diklik", async () => {
      const user = userEvent.setup();
      const { onClose } = renderSidebar({ isOpen: true });

      await user.click(screen.getByTestId("sidebar-overlay"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("memanggil onClose saat tombol tutup diklik", async () => {
      const user = userEvent.setup();
      const { onClose } = renderSidebar({ isOpen: true });

      await user.click(screen.getByRole("button", { name: "Tutup menu" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("memanggil onClose saat salah satu menu dipilih", async () => {
      const user = userEvent.setup();
      const { onClose } = renderSidebar({ isOpen: true });

      await user.click(screen.getByRole("link", { name: "Pengguna" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});