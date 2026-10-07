import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { IconLogout, IconMenu2, IconUser } from "@tabler/icons-react";
import { asyncSetIsAuthLogout } from "../../auth/states/action";
import {
  setIsProfileActionCreator,
  setProfileActionCreator,
} from "../../users/states/action";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function NavbarComponent({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Tutup dropdown saat klik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    const confirmed = await showConfirmDialog(
      "Kamu akan keluar dari akun ini.",
      "Keluar?",
      "Ya, keluar"
    );
    if (!confirmed) return;

    await Promise.resolve(dispatch(asyncSetIsAuthLogout()));
    dispatch(setProfileActionCreator(null));
    dispatch(setIsProfileActionCreator(false));
    navigate("/auth/login", { replace: true });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Buka menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <IconMenu2 size={22} />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="h-9 w-9" />
          <span className="text-lg font-bold">Lost &amp; Founds</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 text-sm text-slate-500 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Sedang masuk</span>
        </span>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Menu profil"
            aria-expanded={isMenuOpen}
            className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100"
          >
            {profile?.photo ? (
              <img
                src={profile.photo}
                alt={profile.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                {getInitials(profile?.name)}
              </span>
            )}
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <div className="border-b border-slate-100 px-3 pb-2 pt-1">
                <p className="truncate font-semibold">{profile?.name}</p>
                <p className="truncate text-sm text-slate-500">{profile?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
              >
                <IconUser size={18} /> Profil Saya
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <IconLogout size={18} /> Keluar
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 lg:flex"
        >
          <IconLogout size={16} /> Keluar
        </button>
      </div>
    </header>
  );
}

NavbarComponent.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};

export default NavbarComponent;