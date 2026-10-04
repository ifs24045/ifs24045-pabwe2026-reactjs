import { Navigate, Outlet } from "react-router-dom";
import { IconSearch, IconMapPin, IconHeartHandshake } from "@tabler/icons-react";
import { getAccessToken } from "../../../helpers/apiHelper";

function AuthLayout() {
  // Jika sudah login, tidak perlu ke halaman auth lagi
  if (getAccessToken()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Banner (disembunyikan di layar kecil) */}
        <aside className="hidden md:flex flex-col justify-between p-10 bg-linear-to-br from-indigo-600 to-violet-700 text-white">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
            <span className="text-xl font-bold">Lost &amp; Founds</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold leading-tight">
              Kehilangan sesuatu? Menemukan barang orang lain?
            </h2>
            <ul className="space-y-3 text-indigo-100">
              <li className="flex items-center gap-3">
                <IconSearch size={20} /> Laporkan barang hilang dengan cepat
              </li>
              <li className="flex items-center gap-3">
                <IconMapPin size={20} /> Catat barang yang kamu temukan
              </li>
              <li className="flex items-center gap-3">
                <IconHeartHandshake size={20} /> Bantu barang kembali ke pemiliknya
              </li>
            </ul>
          </div>

          <p className="text-sm text-indigo-200">Delcom Lost &amp; Founds</p>
        </aside>

        {/* Area form: isi diganti LoginPage / RegisterPage */}
        <main className="flex flex-col justify-center p-6 sm:p-10">
          <div className="md:hidden flex items-center gap-3 mb-6">
            <img src="/logo.svg" alt="Logo" className="w-9 h-9" />
            <span className="text-lg font-bold">Lost &amp; Founds</span>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AuthLayout;