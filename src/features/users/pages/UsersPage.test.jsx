import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils";
import UsersPage from "./UsersPage";
import { asyncSetUsers } from "../states/action";

vi.mock("../states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, asyncSetUsers: vi.fn(() => async () => {}) };
});

const users = [
  { id: "1", name: "Budi Santoso", email: "budi@mail.com", photo: null },
  { id: "2", name: "Siti", email: "siti@mail.com", photo: "https://img.test/siti.png" },
  { id: "3", name: "", email: "anon@mail.com", photo: null },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("memanggil asyncSetUsers saat halaman dimuat", async () => {
    renderWithProviders(<UsersPage />);

    await waitFor(() => expect(asyncSetUsers).toHaveBeenCalledTimes(1));
  });

  it("menampilkan teks memuat lalu menghilang setelah data selesai diambil", async () => {
    renderWithProviders(<UsersPage />, { preloadedState: { users } });

    expect(screen.getByText("Memuat pengguna...")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Memuat pengguna...")).not.toBeInTheDocument()
    );
  });

  it("menampilkan daftar pengguna dengan nama dan email", async () => {
    renderWithProviders(<UsersPage />, { preloadedState: { users } });

    expect(await screen.findByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.getByText("budi@mail.com")).toBeInTheDocument();
    expect(screen.getByText("Siti")).toBeInTheDocument();
    expect(screen.getByText("siti@mail.com")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("menampilkan foto jika ada dan inisial jika tidak ada foto", async () => {
    renderWithProviders(<UsersPage />, { preloadedState: { users } });

    expect(await screen.findByRole("img", { name: "Siti" })).toHaveAttribute(
      "src",
      "https://img.test/siti.png"
    );
    expect(screen.getByText("BS")).toBeInTheDocument(); // Budi Santoso
    expect(screen.queryByRole("img", { name: "Budi Santoso" })).not.toBeInTheDocument();
  });

  it("menampilkan pesan kosong jika tidak ada pengguna", async () => {
    renderWithProviders(<UsersPage />, { preloadedState: { users: [] } });

    expect(
      await screen.findByText("Tidak ada pengguna yang ditemukan.")
    ).toBeInTheDocument();
  });

  it("memfilter pengguna berdasarkan nama (tidak peka huruf besar/kecil)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, { preloadedState: { users } });
    await screen.findByText("Budi Santoso");

    await user.type(screen.getByLabelText("Cari pengguna"), "BUDI");

    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.queryByText("Siti")).not.toBeInTheDocument();
  });

  it("memfilter pengguna berdasarkan email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, { preloadedState: { users } });
    await screen.findByText("Budi Santoso");

    await user.type(screen.getByLabelText("Cari pengguna"), "siti@");

    expect(screen.getByText("Siti")).toBeInTheDocument();
    expect(screen.queryByText("Budi Santoso")).not.toBeInTheDocument();
  });

  it("mengabaikan spasi di awal/akhir kata kunci", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, { preloadedState: { users } });
    await screen.findByText("Budi Santoso");

    await user.type(screen.getByLabelText("Cari pengguna"), "   ");

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("menampilkan pesan kosong jika kata kunci tidak cocok", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, { preloadedState: { users } });
    await screen.findByText("Budi Santoso");

    await user.type(screen.getByLabelText("Cari pengguna"), "zzzz");

    expect(screen.getByText("Tidak ada pengguna yang ditemukan.")).toBeInTheDocument();
  });

  it("tetap aman jika data pengguna tidak punya nama/email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, {
      preloadedState: { users: [{ id: "9", photo: null }] },
    });
    await screen.findByRole("list");

    await user.type(screen.getByLabelText("Cari pengguna"), "abc");

    expect(screen.getByText("Tidak ada pengguna yang ditemukan.")).toBeInTheDocument();
  });
});