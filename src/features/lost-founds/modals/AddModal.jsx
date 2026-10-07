import { useEffect, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import PropTypes from "prop-types";
import { IconLoader2, IconX } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { asyncSetIsLostFoundAdd } from "../states/action";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

function AddModalForm({ onClose, onSuccess }) {
  const dispatch = useDispatch();
  const store = useStore();
  const isLoading = useSelector((state) => state.isLostFoundAdd);

  const [title, onTitleChange] = useInput("");
  const [description, onDescriptionChange] = useInput("");
  const [status, onStatusChange] = useInput("lost");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!title.trim()) newErrors.title = "Judul wajib diisi";
    if (!description.trim()) newErrors.description = "Deskripsi wajib diisi";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    await Promise.resolve(dispatch(asyncSetIsLostFoundAdd({ title, description, status })));

    if (store.getState().isLostFoundAdded) {
      onClose();
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Jenis Laporan</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "lost", label: "Barang Hilang" },
            { value: "found", label: "Barang Ditemukan" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium ${
                status === option.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={status === option.value}
                onChange={onStatusChange}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="add-title" className="mb-1.5 block text-sm font-medium">
          Judul
        </label>
        <input
          id="add-title"
          value={title}
          onChange={onTitleChange}
          placeholder="Contoh: Dompet hitam"
          className={inputClass}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="add-description" className="mb-1.5 block text-sm font-medium">
          Deskripsi
        </label>
        <textarea
          id="add-description"
          rows={4}
          value={description}
          onChange={onDescriptionChange}
          placeholder="Ciri-ciri barang, lokasi, dan waktu kejadian"
          className={inputClass}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
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
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && <IconLoader2 size={18} className="animate-spin" />}
          Simpan
        </button>
      </div>
    </form>
  );
}

AddModalForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

function AddModal({ isOpen, onClose, onSuccess }) {
  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Tutup latar belakang"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/50"
      />
      <dialog
        open
        aria-modal="true"
        aria-labelledby="add-modal-title"
        className="relative m-0 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-inherit shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="add-modal-title" className="text-xl font-bold">
            Tambah Laporan
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

        <AddModalForm onClose={onClose} onSuccess={onSuccess} />
      </dialog>
    </div>
  );
}

AddModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default AddModal;