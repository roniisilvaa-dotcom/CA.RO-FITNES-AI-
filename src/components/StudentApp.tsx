import React, { useState, useEffect } from "react";
import { 
  Dumbbell, Calendar, QrCode, MessageSquare, LineChart, 
  User, Award, ChevronRight, Bell, Sparkles, Send, 
  Plus, Check, Play, Info, LogOut, Clock, ArrowLeft, Trash2, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Aluno, Treino, Aula, Notification, Presenca, Evolucao, IaConversa, IaMensagem } from "../types";

interface StudentAppProps {
  studentId: string;
  onPresenceTriggered: () => void; // Sync Security AI live feed
}

export default function StudentApp({ studentId, onPresenceTriggered }: StudentAppProps) {
  // Navigation Screens: 'splash', 'onboarding', 'home', 'carteirinha', 'plano', 'treino', 'exercicio-detalhe', 'chat-ia', 'sugestao-ia', 'agenda', 'historico-presenca', 'evolucao', 'perfil'
  const [screen, setScreen] = useState<string>("home");
  
  // Data State
  const [student, setStudent] = useState<Aluno | null>(null);
  const [workouts, setWorkouts] = useState<Treino[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Treino | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [classes, setClasses] = useState<Aula[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [attendance, setAttendance] = useState<Presenca[]>([]);
  const [progress, setProgress] = useState<Evolucao[]>([]);
  
  // Chat IA State
  const [conversations, setConversations] = useState<IaConversa[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<IaMensagem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // IA Suggestion Workout State
  const [aiSuggestionPrompt, setAiSuggestionPrompt] = useState("");
  const [aiSuggestionResult, setAiSuggestionResult] = useState("");
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);

  // New Progress Record State
  const [newWeight, setNewWeight] = useState("");
  const [newBiceps, setNewBiceps] = useState("");
  const [newPeito, setNewPeito] = useState("");
  const [newCoxa, setNewCoxa] = useState("");
  const [newProgressObs, setNewProgressObs] = useState("");
  const [isRecordingProgress, setIsRecordingProgress] = useState(false);

  // Simulated QR Code Lifecycle
  const [qrCodeValue, setQrCodeValue] = useState("CA-RO-SECURITY-987123");
  const [qrTimeLeft, setQrTimeLeft] = useState(60);

  // Audio Playback or completed checklist
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  // Loading
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Student Data
  const fetchStudentData = async () => {
    try {
      const sRes = await fetch("/api/students");
      const sData: Aluno[] = await sRes.json();
      const current = sData.find(s => s.id === studentId) || sData[0];
      setStudent(current);

      if (current) {
        // Workouts
        const wRes = await fetch(`/api/workouts?studentId=${current.id}`);
        const wData = await wRes.json();
        setWorkouts(wData);
        if (wData.length > 0 && !activeWorkout) {
          setActiveWorkout(wData[0]);
        }

        // Classes
        const cRes = await fetch(`/api/classes?studentId=${current.id}`);
        const cData = await cRes.json();
        setClasses(cData);

        // Notifications
        const nRes = await fetch(`/api/notifications?studentId=${current.id}`);
        const nData = await nRes.json();
        setNotifications(nData);

        // Attendance
        const aRes = await fetch(`/api/attendance?studentId=${current.id}`);
        const aData = await aRes.json();
        setAttendance(aData);

        // Progress
        const pRes = await fetch(`/api/progress?studentId=${current.id}`);
        const pData = await pRes.json();
        setProgress(pData);

        // IA Conversations
        const iaRes = await fetch(`/api/ai/conversations?studentId=${current.id}`);
        const iaData = await iaRes.json();
        setConversations(iaData);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading student app data", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  // QR Code rotative update
  useEffect(() => {
    const interval = setInterval(() => {
      setQrTimeLeft((prev) => {
        if (prev <= 1) {
          setQrCodeValue(`CA-RO-SECURITY-${Math.floor(100000 + Math.random() * 900000)}`);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Chat Messages when Conversation Active
  useEffect(() => {
    if (activeConvId) {
      fetch(`/api/ai/conversations/${activeConvId}`)
        .then(r => r.json())
        .then(data => setChatMessages(data));
    } else {
      setChatMessages([]);
    }
  }, [activeConvId]);

  const handleBookClass = async (classId: string) => {
    if (!student) return;
    try {
      const res = await fetch(`/api/classes/${classId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id })
      });
      if (res.ok) {
        fetchStudentData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelClass = async (classId: string) => {
    if (!student) return;
    try {
      const res = await fetch(`/api/classes/${classId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id })
      });
      if (res.ok) {
        fetchStudentData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChatMessage = async () => {
    if (!inputText.trim() || !student) return;
    const msg = inputText;
    setInputText("");
    setIsChatLoading(true);

    try {
      // Append local message for instant feedback
      const tempMsg: IaMensagem = {
        id: `temp_${Date.now()}`,
        conversa_id: activeConvId || "new",
        role: "user",
        conteudo: msg,
        intencao: "pergunta_geral",
        tokens: 0,
        created_at: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, tempMsg]);

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          conversationId: activeConvId,
          message: msg
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        if (!activeConvId) {
          setActiveConvId(data.conversationId);
          // Reload conversations list
          const convsRes = await fetch(`/api/ai/conversations?studentId=${student.id}`);
          const convsData = await convsRes.json();
          setConversations(convsData);
        } else {
          setChatMessages(prev => [...prev.filter(m => !m.id.startsWith("temp_")), data.message]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAskAIExercise = (exerciseName: string) => {
    if (!student) return;
    setScreen("chat-ia");
    setIsChatLoading(true);
    setInputText("");

    // Create a new clear conversation about this exercise
    fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: student.id,
        message: `Explique detalhadamente como faço o exercício ${exerciseName} corretamente.`
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.status === "success") {
        setActiveConvId(data.conversationId);
        // Refresh conversas
        fetch(`/api/ai/conversations?studentId=${student.id}`)
          .then(r => r.json())
          .then(convs => {
            setConversations(convs);
            setIsChatLoading(false);
          });
      }
    })
    .catch(err => {
      console.error(err);
      setIsChatLoading(false);
    });
  };

  const handleGenerateAISuggestion = async () => {
    if (!student) return;
    setIsAiSuggesting(true);
    setAiSuggestionResult("");

    try {
      const res = await fetch("/api/ai/workout-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          userPrompt: aiSuggestionPrompt
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setAiSuggestionResult(data.suggestion);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleRecordProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !newWeight) return;
    setIsRecordingProgress(true);

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          peso: Number(newWeight),
          braço: newBiceps ? `${newBiceps}cm` : "38cm",
          peito: newPeito ? `${newPeito}cm` : "104cm",
          coxa: newCoxa ? `${newCoxa}cm` : "60cm",
          observacoes: newProgressObs,
          foto_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop"
        })
      });
      if (res.ok) {
        setNewWeight("");
        setNewBiceps("");
        setNewPeito("");
        setNewCoxa("");
        setNewProgressObs("");
        fetchStudentData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecordingProgress(false);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!student) return;
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id })
      });
      fetchStudentData();
    } catch (err) {
      console.error(err);
    }
  };

  // Triggers simulated entry check on Security AI Gateway
  const handleSimulateEntry = async () => {
    if (!student) return;
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, metodo: "QR Code - Catraca Virtual" })
      });
      if (res.ok) {
        onPresenceTriggered(); // Trigger visual logs in parent dashboard
        fetchStudentData();
        alert("Entrada registrada! Catraca Virtual liberada pela CA.RO Security AI.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-dark-pitch text-white p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand border-r-2 border-transparent"></div>
        <p className="mt-4 text-white/40 font-mono text-sm uppercase tracking-wider">Carregando App...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n.status === "nao_lida").length;
  const nextClass = classes.find(c => c.agendada);

  return (
    <div className="relative w-full max-w-[360px] h-[720px] bg-dark-pitch rounded-[40px] border-[10px] border-white/10 shadow-2xl overflow-hidden flex flex-col font-sans select-none text-white">
      {/* Phone Notch & Header bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-5 bg-white/15 rounded-b-xl z-50 flex items-center justify-around px-2 text-[10px] text-white/40 font-mono">
        <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
        <span className="font-bold tracking-widest text-[9px]">CA.RO AI</span>
        <div className="w-1.5 h-1.5 bg-brand rounded-full animate-ping"></div>
      </div>

      {/* Top Status Indicators (Fake iOS/Android bar) */}
      <div className="bg-black/90 pt-6 pb-2 px-6 flex justify-between items-center text-[10px] text-white/40 font-mono z-40 border-b border-white/5">
        <span>07:30 UTC</span>
        <div className="flex items-center gap-1.5">
          <span className="text-brand font-bold">5G</span>
          <div className="w-5 h-2.5 border border-white/20 rounded-sm p-0.5 flex items-center">
            <div className="w-3.5 h-full bg-brand"></div>
          </div>
        </div>
      </div>

      {/* Dynamic Screen Content Wrapper with Scroll */}
      <div className="flex-1 overflow-y-auto pb-20 scrollbar-none">
        
        {/* SCREEN: HOME */}
        {screen === "home" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
            
            {/* Greeting & Quick Notification Indicator */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider font-bold">Olá, bem-vindo!</p>
                <h2 className="text-lg font-display font-black text-white tracking-tight flex items-center gap-1 uppercase">
                  {student.nome} <Sparkles className="w-4.5 h-4.5 text-brand animate-pulse" />
                </h2>
              </div>
              <button 
                onClick={() => { setScreen("notificacoes"); handleMarkAllNotificationsRead(); }}
                className="relative p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition"
              >
                <Bell className="w-4 h-4 text-white/80" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand rounded-full animate-bounce"></span>
                )}
              </button>
            </div>

            {/* Quick QR Code Launcher Widget */}
            <div className="bg-gradient-to-r from-brand/10 to-transparent border border-brand/20 rounded-2xl p-4 flex justify-between items-center shadow-lg">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-brand uppercase tracking-widest font-bold">Portão de Acesso</span>
                <h3 className="text-sm font-display font-bold text-white uppercase">Carteirinha Digital</h3>
                <p className="text-[10px] text-white/40">Acesso via QR Code Security AI</p>
              </div>
              <button 
                onClick={() => setScreen("carteirinha")}
                className="p-3 bg-brand text-black rounded-xl hover:bg-brand-hover transition shadow-md shadow-brand/20"
              >
                <QrCode className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* AI Advisor Assistant Widget */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-brand/10 border border-brand/20 rounded-lg text-brand">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-display font-bold text-white uppercase tracking-tight">CA.RO Fitness AI</h4>
                    <p className="text-[9px] text-white/40">Seu assistente virtual de treino</p>
                  </div>
                </div>
                <span className="text-[8px] bg-brand/10 text-brand px-1.5 py-0.5 rounded border border-brand/20 font-mono font-bold">ONLINE</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed italic text-left">
                &ldquo;Olá, Rony! Como está o seu joelho hoje? Posso sugerir um aquecimento articular antes de treinar.&rdquo;
              </p>
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => { setScreen("chat-ia"); }}
                  className="flex-1 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] rounded-lg font-bold flex items-center justify-center gap-1.5 transition text-white uppercase tracking-wider text-[9px]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-brand" /> Chat
                </button>
                <button 
                  onClick={() => { setScreen("sugestao-ia"); }}
                  className="flex-1 py-1.5 bg-brand text-black hover:bg-brand-hover text-[10px] rounded-lg font-black flex items-center justify-center gap-1 transition uppercase tracking-wider text-[9px]"
                >
                  <Dumbbell className="w-3.5 h-3.5" /> IA Treino
                </button>
              </div>
            </div>

            {/* Todays Training Widget */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-display font-black text-white/60 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Dumbbell className="w-4 h-4 text-brand" /> Treino Recomendado
                </h4>
                <button onClick={() => setScreen("treino")} className="text-[10px] text-brand hover:underline flex items-center font-bold">
                  Ver todos <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {workouts.length > 0 ? (
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2 text-left">
                  <p className="text-xs font-bold text-white uppercase tracking-tight truncate">{workouts[0].nome}</p>
                  <div className="flex justify-between text-[10px] text-white/40 font-mono">
                    <span>Foco: {workouts[0].objetivo}</span>
                    <span>Divisão: {workouts[0].frequencia}</span>
                  </div>
                  <button 
                    onClick={() => { setActiveWorkout(workouts[0]); setScreen("treino"); }}
                    className="w-full py-1.5 bg-brand/10 border border-brand/20 text-brand rounded-lg text-[10px] font-black hover:bg-brand/20 transition flex items-center justify-center gap-1 uppercase tracking-wider text-[9px]"
                  >
                    <Play className="w-3 h-3 fill-current" /> Iniciar Sessão de Treino
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-white/40 text-center py-2">Nenhum treino vinculado ainda.</p>
              )}
            </div>

            {/* Next Scheduled Class Widget */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-display font-black text-white/60 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Calendar className="w-4 h-4 text-brand" /> Próxima Aula
                </h4>
                <button onClick={() => setScreen("agenda")} className="text-[10px] text-brand hover:underline flex items-center font-bold">
                  Reservar <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {nextClass ? (
                <div className="p-3 bg-black/40 border border-brand/10 rounded-xl flex justify-between items-center text-left">
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">{nextClass.nome}</p>
                    <p className="text-[10px] text-white/40">{nextClass.professor} • {new Date(nextClass.data_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <span className="text-[8px] bg-brand/15 text-brand border border-brand/20 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">RESERVADO</span>
                </div>
              ) : (
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-center">
                  <p className="text-[10px] text-white/40 mb-1">Nenhuma aula agendada hoje.</p>
                  <button onClick={() => setScreen("agenda")} className="text-[10px] text-brand font-bold hover:underline uppercase tracking-wide text-[9px]">
                    Ver agenda completa
                  </button>
                </div>
              )}
            </div>

            {/* Active Subscription Status */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-brand" />
                <div className="text-left">
                  <p className="text-[10px] font-mono font-bold text-brand tracking-wider">PLANO VIP BLACK</p>
                  <p className="text-[9px] text-white/40">Ativo • Renovação Automática</p>
                </div>
              </div>
              <button onClick={() => setScreen("plano")} className="text-[9px] text-white/40 hover:text-white underline font-mono">
                BENEFÍCIOS
              </button>
            </div>

          </motion.div>
        )}

        {/* SCREEN: CARTEIRINHA DIGITAL */}
        {screen === "carteirinha" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6 flex flex-col items-center text-center">
            <div className="w-full flex items-center gap-2">
              <button onClick={() => setScreen("home")} className="p-1 bg-white/5 border border-white/10 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-display font-black uppercase tracking-wider text-brand">Carteirinha Digital</h3>
            </div>

            {/* Virtual Membership Card Box */}
            <div className="w-full bg-black/60 border-2 border-brand/40 rounded-3xl p-5 shadow-2xl relative space-y-4 neon-glow">
              <div className="absolute top-4 right-4 bg-brand/10 border border-brand/20 text-brand text-[8px] font-mono font-bold px-2 py-0.5 rounded">
                BLACK VIP
              </div>
              
              <div className="flex items-center gap-3 text-left">
                <img src={student.foto_url} alt={student.nome} className="w-12 h-12 rounded-full border border-brand object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-xs font-display font-black text-white uppercase tracking-wide">{student.nome}</h4>
                  <p className="text-[9px] text-white/40 font-mono">ID: CA-RO-{student.id.toUpperCase()}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-white/10 my-2"></div>

              {/* QR Code Graphic Holder */}
              <div className="bg-white p-3.5 rounded-2xl inline-block shadow-lg mx-auto border-4 border-brand/20">
                {/* Visual Representation of QR Code */}
                <div className="w-32 h-32 bg-black rounded-lg flex flex-col items-center justify-center p-2 text-center text-white relative">
                  <QrCode className="w-20 h-20 text-brand animate-pulse" />
                  <span className="text-[8px] font-mono text-brand mt-2 tracking-wider font-bold">{qrCodeValue}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/80">
                  <Clock className="w-3.5 h-3.5 text-brand animate-spin" />
                  <span>Código expira em: <strong className="font-mono text-brand">{qrTimeLeft}s</strong></span>
                </div>
                <p className="text-[9px] text-white/40">Aponte para o leitor de entrada da CA.RO Security AI</p>
              </div>
            </div>

            {/* Access Integration Demo Action */}
            <div className="w-full space-y-2">
              <button 
                onClick={handleSimulateEntry}
                className="w-full py-3 bg-brand hover:bg-brand-hover text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg shadow-brand/10"
              >
                <Check className="w-4 h-4 stroke-[2.5]" /> Registrar Entrada (Simulador Catraca)
              </button>
              <p className="text-[9px] text-white/40 leading-relaxed max-w-xs mx-auto">
                No MVP, clicar acima simula o scanner físico da catraca registrando sua presença e desbloqueando a porta no painel Security AI.
              </p>
            </div>
          </motion.div>
        )}

        {/* SCREEN: MEU PLANO */}
        {screen === "plano" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setScreen("home")} className="p-1 bg-white/5 border border-white/10 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-display font-black uppercase tracking-wider text-brand">Detalhes do Plano</h3>
            </div>

            <div className="bg-gradient-to-br from-brand/10 to-transparent border border-brand/20 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono text-brand uppercase font-bold tracking-wider">Categoria Premium</span>
                  <h4 className="text-sm font-display font-black text-white uppercase tracking-tight">Plano Black VIP Anual</h4>
                </div>
                <Award className="w-8 h-8 text-brand" />
              </div>

              <div className="space-y-2 text-xs text-white/75">
                <p className="text-[10px] font-mono font-bold text-white/40 tracking-wider">BENEFÍCIOS EXCLUSIVOS:</p>
                <ul className="space-y-1.5 list-disc pl-4 text-white/80 leading-relaxed">
                  <li>Acesso livre a todas as unidades do grupo;</li>
                  <li>Agendamento ilimitado de aulas coletivas simultâneas;</li>
                  <li>Acesso total ao módulo Premium de IA no app;</li>
                  <li>Suporte prioritário com Professores e Nutricionistas;</li>
                  <li>Inclusão de 1 convidado por mês para treinar junto.</li>
                </ul>
              </div>

              <div className="border-t border-white/10 pt-3 flex justify-between text-[10px] text-white/40 font-mono">
                <div>
                  <span>Início:</span>
                  <p className="text-white font-bold">10/01/2026</p>
                </div>
                <div>
                  <span>Vencimento:</span>
                  <p className="text-white font-bold">10/01/2027</p>
                </div>
                <div>
                  <span>Status:</span>
                  <p className="text-brand font-black">ATIVO</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 text-left">
              <h5 className="text-[10px] font-display font-bold text-brand uppercase tracking-wider">Unidade Vinculada</h5>
              <p className="text-xs text-white font-bold uppercase">CA.RO Unidade Jardins</p>
              <p className="text-[10px] text-white/40 leading-relaxed">Alameda Lorena, 1500 - Jardins, São Paulo - SP</p>
            </div>
          </motion.div>
        )}

        {/* SCREEN: WORKOUTS */}
        {screen === "treino" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setScreen("home")} className="p-1 bg-white/5 border border-white/10 rounded-full">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-xs font-display font-black uppercase tracking-wider text-brand">Minha Ficha</h3>
              </div>
              <span className="text-[9px] bg-white/10 border border-white/10 px-2 py-0.5 rounded font-mono text-white/50 font-bold uppercase">A / B / C</span>
            </div>

            {/* Fichas Switcher list */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {workouts.map(w => (
                <button 
                  key={w.id} 
                  onClick={() => setActiveWorkout(w)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition whitespace-nowrap border uppercase tracking-wide ${
                    activeWorkout?.id === w.id 
                      ? "bg-brand text-black border-brand" 
                      : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {w.nome.split(" - ")[0]}
                </button>
              ))}
            </div>

            {/* Active Ficha Header */}
            {activeWorkout && (
              <div className="space-y-3">
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-left">
                  <h4 className="text-xs font-display font-black text-brand uppercase tracking-wider">{activeWorkout.nome}</h4>
                  <div className="flex gap-3 text-[10px] text-white/40 mt-1.5 font-mono">
                    <span>Foco: {activeWorkout.objetivo}</span>
                    <span>Nível: {activeWorkout.nivel}</span>
                    <span>Divisão: {activeWorkout.frequencia}</span>
                  </div>
                </div>

                <div className="text-[11px] font-display font-black text-white/40 px-1 uppercase tracking-widest text-left">Exercícios ({activeWorkout.exercicios?.length || 0})</div>
                
                {/* Exercises list */}
                <div className="space-y-2.5">
                  {activeWorkout.exercicios && activeWorkout.exercicios.length > 0 ? (
                    activeWorkout.exercicios.map((te) => (
                      <div 
                        key={te.id} 
                        className={`bg-white/5 border rounded-xl p-3 flex justify-between items-center transition ${
                          completedExercises[te.id] ? "border-brand/40 opacity-70 bg-brand/5" : "border-white/10"
                        }`}
                      >
                        <div className="space-y-1 text-left flex-1 mr-2">
                          <p className="text-xs font-bold text-white uppercase tracking-tight">{te.exercicio?.nome}</p>
                          <p className="text-[9px] font-mono text-white/50">{te.exercicio?.grupo_muscular} • {te.series} séries x {te.repeticoes} reps ({te.carga})</p>
                          <div className="flex gap-3 pt-1">
                            <button 
                              onClick={() => { setSelectedExercise(te); setScreen("exercicio-detalhe"); }}
                              className="text-[9px] text-brand hover:underline flex items-center gap-0.5 font-bold uppercase tracking-wider"
                            >
                              <Info className="w-2.5 h-2.5" /> Detalhes
                            </button>
                            <button 
                              onClick={() => handleAskAIExercise(te.exercicio?.nome || "")}
                              className="text-[9px] text-brand hover:underline flex items-center gap-0.5 font-black uppercase tracking-wider"
                            >
                              <Sparkles className="w-2.5 h-2.5" /> IA Help
                            </button>
                          </div>
                        </div>

                        {/* Complete Checkbox */}
                        <button 
                           onClick={() => setCompletedExercises(prev => ({ ...prev, [te.id]: !prev[te.id] }))}
                           className={`w-7 h-7 rounded-lg flex items-center justify-center border transition ${
                             completedExercises[te.id] 
                               ? "bg-brand border-brand text-black animate-pulse" 
                               : "border-white/10 bg-black hover:border-white/30 text-white/20"
                           }`}
                        >
                          <Check className="w-4 h-4 stroke-[3px]" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-white/40 text-xs py-6">Nenhum exercício cadastrado nesta ficha.</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SCREEN: DETALHE DO EXERCICIO */}
        {screen === "exercicio-detalhe" && selectedExercise && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <button onClick={() => setScreen("treino")} className="p-1 bg-white/5 border border-white/10 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-display font-black uppercase tracking-wider text-brand truncate">Como Executar</h3>
            </div>

            <img 
              src={selectedExercise.exercicio?.midia_url} 
              alt={selectedExercise.exercicio?.nome} 
              className="w-full h-40 object-cover rounded-2xl border border-white/10 shadow-inner" 
              referrerPolicy="no-referrer"
            />

            <div className="space-y-1">
              <span className="text-[9px] bg-brand/10 border border-brand/20 text-brand px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                {selectedExercise.exercicio?.grupo_muscular}
              </span>
              <h4 className="text-xs font-display font-black text-white uppercase tracking-wide pt-1.5">{selectedExercise.exercicio?.nome}</h4>
              <p className="text-[10px] text-white/40 font-mono">Prescrito: {selectedExercise.series} séries x {selectedExercise.repeticoes} repetições ({selectedExercise.carga})</p>
            </div>

            <div className="space-y-3 text-[11px] text-white/70">
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <strong className="text-brand text-xs font-display font-black uppercase tracking-wider">Instruções de Execução:</strong>
                <p className="leading-relaxed text-white/80">{selectedExercise.exercicio?.instrucoes}</p>
              </div>

              <div className="p-3.5 bg-rose-950/10 border border-rose-900/30 rounded-xl space-y-1">
                <strong className="text-rose-400 text-xs font-display font-black uppercase tracking-wider">Evite Erros Comuns:</strong>
                <p className="leading-relaxed text-white/80">{selectedExercise.exercicio?.erros_comuns}</p>
              </div>

              <div className="p-3.5 bg-amber-950/10 border border-amber-900/30 rounded-xl space-y-1">
                <strong className="text-amber-400 text-xs font-display font-black uppercase tracking-wider">Cuidados Importantes:</strong>
                <p className="leading-relaxed text-white/80">{selectedExercise.exercicio?.cuidados}</p>
              </div>
            </div>

            <button 
              onClick={() => handleAskAIExercise(selectedExercise.exercicio?.nome || "")}
              className="w-full py-3 bg-brand hover:bg-brand-hover text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition shadow-lg"
            >
              <Sparkles className="w-4 h-4 animate-pulse text-black" /> Dúvida Rápida com IA
            </button>
          </motion.div>
        )}

        {/* SCREEN: CHAT IA ASSISTANT */}
        {screen === "chat-ia" && (
          <div className="h-full flex flex-col">
            {/* Chat conversations loader header */}
            <div className="bg-black/90 border-b border-white/5 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setScreen("home")} className="p-1 bg-white/5 rounded-full">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div className="text-left">
                  <h4 className="text-xs font-display font-black text-brand flex items-center gap-1 uppercase tracking-wider">
                    CA.RO AI <Sparkles className="w-3 h-3 text-brand animate-pulse" />
                  </h4>
                  <p className="text-[8px] text-white/40 uppercase font-mono font-bold">Assistente Virtual</p>
                </div>
              </div>
              <button 
                onClick={() => { setActiveConvId(null); setChatMessages([]); }}
                className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded text-[9px] text-white/60 hover:text-white uppercase font-mono font-bold"
              >
                Novo Chat
              </button>
            </div>

            {/* Conversation list toggle if many */}
            {conversations.length > 0 && !activeConvId && (
              <div className="p-3 space-y-1 border-b border-white/5 bg-black/60">
                <p className="text-[9px] text-white/40 font-mono font-bold uppercase tracking-widest">Histórico de Conversas</p>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {conversations.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => setActiveConvId(c.id)}
                      className="w-full p-2 bg-white/5 hover:bg-white/10 text-[10px] text-left text-white/80 truncate rounded border border-white/10 flex justify-between items-center transition"
                    >
                      <span className="font-bold">💬 {c.titulo}</span>
                      <ChevronRight className="w-3 h-3 text-white/40" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col text-xs" style={{ maxHeight: "400px" }}>
              {chatMessages.length === 0 ? (
                <div className="text-center text-white/40 p-4 space-y-3 my-auto">
                  <Sparkles className="w-8 h-8 text-brand/20 mx-auto animate-bounce" />
                  <p className="text-[11px] leading-relaxed max-w-xs text-white/60">
                    Como posso ajudar você hoje, Rony? Me pergunte sobre postura, sugestão de aquecimento ou dores articulares.
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    <button onClick={() => setInputText("Quais os cuidados para não forçar o joelho no agachamento?")} className="bg-white/5 hover:bg-white/10 text-[9px] text-white/70 px-2 py-1.5 rounded border border-white/10 transition">
                      Joelho e agachamento 🦿
                    </button>
                    <button onClick={() => setInputText("Explique como executar o supino reto com boa técnica.")} className="bg-white/5 hover:bg-white/10 text-[9px] text-white/70 px-2 py-1.5 rounded border border-white/10 transition">
                      Supino Reto 🏋️
                    </button>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end text-right' : 'self-start text-left'}`}
                  >
                    <div className={`p-2.5 rounded-2xl leading-relaxed text-[11px] ${
                      msg.role === 'user' 
                        ? 'bg-brand text-black rounded-br-none font-bold' 
                        : 'bg-white/5 text-white/90 rounded-bl-none border border-white/10'
                    }`}>
                      {msg.conteudo}
                    </div>
                    <span className="text-[8px] text-white/30 mt-1 uppercase font-mono px-1">
                      {msg.role === 'user' ? 'Rony' : 'CA.RO AI'} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))
              )}

              {isChatLoading && (
                <div className="flex items-center gap-2 self-start bg-white/5 p-3 rounded-2xl rounded-bl-none border border-white/10 max-w-[80%]">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-[9px] text-white/40 font-mono">IA está formulando...</span>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-white/5 bg-black flex gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pergunte à IA do CA.RO..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand text-white placeholder-white/30"
              />
              <button 
                onClick={handleSendChatMessage}
                disabled={!inputText.trim() || isChatLoading}
                className="p-2.5 bg-brand hover:bg-brand-hover text-black rounded-xl disabled:opacity-40 transition font-black"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN: SUGGEST TRAINING BY IA */}
        {screen === "sugestao-ia" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <button onClick={() => setScreen("home")} className="p-1 bg-white/5 border border-white/10 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-display font-black uppercase tracking-wider text-brand">IA Gerador de Treinos</h3>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <p className="text-xs text-white/80 leading-relaxed">
                A IA do **CA.RO Fitness** analisará seu objetivo (**{student.objetivo}**) e nível de condicionamento para estruturar uma divisão personalizada.
              </p>
              <div className="space-y-1.5">
                <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold">Foco ou Restrição Adicional</label>
                <input 
                  type="text"
                  value={aiSuggestionPrompt}
                  onChange={(e) => setAiSuggestionPrompt(e.target.value)}
                  placeholder="Ex: Treino focado em glúteos ou pernas sem agachar profundo..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand placeholder-white/20"
                />
              </div>
              <button 
                onClick={handleGenerateAISuggestion}
                disabled={isAiSuggesting}
                className="w-full py-2.5 bg-brand text-black hover:bg-brand-hover rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                {isAiSuggesting ? "Analisando anatomia..." : "Gerar Treino Customizado pela IA"}
              </button>
            </div>

            {aiSuggestionResult && (
              <div className="bg-white/5 border border-brand/20 rounded-xl p-4 space-y-2 max-h-72 overflow-y-auto">
                <h4 className="text-xs font-display font-black text-brand flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Ficha Proposta pela IA
                </h4>
                <div className="text-[10px] text-white/90 leading-relaxed whitespace-pre-line font-mono bg-black/40 p-3 rounded-lg border border-white/5">
                  {aiSuggestionResult}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SCREEN: AGENDA DE AULAS */}
        {screen === "agenda" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setScreen("home")} className="p-1 bg-white/5 border border-white/10 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-display font-black uppercase tracking-wider text-brand">Aulas Coletivas</h3>
            </div>

            <p className="text-[11px] text-white/50 text-left">Reserva garantida para alunos ativos de acordo com o limite do plano.</p>

            <div className="space-y-3">
              {classes.map(c => (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex justify-between items-center text-left">
                  <div className="space-y-1">
                    <span className="text-[8px] bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                      {c.nome}
                    </span>
                    <h4 className="text-xs font-display font-black text-white uppercase tracking-wide pt-1">{c.nome}</h4>
                    <p className="text-[10px] text-white/40">{c.professor} • Jardins</p>
                    <div className="text-[9px] text-white/50 font-mono">
                      📅 {new Date(c.data_hora).toLocaleDateString()} às {new Date(c.data_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <p className="text-[9px] text-white/40">Vagas restantes: <strong className="text-brand font-bold">{c.vagas_restantes}</strong> / {c.vagas}</p>
                  </div>

                  {c.agendada ? (
                    <button 
                      onClick={() => handleCancelClass(c.id)}
                      className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition whitespace-nowrap"
                    >
                      Cancelar
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBookClass(c.id)}
                      disabled={c.vagas_restantes === 0}
                      className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-black disabled:bg-white/5 disabled:text-white/20 rounded-lg text-[9px] font-black uppercase tracking-wider transition whitespace-nowrap"
                    >
                      Reservar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SCREEN: NOTIFICATIONS */}
        {screen === "notificacoes" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setScreen("home")} className="p-1 bg-white/5 border border-white/10 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-display font-black uppercase tracking-wider text-brand">Notificações</h3>
            </div>

            <div className="space-y-2.5">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-3.5 rounded-xl border text-left space-y-1.5 ${
                    n.status === "nao_lida" ? "bg-white/5 border-brand/30" : "bg-black/20 border-white/5 opacity-80"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono font-bold uppercase text-brand tracking-widest">
                      {n.tipo}
                    </span>
                    <span className="text-[8px] font-mono text-white/30">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-tight">{n.titulo}</h4>
                  <p className="text-[10px] text-white/60 leading-relaxed">{n.mensagem}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SCREEN: PHYSICAL EVOLUTION */}
        {screen === "evolucao" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <button onClick={() => setScreen("home")} className="p-1 bg-white/5 border border-white/10 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-display font-black uppercase tracking-wider text-brand">Evolução Física</h3>
            </div>

            {/* Quick Stats overview */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
                <span className="text-[8px] text-white/40 font-mono font-bold uppercase tracking-wider">PESO ATUAL</span>
                <p className="text-sm font-display font-black text-brand">{student.peso} kg</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
                <span className="text-[8px] text-white/40 font-mono font-bold uppercase tracking-wider">ALTURA</span>
                <p className="text-sm font-display font-black text-white">{student.altura} m</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
                <span className="text-[8px] text-white/40 font-mono font-bold uppercase tracking-wider">IMC</span>
                <p className="text-sm font-display font-black text-white">{(student.peso / (student.altura * student.altura)).toFixed(1)}</p>
              </div>
            </div>

            {/* Record physical measures toggler */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h4 className="text-xs font-display font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Plus className="w-4 h-4 text-brand" /> Registrar Medidas & Peso
              </h4>
              <form onSubmit={handleRecordProgress} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    step="0.1" 
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    required
                    placeholder="Peso (ex: 82.5)"
                    className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-white/20"
                  />
                  <input 
                    type="text" 
                    value={newBiceps}
                    onChange={(e) => setNewBiceps(e.target.value)}
                    placeholder="Braço (ex: 38)"
                    className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-white/20"
                  />
                  <input 
                    type="text" 
                    value={newPeito}
                    onChange={(e) => setNewPeito(e.target.value)}
                    placeholder="Peito (ex: 104)"
                    className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-white/20"
                  />
                  <input 
                    type="text" 
                    value={newCoxa}
                    onChange={(e) => setNewCoxa(e.target.value)}
                    placeholder="Coxa (ex: 60)"
                    className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-white/20"
                  />
                </div>
                <input 
                  type="text" 
                  value={newProgressObs}
                  onChange={(e) => setNewProgressObs(e.target.value)}
                  placeholder="Observação (ex: Treinando pesado e focado)"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-white/20"
                />
                
                {/* Simulated file upload button */}
                <div className="flex items-center gap-2 border border-dashed border-white/10 p-2.5 rounded-lg bg-black/40 text-white/40 cursor-pointer">
                  <Camera className="w-4 h-4 text-brand" />
                  <span className="text-[9px] font-mono uppercase font-bold tracking-wider">Simular upload de foto corporal</span>
                </div>

                <button 
                  type="submit"
                  disabled={isRecordingProgress}
                  className="w-full py-2 bg-brand hover:bg-brand-hover text-black rounded-lg text-[10px] font-black uppercase tracking-wider transition disabled:opacity-50"
                >
                  {isRecordingProgress ? "Salvando..." : "Salvar Registro"}
                </button>
              </form>
            </div>

            {/* History timeline of progress */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest text-left">Linha do Tempo</h4>
              {progress.map(p => (
                <div key={p.id} className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex gap-3">
                  <img src={p.foto_url} alt="Evolução" className="w-12 h-12 rounded-lg object-cover border border-white/10" referrerPolicy="no-referrer" />
                  <div className="flex-1 text-left space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-white">{p.peso} kg</span>
                      <span className="text-[9px] text-white/30 font-mono">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[9px] text-white/40">Braço: {p.medidas?.braço} | Peito: {p.medidas?.peito} | Coxa: {p.medidas?.coxa}</p>
                    <p className="text-[10px] text-white/80 italic">“{p.observacoes}”</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SCREEN: PROFILE */}
        {screen === "perfil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <button onClick={() => setScreen("home")} className="p-1 bg-white/5 border border-white/10 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-display font-black uppercase tracking-wider text-brand">Meu Perfil</h3>
            </div>

            <div className="flex flex-col items-center text-center space-y-2 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <img src={student.foto_url} alt={student.nome} className="w-16 h-16 rounded-full border-2 border-brand object-cover" referrerPolicy="no-referrer" />
              <div>
                <h4 className="text-xs font-display font-black text-white uppercase tracking-wide">{student.nome}</h4>
                <p className="text-[10px] text-white/50">{student.email}</p>
                <p className="text-[10px] text-white/50 font-mono">{student.telefone}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5 text-xs">
              <h5 className="font-display font-black text-brand border-b border-white/10 pb-2 uppercase tracking-widest text-[9px]">Dados Físicos & Objetivos</h5>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[8px] text-white/40 font-mono font-bold uppercase tracking-wider">OBJETIVO PRINCIPAL</span>
                  <p className="text-xs font-bold text-white">{student.objetivo}</p>
                </div>
                <div>
                  <span className="text-[8px] text-white/40 font-mono font-bold uppercase tracking-wider">NÍVEL DE TREINO</span>
                  <p className="text-xs font-bold text-white">{student.nivel}</p>
                </div>
                <div>
                  <span className="text-[8px] text-white/40 font-mono font-bold uppercase tracking-wider">FREQUÊNCIA DESEJADA</span>
                  <p className="text-xs font-bold text-white">{student.frequencia_semanal} dias/semana</p>
                </div>
                <div>
                  <span className="text-[8px] text-white/40 font-mono font-bold uppercase tracking-wider">ACADEMIA ATUAL</span>
                  <p className="text-xs font-bold text-brand">Alpha Jardins</p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[8px] text-white/40 font-mono font-bold uppercase tracking-wider">RESTRIÇÕES FÍSICAS / NOTAS MÉDICAS</span>
                <p className="text-xs font-bold text-rose-400 bg-rose-500/5 p-2 rounded border border-rose-500/10 mt-1 leading-relaxed">
                  ⚠️ {student.restricoes || "Nenhuma restrição registrada"}
                </p>
              </div>
            </div>

            {/* Attendance quick logs button */}
            <button 
              onClick={() => setScreen("historico-presenca")}
              className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-brand" /> Histórico de Presença
            </button>
          </motion.div>
        )}

        {/* SCREEN: ATTENDANCE HISTORY */}
        {screen === "historico-presenca" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setScreen("perfil")} className="p-1 bg-white/5 border border-white/10 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-xs font-display font-black uppercase tracking-wider text-brand">Frequência</h3>
            </div>

            <p className="text-[11px] text-white/50 text-left">Presenças auditadas pelo controle biométrico / QR Code CA.RO Security AI.</p>

            <div className="space-y-2.5">
              {attendance.map(p => (
                <div key={p.id} className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex justify-between items-center text-left">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white uppercase tracking-tight">Unidade Jardins</p>
                    <p className="text-[10px] text-white/50 font-mono">Entrada: {new Date(p.entrada_at).toLocaleString()}</p>
                    <p className="text-[10px] text-white/50 font-mono">Método: {p.metodo}</p>
                  </div>
                  <span className="text-[8px] bg-brand/10 border border-brand/20 text-brand px-2.5 py-0.5 rounded-full font-mono font-black tracking-wider">PRESENTE</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* Bottom Smartphone Navigation Tab Bar */}
      <div className="absolute bottom-0 left-0 w-full bg-black border-t border-white/10 px-3 py-2 flex justify-around items-center z-40 text-white/40">
        <button 
          onClick={() => setScreen("home")}
          className={`flex flex-col items-center gap-0.5 ${screen === 'home' ? 'text-brand' : 'hover:text-white'}`}
        >
          <Award className="w-4.5 h-4.5" />
          <span className="text-[8px] font-display font-black uppercase tracking-wider">Home</span>
        </button>

        <button 
          onClick={() => setScreen("treino")}
          className={`flex flex-col items-center gap-0.5 ${screen === 'treino' || screen === 'exercicio-detalhe' ? 'text-brand' : 'hover:text-white'}`}
        >
          <Dumbbell className="w-4.5 h-4.5" />
          <span className="text-[8px] font-display font-black uppercase tracking-wider">Treinos</span>
        </button>

        <button 
          onClick={() => setScreen("carteirinha")}
          className={`flex flex-col items-center gap-0.5 ${screen === 'carteirinha' ? 'text-brand' : 'hover:text-white'}`}
        >
          <QrCode className="w-4.5 h-4.5" />
          <span className="text-[8px] font-display font-black uppercase tracking-wider">Acesso</span>
        </button>

        <button 
          onClick={() => setScreen("chat-ia")}
          className={`flex flex-col items-center gap-0.5 ${screen === 'chat-ia' ? 'text-brand' : 'hover:text-white'}`}
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span className="text-[8px] font-display font-black uppercase tracking-wider">AI Chat</span>
        </button>

        <button 
          onClick={() => setScreen("perfil")}
          className={`flex flex-col items-center gap-0.5 ${screen === 'perfil' || screen === 'historico-presenca' ? 'text-brand' : 'hover:text-white'}`}
        >
          <User className="w-4.5 h-4.5" />
          <span className="text-[8px] font-display font-black uppercase tracking-wider">Perfil</span>
        </button>

        <button 
          onClick={() => setScreen("evolucao")}
          className={`flex flex-col items-center gap-0.5 ${screen === 'evolucao' ? 'text-brand' : 'hover:text-white'}`}
        >
          <LineChart className="w-4.5 h-4.5" />
          <span className="text-[8px] font-display font-black uppercase tracking-wider">Evolução</span>
        </button>
      </div>

      {/* Touch Screen bottom bar overlay */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50"></div>
    </div>
  );
}
