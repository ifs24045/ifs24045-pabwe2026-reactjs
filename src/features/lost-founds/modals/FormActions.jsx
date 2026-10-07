import PropTypes from "prop-types";
import { IconLoader2 } from "@tabler/icons-react";

function FormActions({ onCancel, submitLabel, disabled, isLoading }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading && <IconLoader2 size={18} className="animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}

FormActions.propTypes = {
  onCancel: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default FormActions;