import { useEffect } from "react";
import PropTypes from "prop-types";
import { IconX } from "@tabler/icons-react";

function ModalShell({ isOpen, onClose, title, titleId, children }) {
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
        aria-labelledby={titleId}
        className="relative m-0 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-inherit shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
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

        {children}
      </dialog>
    </div>
  );
}

ModalShell.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  titleId: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default ModalShell;