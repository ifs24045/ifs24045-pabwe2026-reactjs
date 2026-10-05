import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { IconLoader2 } from "@tabler/icons-react";
import { getAccessToken } from "../../../helpers/apiHelper";
import { asyncSetProfile } from "../../users/states/action";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

function LostFoundLayout() {
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Verifikasi token dengan memuat profil pengguna
  useEffect(() => {
    if (!getAccessToken()) return;

    dispatch(asyncSetProfile()).finally(() => setIsChecking(false));
  }, [dispatch]);

  // Route guard 1: belum login / token dihapus karena tidak valid
  if (!getAccessToken()) {
    return <Navigate to="/auth/login" replace />;
  }

  // Route guard 2: sesi masih diverifikasi
  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center gap-2 text-slate-600">
        <IconLoader2 size={22} className="animate-spin" />
        <h1 className="text-base font-normal">Memuat sesi...</h1>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarComponent onMenuClick={() => setIsSidebarOpen(true)} />
      <SidebarComponent
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="px-4 pb-10 pt-24 md:pl-72 md:pr-6">
        <Outlet />
      </main>
    </div>
  );
}

export default LostFoundLayout;