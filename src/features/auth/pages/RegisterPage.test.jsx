import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import RegisterPage from "./RegisterPage";
import { asyncSetIsAuthRegister } from "../states/action";

vi.mock("../states/action", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, asyncSetIsAuthRegister: vi.fn(() => async () => {}) };
});

function renderRegister(preloadedState) {
  return renderWithProviders(
    <Routes>
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/login" element={<p>Halaman Login</p>} />
    </Routes>,
    { route: "/auth/register", preloadedState }
  );
}

async function fillForm(user, { name, email, password, confirmPassword }) {
  if (name) await user.type(screen.getByLabelText("Nama"), name);
  if (email) await user.type(screen.getByLabelText("Email"), email);
  if (password) await user.type(screen.getByLabelText("Kata Sandi"), password);
  if (confirmPassword) {
    await user.type(screen.getByLabelText("Konfirmasi Kata Sandi"), confirmPassword);
  }
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan form registrasi dan tautan ke halaman masuk", () => {
    renderRegister();

    expect(screen.getByRole("heading", { name: "Buat akun baru" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi")).toBeInTheDocument();
    expect(screen.getByLabelText("Konfirmasi Kata Sandi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute(
      "href",
      "/auth/login"
    );
  });

  it("menampilkan pesan validasi jika form kosong", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(screen.getByText("Nama wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Email wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Konfirmasi kata sandi wajib diisi")).toBeInTheDocument();
    expect(asyncSetIsAuthRegister).not.toHaveBeenCalled();
  });

  it("menolak nama yang terlalu pendek", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillForm(user, {
      name: "Bu",
      email: "budi@b.com",
      password: "123456",
      confirmPassword: "123456",
    });
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(screen.getByText("Nama minimal 3 karakter")).toBeInTheDocument();
    expect(asyncSetIsAuthRegister).not.toHaveBeenCalled();
  });

  it("menolak konfirmasi kata sandi yang tidak sama", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillForm(user, {
      name: "Budi",
      email: "budi@b.com",
      password: "123456",
      confirmPassword: "654321",
    });
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(screen.getByText("Konfirmasi kata sandi tidak sama")).toBeInTheDocument();
    expect(asyncSetIsAuthRegister).not.toHaveBeenCalled();
  });

  it("menampilkan dan menyembunyikan kata sandi saat tombol mata ditekan", async () => {
    const user = userEvent.setup();
    renderRegister();

    const password = screen.getByLabelText("Kata Sandi");
    const confirmPassword = screen.getByLabelText("Konfirmasi Kata Sandi");
    expect(password).toHaveAttribute("type", "password");
    expect(confirmPassword).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Tampilkan kata sandi" }));

    expect(password).toHaveAttribute("type", "text");
    expect(confirmPassword).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Sembunyikan kata sandi" }));

    expect(password).toHaveAttribute("type", "password");
    expect(confirmPassword).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Tampilkan kata sandi" })
    ).toBeInTheDocument();
  });

  it("memanggil registrasi tanpa field konfirmasi jika data valid", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillForm(user, {
      name: "Budi",
      email: "budi@b.com",
      password: "123456",
      confirmPassword: "123456",
    });
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    await waitFor(() =>
      expect(asyncSetIsAuthRegister).toHaveBeenCalledWith({
        name: "Budi",
        email: "budi@b.com",
        password: "123456",
      })
    );
  });

  it("menonaktifkan tombol dan menampilkan 'Memproses...' selama registrasi berjalan", async () => {
    let resolveRegister;
    asyncSetIsAuthRegister.mockImplementationOnce(
      () => () =>
        new Promise((resolve) => {
          resolveRegister = resolve;
        })
    );
    const user = userEvent.setup();
    renderRegister();

    await fillForm(user, {
      name: "Budi",
      email: "budi@b.com",
      password: "123456",
      confirmPassword: "123456",
    });
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(await screen.findByRole("button", { name: "Memproses..." })).toBeDisabled();

    await act(async () => {
      resolveRegister();
    });

    expect(await screen.findByRole("button", { name: "Daftar" })).toBeEnabled();
  });

  it("berpindah ke halaman login dan mereset status setelah registrasi sukses", async () => {
    const { store } = renderRegister({ isAuthRegister: true });

    expect(await screen.findByText("Halaman Login")).toBeInTheDocument();
    expect(store.getState().isAuthRegister).toBe(false);
  });
});