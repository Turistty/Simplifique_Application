"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* Tipos */
interface User {
  nome: string;
  avatarColor?: string;
}

/* Tipos para saldos recebidos do backend (sempre tratar como fonte da verdade) */
interface BackendBalances {
  saldoAtualPts: number; // saldo disponível em pontos (não dinheiro)
  pontosRetiradosPts: number;
  pontosProcessandoPts: number;
  saldoTotalPts: number; // enviado pelo backend (já calculado)
}

/* Props de modal/drawer */
interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#002060]">{title}</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">Fechar</button>
        </div>
        <div className="max-h-[60vh] overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default function UserPage(): React.ReactElement {
  const router = useRouter();

  /* Dados do usuário (identidade) */
  const [user] = useState<User>({
    nome: "João Silva",
    avatarColor: "from-[#0b5ed7] to-[#06b6d4]",
  });

  /* Estados que vêm do backend — fonte da verdade
     - NÃO calcular totals no cliente por segurança
     - Inicializar com null para forçar usar valores vindos do backend
  */
  const [backendBalances, setBackendBalances] = useState<BackendBalances | null>(null);

  /* UI states */
  const [openHistory, setOpenHistory] = useState<boolean>(false);
  const [openSimplifiques, setOpenSimplifiques] = useState<boolean>(false);

  /* Mock fetch: substituir por fetch/axios real que retorna BackendBalances do servidor */
  useEffect(() => {
    // Simulação de chamada segura ao backend: o backend já retorna todos os saldos prontos
    const timer = setTimeout(() => {
      const mockFromBackend: BackendBalances = {
        saldoAtualPts: 1200, // pontos disponíveis
        pontosRetiradosPts: 450,
        pontosProcessandoPts: 200,
        saldoTotalPts: 1850, // backend calcula e envia
      };
      setBackendBalances(mockFromBackend);
    }, 450); // simula latência de rede

    return () => clearTimeout(timer);
  }, []);

  /* Dados mock de histórico e simplifiques (substituir por chamadas reais) */
  const history = [
    { id: 1, date: "2025-09-20", points: 200, status: "Concluído" },
    { id: 2, date: "2025-08-12", points: 250, status: "Concluído" },
  ];

  const simplifiques = [
    { id: "S-1001", date: "2025-09-23", valuePts: 25 },
    { id: "S-1000", date: "2025-09-10", valuePts: 15 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      <header className="bg-[#002060] text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-xl grid place-items-center text-2xl font-extrabold text-white bg-gradient-to-br ${user.avatarColor} shadow-lg`}
              aria-hidden="true"
            >
              {user.nome ? user.nome.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">MAHLE • Área do Usuário</h1>
              <p className="mt-1 text-sm sm:text-base">Bem-vindo, <span className="font-semibold">{user.nome}</span> 👋</p>
            </div>
          </div>

          <div className="ml-auto hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-white/80">Saldo Atual (pts)</p>
              <p className="text-lg font-bold">{backendBalances ? backendBalances.saldoAtualPts : "—"}</p>
            </div>
            <button
              onClick={() => router.push("/rewards")}
              className="py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition"
            >
              Retirar Brindes
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-[#002060] mb-6">Resumo de Pontos</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Saldo atual (pts)</p>
                  <p className="text-3xl font-extrabold text-[#002060]">
                    {backendBalances ? backendBalances.saldoAtualPts : "Carregando..."}
                  </p>
                  <p className="mt-3 text-sm text-gray-500">Os valores são fornecidos apenas pelo backend</p>
                </div>

                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-xs text-gray-400">Saldo total (pts)</p>
                  <p className="text-xl font-semibold text-[#002060]">
                    {backendBalances ? backendBalances.saldoTotalPts : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500">Pontos Retirados</p>
                  <p className="text-lg font-bold text-[#002060]">
                    {backendBalances ? backendBalances.pontosRetiradosPts : "—"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500">Em Processamento</p>
                  <p className="text-lg font-bold text-[#002060]">
                    {backendBalances ? backendBalances.pontosProcessandoPts : "—"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500">Total de Pontos (backend)</p>
                  <p className="text-lg font-bold text-[#002060]">
                    {backendBalances ? backendBalances.saldoTotalPts : "—"}
                  </p>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <p className="text-sm text-gray-500 mb-3">Ações</p>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => router.push("/rewards")}
                    className="w-full py-3 bg-[#002060] hover:bg-[#003080] text-white font-semibold rounded-xl shadow transition"
                    aria-label="Retirar brindes"
                  >
                    🎁 Retirar Brindes
                  </button>

                  <button
                    onClick={() => setOpenHistory(true)}
                    className="w-full py-3 bg-white border border-gray-100 text-[#002060] font-semibold rounded-xl shadow-sm hover:shadow-md transition"
                    aria-label="Abrir histórico de retirada"
                  >
                    📜 Histórico de Retiradas
                  </button>

                  <button
                    onClick={() => setOpenSimplifiques(true)}
                    className="w-full py-3 bg-white border border-gray-100 text-[#002060] font-semibold rounded-xl shadow-sm hover:shadow-md transition"
                    aria-label="Ver últimos simplifiques"
                  >
                    📊 Últimos Simplifiques
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-tr from-[#f3f6ff] to-white p-4 rounded-2xl shadow-inner text-sm">
                <p className="font-semibold text-[#002060]">Dica</p>
                <p className="text-gray-600 text-sm">
                  Todas as regras e cálculos estão no backend. O cliente exibe somente os valores retornados.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Modal open={openHistory} onClose={() => setOpenHistory(false)} title="Histórico de Retiradas">
        {history.length === 0 ? (
          <p className="text-gray-500">Nenhuma retirada encontrada.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((h) => (
              <li key={h.id} className="p-3 rounded-lg bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-[#002060]">{h.date}</p>
                  <p className="text-sm text-gray-500">Pontos: {h.points}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${h.status === "Concluído" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {h.status}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Drawer simples in-page para simplifiques */}
      <div className={`fixed inset-0 z-40 ${openSimplifiques ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${openSimplifiques ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpenSimplifiques(false)}
        />
        <aside className={`absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform ${openSimplifiques ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-[#002060]">Últimos Simplifiques</h4>
              <button onClick={() => setOpenSimplifiques(false)} className="text-gray-600 hover:text-gray-800">Fechar</button>
            </div>

            {simplifiques.length === 0 ? (
              <p className="text-gray-500">Nenhum simplifique recente.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {simplifiques.map((s) => (
                  <li key={s.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-[#002060]">{s.id}</p>
                      <p className="text-xs text-gray-500">{s.date}</p>
                    </div>
                    <div className="text-sm font-semibold">{s.valuePts} pts</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
