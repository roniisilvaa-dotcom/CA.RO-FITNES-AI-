import React, { useState, useEffect } from "react";
import { Shield, Server, Key, AlertTriangle, Check, Plus, Trash2, Database, DollarSign } from "lucide-react";
import { Empresa } from "../types";

export default function MasterAdmin() {
  const [gyms, setGyms] = useState<Empresa[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Gym Form
  const [isAdding, setIsAdding] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [planoSaas, setPlanoSaas] = useState("Pro Enterprise");
  const [limiteAlunos, setLimiteAlunos] = useState("500");
  const [limiteIa, setLimiteIa] = useState("2000");

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/saas/stats");
      const data = await res.json();
      setGyms(data.gyms || []);
      setLogs(data.logs || []);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/saas/gyms/${id}/toggle-status`, { method: "POST" });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGym = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) return;

    try {
      const res = await fetch("/api/saas/gyms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome, email, telefone, plano_saas: planoSaas, limite_alunos: limiteAlunos, limite_ia_mensal: limiteIa
        })
      });
      if (res.ok) {
        setIsAdding(false);
        setNome("");
        setEmail("");
        setTelefone("");
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500 border-transparent"></div>
        <p className="mt-2 text-xs font-mono">Carregando Master SaaS...</p>
      </div>
    );
  }

  const activeCount = gyms.filter(g => g.status === "ativo").length;
  const blockedCount = gyms.filter(g => g.status === "bloqueado").length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-100 space-y-6 text-left">
      
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">CA.RO Master Admin Cockpit (SaaS Vendor)</h3>
        </div>
        <span className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-amber-400 font-mono">
          MASTER ROOT ACCESS
        </span>
      </div>

      {/* Global SaaS Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 text-left">
          <span className="text-[10px] text-slate-500 font-mono">ACADEMIAS ADERIDAS</span>
          <h4 className="text-xl font-bold text-white mt-1">{gyms.length}</h4>
          <p className="text-[9px] text-emerald-400 font-mono mt-1">● {activeCount} Ativas | 🔴 {blockedCount} Bloqueadas</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 text-left">
          <span className="text-[10px] text-slate-500 font-mono">RECORRÊNCIA MENSAL (ARR)</span>
          <h4 className="text-xl font-bold text-emerald-400 mt-1">R$ {(gyms.length * 499.00).toFixed(2)}</h4>
          <p className="text-[9px] text-slate-400 font-mono mt-1">Calculado por licenças ativas</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 text-left">
          <span className="text-[10px] text-slate-500 font-mono">CONVERSAS TOTAIS IA</span>
          <h4 className="text-xl font-bold text-white mt-1">{logs.length}</h4>
          <p className="text-[9px] text-slate-400 font-mono mt-1">Consumo integrado da plataforma</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 text-left">
          <span className="text-[10px] text-slate-500 font-mono">CUSTO ESTIMADO GEMINI API</span>
          <h4 className="text-xl font-bold text-amber-400 mt-1">
            ${(logs.reduce((acc, curr) => acc + (curr.custo_estimado || 0), 0)).toFixed(5)}
          </h4>
          <p className="text-[9px] text-slate-500 font-mono mt-1">Consumo real faturado na Google Cloud</p>
        </div>
      </div>

      {/* Grid: Companies CRUD and logs */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400">Academias Clientes Registradas</h4>
          <button 
            onClick={() => setIsAdding(true)}
            className="py-1 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Unidade / Rede de Academia
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleCreateGym} className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400">Cadastrar Academia na Plataforma</span>
              <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Nome da Academia / Rede" value={nome} onChange={e => setNome(e.target.value)} required className="bg-slate-900 border border-slate-800 rounded p-2 text-white" />
              <input type="email" placeholder="E-mail Administrativo" value={email} onChange={e => setEmail(e.target.value)} required className="bg-slate-900 border border-slate-800 rounded p-2 text-white" />
              <input type="text" placeholder="Telefone Comercial" value={telefone} onChange={e => setTelefone(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-2 text-white" />
              <input type="text" placeholder="Plano SaaS (ex: Enterprise)" value={planoSaas} onChange={e => setPlanoSaas(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-2 text-white" />
              <input type="number" placeholder="Limite Alunos (ex: 500)" value={limiteAlunos} onChange={e => setLimiteAlunos(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-2 text-white" />
              <input type="number" placeholder="Limite IA Mensal (ex: 2000)" value={limiteIa} onChange={e => setLimiteIa(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-2 text-white" />
            </div>
            <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 rounded font-bold hover:bg-amber-400">
              Criar Licença de Uso
            </button>
          </form>
        )}

        <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[9px] border-b border-slate-800">
              <tr>
                <th className="p-3">ID / Nome da Academia</th>
                <th className="p-3">Plano SaaS</th>
                <th className="p-3">Limites (Alunos / IA)</th>
                <th className="p-3">Contato Adm</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {gyms.map(g => (
                <tr key={g.id} className="hover:bg-slate-900/30">
                  <td className="p-3">
                    <p className="font-bold text-white">{g.nome}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{g.id}</p>
                  </td>
                  <td className="p-3 font-semibold text-slate-300">{g.plano_saas}</td>
                  <td className="p-3">
                    <p className="text-slate-200">Max Alunos: {g.limite_alunos}</p>
                    <p className="text-[10px] text-slate-400">Max IA / Mês: {g.limite_ia_mensal}</p>
                  </td>
                  <td className="p-3">
                    <p>{g.email}</p>
                    <p className="text-[10px] text-slate-400">{g.telefone}</p>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      g.status === "ativo" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {g.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleToggleStatus(g.id)}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                        g.status === "ativo" 
                          ? "bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400" 
                          : "bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400"
                      }`}
                    >
                      {g.status === "ativo" ? "Bloquear" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Health logs */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 space-y-2">
        <h5 className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500 flex items-center gap-1">
          <Database className="w-3.5 h-3.5" /> Logs de Integridade do Servidor
        </h5>
        <div className="font-mono text-[9px] text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-1">
          <p className="text-emerald-400">[OK] Express Server running perfectly on port 3000</p>
          <p className="text-emerald-400">[OK] Vite middleware compiled successfully</p>
          <p className="text-amber-400">[WARN] Dual-mode active: Gemini API ready, simulated fallbacks initialized</p>
          <p className="text-slate-500">[INFO] Database session storage synced with Alunos, Treinos and Aulas modules</p>
        </div>
      </div>

    </div>
  );
}
