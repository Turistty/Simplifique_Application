// app/admin/page.tsx (ou pages/admin.tsx)
"use client";

import React, { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// ---------- Tipagens ----------
type OrderStatus = "pending" | "processing" | "delivered" | "canceled";

interface Reward {
  id: number;
  name: string;
  description?: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
  category: string;
  sizes?: string[];
}

interface User {
  id: number;
  name: string;
  email: string;
  points: number;
}

interface OrderItem {
  rewardId: number;
  quantity: number;
  pointsCost: number;
}

interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalPoints: number;
  status: OrderStatus;
  createdAt: string; // ISO date
}

// ---------- Ícones (inline SVG, sem libs externas) ----------
function IconDashboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M3 13h8V3H3v10Zm10 8h8V3h-8v18Zm-10 0h8v-6H3v6Z" />
    </svg>
  );
}
function IconGift(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M2 9h20v4H2V9Zm2 4h16v9H4v-9Zm5-4s-3-.5-3-3 3-3 5 0l1 3m3 0s3-.5 3-3-3-3-5 0l-1 3" />
    </svg>
  );
}
function IconUsers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M16 14a4 4 0 1 0-8 0M3 21a7 7 0 0 1 18 0M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    </svg>
  );
}
function IconOrders(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M3 3h13l5 5v13a1 1 0 0 1-1 1H3V3Zm13 0v5h5" />
    </svg>
  );
}
function IconSettings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm8.66 2a8.02 8.02 0 0 1 0 4l2.02 1.57a1 1 0 0 1 .32 1.28l-1.92 3.32a1 1 0 0 1-1.2.46L17.9 19.6a8.07 8.07 0 0 1-3.46 2.02l-.52 2.5a1 1 0 0 1-.98.78h-3.48a1 1 0 0 1-.98-.78l-.52-2.5A8.07 8.07 0 0 1 3.98 19.6l-1.98 1.35a1 1 0 0 1-1.2-.46L-1.12 17.2a1 1 0 0 1 .32-1.28L1.22 14.4a8.02 8.02 0 0 1 0-4L-.8 8.83A1 1 0 0 1-1.12 7.55l1.92-3.32a1 1 0 0 1 1.2-.46L3.98 5.4A8.07 8.07 0 0 1 7.44 3.38l.52-2.5A1 1 0 0 1 8.94.1h3.48a1 1 0 0 1 .98.78l.52 2.5A8.07 8.07 0 0 1 17.9 5.4l1.98-1.35a1 1 0 0 1 1.2.46l1.92 3.32a1 1 0 0 1-.32 1.28L20.66 10Z" />
    </svg>
  );
}
function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M15.5 15.5 21 21M10 17a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
    </svg>
  );
}
function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconEdit(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm14.71-9.71a1 1 0 0 0 0-1.41l-2.83-2.83a1 1 0 0 0-1.41 0l-1.34 1.34 3.75 3.75 1.83-1.83Z" />
    </svg>
  );
}
function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M4 7h16M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function IconUpload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M12 16V4m0 0 5 5m-5-5-5 5M4 20h16" />
    </svg>
  );
}
function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" d="M6 6l12 12M6 18 18 6" />
    </svg>
  );
}

// ---------- Chips / Badges ----------
function StatusPill({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-[#fff3cd] text-[#8a6d3b]", text: "#8a6d3b", label: "Pendente" },
    processing: { bg: "bg-[#d6e9f8] text-[#1e2a63]", text: "#1e2a63", label: "Processando" },
    delivered: { bg: "bg-[#dff0d8] text-[#3c763d]", text: "#3c763d", label: "Entregue" },
    canceled: { bg: "bg-[#f2dede] text-[#a94442]", text: "#a94442", label: "Cancelado" },
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${map[status].bg}`}>
      {map[status].label}
    </span>
  );
}

// ---------- Componentes base ----------
function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e3e7ee]">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#eef1f6]">
        {icon}
        <h3 className="text-[#00205b] font-semibold">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Toolbar({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-[#00205b]">{title}</h2>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

export default function AdminPage(): React.ReactElement | null{
  
  const router = useRouter();

    // Controle de sessão
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Seções
  const [section, setSection] = useState<"dashboard" | "rewards" | "users" | "orders" | "settings">("dashboard");

  // Estados
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // UI / Filtros / Busca
  const [searchRewards, setSearchRewards] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [searchOrders, setSearchOrders] = useState("");

  // Modais
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [orderDetailOpen, setOrderDetailOpen] = useState<Order | null>(null);

  // Verificação de sessão
  useEffect(() => {
    api.get("/api/me")
      .then((res) => {
        if (res.data.role !== "admin") {
          router.replace("/user"); // se não for admin, manda para área do usuário
        } else {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        router.replace("/login"); // sem cookie → login
      })
      .finally(() => setLoading(false));
  }, [router]);



  // Mock inicial
  useEffect(() => {
    setRewards([
      { id: 1, name: "Caneca Mahle Pro", pointsCost: 500, stock: 12, imageUrl: "/images/caneca.png", category: "Canecas" },
      { id: 2, name: "Camiseta Polo Tech", pointsCost: 1200, stock: 5, imageUrl: "/images/camiseta.png", category: "Vestuário", sizes: ["P","M","G","GG"] },
      { id: 3, name: "Boné UltraFit", pointsCost: 800, stock: 20, imageUrl: "/images/bone.png", category: "Acessórios" },
    ]);
    setUsers([
      { id: 1, name: "Bruno Silva", email: "bruno@empresa.com", points: 1850 },
      { id: 2, name: "Ana Costa", email: "ana@empresa.com", points: 920 },
      { id: 3, name: "Pedro Lima", email: "pedro@empresa.com", points: 450 },
    ]);
    setOrders([
      {
        id: 101,
        userId: 1,
        items: [{ rewardId: 1, quantity: 2, pointsCost: 500 }],
        totalPoints: 1000,
        status: "pending",
        createdAt: "2025-09-26T10:21:00Z",
      },
      {
        id: 102,
        userId: 2,
        items: [{ rewardId: 2, quantity: 1, pointsCost: 1200 }],
        totalPoints: 1200,
        status: "delivered",
        createdAt: "2025-09-25T15:05:00Z",
      },
      {
        id: 103,
        userId: 3,
        items: [{ rewardId: 3, quantity: 1, pointsCost: 800 }],
        totalPoints: 800,
        status: "processing",
        createdAt: "2025-09-26T12:00:00Z",
      },
    ]);
  }, []);
  
  // Derivados
  const filteredRewards = useMemo(() => {
    return rewards.filter(r => r.name.toLowerCase().includes(searchRewards.toLowerCase()) || r.category.toLowerCase().includes(searchRewards.toLowerCase()));
  }, [rewards, searchRewards]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(searchUsers.toLowerCase()) || u.email.toLowerCase().includes(searchUsers.toLowerCase()));
  }, [users, searchUsers]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const user = users.find(u => u.id === o.userId);
      const byUser = user?.name.toLowerCase().includes(searchOrders.toLowerCase());
      const byId = String(o.id).includes(searchOrders);
      return byUser || byId;
    });
  }, [orders, users, searchOrders]);

    if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Verificando sessão...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // evita piscar conteúdo antes do redirect
  }

  // Ações
  function saveReward(data: Partial<Reward>) {
    if (editingReward) {
      setRewards(prev => prev.map(r => (r.id === editingReward.id ? { ...editingReward, ...data } as Reward : r)));
    } else {
      const nextId = Math.max(0, ...rewards.map(r => r.id)) + 1;
      setRewards(prev => [...prev, { id: nextId, name: data.name || "Novo", pointsCost: data.pointsCost || 0, stock: data.stock || 0, imageUrl: data.imageUrl, category: data.category || "Outros", sizes: data.sizes }]);
    }
    setRewardModalOpen(false);
    setEditingReward(null);
  }

  function deleteReward(id: number) {
    setRewards(prev => prev.filter(r => r.id !== id));
  }

  function saveUser(data: Partial<User>) {
    if (editingUser) {
      setUsers(prev => prev.map(u => (u.id === editingUser.id ? { ...editingUser, ...data } as User : u)));
    } else {
      const nextId = Math.max(0, ...users.map(u => u.id)) + 1;
      setUsers(prev => [...prev, { id: nextId, name: data.name || "Novo usuário", email: data.email || "sem@email", points: data.points ?? 0 }]);
    }
    setUserModalOpen(false);
    setEditingUser(null);
  }

  function importUsers(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = (reader.result as string).trim().split(/\r?\n/);
      const imported = lines
        .map(ln => ln.split(","))
        .filter(arr => arr.length >= 3)
        .map(([name, email, pts], idx): User => ({
          id: Math.max(0, ...users.map(u => u.id)) + idx + 1,
          name: name.trim(),
          email: email.trim(),
          points: Number(pts.trim()),
        }));
      setUsers(prev => [...prev, ...imported]);
    };
    reader.readAsText(file);
  }

  function setOrderStatus(id: number, status: OrderStatus) {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
  }

  // KPI
  const kpiTotalUsers = users.length;
  const kpiTotalRewards = rewards.length;
  const kpiPending = orders.filter(o => o.status === "pending").length;
  const kpiProcessing = orders.filter(o => o.status === "processing").length;

  // ---------- Layout ----------
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#00205b]">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-[#00205b] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#41b6e6]">
              <IconDashboard className="w-5 h-5 text-white" />
            </span>
            <h1 className="text-xl font-bold">Painel de Controle</h1>
            <span className="mx-2 opacity-60">/</span>
            <span className="opacity-90 capitalize">{section}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/")} className="px-3 py-2 rounded-lg bg-white text-[#00205b] hover:bg-[#f0f0f0]">
              Voltar ao cliente
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-[220px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="bg-white rounded-xl shadow-sm border border-[#e3e7ee] p-3">
          <nav className="space-y-1">
            <button onClick={() => setSection("dashboard")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${section === "dashboard" ? "bg-[#eaf7fd] text-[#00205b] font-semibold" : "hover:bg-[#f6f8fc]"}`}>
              <IconDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button onClick={() => setSection("rewards")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${section === "rewards" ? "bg-[#eaf7fd] text-[#00205b] font-semibold" : "hover:bg-[#f6f8fc]"}`}>
              <IconGift className="w-5 h-5" /> Brindes
            </button>
            <button onClick={() => setSection("users")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${section === "users" ? "bg-[#eaf7fd] text-[#00205b] font-semibold" : "hover:bg-[#f6f8fc]"}`}>
              <IconUsers className="w-5 h-5" /> Usuários
            </button>
            <button onClick={() => setSection("orders")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${section === "orders" ? "bg-[#eaf7fd] text-[#00205b] font-semibold" : "hover:bg-[#f6f8fc]"}`}>
              <IconOrders className="w-5 h-5" /> Pedidos
            </button>
            <button onClick={() => setSection("settings")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${section === "settings" ? "bg-[#eaf7fd] text-[#00205b] font-semibold" : "hover:bg-[#f6f8fc]"}`}>
              <IconSettings className="w-5 h-5" /> Configurações
            </button>
          </nav>
        </aside>

        {/* Conteúdo */}
        <main className="space-y-8">
          {/* Dashboard */}
          {section === "dashboard" && (
            <>
              <Toolbar title="Visão geral" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Usuários" icon={<IconUsers className="w-5 h-5 text-[#41b6e6]" />}>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-bold">{kpiTotalUsers}</p>
                    <span className="text-sm text-[#75787b]">ativos</span>
                  </div>
                </Card>
                <Card title="Brindes" icon={<IconGift className="w-5 h-5 text-[#41b6e6]" />}>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-bold">{kpiTotalRewards}</p>
                    <span className="text-sm text-[#75787b]">catalogados</span>
                  </div>
                </Card>
                <Card title="Pedidos pendentes" icon={<IconOrders className="w-5 h-5 text-[#41b6e6]" />}>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-bold">{kpiPending}</p>
                    <span className="text-sm text-[#75787b]">aguardando</span>
                  </div>
                </Card>
                <Card title="Em processamento" icon={<IconOrders className="w-5 h-5 text-[#41b6e6]" />}>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-bold">{kpiProcessing}</p>
                    <span className="text-sm text-[#75787b]">andamento</span>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* Brindes */}
          {section === "rewards" && (
            <>
              <Toolbar
                title="Gestão de brindes"
                actions={
                  <>
                    <div className="relative">
                      <IconSearch className="w-4 h-4 absolute left-3 top-2.5 text-[#75787b]" />
                      <input
                        value={searchRewards}
                        onChange={(e) => setSearchRewards(e.target.value)}
                        placeholder="Buscar por nome ou categoria..."
                        className="pl-9 pr-3 py-2 rounded-lg border border-[#e3e7ee] bg-white focus:ring-2 focus:ring-[#41b6e6]"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setEditingReward(null);
                        setRewardModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#43b02a] text-white hover:bg-[#379623]"
                    >
                      <IconPlus className="w-4 h-4" /> Novo brinde
                    </button>
                  </>
                }
              />
              <div className="bg-white rounded-xl shadow-sm border border-[#e3e7ee] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#00205b] text-white">
                    <tr>
                      <th className="px-5 py-3 text-left">Brinde</th>
                      <th className="px-5 py-3 text-left">Categoria</th>
                      <th className="px-5 py-3 text-right">Pts</th>
                      <th className="px-5 py-3 text-right">Estoque</th>
                      <th className="px-5 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRewards.map((r) => (
                      <tr key={r.id} className="border-t border-[#eef1f6] hover:bg-[#f6f8fc]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {r.imageUrl ? (
                              <img src={r.imageUrl} alt={r.name} className="w-10 h-10 rounded-lg object-cover border border-[#e3e7ee]" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#eef1f6]" />
                            )}
                            <div>
                              <p className="font-semibold">{r.name}</p>
                              <p className="text-xs text-[#75787b]">{r.sizes?.length ? `Tamanhos: ${r.sizes.join(", ")}` : "Sem variações"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">{r.category}</td>
                        <td className="px-5 py-4 text-right">{r.pointsCost}</td>
                        <td className="px-5 py-4 text-right">{r.stock}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingReward(r);
                                setRewardModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#eaf7fd] text-[#00205b] hover:bg-[#d6effa]"
                            >
                              <IconEdit className="w-4 h-4" /> Editar
                            </button>
                            <button
                              onClick={() => deleteReward(r.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#f2dede] text-[#a94442] hover:bg-[#e9cfcf]"
                            >
                              <IconTrash className="w-4 h-4" /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRewards.length === 0 && (
                      <tr>
                        <td className="px-5 py-10 text-center text-[#75787b]" colSpan={5}>
                          Nenhum brinde encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Usuários */}
          {section === "users" && (
            <>
              <Toolbar
                title="Gestão de usuários"
                actions={
                  <>
                    <div className="relative">
                      <IconSearch className="w-4 h-4 absolute left-3 top-2.5 text-[#75787b]" />
                      <input
                        value={searchUsers}
                        onChange={(e) => setSearchUsers(e.target.value)}
                        placeholder="Buscar por nome ou email..."
                        className="pl-9 pr-3 py-2 rounded-lg border border-[#e3e7ee] bg-white focus:ring-2 focus:ring-[#41b6e6]"
                      />
                    </div>
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#41b6e6] text-white hover:bg-[#33a1d1] cursor-pointer">
                      <IconUpload className="w-4 h-4" /> Importar CSV/TXT
                      <input type="file" accept=".txt,.csv" className="hidden" onChange={importUsers} />
                    </label>
                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setUserModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#43b02a] text-white hover:bg-[#379623]"
                    >
                      <IconPlus className="w-4 h-4" /> Novo usuário
                    </button>
                  </>
                }
              />
              <div className="bg-white rounded-xl shadow-sm border border-[#e3e7ee] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#00205b] text-white">
                    <tr>
                      <th className="px-5 py-3 text-left">Usuário</th>
                      <th className="px-5 py-3 text-left">Email</th>
                      <th className="px-5 py-3 text-right">Pontos</th>
                      <th className="px-5 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-t border-[#eef1f6] hover:bg-[#f6f8fc]">
                        <td className="px-5 py-4">
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-xs text-[#75787b]">ID: {u.id}</p>
                        </td>
                        <td className="px-5 py-4">{u.email}</td>
                        <td className="px-5 py-4 text-right">{u.points}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setUserModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#eaf7fd] text-[#00205b] hover:bg-[#d6effa]"
                            >
                              <IconEdit className="w-4 h-4" /> Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td className="px-5 py-10 text-center text-[#75787b]" colSpan={4}>
                          Nenhum usuário encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pedidos */}
          {section === "orders" && (
            <>
              <Toolbar
                title="Histórico de pedidos"
                actions={
                  <div className="relative">
                    <IconSearch className="w-4 h-4 absolute left-3 top-2.5 text-[#75787b]" />
                    <input
                      value={searchOrders}
                      onChange={(e) => setSearchOrders(e.target.value)}
                      placeholder="Buscar por ID ou usuário..."
                      className="pl-9 pr-3 py-2 rounded-lg border border-[#e3e7ee] bg-white focus:ring-2 focus:ring-[#41b6e6]"
                    />
                  </div>
                }
              />
              <div className="bg-white rounded-xl shadow-sm border border-[#e3e7ee] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#00205b] text-white">
                    <tr>
                      <th className="px-5 py-3 text-left">Pedido</th>
                      <th className="px-5 py-3 text-left">Usuário</th>
                      <th className="px-5 py-3 text-right">Total pts</th>
                      <th className="px-5 py-3 text-left">Data</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => {
                      const user = users.find(u => u.id === o.userId);
                      return (
                        <tr key={o.id} className="border-t border-[#eef1f6] hover:bg-[#f6f8fc]">
                          <td className="px-5 py-4">#{o.id}</td>
                          <td className="px-5 py-4">{user?.name}</td>
                          <td className="px-5 py-4 text-right">{o.totalPoints}</td>
                          <td className="px-5 py-4">{new Date(o.createdAt).toLocaleString()}</td>
                          <td className="px-5 py-4"><StatusPill status={o.status} /></td>
                          <td className="px-5 py-4 text-center">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => setOrderDetailOpen(o)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#eaf7fd] text-[#00205b] hover:bg-[#d6effa]"
                              >
                                Detalhes
                              </button>
                              {o.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => setOrderStatus(o.id, "processing")}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#fff3cd] text-[#8a6d3b] hover:bg-[#ffe8a6]"
                                  >
                                    Processar
                                  </button>
                                  <button
                                    onClick={() => setOrderStatus(o.id, "delivered")}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#dff0d8] text-[#3c763d] hover:bg-[#cfe8c7]"
                                  >
                                    <IconCheck className="w-4 h-4" /> Entregar
                                  </button>
                                  <button
                                    onClick={() => setOrderStatus(o.id, "canceled")}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#f2dede] text-[#a94442] hover:bg-[#e9cfcf]"
                                  >
                                    <IconX className="w-4 h-4" /> Cancelar
                                  </button>
                                </>
                              )}
                              {o.status === "processing" && (
                                <>
                                  <button
                                    onClick={() => setOrderStatus(o.id, "delivered")}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#dff0d8] text-[#3c763d] hover:bg-[#cfe8c7]"
                                  >
                                    <IconCheck className="w-4 h-4" /> Entregar
                                  </button>
                                  <button
                                    onClick={() => setOrderStatus(o.id, "canceled")}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#f2dede] text-[#a94442] hover:bg-[#e9cfcf]"
                                  >
                                    <IconX className="w-4 h-4" /> Cancelar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td className="px-5 py-10 text-center text-[#75787b]" colSpan={6}>
                          Nenhum pedido encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Configurações */}
          {section === "settings" && (
            <>
              <Toolbar title="Configurações" />
              <Card title="Tema & marca" icon={<IconSettings className="w-5 h-5 text-[#41b6e6]" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cor primária</label>
                    <input type="color" defaultValue="#00205b" className="w-16 h-10 p-0 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cor de destaque</label>
                    <input type="color" defaultValue="#41b6e6" className="w-16 h-10 p-0 border rounded" />
                  </div>
                </div>
              </Card>
            </>
          )}
        </main>
      </div>

      {/* Modal de Brinde */}
      {rewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#eef1f6]">
              <h3 className="text-lg font-semibold">{editingReward ? "Editar brinde" : "Novo brinde"}</h3>
              <button onClick={() => { setRewardModalOpen(false); setEditingReward(null); }} className="px-3 py-1 rounded hover:bg-[#f6f8fc]">
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <form
              className="p-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const data: Partial<Reward> = {
                  name: String(fd.get("name") || ""),
                  pointsCost: Number(fd.get("pointsCost") || 0),
                  stock: Number(fd.get("stock") || 0),
                  category: String(fd.get("category") || "Outros"),
                  imageUrl: String(fd.get("imageUrl") || ""),
                  sizes: String(fd.get("sizes") || "")
                    .split(",")
                    .map(s => s.trim())
                    .filter(Boolean),
                };
                saveReward(data);
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Nome</label>
                  <input name="name" defaultValue={editingReward?.name} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#41b6e6]" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Categoria</label>
                  <input name="category" defaultValue={editingReward?.category || "Outros"} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#41b6e6]" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Pontos</label>
                  <input type="number" name="pointsCost" defaultValue={editingReward?.pointsCost} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Estoque</label>
                  <input type="number" name="stock" defaultValue={editingReward?.stock} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Imagem (URL)</label>
                  <input name="imageUrl" defaultValue={editingReward?.imageUrl} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Tamanhos (separados por vírgula)</label>
                  <input name="sizes" defaultValue={editingReward?.sizes?.join(", ")} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setRewardModalOpen(false); setEditingReward(null); }} className="px-4 py-2 rounded-lg border">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#43b02a] text-white hover:bg-[#379623]">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Usuário */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#eef1f6]">
              <h3 className="text-lg font-semibold">{editingUser ? "Editar usuário" : "Novo usuário"}</h3>
              <button onClick={() => { setUserModalOpen(false); setEditingUser(null); }} className="px-3 py-1 rounded hover:bg-[#f6f8fc]">
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <form
              className="p-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const data: Partial<User> = {
                  name: String(fd.get("name") || ""),
                  email: String(fd.get("email") || ""),
                  points: Number(fd.get("points") || 0),
                };
                saveUser(data);
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Nome</label>
                  <input name="name" defaultValue={editingUser?.name} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input name="email" defaultValue={editingUser?.email} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Pontos</label>
                  <input type="number" name="points" defaultValue={editingUser?.points} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setUserModalOpen(false); setEditingUser(null); }} className="px-4 py-2 rounded-lg border">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#43b02a] text-white hover:bg-[#379623]">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer de Pedido */}
      {orderDetailOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOrderDetailOpen(null)} />
          <aside className="relative ml-auto bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col">
            <button onClick={() => setOrderDetailOpen(null)} className="self-end mb-4 px-3 py-1 rounded hover:bg-[#f6f8fc]">
              <IconX className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold">Pedido #{orderDetailOpen.id}</h3>
            <p className="text-sm text-[#75787b] mt-1">Criado em: {new Date(orderDetailOpen.createdAt).toLocaleString()}</p>
            <div className="mt-3"><StatusPill status={orderDetailOpen.status} /></div>
            <div className="mt-6 space-y-3">
              {orderDetailOpen.items.map((it, idx) => {
                const reward = rewards.find(r => r.id === it.rewardId);
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {reward?.imageUrl ? (
                        <img src={reward.imageUrl} alt={reward.name} className="w-12 h-12 rounded-lg object-cover border border-[#e3e7ee]" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#eef1f6]" />
                      )}
                      <div>
                        <p className="font-medium">{reward?.name}</p>
                        <p className="text-xs text-[#75787b]">{it.pointsCost} pts × {it.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">{it.pointsCost * it.quantity} pts</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto">
              <div className="flex justify-between font-semibold my-4">
                <span>Total</span>
                <span>{orderDetailOpen.totalPoints} pts</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(orderDetailOpen.status === "pending" || orderDetailOpen.status === "processing") && (
                  <>
                    <button
                      onClick={() => setOrderStatus(orderDetailOpen.id, "delivered")}
                      className="px-4 py-2 rounded-lg bg-[#43b02a] text-white hover:bg-[#379623]"
                    >
                      Marcar como entregue
                    </button>
                    <button
                      onClick={() => setOrderStatus(orderDetailOpen.id, "canceled")}
                      className="px-4 py-2 rounded-lg bg-[#f2dede] text-[#a94442] hover:bg-[#e9cfcf]"
                    >
                      Cancelar pedido
                    </button>
                  </>
                )}
                {orderDetailOpen.status === "delivered" && (
                  <button className="px-4 py-2 rounded-lg bg-[#dff0d8] text-[#3c763d]" disabled>
                    Já entregue
                  </button>
                )}
                {orderDetailOpen.status === "canceled" && (
                  <button className="px-4 py-2 rounded-lg bg-[#f2dede] text-[#a94442]" disabled>
                    Cancelado
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
