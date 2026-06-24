import React, { useState, useEffect } from "react";
import { 
  Shield, Dumbbell, Sparkles, Cpu, Users, Eye, Info, 
  HelpCircle, HardDrive, CheckCircle2, ChevronRight, User, Settings, Award
} from "lucide-react";
import StudentApp from "./components/StudentApp";
import GymAdmin from "./components/GymAdmin";
import MasterAdmin from "./components/MasterAdmin";
import SecurityAI from "./components/SecurityAI";

export default function App() {
  // Current active portal on the right side: 'academia' | 'master' | 'security'
  const [activePortal, setActivePortal] = useState<'academia' | 'master' | 'security'>('academia');
  
  // Real-time synchronization event triggered by QR scanner clicks in StudentApp
  const [presenceEventCount, setPresenceEventCount] = useState<number>(0);
  
  // Helper state to force child components to refresh when updates are made
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handlePresenceScanned = () => {
    setPresenceEventCount(prev => prev + 1);
  };

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-dark-pitch text-white flex flex-col font-sans selection:bg-brand selection:text-black">
      
      {/* Top Navigation Bar */}
      <header className="bg-dark-pitch border-b border-white/10 px-6 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-brand text-black rounded-lg shadow-lg neon-glow">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-black uppercase tracking-tighter leading-none text-white">
              <span className="text-brand">CA.RO</span><br />FITNESS AI
            </h1>
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono mt-1">SaaS Ecosystem</p>
          </div>
        </div>

        {/* Global Hub Controls */}
        <div className="flex items-center gap-3">
          
          {/* Active Context Swapper for Demonstration */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            <span className="text-[9px] font-mono text-white/40 px-2 uppercase font-bold tracking-wider hidden sm:inline">Mudar Painel:</span>
            
            <button
              onClick={() => setActivePortal('academia')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                activePortal === 'academia' 
                  ? 'bg-brand text-black neon-glow' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Academia
            </button>

            <button
              onClick={() => setActivePortal('master')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                activePortal === 'master' 
                  ? 'bg-brand text-black neon-glow' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Master
            </button>

            <button
              onClick={() => setActivePortal('security')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                activePortal === 'security' 
                  ? 'bg-brand text-black neon-glow' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Security
            </button>
          </div>

          {/* Quick platform links or stats */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulse neon-glow"></span>
            <span className="text-white/40">PORT 3000</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Student Smartphone Simulator View (Always Visible) */}
        <section className="lg:col-span-4 flex flex-col items-center space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-[11px] font-display font-black uppercase tracking-widest text-brand">Visualização do Aluno</h2>
            <p className="text-[11px] text-white/40 uppercase tracking-wider font-mono">Simulador Mobile Interativo</p>
          </div>

          {/* Render the full high-fidelity mobile app */}
          <StudentApp 
            studentId="alu_rony" 
            onPresenceTriggered={handlePresenceScanned} 
          />
          
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl w-full max-w-[360px] text-left space-y-2">
            <span className="text-[10px] font-display font-black text-brand uppercase tracking-wider block">💡 Dica de Demonstração</span>
            <p className="text-[11px] text-white/60 leading-relaxed">
              No aplicativo móvel acima, toque na aba **&ldquo;Acesso&rdquo;** e clique em **&ldquo;Registrar Entrada&rdquo;**. Isso simulará o scanner óptico enviando o sinal para o portal complementar **CA.RO Security AI** do lado direito!
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN: Interactive Corporate SaaS Portals based on switch */}
        <section className="lg:col-span-8 space-y-6">
          <div className="text-left space-y-1">
            <h2 className="text-[11px] font-display font-black uppercase tracking-widest text-white/40">Painéis Administrativos Web</h2>
            <p className="text-[11px] text-white/40 uppercase tracking-wider font-mono">Explore as ferramentas de gestão corporativa e SaaS</p>
          </div>

          <div className="transition-all duration-300">
            {activePortal === 'academia' && (
              <GymAdmin 
                onRefreshStudent={handleRefreshData} 
              />
            )}
            {activePortal === 'master' && (
              <MasterAdmin />
            )}
            {activePortal === 'security' && (
              <SecurityAI 
                presenceEventCount={presenceEventCount} 
              />
            )}
          </div>
        </section>

      </main>

      {/* SaaS Feature Roadmap & Documentation */}
      <footer className="mt-auto border-t border-white/10 bg-dark-card p-8 text-xs text-white/40">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          
          {/* Column 1: App Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-display font-black uppercase tracking-wider">
              <Shield className="w-4 h-4 text-brand" />
              <span>CA.RO Fitness AI</span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Aplicativo SaaS inteligente para gestão de academias, studios e personal trainers com assistente de treino integrado movido à Inteligência Artificial (Gemini SDK).
            </p>
          </div>

          {/* Column 2: Architecture Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-display font-black text-white uppercase tracking-wider font-mono text-[10px]">Arquitetura do MVP</h4>
            <ul className="space-y-1.5 text-[11px] text-white/50 list-disc pl-4">
              <li>**Vite + React SPA** para interfaces rápidas;</li>
              <li>**Express API Router** atuando como backend integrado;</li>
              <li>**In-Memory Database** mantendo dados sincronizados em tempo real;</li>
              <li>**Google GenAI SDK** integrado via rota segura com o modelo `gemini-3.5-flash`.</li>
            </ul>
          </div>

          {/* Column 3: Roadmap */}
          <div className="space-y-2">
            <h4 className="text-xs font-display font-black text-white uppercase tracking-wider font-mono text-[10px]">Próximas Fases</h4>
            <ul className="space-y-1 text-[11px] text-white/50">
              <li>🚀 **Fase 2**: Integração com PostgreSQL/Neon, upload de fotos corporativas e notificações por SMS/WhatsApp.</li>
              <li>🔒 **Fase 3**: Catraca real via hardware IoT, logs correlacionados com câmeras de CFTV.</li>
              <li>🎥 **Fase 4**: IA de câmera para correção de postura biométrica em tempo real.</li>
            </ul>
          </div>

          {/* Column 4: Quick Launch Guide */}
          <div className="space-y-2">
            <h4 className="text-xs font-display font-black text-white uppercase tracking-wider font-mono text-[10px]">Segurança & IA</h4>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Nosso assistente virtual respeita diretrizes estritas de saúde: detecta termos médicos de dor/lesão e orienta a suspensão imediata com consulta a profissionais qualificados.
            </p>
          </div>

        </div>

        <div className="max-w-[1400px] mx-auto border-t border-white/10 mt-8 pt-4 flex flex-wrap justify-between items-center gap-4 text-[10px] text-white/30">
          <span>© 2026 CA.RO FITNESS AI & SECURITY CO. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-brand transition">Termos de Uso</a>
            <a href="#" className="hover:text-brand transition">Política de Privacidade</a>
          </div>
        </div>
      </footer>

      {/* Footer Ticker */}
      <footer className="bg-brand text-black px-8 py-2 overflow-hidden whitespace-nowrap border-t border-white/10 select-none">
        <div className="text-[10px] font-display font-black uppercase tracking-[0.3em] flex justify-between gap-20">
          <span>SISTEMA INTEGRADO CA.RO SECURITY AI • STATUS: ONLINE</span>
          <span className="hidden md:inline">CARGA DE TREINO ATUALIZADA POR IA • GEMINI ACTIVE</span>
          <span className="hidden lg:inline">ACADEMIA UNIDADE JARDINS • 14 ALUNOS EM TREINO AGORA</span>
        </div>
      </footer>

    </div>
  );
}
