import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import {
  asyncSetIsAuthRegister,
  setIsAuthRegisterActionCreator,
} from "../states/action";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, password, confirmPassword }) {
  const errors = {};

  if (!name.trim()) errors.name = "Nama wajib diisi";
  else if (name.trim().length < 3) errors.name = "Nama minimal 3 karakter";

  if (!email.trim()) errors.email = "Email wajib diisi";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Format email tidak valid";

  if (!password) errors.password = "Kata sandi wajib diisi";
  else if (password.length < 6) errors.password = "Kata sandi minimal 6 karakter";

  if (!confirmPassword) errors.confirmPassword = "Konfirmasi kata sandi wajib diisi";
  else if (confirmPassword !== password)
    errors.confirmPassword = "Konfirmasi kata sandi tidak sama";

  return errors;
}

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthRegister = useSelector((state) => state.isAuthRegister);

  const [name, onNameChange] = useInput("");
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [confirmPassword, onConfirmPasswordChange] = useInput("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registrasi sukses -> reset flag, lalu ke halaman login
  useEffect(() => {
    if (isAuthRegister) {
      dispatch(setIsAuthRegisterActionCreator(false));
      navigate("/auth/login", { replace: true });
    }
  }, [isAuthRegister, dispatch, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate({ name, email, password, confirmPassword });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    await dispatch(asyncSetIsAuthRegister({ name, email, password }));
    setIsSubmitting(false);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Buat akun baru</h1>
      <p className="mt-1 text-slate-500">Daftar untuk mulai melaporkan barang.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">
            Nama
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={onNameChange}
            placeholder="Nama lengkap"
            className={inputClass}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={onEmailChange}
            placeholder="nama@email.com"
            className={inputClass}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            Kata Sandi
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={onPasswordChange}
              placeholder="Minimal 6 karakter"
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute inset-y-0 right-1 px-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
            Konfirmasi Kata Sandi
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            placeholder="Ulangi kata sandi"
            className={inputClass}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting && <IconLoader2 size={18} className="animate-spin" />}
          {isSubmitting ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link to="/auth/login" className="font-semibold text-indigo-600 underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;