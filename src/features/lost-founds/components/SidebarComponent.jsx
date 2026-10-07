import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  IconChartBar,
  IconLayoutDashboard,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

const MENU_ITEMS = [
  {
    label: "Dashboard",
    to: "/",
    icon: IconLayoutDashboard,
    isActive: ({ pathname, hash }) =>
      (pathname === "/" && hash !== "#statistik") ||
      pathname.startsWith("/lost-founds"),
  },
  {
    label: "Statistik",
    to: "/#statistik",
    icon: IconChartBar,
    isActive: ({ pathname, hash }) => pathname === "/" && hash === "#statistik",
  },
  {
    label: "Pengguna",
    to: "/users",
    icon: IconUsers,
    isActive: ({ pathname }) => pathname === "/users",
  },
  {
    label: "Profil Saya",
    to: "/profile",
    icon: IconUser,
    isActive: ({ pathname }) => pathname === "/profile",
  },
];

function SidebarComponent({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <button
          type="button"
          data-testid="sidebar-overlay"
          aria-label="Tutup latar menu"
          tabIndex={-1}
          onClick={onClose}
          className="fixed inset-0 z-40 cursor-default bg-slate-900/40 md:hidden"
        />
      )}

      <aside
        aria-label="Navigasi utama"
        className={`fixed bottom-0 left-0 top-0 z-50 w-64 border-r border-slate-200 bg-white pt-4 transition-transform md:top-16 md:z-20 md:translate-x-0 md:pt-4 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-2 flex items-center justify-between px-4 md:hidden">
          <span className="text-lg font-bold">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <IconX size={20} />
          </button>
        </div>

        <nav className="space-y-1 px-3">
          {MENU_ITEMS.map(({ label, to, icon: Icon, isActive }) => {
            const active = isActive(location);
            return (
              <Link
                key={label}
                to={to}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

SidebarComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SidebarComponent;