import React, { useState, useEffect } from "react";
import { 
  Users, Calendar, FileText, Dumbbell, Send, Sparkles, 
  Trash2, Plus, Edit, Shield, Check, X, Search, Info, LineChart, Cpu, RefreshCw
} from "lucide-react";
import { Aluno, Treino, Aula, Notification, Exercicio, IaLog, Plano } from "../types";

interface GymAdminProps {
  onRefreshStudent: () => void; // Sync mobile simulator instantly
}

export default function GymAdmin({ onRefreshStudent }: GymAdminProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // State Lists
  const [students, setStudents] = useState<Aluno[]>([]);
  const [workouts, setWorkouts] = useState<Treino[]>([]);
  const [exercises, setExercises] = useState<Exercicio[]>([]);
  const [classes, setClasses] = useState<Aula[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [logs, setLogs] = useState<IaLog[]>([]);
  const [plans, setPlans] = useState<Plano[]>([]);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");

  // CRUD modal states or Quick Create fields
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    nome: "", email: "", telefone: "", altura: "", peso: "", objetivo: "Hipertrofia", nivel: "Iniciante", frequencia_semanal: "4"
  });

  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClass, setNewClass] = useState({
    nome: "", professor: "", data_hora: "", vagas: "20"
  });

  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({
    nome: "", grupo_muscular: "Peito", instrucoes: "", erros_comuns: "", cuidados: "", midia_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop", nivel: "Todos"
  });

  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    aluno_id: "", nome: "", objetivo: "Hipertrofia", nivel: "Intermediário", frequencia: "A / B / C",
    selected_exercises: [] as { exercicio_id: string; series: string; repeticoes: string; carga: string; descanso: string; observacoes: string }[]
  });
  const [tempExId, setTempExId] = useState("");
  const [tempSeries, setTempSeries] = useState("3");
  const [tempRepeticoes, setTempRepeticoes] = useState("12");
  const [tempCarga, setTempCarga] = useState("15kg");
  const [tempDescanso, setTempDescanso] = useState("60s");

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<any>("comunicado");
  const [broadcastStatusMessage, setBroadcastStatusMessage] = useState("");

  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    tone: "Encorajador & Científico",
    limitsEnabled: true,
    monthlyLimit: 1500
  });

  // Load Admin Data
  const fetchAllAdminData = async () => {
    try {
      const sRes = await fetch("/api/students");
      setStudents(await sRes.json());

      const wRes = await fetch("/api/workouts");
      setWorkouts(await wRes.json());

      const eRes = await fetch("/api/exercises");
      setExercises(await eRes.json());

      const cRes = await fetch("/api/classes");
      setClasses(await cRes.json());

      const nRes = await fetch("/api/notifications");
      setNotifications(await nRes.json());

      // Logs from master saas stats endpoint
      const statsRes = await fetch("/api/saas/stats");
      const statsData = await statsRes.json();
      setLogs(statsData.logs || []);
      setPlans(statsData.gyms[0]?.plano_saas ? [{ id: "pla_1", empresa_id: "emp_1", nome: "SaaS Premium Custom", valor: 499, duracao_dias: 30, beneficios: "Acesso total", status: "ativo" }] : []);
    } catch (err) {
      console.error("Error loading admin board data", err);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent)
      });
      if (res.ok) {
        setIsCreatingStudent(false);
        setNewStudent({ nome: "", email: "", telefone: "", altura: "", peso: "", objetivo: "Hipertrofia", nivel: "Iniciante", frequencia_semanal: "4" });
        fetchAllAdminData();
        onRefreshStudent();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClass)
      });
      if (res.ok) {
        setIsCreatingClass(false);
        setNewClass({ nome: "", professor: "", data_hora: "", vagas: "20" });
        fetchAllAdminData();
        onRefreshStudent();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExercise)
      });
      if (res.ok) {
        setIsCreatingExercise(false);
        setNewExercise({ nome: "", grupo_muscular: "Peito", instrucoes: "", erros_comuns: "", cuidados: "", midia_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop", nivel: "Todos" });
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExerciseToWorkoutDraft = () => {
    if (!tempExId) return;
    const selected = exercises.find(e => e.id === tempExId);
    if (!selected) return;

    setNewWorkout(prev => ({
      ...prev,
      selected_exercises: [
        ...prev.selected_exercises,
        {
          exercicio_id: tempExId,
          series: tempSeries,
          repeticoes: tempRepeticoes,
          carga: tempCarga,
          descanso: tempDescanso,
          observacoes: ""
        }
      ]
    }));
    setTempExId("");
  };

  const handleCreateWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkout.aluno_id || newWorkout.selected_exercises.length === 0) {
      alert("Selecione um aluno e adicione pelo menos um exercício!");
      return;
    }

    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aluno_id: newWorkout.aluno_id,
          nome: newWorkout.nome || `Treino Foco ${newWorkout.objetivo}`,
          objetivo: newWorkout.objetivo,
          nivel: newWorkout.nivel,
          frequencia: newWorkout.frequencia,
          exercicios: newWorkout.selected_exercises
        })
      });
      if (res.ok) {
        setIsCreatingWorkout(false);
        setNewWorkout({ aluno_id: "", nome: "", objetivo: "Hipertrofia", nivel: "Intermediário", frequencia: "A / B / C", selected_exercises: [] });
        fetchAllAdminData();
        onRefreshStudent();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      // Send to all loaded students in parallel
      await Promise.all(
        students.map(s => 
          fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              aluno_id: s.id,
              titulo: broadcastTitle,
              mensagem: broadcastMessage,
              tipo: broadcastType
            })
          })
        )
      );

      setBroadcastTitle("");
      setBroadcastMessage("");
      setBroadcastStatusMessage("✅ Comunicado enviado com sucesso para todos os alunos cadastrados!");
      setTimeout(() => setBroadcastStatusMessage(""), 5000);
      fetchAllAdminData();
      onRefreshStudent();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm("Deseja realmente excluir este treino?")) return;
    try {
      await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      fetchAllAdminData();
      onRefreshStudent();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm("Deseja realmente excluir este exercício do banco de dados?")) return;
    try {
      await fetch(`/api/exercises/${id}`, { method: "DELETE" });
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filters students by search query
  const filteredStudents = students.filter(s => 
    s.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-dark-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl text-white font-sans">
      
      {/* Admin Panel Header tabs */}
      <div className="bg-black border-b border-white/10 px-6 py-5 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-brand" />
          <h3 className="text-sm font-display font-black uppercase tracking-wider text-white">Painel da Academia</h3>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-dark-pitch p-1 rounded-xl border border-white/10">
          {[
            { id: "dashboard", label: "Dashboard", icon: LineChart },
            { id: "alunos", label: "Alunos", icon: Users },
            { id: "treinos", label: "Treinos", icon: Dumbbell },
            { id: "exercicios", label: "Exercícios", icon: FileText },
            { id: "agenda", label: "Agenda", icon: Calendar },
            { id: "comunicados", label: "Comunicados", icon: Send },
            { id: "ia", label: "IA Analítica", icon: Cpu }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-display font-black uppercase tracking-wider transition whitespace-nowrap ${
                activeTab === t.id 
                  ? "bg-brand text-black neon-glow" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
 
        <button 
          onClick={fetchAllAdminData}
          className="p-2 bg-dark-pitch hover:bg-white/5 border border-white/10 rounded-lg text-white/50 hover:text-white transition"
          title="Recarregar Dados"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
 
      {/* Main Panel Content Box */}
      <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: "600px" }}>
        
        {/* TAB: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest font-bold">TOTAL ALUNOS</span>
                <h4 className="text-3xl font-display font-black text-white uppercase tracking-tighter mt-1">{students.length}</h4>
                <p className="text-[10px] text-brand mt-1.5 font-mono uppercase tracking-wider font-bold">● 100% ativos nesta unidade</p>
              </div>
 
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest font-bold">AULAS RESERVADAS</span>
                <h4 className="text-3xl font-display font-black text-brand uppercase tracking-tighter mt-1">
                  {classes.reduce((acc, curr) => acc + (curr.vagas - (curr.vagas_restantes || curr.vagas)), 0)}
                </h4>
                <p className="text-[10px] text-white/40 mt-1.5 font-mono uppercase tracking-wider font-bold">Sessões coletivas agendadas</p>
              </div>
 
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest font-bold">REQUISIÇÕES DE IA</span>
                <h4 className="text-3xl font-display font-black text-white uppercase tracking-tighter mt-1">{logs.length}</h4>
                <p className="text-[10px] text-brand mt-1.5 font-mono uppercase tracking-wider font-bold">Limite mensal: 2000</p>
              </div>
 
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest font-bold">STATUS DO SAAS</span>
                <h4 className="text-xl font-display font-black text-brand uppercase tracking-tighter mt-1">VIP Premium</h4>
                <p className="text-[10px] text-white/40 mt-1.5 font-mono uppercase tracking-wider">Mensalidade em dia (R$ 499,00)</p>
              </div>
            </div>
 
            {/* Quick overview grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Gym collective Classes Today */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 text-left">
                <h4 className="text-[11px] font-display font-black uppercase tracking-widest text-brand mb-2">Grade de Aulas Coletivas</h4>
                <div className="space-y-2">
                  {classes.slice(0, 3).map(c => {
                    const booked = c.vagas - (c.vagas_restantes ?? c.vagas);
                    return (
                      <div key={c.id} className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white uppercase tracking-tight">{c.nome}</p>
                          <p className="text-[10px] text-white/50">{c.professor} • {new Date(c.data_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        <span className="font-mono text-[10px] bg-brand text-black font-black uppercase px-2.5 py-1 rounded">
                          {booked} / {c.vagas} Alunos
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
 
              {/* Recent AI queries metrics */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 text-left">
                <h4 className="text-[11px] font-display font-black uppercase tracking-widest text-brand mb-2">Perguntas Recentes à IA</h4>
                <div className="space-y-2">
                  {logs.slice(-3).map((l, i) => (
                    <div key={i} className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-[10px] text-white/80 space-y-1">
                      <div className="flex justify-between font-mono text-[8px] text-white/40">
                        <span>MODELO: {l.modelo}</span>
                        <span>CUSTO: ${l.custo_estimado.toFixed(5)}</span>
                      </div>
                      <p className="truncate text-white font-medium italic">💬 Aluno solicitou ajuda / sugestão de treino focado.</p>
                      <span className="text-[9px] bg-brand/10 text-brand px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block mt-1">
                        Processado por {l.provider.toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <p className="text-xs text-white/40 py-6 text-center">Nenhuma requisição de IA efetuada ainda.</p>
                  )}
                </div>
              </div>
 
            </div>
 
          </div>
        )}

        {/* TAB: ALUNOS CRUD */}
        {activeTab === "alunos" && (
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar aluno por nome ou e-mail..."
                  className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand text-white placeholder-white/30"
                />
              </div>
              
              <button 
                onClick={() => setIsCreatingStudent(true)}
                className="py-2 px-4 bg-brand hover:bg-brand-hover text-black rounded-xl text-[10px] font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition neon-glow"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Cadastrar Novo Aluno
              </button>
            </div>

            {/* Create Student form inline modal */}
            {isCreatingStudent && (
              <form onSubmit={handleAddStudent} className="bg-black p-5 rounded-2xl border border-brand/35 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h4 className="text-xs font-display font-black uppercase tracking-wider text-brand">Formulário de Cadastro</h4>
                  <button type="button" onClick={() => setIsCreatingStudent(false)} className="text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    placeholder="Nome Completo" 
                    value={newStudent.nome}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, nome: e.target.value }))}
                    required
                    className="bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-brand" 
                  />
                  <input 
                    type="email" 
                    placeholder="E-mail" 
                    value={newStudent.email}
                    onChange={(prev) => setNewStudent(p => ({ ...p, email: prev.target.value }))}
                    required
                    className="bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-brand" 
                  />
                  <input 
                    type="text" 
                    placeholder="Telefone (ex: 11999999999)" 
                    value={newStudent.telefone}
                    onChange={(prev) => setNewStudent(p => ({ ...p, telefone: prev.target.value }))}
                    className="bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-brand" 
                  />
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Altura (m)" 
                    value={newStudent.altura}
                    onChange={(prev) => setNewStudent(p => ({ ...p, altura: prev.target.value }))}
                    className="bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-brand" 
                  />
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="Peso (kg)" 
                    value={newStudent.peso}
                    onChange={(prev) => setNewStudent(p => ({ ...p, peso: prev.target.value }))}
                    className="bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-brand" 
                  />
                  <select 
                    value={newStudent.objetivo}
                    onChange={(prev) => setNewStudent(p => ({ ...p, objetivo: prev.target.value }))}
                    className="bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white/80 focus:outline-none focus:border-brand"
                  >
                    <option value="Hipertrofia" className="bg-black">Hipertrofia</option>
                    <option value="Definição" className="bg-black">Definição Muscular</option>
                    <option value="Perda de Peso" className="bg-black">Emagrecimento</option>
                    <option value="Condicionamento" className="bg-black">Condicionamento Físico</option>
                  </select>
                </div>
                <button type="submit" className="px-4 py-2.5 bg-brand text-black font-display font-black rounded-lg text-[10px] uppercase tracking-wider hover:bg-brand-hover transition neon-glow">
                  Cadastrar e Vincular Treino IA Padrão
                </button>
              </form>
            )}

            {/* Students Data Grid Table */}
            <div className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-black text-white/50 uppercase font-mono text-[9px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-3">Aluno</th>
                    <th className="p-3">Objetivo / Nível</th>
                    <th className="p-3">Peso / Altura</th>
                    <th className="p-3">Restrições / Notas</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-white/5 transition duration-150">
                      <td className="p-3 flex items-center gap-2.5">
                        <img src={s.foto_url} alt={s.nome} className="w-8 h-8 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-white uppercase">{s.nome}</p>
                          <p className="text-[10px] text-white/40">{s.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-white/90 uppercase text-[11px]">{s.objetivo}</p>
                        <p className="text-[10px] text-white/40">Nível: {s.nivel}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold">{s.peso} kg</p>
                        <p className="text-[10px] text-white/40">{s.altura} m</p>
                      </td>
                      <td className="p-3 max-w-xs truncate" title={s.restricoes}>
                        <p className="text-rose-400 bg-rose-500/10 border border-rose-500/10 px-2 py-0.5 rounded text-[10px] inline-block uppercase font-bold">
                          {s.restricoes}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-brand/10 text-brand border border-brand/20 px-2.5 py-0.5 rounded text-[10px] font-display font-black uppercase tracking-wider">
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB: TREINOS BUILDER */}
        {activeTab === "treinos" && (
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h4 className="text-[11px] font-display font-black uppercase tracking-widest text-white/40">Gestão de Fichas de Treino</h4>
              <button 
                onClick={() => setIsCreatingWorkout(true)}
                className="py-2 px-4 bg-brand hover:bg-brand-hover text-black rounded-xl text-[10px] font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition neon-glow"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Montar Nova Ficha de Treino
              </button>
            </div>

            {/* Create Workout Form */}
            {isCreatingWorkout && (
              <form onSubmit={handleCreateWorkoutSubmit} className="bg-black p-5 rounded-2xl border border-brand/25 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h4 className="text-xs font-display font-black uppercase tracking-wider text-brand">Montador de Ficha</h4>
                  <button type="button" onClick={() => setIsCreatingWorkout(false)} className="text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/40 font-mono mb-1 uppercase font-bold">VINCULAR ALUNO *</label>
                    <select 
                      value={newWorkout.aluno_id}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, aluno_id: e.target.value }))}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white/90 focus:outline-none focus:border-brand"
                    >
                      <option value="" className="bg-black text-white/40">Selecione...</option>
                      {students.map(s => <option key={s.id} value={s.id} className="bg-black">{s.nome}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 font-mono mb-1 uppercase font-bold">NOME DA FICHA *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Treino A - Costas & Bíceps" 
                      value={newWorkout.nome}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, nome: e.target.value }))}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 font-mono mb-1 uppercase font-bold">DIVISÃO SEMANAL</label>
                    <input 
                      type="text" 
                      placeholder="Ex: A / B / C" 
                      value={newWorkout.frequencia}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, frequencia: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Sub-form to Add exercise item to draft */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                  <span className="text-[10px] text-brand font-display font-black uppercase tracking-wider">ADICIONAR EXERCÍCIO À FICHA:</span>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <select 
                      value={tempExId} 
                      onChange={(e) => setTempExId(e.target.value)}
                      className="bg-black border border-white/10 rounded p-2 text-white/90 focus:outline-none focus:border-brand"
                    >
                      <option value="" className="bg-black text-white/40">Escolher exercício...</option>
                      {exercises.map(e => <option key={e.id} value={e.id} className="bg-black">{e.nome}</option>)}
                    </select>
                    <input type="number" placeholder="Séries (ex: 4)" value={tempSeries} onChange={e => setTempSeries(e.target.value)} className="bg-black border border-white/10 rounded p-2 text-white focus:outline-none focus:border-brand" />
                    <input type="text" placeholder="Reps (ex: 12)" value={tempRepeticoes} onChange={e => setTempRepeticoes(e.target.value)} className="bg-black border border-white/10 rounded p-2 text-white focus:outline-none focus:border-brand" />
                    <input type="text" placeholder="Carga (ex: 20kg)" value={tempCarga} onChange={e => setTempCarga(e.target.value)} className="bg-black border border-white/10 rounded p-2 text-white focus:outline-none focus:border-brand" />
                    <input type="text" placeholder="Descanso (ex: 60s)" value={tempDescanso} onChange={e => setTempDescanso(e.target.value)} className="bg-black border border-white/10 rounded p-2 text-white focus:outline-none focus:border-brand" />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddExerciseToWorkoutDraft}
                    className="px-4 py-2 bg-brand text-black font-display font-black uppercase tracking-wider text-[10px] rounded hover:bg-brand-hover transition duration-200"
                  >
                    + Adicionar à Lista
                  </button>
                </div>

                {/* Draft list display */}
                {newWorkout.selected_exercises.length > 0 && (
                  <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1.5">
                    <p className="text-[10px] text-white/40 font-mono uppercase font-bold">EXERCÍCIOS INCLUÍDOS NO TREINO ATUAL:</p>
                    <ul className="divide-y divide-white/5">
                      {newWorkout.selected_exercises.map((se, idx) => {
                        const exe = exercises.find(e => e.id === se.exercicio_id);
                        return (
                          <li key={idx} className="py-2 flex justify-between items-center text-xs text-white/95">
                            <span>{idx+1}. <strong className="text-brand uppercase font-bold">{exe?.nome}</strong> — {se.series} séries x {se.repeticoes} reps ({se.carga} | {se.descanso})</span>
                            <button 
                              type="button" 
                              onClick={() => setNewWorkout(p => ({ ...p, selected_exercises: p.selected_exercises.filter((_, i) => i !== idx) }))}
                              className="text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider text-[10px]"
                            >
                              Remover
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <button type="submit" className="w-full py-3 bg-brand text-black font-display font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-brand-hover transition duration-200 neon-glow">
                  Gravar Ficha de Treino e Publicar no App do Aluno
                </button>
              </form>
            )}

            {/* List of existing workouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workouts.map(w => {
                const s = students.find(student => student.id === w.aluno_id);
                return (
                  <div key={w.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between text-left space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-brand/10 border border-brand/20 text-brand px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                          {w.frequencia}
                        </span>
                        <button onClick={() => handleDeleteWorkout(w.id)} className="text-white/40 hover:text-rose-400 p-1 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-base font-display font-black text-white uppercase tracking-tight pt-1">{w.nome}</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-wide font-mono">Aluno: <strong className="text-white">{s?.nome || "Rony Silva"}</strong></p>
                    </div>

                    <div className="border-t border-white/5 pt-2 text-[10px] text-white/40 flex justify-between items-center">
                      <span className="uppercase font-semibold tracking-wide">Foco: {w.objetivo}</span>
                      <span className="font-mono text-brand text-[9px] uppercase font-black">Sincronizado IA</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB: EXERCISES LIBRARY */}
        {activeTab === "exercicios" && (
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h4 className="text-[11px] font-display font-black uppercase tracking-widest text-white/40">Biblioteca de Exercícios</h4>
              <button 
                onClick={() => setIsCreatingExercise(true)}
                className="py-2 px-4 bg-brand hover:bg-brand-hover text-black rounded-xl text-[10px] font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition neon-glow"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Cadastrar Novo Exercício
              </button>
            </div>

            {isCreatingExercise && (
              <form onSubmit={handleAddExercise} className="bg-black p-5 rounded-2xl border border-brand/25 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h4 className="text-xs font-display font-black uppercase tracking-wider text-brand">Novo Exercício</h4>
                  <button type="button" onClick={() => setIsCreatingExercise(false)} className="text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Nome do Exercício" value={newExercise.nome} onChange={e => setNewExercise(p => ({ ...p, nome: e.target.value }))} required className="bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand" />
                  <select value={newExercise.grupo_muscular} onChange={e => setNewExercise(p => ({ ...p, grupo_muscular: e.target.value }))} className="bg-white/5 border border-white/10 rounded p-2.5 text-white/80 focus:outline-none focus:border-brand">
                    <option value="Peito" className="bg-black">Peito</option>
                    <option value="Costas" className="bg-black">Costas</option>
                    <option value="Pernas" className="bg-black">Pernas</option>
                    <option value="Bíceps" className="bg-black">Bíceps</option>
                    <option value="Tríceps" className="bg-black">Tríceps</option>
                    <option value="Ombros" className="bg-black">Ombros</option>
                    <option value="Abdômen" className="bg-black">Abdômen</option>
                  </select>
                  <textarea placeholder="Instruções de Execução" value={newExercise.instrucoes} onChange={e => setNewExercise(p => ({ ...p, instrucoes: e.target.value }))} rows={2} required className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand" />
                  <textarea placeholder="Erros comuns para evitar" value={newExercise.erros_comuns} onChange={e => setNewExercise(p => ({ ...p, erros_comuns: e.target.value }))} rows={2} className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand" />
                  <textarea placeholder="Cuidados específicos (Ex: Evitar se houver lesão no joelho)" value={newExercise.cuidados} onChange={e => setNewExercise(p => ({ ...p, cuidados: e.target.value }))} rows={2} className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand" />
                  <input type="text" placeholder="Imagem/Mídia URL de demonstração" value={newExercise.midia_url} onChange={e => setNewExercise(p => ({ ...p, midia_url: e.target.value }))} className="bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand" />
                </div>
                <button type="submit" className="px-4 py-2.5 bg-brand text-black font-display font-black rounded-lg text-[10px] uppercase tracking-wider hover:bg-brand-hover transition duration-200">
                  Salvar na Biblioteca
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exercises.map(e => (
                <div key={e.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between text-left space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] bg-white/10 border border-white/10 text-white px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                        {e.grupo_muscular}
                      </span>
                      <button onClick={() => handleDeleteExercise(e.id)} className="text-white/40 hover:text-rose-400 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h5 className="text-sm font-display font-black text-white pt-1 uppercase tracking-tight">{e.nome}</h5>
                    <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed">{e.instrucoes}</p>
                  </div>
                  <img src={e.midia_url} alt={e.nome} className="w-full h-24 object-cover rounded-lg border border-white/5" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB: COLLECTIVE CLASSES AGENDA */}
        {activeTab === "agenda" && (
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h4 className="text-[11px] font-display font-black uppercase tracking-widest text-white/40">Grade de Agenda de Aulas Coletivas</h4>
              <button 
                onClick={() => setIsCreatingClass(true)}
                className="py-2 px-4 bg-brand hover:bg-brand-hover text-black rounded-xl text-[10px] font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition neon-glow"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Criar Nova Aula Coletiva
              </button>
            </div>

            {isCreatingClass && (
              <form onSubmit={handleAddClass} className="bg-black p-5 rounded-2xl border border-brand/25 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h4 className="text-xs font-display font-black uppercase tracking-wider text-brand">Nova Aula</h4>
                  <button type="button" onClick={() => setIsCreatingClass(false)} className="text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input type="text" placeholder="Nome da Aula (ex: Spinning)" value={newClass.nome} onChange={e => setNewClass(p => ({ ...p, nome: e.target.value }))} required className="bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand" />
                  <input type="text" placeholder="Professor" value={newClass.professor} onChange={e => setNewClass(p => ({ ...p, professor: e.target.value }))} required className="bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand" />
                  <input type="datetime-local" value={newClass.data_hora} onChange={e => setNewClass(p => ({ ...p, data_hora: e.target.value }))} required className="bg-white/5 border border-white/10 rounded p-2.5 text-white/80 focus:outline-none focus:border-brand" />
                  <input type="number" placeholder="Vagas Totais" value={newClass.vagas} onChange={e => setNewClass(p => ({ ...p, vagas: e.target.value }))} required className="bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand" />
                </div>
                <button type="submit" className="px-4 py-2.5 bg-brand text-black font-display font-black rounded-lg text-[10px] uppercase tracking-wider hover:bg-brand-hover transition duration-200">
                  Publicar na Agenda
                </button>
              </form>
            )}

            <div className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-black text-white/50 uppercase font-mono text-[9px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-3">Aula Coletiva</th>
                    <th className="p-3">Professor</th>
                    <th className="p-3">Data & Horário</th>
                    <th className="p-3 text-center">Vagas Totais</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {classes.map(c => (
                    <tr key={c.id} className="hover:bg-white/5 transition duration-150">
                      <td className="p-3 font-bold text-white uppercase">{c.nome}</td>
                      <td className="p-3 text-white/80">{c.professor}</td>
                      <td className="p-3 font-mono text-white/60">
                        {new Date(c.data_hora).toLocaleDateString()} às {new Date(c.data_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-brand">{c.vagas}</td>
                      <td className="p-3 text-center">
                        <span className="bg-brand/10 text-brand border border-brand/20 px-2.5 py-0.5 rounded text-[10px] font-display font-black uppercase tracking-wider">
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB: DISPATCH BROADCAST NOTIFICATIONS */}
        {activeTab === "comunicados" && (
          <div className="space-y-4 text-left">
            <h4 className="text-[11px] font-display font-black uppercase tracking-widest text-white/40">Disparador de Notificações / Comunicados</h4>

            {broadcastStatusMessage && (
              <div className="p-3.5 bg-brand/10 border border-brand/20 text-brand text-xs rounded-xl font-bold font-mono uppercase tracking-wider">
                {broadcastStatusMessage}
              </div>
            )}

            <form onSubmit={handleBroadcastNotification} className="bg-black p-6 rounded-2xl border border-white/10 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-white/40 font-mono uppercase font-bold">Título da Notificação *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Manutenção na Unidade Paulista amanhã" 
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-white/40 font-mono uppercase font-bold">Tipo de Notificação</label>
                  <select 
                    value={broadcastType} 
                    onChange={e => setBroadcastType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white/80 focus:outline-none focus:border-brand"
                  >
                    <option value="comunicado" className="bg-black">Comunicado Geral</option>
                    <option value="alerta" className="bg-black">Alerta Crítico / Aviso Importante</option>
                    <option value="confirmacao" className="bg-black">Mensagem Informativa</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-white/40 font-mono uppercase font-bold">Corpo da Mensagem (Mensagem Push instantânea) *</label>
                <textarea 
                  placeholder="Escreva as informações completas que o aluno receberá na tela inicial do app..."
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand"
                />
              </div>

              <button 
                type="submit" 
                className="py-3 px-6 bg-brand hover:bg-brand-hover text-black font-display font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition neon-glow"
              >
                <Send className="w-4 h-4 stroke-[2.5]" /> Disparar Comunicado Push para Todos os Alunos
              </button>
            </form>
          </div>
        )}

        {/* TAB: IA SETTINGS & ANALYTICS */}
        {activeTab === "ia" && (
          <div className="space-y-6 text-left">
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-display font-black uppercase tracking-wider text-brand flex items-center gap-1.5">
                <Cpu className="w-4.5 h-4.5 stroke-[2.5]" /> Configuração da IA para Alunos
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl">
                  <div>
                    <p className="font-bold text-white uppercase tracking-tight">Assistente de Treino por IA</p>
                    <p className="text-[10px] text-white/40">Ativa o chat com o CA.RO Fitness AI no app</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={aiSettings.enabled} 
                    onChange={e => setAiSettings(p => ({ ...p, enabled: e.target.checked }))}
                    className="w-4.5 h-4.5 accent-brand cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl">
                  <div>
                    <p className="font-bold text-white uppercase tracking-tight">Controle de Gastos da API</p>
                    <p className="text-[10px] text-white/40">Limita uso máximo de tokens por mês</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={aiSettings.limitsEnabled} 
                    onChange={e => setAiSettings(p => ({ ...p, limitsEnabled: e.target.checked }))}
                    className="w-4.5 h-4.5 accent-brand cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-white/40 font-mono uppercase font-bold">Tom da Resposta da IA</label>
                  <select 
                    value={aiSettings.tone} 
                    onChange={e => setAiSettings(p => ({ ...p, tone: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white/80 focus:outline-none focus:border-brand"
                  >
                    <option value="Encorajador & Científico" className="bg-black">Encorajador & Científico (Padrão)</option>
                    <option value="Sargento Técnico" className="bg-black">Brutal / Cobrador (Hardcore)</option>
                    <option value="Suave & Terapêutico" className="bg-black">Zen / Calmante</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-white/40 font-mono uppercase font-bold">Limite de Conversas por Aluno (Mensal)</label>
                  <input 
                    type="number" 
                    value={aiSettings.monthlyLimit} 
                    onChange={e => setAiSettings(p => ({ ...p, monthlyLimit: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-brand" 
                  />
                </div>
              </div>

              <div className="p-4 bg-brand/10 border border-brand/20 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-brand shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-white uppercase tracking-wide">Pronto para Produção!</p>
                  <p className="text-white/70 leading-relaxed">
                    O modelo de linguagem configurado é o **gemini-3.5-flash**. Suas regras de segurança bloqueiam prescrição de esteroides, anabolizantes e diagnósticos médicos severos de forma 100% autônoma.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Request History list */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-display font-black uppercase tracking-widest text-white/40">Logs de Uso em Tempo Real</h4>
              <div className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5 text-xs">
                {logs.length > 0 ? (
                  logs.map((l, i) => (
                    <div key={i} className="p-3.5 flex justify-between items-center hover:bg-white/5 transition duration-150">
                      <div>
                        <p className="font-bold text-white uppercase tracking-tight">Consumo por Aluno (ID: {l.aluno_id})</p>
                        <p className="text-[10px] text-white/40 font-mono">Modelo: {l.modelo} • Provedor: {l.provider}</p>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <p className="text-brand font-bold">{l.tokens_input + l.tokens_output} tokens</p>
                        <p className="text-white/40">${l.custo_estimado.toFixed(6)} USD</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-white/40 p-6">Nenhum log de IA registrado ainda.</p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
      
    </div>
  );
}
