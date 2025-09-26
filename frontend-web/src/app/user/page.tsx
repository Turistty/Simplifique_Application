"use client";

export default function UserPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-[#002060] mb-4">Área do Usuário</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
        Bem-vindo à área restrita do usuário!
      </p>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Informações do Usuário</h2>
        <ul className="space-y-2 text-gray-800 dark:text-gray-200">
          <li><strong>Nome:</strong> João Silva</li>
          <li><strong>Usuário (NP):</strong> 123456</li>
          <li><strong>Saldo:</strong> R$ 250,00</li>
          <li><strong>Status:</strong> Ativo</li>
        </ul>
      </div>
    </div>
  );
}
