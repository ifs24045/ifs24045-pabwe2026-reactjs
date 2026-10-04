import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import { putAccessToken } from "../../../helpers/apiHelper";
import AuthLayout from "./AuthLayout";

function renderLayout() {
  return renderWithProviders(
    <Routes>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<p>Isi Halaman Login</p>} />
      </Route>
      <Route path="/" element={<p>Beranda</p>} />
    </Routes>,
    { route: "/auth/login" }
  );
}

describe("AuthLayout", () => {
  it("menampilkan konten halaman anak dan banner jika belum login", () => {
    renderLayout();

    expect(screen.getByText("Isi Halaman Login")).toBeInTheDocument();
    expect(
      screen.getByText("Kehilangan sesuatu? Menemukan barang orang lain?")
    ).toBeInTheDocument();
  });

  it("mengalihkan ke beranda jika pengguna sudah punya token", () => {
    putAccessToken("token-123");

    renderLayout();

    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.queryByText("Isi Halaman Login")).not.toBeInTheDocument();
  });
});