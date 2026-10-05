import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
  IconArrowLeft,
  IconCircleCheck,
  IconClockHour4,
  IconEdit,
  IconLoader2,
  IconPhoto,
  IconPhotoEdit,
  IconTrash,
} from "@tabler/icons-react";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import {
  asyncSetIsLostFoundDelete,
  asyncSetLostFound,
  setLostFoundActionCreator,
} from "../states/action";
import ChangeModal from "../modals/ChangeModal";
import ChangeCoverModal from "../modals/ChangeCoverModal";

function getAuthorName(author) {
  if (!author) return "-";
  return typeof author === "string" ? author : author.name ?? "-";
}

function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const store = useStore();

  const lostFound = useSelector((state) => state.lostFound);
  const profile = useSelector((state) => state.profile);
  const isDeleting = useSelector((state) => state.isLostFoundDelete);

  const [isLoading, setIsLoading] = useState(true);
  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [isCoverOpen, setIsCoverOpen] = useState(false);

  useEffect(() => {
    dispatch(asyncSetLostFound(id)).finally(() => setIsLoading(false));

    // Bersihkan detail saat meninggalkan halaman agar data lama tidak sempat tampil
    return () => {
      dispatch(setLostFoundActionCreator(null));
    };
  }, [dispatch, id]);

  const handleDelete = async () => {
    const confirmed = await showConfirmDialog(
      "Laporan yang dihapus tidak dapat dikembalikan.",
      "Hapus laporan ini?",
      "Ya, hapus"
    );
    if (!confirmed) return;

    await dispatch(asyncSetIsLostFoundDelete(id));

    if (store.getState().isLostFoundDeleted) {
      navigate("/", { replace: true });
    }
  };

  if (isLoading) {
    return <p className="py-10 text-center text-slate-500">Memuat detail laporan...</p>;
  }

  if (!lostFound || String(lostFound.id) !== String(id)) {
    return (
      <div className="space-y-3 py-10 text-center">
        <p className="text-slate-500">Laporan tidak ditemukan.</p>
        <Link to="/" className="font-semibold text-indigo-600 hover:underline">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const isLost = lostFound.status === "lost";
  const isCompleted = Boolean(Number(lostFound.is_completed));
  const isOwner = profile && String(profile.id) === String(lostFound.user_id);

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <IconArrowLeft size={18} /> Kembali
      </Link>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Cover dengan rasio adaptif */}
        <div className="flex max-h-[28rem] min-h-48 items-center justify-center bg-slate-100">
          {lostFound.cover ? (
            <img
              src={lostFound.cover}
              alt={lostFound.title}
              className="max-h-[28rem] w-auto max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
              <IconPhoto size={48} />
              <span className="text-sm">Belum ada cover</span>
            </div>
          )}
        </div>

        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isLost ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isLost ? "Barang Hilang" : "Barang Ditemukan"}
            </span>
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                isCompleted ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {isCompleted ? <IconCircleCheck size={14} /> : <IconClockHour4 size={14} />}
              {isCompleted ? "Selesai" : "Dalam proses"}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold">{lostFound.title}</h1>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-400">Pelapor</dt>
              <dd className="font-medium">{getAuthorName(lostFound.author)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Tanggal lapor</dt>
              <dd className="font-medium">{formatDate(lostFound.created_at)}</dd>
            </div>
          </dl>

          <div>
            <h2 className="mb-1 text-sm text-slate-400">Deskripsi</h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-700">
              {lostFound.description}
            </p>
          </div>

          {isOwner && (
            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setIsCoverOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <IconPhotoEdit size={18} /> Ubah Cover
              </button>
              <button
                type="button"
                onClick={() => setIsChangeOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <IconEdit size={18} /> Ubah Data
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? (
                  <IconLoader2 size={18} className="animate-spin" />
                ) : (
                  <IconTrash size={18} />
                )}
                Hapus
              </button>
            </div>
          )}
        </div>
      </article>

      <ChangeModal
        isOpen={isChangeOpen}
        onClose={() => setIsChangeOpen(false)}
        lostFound={lostFound}
      />
      <ChangeCoverModal
        isOpen={isCoverOpen}
        onClose={() => setIsCoverOpen(false)}
        lostFound={lostFound}
      />
    </div>
  );
}

export default DetailPage;