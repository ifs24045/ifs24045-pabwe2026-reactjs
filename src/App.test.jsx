import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { putAccessToken } from "./helpers/apiHelper";
import App from "./App";

// Halaman dan layout diganti stub agar tes fokus pada konfigurasi rute
vi.mock("./features/auth/pages/LoginPage", () => ({
  default: () => <p>Halaman Login</p>,
}));
vi.mock("./features/auth/pages/RegisterPage", () => ({
  default: () => <p>Halaman Registrasi</p>,
}));
vi.mock("./features/lost-founds/pages/HomePage", () => ({
  default: () => <p>Halaman Beranda</p>,
}));
vi.mock("./features/lost-founds/pages/DetailPage", () => ({
  default: () => <p>Halaman Detail</p>,
}));
vi.mock("./features/users/pages/UsersPage", () => ({
  default: () => <p>Halaman Pengguna</p>,
}));
vi.mock("./features/users/pages/ProfilePage", () => ({
  default: () => <p>Halaman Profil</p>,
}));
vi.mock("./features/lost-founds/components/NavbarComponent", () => ({
  default: () => <nav>Navbar</nav>,
}));
vi.mock("./features/lost-founds/components/SidebarComponent", () => ({
  default: () => <aside>Sidebar</aside>,
}));
vi.mock("./features/users/states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, asyncSetProfile: vi.fn(() => async () => {}) };
});

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rute autentikasi", () => {
    it("menampilkan halaman login di /auth/login", () => {
      renderWithProviders(<App />, { route: "/auth/login" });

      expect(screen.getByText("Halaman Login")).toBeInTheDocument();
    });

    it("menampilkan halaman registrasi di /auth/register", () => {
      renderWithProviders(<App />, { route: "/auth/register" });

      expect(screen.getByText("Halaman Registrasi")).toBeInTheDocument();
    });

    it("mengalihkan /auth ke halaman login", () => {
      renderWithProviders(<App />, { route: "/auth" });

      expect(screen.getByText("Halaman Login")).toBeInTheDocument();
    });

    it("mengalihkan pengguna yang sudah login dari /auth/login ke beranda", async () => {
      putAccessToken("token-123");

      renderWithProviders(<App />, { route: "/auth/login" });

      expect(await screen.findByText("Halaman Beranda")).toBeInTheDocument();
      expect(screen.queryByText("Halaman Login")).not.toBeInTheDocument();
    });
  });

  describe("rute dashboard tanpa login", () => {
    it.each(["/", "/users", "/profile", "/lost-founds/abc"])(
      "mengalihkan %s ke halaman login",
      (route) => {
        renderWithProviders(<App />, { route });

        expect(screen.getByText("Halaman Login")).toBeInTheDocument();
      }
    );
  });

  describe("rute dashboard setelah login", () => {
    beforeEach(() => {
      putAccessToken("token-123");
    });

    it("menampilkan beranda beserta navbar dan sidebar di /", async () => {
      renderWithProviders(<App />, { route: "/" });

      expect(await screen.findByText("Halaman Beranda")).toBeInTheDocument();
      expect(screen.getByText("Navbar")).toBeInTheDocument();
      expect(screen.getByText("Sidebar")).toBeInTheDocument();
    });

    it("menampilkan halaman detail di /lost-founds/:id", async () => {
      renderWithProviders(<App />, { route: "/lost-founds/abc" });

      expect(await screen.findByText("Halaman Detail")).toBeInTheDocument();
    });

    it("menampilkan halaman pengguna di /users", async () => {
      renderWithProviders(<App />, { route: "/users" });

      expect(await screen.findByText("Halaman Pengguna")).toBeInTheDocument();
    });

    it("menampilkan halaman profil di /profile", async () => {
      renderWithProviders(<App />, { route: "/profile" });

      expect(await screen.findByText("Halaman Profil")).toBeInTheDocument();
    });
  });

  it("mengalihkan rute yang tidak dikenal ke beranda", async () => {
    putAccessToken("token-123");

    renderWithProviders(<App />, { route: "/halaman-ngawur" });

    expect(await screen.findByText("Halaman Beranda")).toBeInTheDocument();
  });
});