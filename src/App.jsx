import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./features/auth/layouts/AuthLayout";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import LostFoundLayout from "./features/lost-founds/layouts/LostFoundLayout";

// Halaman dashboard dimuat terpisah agar halaman login lebih ringan
const HomePage = lazy(() => import("./features/lost-founds/pages/HomePage"));
const DetailPage = lazy(() => import("./features/lost-founds/pages/DetailPage"));
const UsersPage = lazy(() => import("./features/users/pages/UsersPage"));
const ProfilePage = lazy(() => import("./features/users/pages/ProfilePage"));

// Tampilan sementara saat halaman dashboard sedang dimuat
const pageFallback = (
  <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-100">
    <img src="/logo.svg" alt="" width="56" height="56" />
    <h1 className="text-lg font-bold text-slate-700">Lost &amp; Founds</h1>
  </main>
);

function App() {
  return (
    <Suspense fallback={pageFallback}>
      <Routes>
        {/* Rute autentikasi */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Rute dashboard (dilindungi oleh LostFoundLayout) */}
        <Route path="/" element={<LostFoundLayout />}>
          <Route index element={<HomePage />} />
          <Route path="lost-founds/:id" element={<DetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Rute tidak dikenal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;