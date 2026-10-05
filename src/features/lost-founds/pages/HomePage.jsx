import { useCallback, useEffect, useMemo, useState } from "react";
import StatsSection from "../components/StatsSection";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  IconCircleCheck,
  IconPhoto,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { formatDate } from "../../../helpers/toolsHelper";
import { asyncSetLostFounds } from "../states/action";
import AddModal from "../modals/AddModal";

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "lost", label: "Hilang" },
  { value: "found", label: "Ditemukan" },
];

function getAuthorName(author) {
  if (!author) return "-";
  return typeof author === "string" ? author : author.name ?? "-";
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function LostFoundCard({ item }) {
  const isLost = item.status === "lost";
  const isCompleted = Boolean(Number(item.is_completed));

  return (
    <li>
      <Link
        to={`/lost-founds/${item.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
      >
        <div className="flex aspect-video items-center justify-center overflow-hidden bg-slate-100">
          {item.cover ? (
            <img
              loading="lazy"
              decoding="async"
              src={item.cover}
              alt={item.title}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <IconPhoto size={36} className="text-slate-300" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isLost ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isLost ? "Hilang" : "Ditemukan"}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                <IconCircleCheck size={14} /> Selesai
              </span>
            )}
          </div>

          <h3 className="line-clamp-1 font-bold">{item.title}</h3>
          <p className="line-clamp-2 text-sm text-slate-500">{item.description}</p>

          <p className="mt-auto pt-2 text-xs text-slate-400">
            {getAuthorName(item.author)} · {formatDate(item.created_at)}
          </p>
        </div>
      </Link>
    </li>
  );
}

function HomePage() {
  const dispatch = useDispatch();
    const { hash } = useLocation();

  // Menu "Statistik" mengarah ke /#statistik
  useEffect(() => {
    if (hash === "#statistik") {
      document.getElementById("statistik")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);
  const lostFounds = useSelector((state) => state.lostFounds);

  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [keyword, onKeywordChange] = useInput("");
  const [statusFilter, setStatusFilter] = useState("");
  const [completedFilter, onCompletedFilterChange] = useInput("");
  const [onlyMine, setOnlyMine] = useState(false);

  // Data diambil dari server (is_me); filter lain diterapkan di klien
  // agar angka ringkasan selalu akurat.
  const loadLostFounds = useCallback(() => {
    return dispatch(asyncSetLostFounds(onlyMine ? { is_me: 1 } : {}));
  }, [dispatch, onlyMine]);

  useEffect(() => {
    loadLostFounds().finally(() => setIsLoading(false));
  }, [loadLostFounds]);

  const summary = useMemo(() => {
    const isDone = (item) => Boolean(Number(item.is_completed));
    return {
      total: lostFounds.length,
      lost: lostFounds.filter((item) => item.status === "lost").length,
      found: lostFounds.filter((item) => item.status === "found").length,
      completed: lostFounds.filter(isDone).length,
    };
  }, [lostFounds]);

  const filteredLostFounds = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    return lostFounds.filter((item) => {
      const done = Boolean(Number(item.is_completed));

      if (statusFilter && item.status !== statusFilter) return false;
      if (completedFilter === "1" && !done) return false;
      if (completedFilter === "0" && done) return false;
      if (!query) return true;

      return (
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    });
  }, [lostFounds, keyword, statusFilter, completedFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Dashboard</h1>
          <p className="text-slate-500">Pantau laporan barang hilang dan temuan.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
        >
          <IconPlus size={18} /> Tambah Laporan
        </button>
      </div>

      {/* Ringkasan metrik */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Total" value={summary.total} tone="text-slate-900" />
        <SummaryCard label="Barang Hilang" value={summary.lost} tone="text-red-600" />
        <SummaryCard label="Barang Ditemukan" value={summary.found} tone="text-emerald-600" />
        <SummaryCard label="Selesai" value={summary.completed} tone="text-indigo-600" />
      </div>

      {/* Statistik laporan (tujuan menu sidebar "Statistik") */}
      <StatsSection />
      {/* Filter dan pencarian */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={keyword}
            onChange={onKeywordChange}
            placeholder="Cari judul atau deskripsi..."
            aria-label="Cari laporan"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Filter jenis">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                aria-pressed={statusFilter === tab.value}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                  statusFilter === tab.value
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={completedFilter}
            onChange={onCompletedFilterChange}
            aria-label="Filter penyelesaian"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">Semua status</option>
            <option value="0">Dalam proses</option>
            <option value="1">Selesai</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(event) => setOnlyMine(event.target.checked)}
              className="h-6 w-6 accent-indigo-600"
            />
            Laporan saya
          </label>
        </div>
      </div>

      {/* Daftar laporan */}
      {isLoading ? (
        <p className="py-10 text-center text-slate-500">Memuat laporan...</p>
      ) : filteredLostFounds.length === 0 ? (
        <p className="py-10 text-center text-slate-500">
          Tidak ada laporan yang cocok.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredLostFounds.map((item) => (
            <LostFoundCard key={item.id} item={item} />
          ))}
        </ul>
      )}

      <AddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadLostFounds}
      />
    </div>
  );
}

export default HomePage;