import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import LoginPage from "./LoginPage";
import { asyncSetIsAuthLogin } from "../states/action";

vi.mock("../states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, asyncSetIsAuthLogin: vi.fn(() => async () => {}) };
});

function renderLogin(preloadedState) {
  return renderWithProviders(
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/" element={<p>Beranda</p>} />
    </Routes>,
    { route: "/auth/login", preloadedState }
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan form login dan tautan ke halaman daftar", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: "Selamat datang kembali" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute(
      "href",
      "/auth/register"
    );
  });

  it("menampilkan pesan validasi jika form kosong dan tidak memanggil login", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(screen.getByText("Email wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi wajib diisi")).toBeInTheDocument();
    expect(asyncSetIsAuthLogin).not.toHaveBeenCalled();
  });

  it("menolak format email yang tidak valid", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "bukan-email");
    await user.type(screen.getByLabelText("Kata Sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(asyncSetIsAuthLogin).not.toHaveBeenCalled();
  });

  it("menolak kata sandi kurang dari 6 karakter", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "123");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(screen.getByText("Kata sandi minimal 6 karakter")).toBeInTheDocument();
    expect(asyncSetIsAuthLogin).not.toHaveBeenCalled();
  });

  it("memanggil login dengan data yang diisi jika valid", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() =>
      expect(asyncSetIsAuthLogin).toHaveBeenCalledWith({
        email: "a@b.com",
        password: "123456",
      })
    );
  });

  it("menonaktifkan tombol selama proses login berjalan", async () => {
    let finish;
    asyncSetIsAuthLogin.mockImplementationOnce(
      () => () => new Promise((resolve) => (finish = resolve))
    );
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByRole("button", { name: /Memproses/ })).toBeDisabled();

    await act(async () => finish());
    expect(screen.getByRole("button", { name: "Masuk" })).toBeEnabled();
  });

  it("menampilkan dan menyembunyikan kata sandi", async () => {
    const user = userEvent.setup();
    renderLogin();
    const input = screen.getByLabelText("Kata Sandi");

    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Tampilkan kata sandi" }));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Sembunyikan kata sandi" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("berpindah ke beranda ketika status login sudah true", () => {
    renderLogin({ isAuthLogin: true });

    expect(screen.getByText("Beranda")).toBeInTheDocument();
  });
});