import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import PropTypes from "prop-types";
import { IconPhotoUp } from "@tabler/icons-react";
import { asyncSetIsLostFoundChangeCover } from "../states/action";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import ModalShell from "./ModalShell";
import FormActions from "./FormActions";

const MAX_COVER_SIZE = 2 * 1024 * 1024; // 2 MB

const lostFoundShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cover: PropTypes.string,
});

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

  const rejectFile = (message) => {
    showErrorDialog(message);
    setFile(null);
    setInputKey((key) => key + 1);
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return setFile(null);

    if (!selected.type.startsWith("image/")) {
      return rejectFile("File harus berupa gambar");
    }
    if (selected.size > MAX_COVER_SIZE) {
      return rejectFile("Ukuran gambar maksimal 2 MB");
    }
    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return showErrorDialog("Pilih gambar terlebih dahulu");

    await Promise.resolve(dispatch(asyncSetIsLostFoundChangeCover(lostFound.id, file)));

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

      <FormActions
        onCancel={onClose}
        submitLabel="Unggah Cover"
        disabled={isLoading || !file}
        isLoading={isLoading}
      />
    </form>
  );
}

ChangeCoverForm.propTypes = {
  lostFound: lostFoundShape.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

function ChangeCoverModal({ isOpen, onClose, lostFound, onSuccess }) {
  return (
    <ModalShell
      isOpen={isOpen && Boolean(lostFound)}
      onClose={onClose}
      title="Ubah Cover"
      titleId="cover-modal-title"
    >
      {lostFound && (
        <ChangeCoverForm
          lostFound={lostFound}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </ModalShell>
  );
}

ChangeCoverModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  lostFound: lostFoundShape,
  onSuccess: PropTypes.func,
};

export default ChangeCoverModal;