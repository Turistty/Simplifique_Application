"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
      if (res.data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao fazer login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* <<ThemeToggle /> não ta funcionando */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#00205b] to-[#1e2a63] items-center justify-center p-10">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center">
              <Image
                src="/logos/Simplifique.png"
                alt="Logo Simplifique"
                width={500}
                height={500}
                priority
                className="drop-shadow-[0_0_3px_white]"
              />
            </div>
          </div>
          <h1 className="text-white text-4xl font-extrabold mt-6 leading-tight">
            Bem-vindo ao <span className="text-yellow-300">Simplifique</span>
          </h1>
          <p className="text-white/80 mt-4 text-lg">
            Consulte sua pontuação, acompanhe seu histórico e resgate brindes exclusivos.
          </p>
        </div>
      </div>
      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
           {/* MAHLE no topo */}
          <h1 className="text-4xl font-extrabold text-[#00205b] text-center tracking-widest">
            MAHLE
          </h1>
          <h2 className="text-3xl font-bold text-[#1E2A63] text-center">Acesse sua conta</h2>
          {/* Inputs */}
          <div className="space-y-4">
            {/* Usuário */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuário (NP)
              </label>
              <div className="relative mt-1">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full p-3 pl-10 border rounded-lg placeholder-gray-600 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E2A63] focus:border-[#1E2A63] transition"
                  aria-label="Usuário"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800">👤</span>
              </div>
            </div>
            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha (RE)
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full p-3 pl-10 pr-10 border placeholder-gray-600 text-gray-900  rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A63] focus:border-[#1E2A63] transition"
                  aria-label="Senha"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔒</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1E2A63]"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>
          </div>
          {/* Opções extras */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-300 text-[#1E2A63]" />
              <span>Lembrar</span>
            </label>
            <button className="text-[#1E2A63] hover:underline">Esqueci minha senha</button>
          </div>
          {/* Botão */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-[#1E2A63] hover:bg-[#2B3C8F] text-white font-semibold rounded-lg transition flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
          {/* Erro */}
          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded p-2">
              {error}
            </p>
          )}
          {/* Rodapé */}
          <p className="text-xs text-center text-gray-400">
            © {new Date().getFullYear()} Simplifique • v1.3
          </p>
        </div>
      </div>
    </div>
  );
}