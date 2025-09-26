'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ===== Tipos ===== */
type ServerUser = { nome: string };

type BackendBalances = {
  saldoAtualPts: number;        // disponível para resgates
  pontosRetiradosPts: number;
  pontosProcessandoPts: number;
  saldoTotalPts: number;        // total enviado pelo backend
};

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
}

/* ===== Modal ===== */
const Modal: React.FC<ModalProps> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
        <div className="prose max-w-none text-sm text-gray-700">{children}</div>
      </div>
    </div>
  );
};

/* ===== Página Cliente ===== */
export default function UserClient({ serverUser }: { serverUser: ServerUser }) {
  const router = useRouter();




  // Estado vindo do backend — fonte da verdade
  const [backendBalances, setBackendBalances] = useState<BackendBalances | null>(null);

  // Estados de UI
  const [openHistory, setOpenHistory] = useState(false);
  const [openSimplifiques, setOpenSimplifiques] = useState(false);

  // Busca segura via API route (servidor lê cookie HttpOnly e chama o backend)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user/balances', { credentials: 'include' });
        if (res.status === 401) {
          router.replace('/login');
          return;
        }
        if (!res.ok) throw new Error('Falha ao buscar saldos');
        const data: BackendBalances = await res.json();
        setBackendBalances(data);
      } catch (err) {
        console.error('Erro na busca de saldos:', err);
        // fallback opcional
        setBackendBalances({
          saldoAtualPts: 0,
          pontosRetiradosPts: 0,
          pontosProcessandoPts: 0,
          saldoTotalPts: 0,
        });
      }
    })();
  }, [router]);

  // Mocks de histórico e simplifiques (substituir por chamadas reais)
  const history = [
    { id: 1, date: '2025-09-20', points: 200, status: 'Concluído' },
    { id: 2, date: '2025-08-12', points: 250, status: 'Concluído' },
  ];
  const simplifiques = [{ id: 'Em implementação', date: '2025-09-23', valuePts: 0 }];

  const firstLetter = serverUser.nome ? serverUser.nome.charAt(0).toUpperCase() : 'U';

    async function handleLogout(){
    try{
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if(!res.ok){
        console.warn('Logout retornou status não-OK:', res.status);
      }
    } catch(e){
      console.error('Erro ao deslogar', e);
    } finally{
      router.replace('/login');
      router.refresh?.();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-[#0b5ed7] to-[#06b6d4] text-white">
              <span className="text-lg font-bold">{firstLetter}</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-[#00205b]">MAHLE • Área do Usuário</p>
              <p className="text-xs text-gray-500">Bem-vindo, {serverUser.nome} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/rewards')}
              className="rounded-lg bg-[#00205b] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#003080]"
              aria-label="Ir para Retirada de Brindes"
            >
              🎁 Retirar Brindes
            </button>
            {/* Botão de logout*/}
            <button
              onClick = {handleLogout}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Cards de saldo */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Saldo Atual (pts)</p>
            <p className="mt-1 text-2xl font-extrabold text-[#00205b]">
              {backendBalances ? backendBalances.saldoAtualPts : '—'}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Disponível para retirada de brindes
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Saldo Total (pts)</p>
            <p className="mt-1 text-2xl font-extrabold text-[#00205b]">
              {backendBalances ? backendBalances.saldoTotalPts : '—'}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pontos Retirados</p>
            <p className="mt-1 text-2xl font-extrabold text-[#00205b]">
              {backendBalances ? backendBalances.pontosRetiradosPts : '—'}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Em Processamento</p>
            <p className="mt-1 text-2xl font-extrabold text-[#00205b]">
              {backendBalances ? backendBalances.pontosProcessandoPts : '—'}
            </p>
          </div>
        </section>

        {/* Ações */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <button
            onClick={() => router.push('/rewards')}
            className="w-full rounded-xl bg-[#00205b] py-3 font-semibold text-white shadow transition hover:bg-[#003080]"
            aria-label="Retirar brindes"
          >
            🎁 Retirar Brindes
          </button>

          <button
            onClick={() => setOpenHistory(true)}
            className="w-full rounded-xl border border-gray-100 bg-white py-3 font-semibold text-[#00205b] shadow-sm transition hover:shadow-md"
            aria-label="Abrir histórico de retirada"
          >
            🗒️ Histórico de Retiradas
          </button>

          <button
            onClick={() => setOpenSimplifiques(true)}
            className="w-full rounded-xl border border-gray-100 bg-white py-3 font-semibold text-[#00205b] shadow-sm transition hover:shadow-md"
            aria-label="Ver últimos simplifiques"
          >
            📈 Últimos Simplifiques
          </button>
        </section>

        <p className="mt-3 text-sm text-gray-500">
          <strong>Dica:</strong> use seus pontos para retirar brindes e acompanhe seus
          simplifiques recentes.
        </p>
      </main>

      {/* Modal: Histórico */}
      <Modal open={openHistory} title="Histórico de Retiradas" onClose={() => setOpenHistory(false)}>
        {history.length === 0 ? (
          <p className="text-sm text-gray-600">Nenhuma retirada encontrada.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((h) => (
              <li key={h.id} className="rounded-lg border bg-white p-3">
                <p className="text-sm text-gray-700"><span className="font-semibold">Data:</span> {h.date}</p>
                <p className="text-sm text-gray-700"><span className="font-semibold">Pontos:</span> {h.points}</p>
                <p className="text-sm text-gray-700"><span className="font-semibold">Status:</span> {h.status}</p>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Modal: Simplifiques */}
      <Modal open={openSimplifiques} title="Últimos Simplifiques" onClose={() => setOpenSimplifiques(false)}>
        {simplifiques.length === 0 ? (
          <p className="text-sm text-gray-600">Nenhum simplifique recente.</p>
        ) : (
          <ul className="space-y-3">
            {simplifiques.map((s) => (
              <li key={s.id} className="rounded-lg border bg-white p-3">
                <p className="text-sm text-gray-700"><span className="font-semibold">ID:</span> {s.id}</p>
                <p className="text-sm text-gray-700"><span className="font-semibold">Data:</span> {s.date}</p>
                <p className="text-sm text-gray-700"><span className="font-semibold">Valor:</span> {s.valuePts} pts</p>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}