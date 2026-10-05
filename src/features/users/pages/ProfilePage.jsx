import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { IconLoader2 } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import {
  asyncSetIsChangeProfile,
  asyncSetIsChangeProfilePhoto,
  asyncSetIsChangeProfilePassword,
} from "../states/action";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2 MB

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
const buttonClass =
  "flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function Card({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mb-5 text-sm text-slate-500">{description}</p>
      {children}
    </section>
  );
}

/* ---------- Ubah data profil ---------- */
function ProfileInfoForm({ profile }) {
  const dispatch = useDispatch();
  const [name, onNameChange] = useInput(profile.name ?? "");
  const [email, onEmailChange] = useInput(profile.email ?? "");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!name.trim()) newErrors.name = "Nama wajib diisi";
    if (!email.trim()) newErrors.email = "Email wajib diisi";
    else if (!EMAIL_REGEX.test(email)) newErrors.email = "Format email tidak valid";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    await dispatch(asyncSetIsChangeProfile({ name, email }));
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium">
          Nama
        </label>
        <input id="profile-name" value={name} onChange={onNameChange} className={inputClass} />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="profile-email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          value={email}
          onChange={onEmailChange}
          className={inputClass}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className={buttonClass}>
        {isSubmitting && <IconLoader2 size={18} className="animate-spin" />}
        Simpan Perubahan
      </button>
    </form>
  );
}

/* ---------- Ganti foto ---------- */
function ProfilePhotoForm({ profile }) {
  const dispatch = useDispatch();
  const store = useStore();
  const [file, setFile] = useState(null);
  const [inputKey, setInputKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      return setInputKey((key) => key + 1);
    }
    if (selected.size > MAX_PHOTO_SIZE) {
      showErrorDialog("Ukuran foto maksimal 2 MB");
      return setInputKey((key) => key + 1);
    }
    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return showErrorDialog("Pilih foto terlebih dahulu");

    setIsSubmitting(true);
    await dispatch(asyncSetIsChangeProfilePhoto(file));
    setIsSubmitting(false);

    if (store.getState().isChangeProfilePhoto) {
      setFile(null);
      setInputKey((key) => key + 1);
    }
  };

  const shownPhoto = previewUrl ?? profile.photo;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-5">
        {shownPhoto ? (
          <img
            src={shownPhoto}
            alt="Foto profil"
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
            {getInitials(profile.name)}
          </div>
        )}
        <div>
          <label htmlFor="profile-photo" className="mb-1.5 block text-sm font-medium">
            Pilih foto
          </label>
          <input
            key={inputKey}
            id="profile-photo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100"
          />
          <p className="mt-1 text-xs text-slate-600">Gambar, maksimal 2 MB.</p>
        </div>
      </div>
      <button type="submit" disabled={isSubmitting || !file} className={buttonClass}>
        {isSubmitting && <IconLoader2 size={18} className="animate-spin" />}
        Unggah Foto
      </button>
    </form>
  );
}

/* ---------- Ganti kata sandi ---------- */
function ProfilePasswordForm() {
  const dispatch = useDispatch();
  const store = useStore();
  const [password, onPasswordChange, setPassword] = useInput("");
  const [newPassword, onNewPasswordChange, setNewPassword] = useInput("");
  const [confirmPassword, onConfirmPasswordChange, setConfirmPassword] = useInput("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!password) newErrors.password = "Kata sandi saat ini wajib diisi";
    if (!newPassword) newErrors.newPassword = "Kata sandi baru wajib diisi";
    else if (newPassword.length < 6)
      newErrors.newPassword = "Kata sandi baru minimal 6 karakter";
    if (confirmPassword !== newPassword)
      newErrors.confirmPassword = "Konfirmasi kata sandi tidak sama";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    await dispatch(asyncSetIsChangeProfilePassword({ password, newPassword }));
    setIsSubmitting(false);

    if (store.getState().isChangeProfilePassword) {
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium">
          Kata Sandi Saat Ini
        </label>
        <input
          id="current-password"
          type="password"
          value={password}
          onChange={onPasswordChange}
          className={inputClass}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>
      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium">
          Kata Sandi Baru
        </label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={onNewPasswordChange}
          className={inputClass}
        />
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
        )}
      </div>
      <div>
        <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm font-medium">
          Konfirmasi Kata Sandi Baru
        </label>
        <input
          id="confirm-new-password"
          type="password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          className={inputClass}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>
      <button type="submit" disabled={isSubmitting} className={buttonClass}>
        {isSubmitting && <IconLoader2 size={18} className="animate-spin" />}
        Ganti Kata Sandi
      </button>
    </form>
  );
}

/* ---------- Halaman ---------- */
function ProfilePage() {
  const profile = useSelector((state) => state.profile);

  if (!profile) {
    return <p className="mt-10 text-center text-slate-500">Memuat profil...</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Profil Saya</h1>
        <p className="text-slate-500">Kelola informasi akun kamu.</p>
      </div>

      <Card title="Informasi Akun" description="Ubah nama dan email.">
        <ProfileInfoForm profile={profile} />
      </Card>

      <Card title="Foto Profil" description="Pratinjau tampil sebelum diunggah.">
        <ProfilePhotoForm profile={profile} />
      </Card>

      <Card title="Kata Sandi" description="Gunakan kata sandi yang kuat.">
        <ProfilePasswordForm />
      </Card>
    </div>
  );
}

export default ProfilePage;