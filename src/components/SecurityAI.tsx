import React, { useState, useEffect } from "react";
import { Shield, QrCode, Monitor, Video, AlertTriangle, Eye, CheckCircle, Terminal, User } from "lucide-react";

interface SecurityAIProps {
  presenceEventCount: number; // Increment triggers visual effect
}

export default function SecurityAI({ presenceEventCount }: SecurityAIProps) {
  const [logs, setLogs] = useState<string[]>([
    "07:15:02 - [INFO] CA.RO Security AI gateway initialization...",
    "07:15:05 - [INFO] Optical scanners active - Unidade Jardins Gate 1",
    "07:15:10 - [OK] CCTV real-time feed connected with facial biometric indexer",
    "07:15:23 - [OK] Sync database with CA.RO Fitness SaaS clients",
    "07:28:10 - [PRESENCE] Aluno Beatriz Santos scanned entrance. Catraca 1 liberada."
  ]);

  const [activeCamera, setActiveCamera] = useState<string>("portaria");
  const [alarmActive, setAlarmActive] = useState<boolean>(false);
  const [lastScannedUser, setLastScannedUser] = useState<string>("Beatriz Santos");
  const [gateOpen, setGateOpen] = useState<boolean>(false);

  // Triggered when Student app registers presence (scan)
  useEffect(() => {
    if (presenceEventCount > 0) {
      setLastScannedUser("Rony Silva");
      setGateOpen(true);
      
      const newLogs = [
        `07:30:15 - [SCAN] Optical scan detected: QR Code CA-RO-SECURITY-77298`,
        `07:30:16 - [AUTH] Comparing photo & facial biometrics for Rony Silva... MATCH 98.7%`,
        `07:30:16 - [CHECK] Verifying Plan Status: BLACK VIP - Active & Paid`,
        `07:30:17 - [GATE] CA.RO Security AI command issued: RELEASE GATE 1`,
        `07:30:17 - [PRESENCE] Presence registered automatically for student Rony Silva`
      ];

      setLogs(prev => [...prev, ...newLogs]);

      // Close gate after 5 seconds
      const timeout = setTimeout(() => {
        setGateOpen(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [presenceEventCount]);

  const triggerMockAlarm = () => {
    setAlarmActive(true);
    setLogs(prev => [
      ...prev,
      `07:30:20 - [ALERT] CA.RO Security AI Alert: Unidentified personnel detected in restricted weights warehouse room. Dispatching notification to manager!`
    ]);
    setTimeout(() => {
      setAlarmActive(false);
    }, 6000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-100 space-y-6 text-left">
      
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">CA.RO Security AI Integration Engine</h3>
        </div>
        <span className="text-[10px] bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
          HARDWARE GATEWAY INTERACTIVE SIMULATOR
        </span>
      </div>

      <p className="text-xs text-slate-300">
        Este painel demonstra como a plataforma de academia **CA.RO Fitness AI** interage em tempo real com o produto complementar **CA.RO Security AI** para controle automatizado de acesso físico, monitoramento predial inteligente e segurança biométrica.
      </p>

      {/* Main Grid: Live Feed Camera Simulator, Terminal, status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CCTV Camera Simulator Screen */}
        <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col relative">
          <div className="absolute top-3 left-3 bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 z-10 animate-pulse">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span> REC LIVE
          </div>

          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-slate-300 font-mono text-[9px] px-2 py-0.5 rounded z-10">
            CAM_01_JARDINS_GATE
          </div>

          {/* Camera View mockup */}
          <div className="w-full h-48 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
            
            {alarmActive ? (
              <div className="absolute inset-0 bg-red-950/40 border-4 border-rose-500 flex flex-col items-center justify-center text-center space-y-2 z-10 animate-pulse">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
                <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">ALERTA DE SEGURANÇA DETECTADO</p>
                <p className="text-[9px] text-rose-300">Área de estoque restrita violada às 07:30</p>
              </div>
            ) : gateOpen ? (
              <div className="absolute inset-0 bg-emerald-950/40 border-4 border-emerald-500 flex flex-col items-center justify-center text-center space-y-2 z-10">
                <CheckCircle className="w-12 h-12 text-emerald-400 animate-bounce" />
                <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">CATRACA DESBLOQUEADA</p>
                <p className="text-[10px] text-slate-300">Seja bem-vindo, {lastScannedUser}!</p>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <Video className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-[10px] text-slate-500 font-mono">FACIAL BIOMETRICS ENGAGED • CCTV IDLE</p>
                
                {/* Visual Scanner Overlay line */}
                <div className="absolute left-0 w-full h-0.5 bg-emerald-500/50 shadow-emerald-500/40 shadow-sm top-1/2 animate-bounce"></div>
              </div>
            )}
          </div>

          {/* Camera toggles */}
          <div className="bg-slate-900 p-2.5 flex justify-between gap-2 border-t border-slate-800 text-[10px] font-mono">
            <span className="text-slate-400">Scanner Biométrico Óptico</span>
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 rounded ${gateOpen ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-950 text-slate-500 border border-slate-800"}`}>
                {gateOpen ? "PORTÃO LIBERADO" : "PORTÃO BLOQUEADO"}
              </span>
            </div>
          </div>
        </div>

        {/* Live Terminal outputs */}
        <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col">
          <div className="bg-slate-900 px-4 py-2 flex items-center gap-1.5 border-b border-slate-800">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">Console de Eventos Security AI</span>
          </div>

          <div className="flex-1 p-4 font-mono text-[10px] text-emerald-500 space-y-2.5 overflow-y-auto max-h-48">
            {logs.map((log, index) => (
              <div key={index} className="leading-relaxed break-all">
                {log}
              </div>
            ))}
          </div>

          <div className="bg-slate-900/50 p-2 border-t border-slate-800 flex justify-between gap-2">
            <button 
              onClick={triggerMockAlarm}
              className="py-1 px-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 text-[10px] font-bold rounded transition"
            >
              Simular Alerta Crítico (Intruso)
            </button>
            <span className="text-[9px] text-slate-500 font-mono self-center">Ver. 1.2.0-SaaS</span>
          </div>
        </div>

      </div>

      {/* Integration details cards list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-left space-y-1.5">
          <h5 className="text-xs font-bold text-white flex items-center gap-1">
            🔑 Controle de Acesso Inteligente
          </h5>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Se o plano do aluno vencer ou for cancelado no app, a catraca é bloqueada de forma autônoma e emite um alerta sonoro para o recepcionista na portaria.
          </p>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-left space-y-1.5">
          <h5 className="text-xs font-bold text-white flex items-center gap-1">
            🚨 Alertas Prediais de IA
          </h5>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Nossa IA analisa em tempo real se há alunos treinando sozinhos em horários tardios fora de expediente, alertando os operadores para evitar incidentes.
          </p>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-left space-y-1.5">
          <h5 className="text-xs font-bold text-white flex items-center gap-1">
            🤖 Biometria e Correção de Postura
          </h5>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Preparado para integração na Fase 4, onde as câmeras analisarão o agachamento do aluno para avaliar desvios posturais e prevenir lesões no joelho.
          </p>
        </div>
      </div>

    </div>
  );
}
