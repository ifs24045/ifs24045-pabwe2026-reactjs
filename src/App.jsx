import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./features/auth/layouts/AuthLayout";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import LostFoundLayout from "./features/lost-founds/layouts/LostFoundLayout";
import HomePage from "./features/lost-founds/pages/HomePage";
import DetailPage from "./features/lost-founds/pages/DetailPage";
import UsersPage from "./features/users/pages/UsersPage";
import ProfilePage from "./features/users/pages/ProfilePage";

function App() {
  return (
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
  );
}

export default App;