import React, { useState, useEffect } from "react";
import { 
  Shield, Dumbbell, Sparkles, Cpu, Users, Eye, Info, LogOut,
  HelpCircle, HardDrive, CheckCircle2, ChevronRight, User, Settings, Award, Lock, Mail
} from "lucide-react";
import StudentApp from "./components/StudentApp";
import GymAdmin from "./components/GymAdmin";
import MasterAdmin from "./components/MasterAdmin";
import SecurityAI from "./components/SecurityAI";

export default function App() {
  // Session User State
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Routing and inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState<'aluno' | 'academia' | 'master'>('aluno');
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentRoute, setCurrentRoute] = useState<'student' | 'admin'>(() => {
    return window.location.pathname.startsWith('/admin') ? 'admin' : 'student';
  });

  // Portal tab selection
  const [activePortal, setActivePortal] = useState<'academia' | 'master' | 'security'>('academia');
  const [presenceEventCount, setPresenceEventCount] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname.startsWith('/admin') ? 'admin' : 'student');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: 'student' | 'admin') => {
    const path = route === 'admin' ? '/admin' : '/';
    window.history.pushState({}, '', path);
    setCurrentRoute(route);
  };

  const handlePresenceScanned = () => {
    setPresenceEventCount(prev => prev + 1);
  };

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: loginRole })
      });
      const data = await res.json();
      if (data.status === "success") {
        const loggedUser = { ...data.user, role: loginRole };
        localStorage.setItem("user", JSON.stringify(loggedUser));
        setUser(loggedUser);
        if (loginRole === 'aluno') {
          navigateTo('student');
        } else {
          navigateTo('admin');
          setActivePortal(loginRole === 'master' ? 'master' : 'academia');
        }
      } else {
        setErrorMsg(data.message || "Credenciais inválidas");
      }
    } catch (err) {
      setErrorMsg("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: "ronysiilvaa1@gmail.com", 
          password: "123", // Demo fallback password
          role: "aluno",
          provider
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        const loggedUser = { ...data.user, role: "aluno" };
        localStorage.setItem("user", JSON.stringify(loggedUser));
        setUser(loggedUser);
        navigateTo('student');
      } else {
        setErrorMsg(`Erro ao autenticar com ${provider}.`);
      }
    } catch (err) {
      setErrorMsg(`Erro de rede ao autenticar com ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigateTo('student');
  };

  // IF NOT LOGGED IN - RENDER PREMIUM LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-dark-pitch text-white flex flex-col items-center justify-center p-4 select-none font-sans relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] -top-40 -left-40 pointer-events-none"></div>
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] -bottom-40 -right-40 pointer-events-none"></div>

        <div className="w-full max-w-[450px] bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-brand text-black rounded-2xl shadow-lg neon-glow animate-pulse">
              <Dumbbell className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-white">
                <span className="text-brand">CA.RO</span> FITNESS AI
              </h1>
              <p className="text-xs text-white/40 uppercase tracking-widest font-mono mt-1">SaaS Ecosystem Authenticator</p>
            </div>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {(['aluno', 'academia', 'master'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setLoginRole(role);
                  setErrorMsg("");
                }}
                className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  loginRole === role 
                    ? 'bg-brand text-black font-bold shadow-md' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {role === 'aluno' ? 'Aluno' : role === 'academia' ? 'Academia' : 'Developer'}
              </button>
            ))}
          </div>

          {loginRole === 'aluno' ? (
            <div className="space-y-4">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOAuthLogin('google')}
                className="w-full bg-white text-black hover:bg-white/90 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                {loading ? "Autenticando..." : "Entrar com o Google"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleOAuthLogin('apple')}
                className="w-full bg-black hover:bg-black/90 border border-white/20 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.5-.63.73-1.18 1.87-1.03 2.99 1.12.09 2.27-.58 2.96-1.43z"/>
                </svg>
                {loading ? "Autenticando..." : "Entrar com a Apple"}
              </button>

              {errorMsg && (
                <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 text-xs rounded-xl p-3 text-center font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="exemplo@carogym.com.br"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-all"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 text-xs rounded-xl p-3 text-center font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand hover:bg-brand/90 text-black py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-brand/20 disabled:opacity-50"
              >
                {loading ? "Autenticando..." : "Entrar no Sistema"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 1. STUDENT/MOBILE FOCUS ROUTE
  if (currentRoute === 'student' || user.role === 'aluno') {
    return (
      <StudentApp 
        studentId={user.id} 
        onPresenceTriggered={handlePresenceScanned} 
        userRole={user.role}
        onLogout={handleLogout}
        onNavigateToAdmin={() => navigateTo('admin')}
      />
    );
  }

  // 2. ADMIN/WEB FOCUS ROUTE
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

            {/* Developer controls only shown to master admin role */}
            {user.role === 'master' && (
              <button
                onClick={() => setActivePortal('master')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                  activePortal === 'master' 
                    ? 'bg-brand text-black neon-glow' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" /> Master (Developer)
              </button>
            )}

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

            <div className="h-4 w-px bg-white/10 mx-1"></div>

            <button
              onClick={() => navigateTo('student')}
              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 text-brand hover:bg-white/5"
            >
              Simular App Aluno
            </button>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white">{user.nome}</span>
              <span className="text-[9px] font-mono text-brand uppercase tracking-wider">{user.role === 'master' ? 'Desenvolvedor' : 'Gestor Academia'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 rounded-xl transition cursor-pointer border border-rose-500/20"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 lg:p-8">
        
        {/* Interactive Corporate SaaS Portals based on switch */}
        <section className="space-y-6">
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
            {activePortal === 'master' && user.role === 'master' && (
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
