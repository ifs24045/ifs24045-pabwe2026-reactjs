import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import LostFoundLayout from "./LostFoundLayout";
import { asyncSetProfile } from "../../users/states/action";

vi.mock("../../users/states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, asyncSetProfile: vi.fn(() => async () => {}) };
});
vi.mock("../components/NavbarComponent", () => ({
  default: ({ onMenuClick }) => <button onClick={onMenuClick}>Buka Sidebar</button>,
}));
vi.mock("../components/SidebarComponent", () => ({
  default: ({ isOpen, onClose }) => (
    <div data-testid="sidebar" data-open={String(isOpen)}>
      <button onClick={onClose}>Tutup Sidebar</button>
    </div>
  ),
}));

function renderLayout() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<LostFoundLayout />}>
        <Route index element={<p>Isi Halaman</p>} />
      </Route>
      <Route path="/auth/login" element={<p>Halaman Login</p>} />
    </Routes>,
    { route: "/" }
  );
}

describe("LostFoundLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("route guard", () => {
    it("mengalihkan ke login dan tidak memuat profil jika belum ada token", () => {
      renderLayout();

      expect(screen.getByText("Halaman Login")).toBeInTheDocument();
      expect(asyncSetProfile).not.toHaveBeenCalled();
    });

    it("menampilkan indikator memuat sesi selama profil diverifikasi", () => {
      putAccessToken("token-123");
      asyncSetProfile.mockImplementationOnce(() => () => new Promise(() => {}));

      renderLayout();

      expect(screen.getByText("Memuat sesi...")).toBeInTheDocument();
      expect(screen.queryByText("Isi Halaman")).not.toBeInTheDocument();
    });

    it("memuat profil lalu menampilkan layout dan konten halaman jika token ada", async () => {
      putAccessToken("token-123");

      renderLayout();

      expect(await screen.findByText("Isi Halaman")).toBeInTheDocument();
      expect(asyncSetProfile).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Buka Sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
      expect(screen.queryByText("Memuat sesi...")).not.toBeInTheDocument();
    });

    it("mengalihkan ke login jika token ternyata tidak valid (dihapus saat memuat profil)", async () => {
      putAccessToken("token-kedaluwarsa");
      asyncSetProfile.mockImplementationOnce(() => async () => removeAccessToken());

      renderLayout();

      expect(await screen.findByText("Halaman Login")).toBeInTheDocument();
      expect(screen.queryByText("Isi Halaman")).not.toBeInTheDocument();
    });
  });

  describe("sidebar", () => {
    it("tertutup secara bawaan", async () => {
      putAccessToken("token-123");
      renderLayout();

      expect(await screen.findByTestId("sidebar")).toHaveAttribute("data-open", "false");
    });

    it("terbuka saat tombol menu navbar ditekan dan tertutup lagi lewat onClose", async () => {
      putAccessToken("token-123");
      const user = userEvent.setup();
      renderLayout();
      await screen.findByTestId("sidebar");

      await user.click(screen.getByText("Buka Sidebar"));
      expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "true");

      await user.click(screen.getByText("Tutup Sidebar"));
      expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "false");
    });
  });
});