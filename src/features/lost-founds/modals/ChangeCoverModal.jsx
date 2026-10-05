import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { IconLoader2, IconPhotoUp, IconX } from "@tabler/icons-react";
import { asyncSetIsLostFoundChangeCover } from "../states/action";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const MAX_COVER_SIZE = 2 * 1024 * 1024; // 2 MB

function ChangeCoverForm({ lostFound, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const store = useStore();
  const isLoading = useSelector((state) => state.isLostFoundChangeCover);

  const [file, setFile] = useState(null);
  const [inputKey, setInputKey] = useState(0);

  // Pratinjau langsung dari file yang dipilih
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return setFile(null);

    if (!selected.type.startsWith("image/")) {
      showErrorDialog("File harus berupa gambar");
      setFile(null);
      return setInputKey((key) => key + 1);
    }
    if (selected.size > MAX_COVER_SIZE) {
      showErrorDialog("Ukuran gambar maksimal 2 MB");
      setFile(null);
      return setInputKey((key) => key + 1);
    }
    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return showErrorDialog("Pilih gambar terlebih dahulu");

    await dispatch(asyncSetIsLostFoundChangeCover(lostFound.id, file));

    if (store.getState().isLostFoundChangedCover) {
      onClose();
      onSuccess?.();
    }
  };

  const shownImage = previewUrl ?? lostFound.cover;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
        {shownImage ? (
          <img
            src={shownImage}
            alt={previewUrl ? "Pratinjau cover" : "Cover saat ini"}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-600">
            <IconPhotoUp size={40} />
            <span className="text-sm">Belum ada cover</span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="cover-file" className="mb-1.5 block text-sm font-medium">
          Pilih gambar
        </label>
        <input
          key={inputKey}
          id="cover-file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100"
        />
        <p className="mt-1 text-xs text-slate-600">Gambar, maksimal 2 MB.</p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading || !file}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && <IconLoader2 size={18} className="animate-spin" />}
          Unggah Cover
        </button>
      </div>
    </form>
  );
}

function ChangeCoverModal({ isOpen, onClose, lostFound, onSuccess }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lostFound) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cover-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="cover-modal-title" className="text-xl font-bold">
            Ubah Cover
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <IconX size={20} />
          </button>
        </div>

        <ChangeCoverForm
          lostFound={lostFound}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}

export default ChangeCoverModal;