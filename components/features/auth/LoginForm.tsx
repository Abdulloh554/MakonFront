"use client";

import { useState, useCallback } from "react";
import { UserIcon, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { login } from "@/store";
import type { User } from "@/types";
import {
  normalizePhone,
  isValidUzbekPhone,
  formatLocalPhone,
} from "@/utils/phone";

interface LoginFormProps {
  onLogin: (name: string, lastName: string, phone: string, password: string) => Promise<User>;
  onRegister: (name: string, lastName: string, phone: string, password: string) => Promise<User>;
}

export default function LoginForm({ onLogin, onRegister }: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (mode === "login") {
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
      setLoading(true);
      try {
        await onLogin("", "", normalized, password);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kirish xatosi");
      } finally {
        setLoading(false);
      }
      return;
    }

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

    if (password.length < 8) {
      setError("Parol kamida 8 belgidan iborat bo'lishi kerak");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parollar mos kelmadi");
      return;
    }

    if (!agreeToTerms) {
      setError("Tizim qoidalariga rozilik bildirishingiz kerak");
      return;
    }

    setLoading(true);
    try {
      await onRegister(name.trim(), lastName.trim(), normalized, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tishda xatolik")
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }}
        className="w-full max-w-sm space-y-5"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200"
          >
            <UserIcon className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-xl font-bold text-gray-900">
            {mode === "login" ? "Tizimga kirish" : "Ro'yxatdan o'tish"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "login"
              ? "Akkountingizga kiring"
              : "Yangi akkount yarating"}
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1">
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

        <div className="space-y-3">
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Ismingiz
          </label>
          <input
            type="text"
            placeholder="Ismingiz"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />

          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Familiyangiz
          </label>
          <input
            type="text"
            placeholder="Familiyangiz"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setError(""); }}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />

          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Telefon raqamingiz
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
              +998
            </span>
            <input
              type="tel"
              placeholder="99 999 99 99"
              value={formatLocalPhone(phone)}
              onChange={handlePhoneChange}
              className="w-full pl-16 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>

          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Parol
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={mode === "register" ? "Kamida 8 belgi" : "Parolingiz"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence>
            {mode === "register" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Parolni tasdiqlang
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Parolni qayta kiriting"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={
              loading ||
              !normalizePhone(phone) ||
              !password ||
              (mode === "register" && (!name.trim() || !lastName.trim() || !confirmPassword || !agreeToTerms))
            }
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Tekshirilmoqda...
              </>
            ) : mode === "login" ? (
              "Kirish"
            ) : (
              "Ro'yxatdan o'tish"
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
