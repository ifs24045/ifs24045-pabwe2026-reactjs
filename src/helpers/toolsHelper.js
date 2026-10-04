import Swal from "sweetalert2";

/** Dialog sukses. */
function showSuccessDialog(message, title = "Berhasil") {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: "#4f46e5",
  });
}

/** Dialog error. */
function showErrorDialog(message, title = "Terjadi Kesalahan") {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: "#4f46e5",
  });
}

/** Dialog konfirmasi. Mengembalikan true jika pengguna menekan tombol konfirmasi. */
async function showConfirmDialog(
  message,
  title = "Apakah Anda yakin?",
  confirmText = "Ya"
) {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#94a3b8",
  });

  return result.isConfirmed;
}

/** Format tanggal ke bahasa Indonesia, contoh: "4 Oktober 2026, 23.18". */
function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export { showSuccessDialog, showErrorDialog, showConfirmDialog, formatDate };