import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { asyncSetIsAuthLogin } from "../states/action";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};

  if (!email.trim()) errors.email = "Email wajib diisi";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Format email tidak valid";

  if (!password) errors.password = "Kata sandi wajib diisi";
  else if (password.length < 6) errors.password = "Kata sandi minimal 6 karakter";

  return errors;
}

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthLogin = useSelector((state) => state.isAuthLogin);

  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login sukses -> ke beranda
  useEffect(() => {
    if (isAuthLogin) navigate("/", { replace: true });
  }, [isAuthLogin, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate({ email, password });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    await dispatch(asyncSetIsAuthLogin({ email, password }));
    setIsSubmitting(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Selamat datang kembali</h1>
      <p className="mt-1 text-slate-500">Masuk untuk melanjutkan.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <div>
         <label htmlFor="login-email-input" className="block text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="login-email-input"
            type="email"
            value={email}
            onChange={onEmailChange}
            placeholder="nama@email.com"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password-input" className="block text-sm font-medium mb-1.5">
            Kata Sandi
          </label>
          <div className="relative">
            <input
              id="login-password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={onPasswordChange}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-11 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute inset-y-0 right-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          id="login-submit-button"
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting && <IconLoader2 size={18} className="animate-spin" />}
          {isSubmitting ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link to="/auth/register" className="font-semibold text-indigo-600 underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;