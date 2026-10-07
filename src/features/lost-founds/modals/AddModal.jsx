import { useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import PropTypes from "prop-types";
import useInput from "../../../hooks/useInput";
import { asyncSetIsLostFoundAdd } from "../states/action";
import ModalShell from "./ModalShell";
import FormActions from "./FormActions";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

const statusOptions = [
  { value: "lost", label: "Barang Hilang" },
  { value: "found", label: "Barang Ditemukan" },
];

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
          {statusOptions.map((option) => (
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

      <FormActions
        onCancel={onClose}
        submitLabel="Simpan"
        disabled={isLoading}
        isLoading={isLoading}
      />
    </form>
  );
}

AddModalForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

function AddModal({ isOpen, onClose, onSuccess }) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Laporan"
      titleId="add-modal-title"
    >
      <AddModalForm onClose={onClose} onSuccess={onSuccess} />
    </ModalShell>
  );
}

AddModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default AddModal;