"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, login, register as storeRegister } from "@/store";
import {
  normalizePhone,
  isValidUzbekPhone,
  formatLocalPhone,
} from "@/utils/phone";
import { LogIn, X, Loader2, Eye, EyeOff } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const authed = isAuthenticated();
  const [auth, setAuth] = useState(authed);
  const [showLogin, setShowLogin] = useState(!authed);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      let rest = digits;

      if (digits.length === 12 && digits.startsWith("998")) {
        rest = digits.slice(3);
      } else if (digits.length === 11 && digits.startsWith("8")) {
        rest = digits.slice(1);
      }

      setPhone(rest.slice(0, 9));
      setError("");
    },
    [],
  );

  async function handleSubmit() {
    setError("");

    if (!name.trim()) {
      setError("Ismingizni kiriting");
      return;
    }

    if (!lastName.trim()) {
      setError("Familiyangizni kiriting");
      return;
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError("Telefon raqamingizni kiriting");
      return;
    }
    if (!isValidUzbekPhone(normalized)) {
      setError("Noto'g'ri O'zbekiston telefon raqami");
      return;
    }

    if (!password) {
      setError("Parolni kiriting");
      return;
    }

    if (mode === "register") {
      if (password.length < 8) {
        setError("Parol kamida 8 belgidan iborat bo'lishi kerak");
        return;
      }
      if (password !== confirmPassword) {
        setError("Parollar mos kelmadi");
        return;
      }
    }

    if (!agreeToTerms) {
      setError("Tizim qoidalariga rozilik bildirishingiz kerak");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(normalized, password);
      } else {
        await storeRegister(name.trim(), lastName.trim(), normalized, password);
      }

      setAuth(true);
      setShowLogin(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xato yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  if (!showLogin && !auth)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );

  if (auth) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === "login"
              ? "Tizimga kirish"
              : "Ro&apos;yxatdan o&apos;tish"}
          </h2>
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Kirish
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "register"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Ro&apos;yxatdan o&apos;tish
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          {mode === "login"
            ? "Akkountingizga kiring."
            : "Yangi akkount yarating."}
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Ismingiz
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Ismingizni kiriting"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Familiyangiz
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setError(""); }}
              placeholder="Familiyangizni kiriting"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Telefon
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                +998
              </span>
              <input
                type="tel"
                value={formatLocalPhone(phone)}
                onChange={handlePhoneChange}
                placeholder="99 999 99 99"
                className="w-full pl-16 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Parol
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder={mode === "register" ? "Kamida 8 belgi" : "Parolingiz"}
                className="w-full px-3 py-2.5 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Parolni qayta kiriting"
                  className="w-full px-3 py-2.5 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => { setAgreeToTerms(e.target.checked); setError(""); }}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500">
              Tizim qoidalariga roziman
            </span>
          </label>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !name.trim() ||
              !lastName.trim() ||
              !normalizePhone(phone) ||
              !password ||
              (mode === "register" && !confirmPassword) ||
              !agreeToTerms
            }
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Tekshirilmoqda...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                {mode === "login"
                  ? "Kirish"
                  : "Ro'yxatdan o'tish"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
