import { useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import PropTypes from "prop-types";
import useInput from "../../../hooks/useInput";
import { asyncSetIsLostFoundChange } from "../states/action";
import ModalShell from "./ModalShell";
import FormActions from "./FormActions";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

const lostFoundShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  description: PropTypes.string,
  status: PropTypes.string,
  is_completed: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
});

function ChangeModalForm({ lostFound, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const store = useStore();
  const isLoading = useSelector((state) => state.isLostFoundChange);

  const [title, onTitleChange] = useInput(lostFound.title ?? "");
  const [description, onDescriptionChange] = useInput(lostFound.description ?? "");
  const [status, onStatusChange] = useInput(lostFound.status ?? "lost");
  const [isCompleted, setIsCompleted] = useState(Boolean(Number(lostFound.is_completed)));
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!title.trim()) newErrors.title = "Judul wajib diisi";
    if (!description.trim()) newErrors.description = "Deskripsi wajib diisi";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    await Promise.resolve(
      dispatch(
        asyncSetIsLostFoundChange(lostFound.id, {
          title,
          description,
          status,
          isCompleted,
        })
      )
    );

    if (store.getState().isLostFoundChanged) {
      onClose();
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="change-status" className="mb-1.5 block text-sm font-medium">
          Jenis Laporan
        </label>
        <select
          id="change-status"
          value={status}
          onChange={onStatusChange}
          className={inputClass}
        >
          <option value="lost">Barang Hilang</option>
          <option value="found">Barang Ditemukan</option>
        </select>
      </div>

      <div>
        <label htmlFor="change-title" className="mb-1.5 block text-sm font-medium">
          Judul
        </label>
        <input
          id="change-title"
          value={title}
          onChange={onTitleChange}
          className={inputClass}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="change-description" className="mb-1.5 block text-sm font-medium">
          Deskripsi
        </label>
        <textarea
          id="change-description"
          rows={4}
          value={description}
          onChange={onDescriptionChange}
          className={inputClass}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
        <div>
          <label htmlFor="change-completed" className="block text-sm font-medium">
            Status selesai
          </label>
          <span id="change-completed-hint" className="block text-xs text-slate-500">
            Tandai jika barang sudah kembali ke pemiliknya.
          </span>
        </div>
        <input
          id="change-completed"
          type="checkbox"
          role="switch"
          aria-describedby="change-completed-hint"
          checked={isCompleted}
          onChange={(event) => setIsCompleted(event.target.checked)}
          className="h-6 w-6 accent-indigo-600"
        />
      </div>

      <FormActions
        onCancel={onClose}
        submitLabel="Simpan Perubahan"
        disabled={isLoading}
        isLoading={isLoading}
      />
    </form>
  );
}

ChangeModalForm.propTypes = {
  lostFound: lostFoundShape.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

function ChangeModal({ isOpen, onClose, lostFound, onSuccess }) {
  return (
    <ModalShell
      isOpen={isOpen && Boolean(lostFound)}
      onClose={onClose}
      title="Ubah Laporan"
      titleId="change-modal-title"
    >
      {lostFound && (
        <ChangeModalForm
          lostFound={lostFound}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </ModalShell>
  );
}

ChangeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  lostFound: lostFoundShape,
  onSuccess: PropTypes.func,
};

export default ChangeModal;