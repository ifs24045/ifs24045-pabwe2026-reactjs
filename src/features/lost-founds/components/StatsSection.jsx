import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { asyncSetLostFoundStats } from "../states/action";

const PERIODS = [
  { value: "daily", label: "Harian" },
  { value: "monthly", label: "Bulanan" },
];

function formatKey(key) {
  // "2026-10-04" -> "04/10", "2026-10" -> "10/2026"
  const parts = String(key).slice(0, 10).split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
  return String(key);
}

function sumValues(object = {}) {
  return Object.values(object).reduce((total, value) => total + Number(value || 0), 0);
}

function StatsSection() {
  const dispatch = useDispatch();
  const stats = useSelector((state) => state.lostFoundStats);
  const [period, setPeriod] = useState("daily");

  useEffect(() => {
    dispatch(asyncSetLostFoundStats({ total_data: 7 }));
  }, [dispatch]);

  const data = stats?.[period];

  const { rows, maxValue, totals } = useMemo(() => {
    if (!data) return { rows: [], maxValue: 0, totals: null };

    const losts = data.stats_losts ?? {};
    const founds = data.stats_founds ?? {};
    const keys = [...new Set([...Object.keys(losts), ...Object.keys(founds)])].sort();

    const builtRows = keys.map((key) => ({
      key,
      lost: Number(losts[key] || 0),
      found: Number(founds[key] || 0),
    }));

    return {
      rows: builtRows,
      maxValue: Math.max(1, ...builtRows.flatMap((row) => [row.lost, row.found])),
      totals: {
        lostCompleted: sumValues(data.stats_losts_completed),
        lostProcess: sumValues(data.stats_losts_process),
        foundCompleted: sumValues(data.stats_founds_completed),
        foundProcess: sumValues(data.stats_founds_process),
      },
    };
  }, [data]);

  return (
    <section
      id="statistik"
      className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Statistik Laporan</h2>
          <p className="text-sm text-slate-500">Jumlah laporan per periode.</p>
        </div>

        <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Periode statistik">
          {PERIODS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriod(item.value)}
              aria-pressed={period === item.value}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                period === item.value
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {!stats ? (
        <p className="py-8 text-center text-slate-500">Memuat statistik...</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-slate-500">Belum ada data statistik.</p>
      ) : (
        <>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-red-500" /> Hilang
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-500" /> Ditemukan
            </span>
          </div>

          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Grafik statistik laporan">
            <div className="flex h-48 min-w-max items-end gap-5 border-b border-slate-200 px-2">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="flex h-full flex-col items-center justify-end gap-1"
                  role="img"
                  aria-label={`${formatKey(row.key)}: ${row.lost} hilang, ${row.found} ditemukan`}
                >
                  <div className="flex h-full items-end gap-1.5">
                    {[
                      { value: row.lost, color: "bg-red-500", name: "Hilang" },
                      { value: row.found, color: "bg-emerald-500", name: "Ditemukan" },
                    ].map((bar) => (
                      <div key={bar.name} className="flex h-full flex-col items-center justify-end">
                        <span className="mb-1 text-xs text-slate-500">{bar.value}</span>
                        <div
                          title={`${bar.name}: ${bar.value}`}
                          className={`w-6 rounded-t-md ${bar.color}`}
                          style={{ height: `${(bar.value / maxValue) * 80}%`, minHeight: bar.value ? 4 : 0 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex min-w-max gap-5 px-2 pt-2">
              {rows.map((row) => (
                <p key={row.key} className="w-[3.75rem] text-center text-xs text-slate-500">
                  {formatKey(row.key)}
                </p>
              ))}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 pt-2 text-sm lg:grid-cols-4">
            <div className="rounded-xl bg-red-50 p-3">
              <dt className="text-red-700">Hilang · selesai</dt>
              <dd className="text-xl font-bold text-red-700">{totals.lostCompleted}</dd>
            </div>
            <div className="rounded-xl bg-red-50 p-3">
              <dt className="text-red-700">Hilang · proses</dt>
              <dd className="text-xl font-bold text-red-700">{totals.lostProcess}</dd>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <dt className="text-emerald-700">Ditemukan · selesai</dt>
              <dd className="text-xl font-bold text-emerald-700">{totals.foundCompleted}</dd>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <dt className="text-emerald-700">Ditemukan · proses</dt>
              <dd className="text-xl font-bold text-emerald-700">{totals.foundProcess}</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}

export default StatsSection;