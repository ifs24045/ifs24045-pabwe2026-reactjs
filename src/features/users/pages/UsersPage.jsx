import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconSearch, IconUsers } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { asyncSetUsers } from "../states/action";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users);

  const [keyword, onKeywordChange] = useInput("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(asyncSetUsers()).finally(() => setIsLoading(false));
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return users;

    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }, [users, keyword]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Pengguna</h1>
          <p className="text-slate-500">Daftar semua pengguna terdaftar.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={keyword}
            onChange={onKeywordChange}
            placeholder="Cari nama atau email..."
            aria-label="Cari pengguna"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="mt-10 text-center text-slate-500">Memuat pengguna...</p>
      ) : filteredUsers.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 text-slate-500">
          <IconUsers size={40} />
          <p>Tidak ada pengguna yang ditemukan.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-sm text-slate-500">{user.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UsersPage;