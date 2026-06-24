import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: any = null;
const hasGeminiKey = !!process.env.GEMINI_API_KEY;

if (hasGeminiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API:", err);
  }
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. Conversational features will use high-quality simulated fitness responses.");
}

// --- MOCK DATABASE STATE ---

let db = {
  empresas: [
    { id: "emp_1", nome: "CA.RO Alpha Gym", email: "contato@carogym.com.br", telefone: "(11) 98888-7777", status: "ativo", plano_saas: "Premium SaaS", limite_alunos: 500, limite_ia_mensal: 2000, created_at: "2026-01-10T10:00:00Z" }
  ],
  unidades: [
    { id: "uni_1", empresa_id: "emp_1", nome: "Unidade Jardins", endereco: "Alameda Lorena, 1500 - Jardins, São Paulo - SP", status: "ativo" },
    { id: "uni_2", empresa_id: "emp_1", nome: "Unidade Paulista", endereco: "Av. Paulista, 2000 - Bela Vista, São Paulo - SP", status: "ativo" }
  ],
  usuarios: [
    { id: "usr_admin", empresa_id: "emp_1", nome: "Professor Carlos", email: "carlos@carogym.com.br", senha_hash: "123456", role: "academia", status: "ativo" },
    { id: "usr_master", empresa_id: "emp_1", nome: "CA.RO Master Admin", email: "master@carofitness.ai", senha_hash: "123456", role: "master", status: "ativo" }
  ],
  planos: [
    { id: "pla_1", empresa_id: "emp_1", nome: "Plano Gold Mensal", valor: 149.90, duracao_dias: 30, beneficios: "Acesso total à musculação, Área cárdio, 2 agendamentos de aulas coletivas simultâneos.", status: "ativo" },
    { id: "pla_2", empresa_id: "emp_1", nome: "Plano Black VIP Anual", valor: 119.90, duracao_dias: 365, beneficios: "Acesso livre a todas as unidades, Aulas coletivas ilimitadas, Carteirinha Black, Assistente de IA Premium.", status: "ativo" }
  ],
  alunos: [
    {
      id: "alu_rony",
      empresa_id: "emp_1",
      unidade_id: "uni_1",
      nome: "Rony Silva",
      email: "ronysiilvaa1@gmail.com",
      telefone: "(11) 97777-1234",
      foto_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=250&auto=format&fit=crop",
      data_nascimento: "1995-08-15",
      altura: 1.78,
      peso: 82.5,
      objetivo: "Hipertrofia e Definição",
      nivel: "Intermediário",
      frequencia_semanal: 4,
      restricoes: "Leve desconforto no joelho direito ao fazer agachamento profundo",
      status: "ativo",
      plano_id: "pla_2"
    },
    {
      id: "alu_2",
      empresa_id: "emp_1",
      unidade_id: "uni_1",
      nome: "Beatriz Santos",
      email: "beatriz@gmail.com",
      telefone: "(11) 98888-4321",
      foto_url: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=250&auto=format&fit=crop",
      data_nascimento: "1998-04-20",
      altura: 1.65,
      peso: 60.2,
      objetivo: "Perda de Gordura e Condicionamento",
      nivel: "Iniciante",
      frequencia_semanal: 3,
      restricoes: "Nenhuma",
      status: "ativo",
      plano_id: "pla_1"
    }
  ],
  exercicios: [
    { id: "exe_supino", empresa_id: "emp_1", nome: "Supino Reto com Barra", grupo_muscular: "Peito", instrucoes: "Deite-se no banco, segure a barra um pouco além da largura dos ombros. Desça a barra controladamente até o peitoral e empurre para cima estendendo os braços sem bloquear os cotovelos.", erros_comuns: "Bater a barra no peito, tirar as costas do banco, abrir demais os cotovelos.", cuidados: "Mantenha as escápulas retraídas e conte com a ajuda de um parceiro/professor para cargas altas.", midia_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop", nivel: "Todos" },
    { id: "exe_agachamento", empresa_id: "emp_1", nome: "Agachamento Livre", grupo_muscular: "Pernas", instrucoes: "Apoie a barra nos trapézios. Afaste os pés na largura dos ombros. Flexione joelhos e quadril descendo como se fosse sentar em uma cadeira. Mantenha as costas retas e empurre o chão para subir.", erros_comuns: "Projetar joelhos para dentro, arquear a coluna vertebral, tirar calcanhares do chão.", cuidados: "Não descer excessivamente se sentir dor no joelho. Ativar o abdômen para proteger a lombar.", midia_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop", nivel: "Intermediário" },
    { id: "exe_puxada", empresa_id: "emp_1", nome: "Puxada Frontal na Polia", grupo_muscular: "Costas", instrucoes: "Ajuste o apoio das pernas. Segure a barra longa com pegada pronada aberta. Incline levemente o tronco para trás e puxe a barra em direção à parte superior do peito, contraindo as costas.", erros_comuns: "Usar o impulso do corpo para puxar, curvar as costas excessivamente.", cuidados: "Evite puxar atrás da nuca para não sobrecarregar as articulações dos ombros.", midia_url: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=400&auto=format&fit=crop", nivel: "Iniciante" },
    { id: "exe_rosca", empresa_id: "emp_1", nome: "Rosca Direta com Halteres", grupo_muscular: "Bíceps", instrucoes: "Em pé, segure os halteres ao lado do corpo com as palmas voltadas para a frente. Flexione os cotovelos trazendo os halteres até os ombros. Desça lentamente até estender os braços.", erros_comuns: "Balançar o tronco (roubar), afastar os cotovelos da lateral do corpo.", cuidados: "Mantenha o abdômen e os glúteos contraídos para estabilizar o corpo.", midia_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop", nivel: "Iniciante" },
    { id: "exe_triceps", empresa_id: "emp_1", nome: "Tríceps Corda na Polia", grupo_muscular: "Tríceps", instrucoes: "De frente para o cabo, segure as pontas da corda. Mantendo os cotovelos fixos ao lado do corpo, empurre a corda para baixo abrindo as mãos no final do movimento.", erros_comuns: "Mover os cotovelos para frente e para trás, curvar os ombros.", cuidados: "Mantenha a postura ereta e os punhos firmes.", midia_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop", nivel: "Iniciante" },
    { id: "exe_elevacao", empresa_id: "emp_1", nome: "Elevação Lateral com Halteres", grupo_muscular: "Ombros", instrucoes: "Segure halteres ao lado do corpo. Eleve os braços para os lados até a altura dos ombros, mantendo uma leve flexão nos cotovelos. Desça de forma controlada.", erros_comuns: "Elevar acima da linha do ombro, usar impulso excessivo, tensionar o trapézio.", cuidados: "Evite cargas excessivas para manter a execução perfeita.", midia_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=400&auto=format&fit=crop", nivel: "Todos" }
  ],
  treinos: [
    { id: "tre_rony_a", empresa_id: "emp_1", aluno_id: "alu_rony", nome: "Treino A - Peito, Tríceps & Ombros", objetivo: "Hipertrofia", nivel: "Intermediário", frequencia: "A / B / C", status: "ativo" },
    { id: "tre_rony_b", empresa_id: "emp_1", aluno_id: "alu_rony", nome: "Treino B - Costas, Bíceps & Abdômen", objetivo: "Hipertrofia", nivel: "Intermediário", frequencia: "A / B / C", status: "ativo" },
    { id: "tre_rony_c", empresa_id: "emp_1", aluno_id: "alu_rony", nome: "Treino C - Pernas Completo", objetivo: "Hipertrofia", nivel: "Intermediário", frequencia: "A / B / C", status: "ativo" }
  ],
  treino_exercicios: [
    { id: "te_1", treino_id: "tre_rony_a", exercicio_id: "exe_supino", series: 4, repeticoes: "10-12", carga: "60kg", descanso: "60s", observacoes: "Focar na descida lenta e controlada.", ordem: 1 },
    { id: "te_2", treino_id: "tre_rony_a", exercicio_id: "exe_elevacao", series: 4, repeticoes: "12-15", carga: "12kg", descanso: "45s", observacoes: "Não balançar o corpo.", ordem: 2 },
    { id: "te_3", treino_id: "tre_rony_a", exercicio_id: "exe_triceps", series: 3, repeticoes: "12", carga: "25kg", descanso: "45s", observacoes: "Estender totalmente embaixo abrindo as mãos.", ordem: 3 },

    { id: "te_4", treino_id: "tre_rony_b", exercicio_id: "exe_puxada", series: 4, repeticoes: "10-12", carga: "55kg", descanso: "60s", observacoes: "Contrair bem o dorsal embaixo.", ordem: 1 },
    { id: "te_5", treino_id: "tre_rony_b", exercicio_id: "exe_rosca", series: 4, repeticoes: "12", carga: "14kg", descanso: "45s", observacoes: "Controlar a descida.", ordem: 2 },

    { id: "te_6", treino_id: "tre_rony_c", exercicio_id: "exe_agachamento", series: 4, repeticoes: "10", carga: "80kg", descanso: "90s", observacoes: "Cuidado com o joelho. Descer até 90 graus devido à restrição.", ordem: 1 }
  ],
  aulas: [
    { id: "aul_1", unidade_id: "uni_1", nome: "Spinning Indoor", professor: "Profª Juliana", data_hora: "2026-06-25T18:30:00Z", vagas: 20, status: "ativo" },
    { id: "aul_2", unidade_id: "uni_1", nome: "Power Yoga", professor: "Profª Alice", data_hora: "2026-06-25T19:30:00Z", vagas: 15, status: "ativo" },
    { id: "aul_3", unidade_id: "uni_1", nome: "CrossFit HIIT", professor: "Prof. Marcos", data_hora: "2026-06-26T07:00:00Z", vagas: 12, status: "ativo" },
    { id: "aul_4", unidade_id: "uni_1", nome: "Muay Thai", professor: "Prof. Anderson", data_hora: "2026-06-26T19:00:00Z", vagas: 18, status: "ativo" }
  ],
  agendamentos: [
    { id: "age_1", aula_id: "aul_1", aluno_id: "alu_rony", status: "confirmado", created_at: "2026-06-24T08:00:00Z" }
  ],
  notificacoes: [
    { id: "not_1", empresa_id: "emp_1", aluno_id: "alu_rony", titulo: "Seja bem-vindo!", mensagem: "Olá Rony, sua carteirinha digital está pronta para acesso. Aproveite o CA.RO Fitness AI!", tipo: "alerta", status: "lida", created_at: "2026-06-24T07:00:00Z" },
    { id: "not_2", empresa_id: "emp_1", aluno_id: "alu_rony", titulo: "Agendamento Confirmado", mensagem: "Sua vaga na aula de Spinning Indoor (Amanhã às 18:30) foi confirmada!", tipo: "comunicado", status: "nao_lida", created_at: "2026-06-24T08:01:00Z" }
  ],
  presencas: [
    { id: "pre_1", aluno_id: "alu_rony", unidade_id: "uni_1", entrada_at: "2026-06-23T18:00:00Z", saida_at: "2026-06-23T19:15:00Z", metodo: "QR Code - Catraca Virtual", status: "concluido" },
    { id: "pre_2", aluno_id: "alu_rony", unidade_id: "uni_1", entrada_at: "2026-06-21T07:15:00Z", saida_at: "2026-06-21T08:30:00Z", metodo: "QR Code - Catraca Virtual", status: "concluido" },
    { id: "pre_3", aluno_id: "alu_rony", unidade_id: "uni_1", entrada_at: "2026-06-19T18:02:00Z", saida_at: "2026-06-19T19:20:00Z", metodo: "QR Code - Catraca Virtual", status: "concluido" }
  ],
  evolucoes: [
    { id: "evo_1", aluno_id: "alu_rony", peso: 84.0, medidas: { braço: "38cm", peito: "102cm", coxa: "59cm" }, foto_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop", observacoes: "Início do protocolo de hipertrofia. Percentual de gordura inicial 16%.", created_at: "2026-05-10T10:00:00Z" },
    { id: "evo_2", aluno_id: "alu_rony", peso: 82.5, medidas: { braço: "38.5cm", peito: "104cm", coxa: "60cm" }, foto_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop", observacoes: "Segunda medição. Redução de gordura visceral e melhora no desenho muscular.", created_at: "2026-06-10T10:00:00Z" }
  ],
  ia_conversas: [
    { id: "con_1", aluno_id: "alu_rony", titulo: "Dicas de Treino e Joelho", created_at: "2026-06-24T07:10:00Z" }
  ],
  ia_mensagens: [
    { id: "msg_1", conversa_id: "con_1", role: "user", conteudo: "Como posso agachar com segurança tendo dor leve no joelho?", intencao: "duvida_exercicio", tokens: 120, created_at: "2026-06-24T07:10:05Z" },
    { id: "msg_2", conversa_id: "con_1", role: "assistant", conteudo: "Olá Rony! Entendo que você tem um leve desconforto no joelho direito. Para agachar com segurança: 1) Limite a amplitude de descida até 90 graus (evite o agachamento profundo); 2) Foque em direcionar o quadril bem para trás; 3) Mantenha os joelhos alinhados com a ponta dos pés, sem deixá-los caírem para dentro; 4) Faça um bom aquecimento das articulações antes de colocar carga. Se a dor persistir, pare o exercício e consulte seu instrutor ou um ortopedista!", intencao: "duvida_exercicio", tokens: 250, created_at: "2026-06-24T07:10:30Z" }
  ],
  ia_logs: [
    { id: "log_1", empresa_id: "emp_1", aluno_id: "alu_rony", provider: "google", modelo: "gemini-3.5-flash", tokens_input: 120, tokens_output: 250, custo_estimado: 0.00037, created_at: "2026-06-24T07:10:30Z" }
  ]
};

// --- AUTH ROUTE ---
app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  // Simple simulator auth
  if (role === "academia") {
    const user = db.usuarios.find(u => u.email === email && u.role === "academia");
    if (user) {
      return res.json({ status: "success", user });
    }
  } else if (role === "master") {
    const user = db.usuarios.find(u => u.email === email && u.role === "master");
    if (user) {
      return res.json({ status: "success", user });
    }
  } else {
    // Check if it matches an email of a student
    const student = db.alunos.find(s => s.email === email);
    if (student) {
      return res.json({ status: "success", user: { ...student, role: "aluno" } });
    }
  }
  return res.status(401).json({ status: "error", message: "Credenciais inválidas ou papel não encontrado." });
});

app.post("/api/auth/register", (req, res) => {
  const { nome, email, telefone, altura, peso, objetivo, nivel, frequencia_semanal } = req.body;
  
  if (db.alunos.find(a => a.email === email)) {
    return res.status(400).json({ status: "error", message: "E-mail já cadastrado!" });
  }

  const newStudent = {
    id: `alu_${Date.now()}`,
    empresa_id: "emp_1",
    unidade_id: "uni_1",
    nome,
    email,
    telefone: telefone || "(11) 99999-9999",
    foto_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=250&auto=format&fit=crop",
    data_nascimento: "1998-01-01",
    altura: Number(altura) || 1.75,
    peso: Number(peso) || 75.0,
    objetivo: objetivo || "Hipertrofia",
    nivel: nivel || "Iniciante",
    frequencia_semanal: Number(frequencia_semanal) || 3,
    restricoes: "Nenhuma",
    status: "ativo",
    plano_id: "pla_1"
  };

  db.alunos.push(newStudent);

  // Give them A/B Workout automatically
  const workoutA = { id: `tre_${newStudent.id}_a`, empresa_id: "emp_1", aluno_id: newStudent.id, nome: "Treino A - Peito, Tríceps e Abdômen", objetivo: newStudent.objetivo, nivel: newStudent.nivel, frequencia: "A / B", status: "ativo" };
  const workoutB = { id: `tre_${newStudent.id}_b`, empresa_id: "emp_1", aluno_id: newStudent.id, nome: "Treino B - Costas, Bíceps e Pernas", objetivo: newStudent.objetivo, nivel: newStudent.nivel, frequencia: "A / B", status: "ativo" };
  db.treinos.push(workoutA, workoutB);

  // Link exercises
  db.treino_exercicios.push(
    { id: `te_${Date.now()}_1`, treino_id: workoutA.id, exercicio_id: "exe_supino", series: 3, repeticoes: "12", carga: "20kg", descanso: "60s", observacoes: "Manter postura.", ordem: 1 },
    { id: `te_${Date.now()}_2`, treino_id: workoutA.id, exercicio_id: "exe_triceps", series: 3, repeticoes: "15", carga: "15kg", descanso: "45s", observacoes: "Cotovelos fechados.", ordem: 2 },
    { id: `te_${Date.now()}_3`, treino_id: workoutB.id, exercicio_id: "exe_puxada", series: 3, repeticoes: "12", carga: "30kg", descanso: "60s", observacoes: "Contrair dorsais.", ordem: 1 },
    { id: `te_${Date.now()}_4`, treino_id: workoutB.id, exercicio_id: "exe_agachamento", series: 3, repeticoes: "12", carga: "Sem peso", descanso: "60s", observacoes: "Focar na técnica.", ordem: 2 }
  );

  // Add welcome notification
  db.notificacoes.push({
    id: `not_${Date.now()}`,
    empresa_id: "emp_1",
    aluno_id: newStudent.id,
    titulo: "Bem-vindo ao CA.RO Fitness!",
    mensagem: `Olá ${nome}, seu cadastro foi efetuado. Seus treinos iniciais foram montados pela nossa IA!`,
    tipo: "alerta",
    status: "nao_lida",
    created_at: new Date().toISOString()
  });

  return res.json({ status: "success", user: { ...newStudent, role: "aluno" } });
});

// --- STUDENTS CRUD ---
app.get("/api/students", (req, res) => {
  res.json(db.alunos);
});

app.post("/api/students", (req, res) => {
  const data = req.body;
  const newStudent = {
    id: `alu_${Date.now()}`,
    empresa_id: "emp_1",
    unidade_id: data.unidade_id || "uni_1",
    nome: data.nome,
    email: data.email,
    telefone: data.telefone || "(11) 99999-9999",
    foto_url: data.foto_url || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=250&auto=format&fit=crop",
    data_nascimento: data.data_nascimento || "1995-01-01",
    altura: Number(data.altura) || 1.70,
    peso: Number(data.peso) || 70.0,
    objetivo: data.objetivo || "Manutenção",
    nivel: data.nivel || "Iniciante",
    frequencia_semanal: Number(data.frequencia_semanal) || 3,
    restricoes: data.restricoes || "Nenhuma",
    status: data.status || "ativo",
    plano_id: data.plano_id || "pla_1"
  };
  db.alunos.push(newStudent);
  res.json({ status: "success", student: newStudent });
});

app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const index = db.alunos.findIndex(s => s.id === id);
  if (index !== -1) {
    db.alunos[index] = { ...db.alunos[index], ...req.body };
    return res.json({ status: "success", student: db.alunos[index] });
  }
  res.status(404).json({ status: "error", message: "Aluno não encontrado" });
});

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  db.alunos = db.alunos.filter(s => s.id !== id);
  res.json({ status: "success" });
});

// --- WORKOUTS & EXERCISES ---
app.get("/api/workouts", (req, res) => {
  const { studentId } = req.query;
  if (studentId) {
    const workouts = db.treinos.filter(t => t.aluno_id === studentId);
    // Hydrate workouts with exercise details
    const hydrated = workouts.map(w => {
      const tes = db.treino_exercicios.filter(te => te.treino_id === w.id);
      const exercisesList = tes.map(te => {
        const exe = db.exercicios.find(e => e.id === te.exercicio_id);
        return {
          ...te,
          exercicio: exe || { nome: "Exercício não encontrado", grupo_muscular: "Desconhecido" }
        };
      }).sort((a,b) => a.ordem - b.ordem);
      return { ...w, exercicios: exercisesList };
    });
    return res.json(hydrated);
  }
  res.json(db.treinos);
});

app.post("/api/workouts", (req, res) => {
  const { aluno_id, nome, objetivo, nivel, frequencia, exercicios } = req.body;
  const newWorkout = {
    id: `tre_${Date.now()}`,
    empresa_id: "emp_1",
    aluno_id,
    nome,
    objetivo,
    nivel,
    frequencia,
    status: "ativo"
  };
  db.treinos.push(newWorkout);

  if (exercicios && Array.isArray(exercicios)) {
    exercicios.forEach((exe: any, index: number) => {
      db.treino_exercicios.push({
        id: `te_${Date.now()}_${index}`,
        treino_id: newWorkout.id,
        exercicio_id: exe.exercicio_id,
        series: Number(exe.series) || 3,
        repeticoes: String(exe.repeticoes) || "12",
        carga: String(exe.carga) || "10kg",
        descanso: String(exe.descanso) || "60s",
        observacoes: String(exe.observacoes || ""),
        ordem: index + 1
      });
    });
  }

  res.json({ status: "success", workout: newWorkout });
});

app.delete("/api/workouts/:id", (req, res) => {
  const { id } = req.params;
  db.treinos = db.treinos.filter(t => t.id !== id);
  db.treino_exercicios = db.treino_exercicios.filter(te => te.treino_id !== id);
  res.json({ status: "success" });
});

app.get("/api/exercises", (req, res) => {
  res.json(db.exercicios);
});

app.post("/api/exercises", (req, res) => {
  const newExe = {
    id: `exe_${Date.now()}`,
    empresa_id: "emp_1",
    ...req.body
  };
  db.exercicios.push(newExe);
  res.json({ status: "success", exercise: newExe });
});

app.put("/api/exercises/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.exercicios.findIndex(e => e.id === id);
  if (idx !== -1) {
    db.exercicios[idx] = { ...db.exercicios[idx], ...req.body };
    return res.json({ status: "success", exercise: db.exercicios[idx] });
  }
  res.status(404).json({ status: "error", message: "Exercício não encontrado" });
});

app.delete("/api/exercises/:id", (req, res) => {
  const { id } = req.params;
  db.exercicios = db.exercicios.filter(e => e.id !== id);
  res.json({ status: "success" });
});

// --- CLASSES & BOOKINGS ---
app.get("/api/classes", (req, res) => {
  const { studentId } = req.query;
  const enrichedClasses = db.aulas.map(c => {
    const totalBooked = db.agendamentos.filter(a => a.aula_id === c.id && a.status === "confirmado").length;
    const isBooked = studentId ? db.agendamentos.some(a => a.aula_id === c.id && a.aluno_id === studentId && a.status === "confirmado") : false;
    return {
      ...c,
      vagas_restantes: Math.max(0, c.vagas - totalBooked),
      agendada: isBooked
    };
  });
  res.json(enrichedClasses);
});

app.post("/api/classes", (req, res) => {
  const newClass = {
    id: `aul_${Date.now()}`,
    unidade_id: req.body.unidade_id || "uni_1",
    nome: req.body.nome,
    professor: req.body.professor,
    data_hora: req.body.data_hora,
    vagas: Number(req.body.vagas) || 15,
    status: "ativo"
  };
  db.aulas.push(newClass);
  res.json({ status: "success", class: newClass });
});

app.post("/api/classes/:id/book", (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  const gymClass = db.aulas.find(c => c.id === id);
  if (!gymClass) return res.status(404).json({ status: "error", message: "Aula não encontrada." });

  // Check if already booked
  const exists = db.agendamentos.find(a => a.aula_id === id && a.aluno_id === studentId && a.status === "confirmado");
  if (exists) return res.json({ status: "success", message: "Já agendado!" });

  const totalBooked = db.agendamentos.filter(a => a.aula_id === id && a.status === "confirmado").length;
  if (totalBooked >= gymClass.vagas) {
    return res.status(400).json({ status: "error", message: "Aula lotada!" });
  }

  db.agendamentos.push({
    id: `age_${Date.now()}`,
    aula_id: id,
    aluno_id: studentId,
    status: "confirmado",
    created_at: new Date().toISOString()
  });

  // Add notification
  db.notificacoes.push({
    id: `not_${Date.now()}`,
    empresa_id: "emp_1",
    aluno_id: studentId,
    titulo: "Agendamento Confirmado!",
    mensagem: `Você garantiu sua vaga na aula de ${gymClass.nome} com ${gymClass.professor}!`,
    tipo: "confirmacao",
    status: "nao_lida",
    created_at: new Date().toISOString()
  });

  res.json({ status: "success", message: "Agendamento confirmado com sucesso." });
});

app.post("/api/classes/:id/cancel", (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  db.agendamentos = db.agendamentos.filter(a => !(a.aula_id === id && a.aluno_id === studentId));
  res.json({ status: "success", message: "Agendamento cancelado com sucesso." });
});

// --- NOTIFICATIONS ---
app.get("/api/notifications", (req, res) => {
  const { studentId } = req.query;
  if (studentId) {
    const list = db.notificacoes.filter(n => n.aluno_id === studentId);
    return res.json(list.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }
  res.json(db.notificacoes);
});

app.post("/api/notifications", (req, res) => {
  const { aluno_id, titulo, mensagem, tipo } = req.body;
  const newNot = {
    id: `not_${Date.now()}`,
    empresa_id: "emp_1",
    aluno_id: aluno_id || "alu_rony",
    titulo,
    mensagem,
    tipo: tipo || "comunicado",
    status: "nao_lida",
    created_at: new Date().toISOString()
  };
  db.notificacoes.push(newNot);
  res.json({ status: "success", notification: newNot });
});

app.post("/api/notifications/mark-all-read", (req, res) => {
  const { studentId } = req.body;
  db.notificacoes = db.notificacoes.map(n => n.aluno_id === studentId ? { ...n, status: "lida" } : n);
  res.json({ status: "success" });
});

// --- ATTENDANCE & PROGRESS ---
app.get("/api/attendance", (req, res) => {
  const { studentId } = req.query;
  if (studentId) {
    const list = db.presencas.filter(p => p.aluno_id === studentId);
    return res.json(list.sort((a,b) => new Date(b.entrada_at).getTime() - new Date(a.entrada_at).getTime()));
  }
  res.json(db.presencas);
});

app.post("/api/attendance", (req, res) => {
  const { studentId, metodo } = req.body;
  const student = db.alunos.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ status: "error", message: "Aluno não encontrado" });

  const entryTime = new Date();
  const estimatedExit = new Date(entryTime.getTime() + 75 * 60 * 1000); // 1h15 later

  const newPresence = {
    id: `pre_${Date.now()}`,
    aluno_id: studentId,
    unidade_id: student.unidade_id,
    entrada_at: entryTime.toISOString(),
    saida_at: estimatedExit.toISOString(),
    metodo: metodo || "QR Code - Catraca Virtual",
    status: "concluido"
  };

  db.presencas.push(newPresence);
  res.json({ status: "success", presence: newPresence });
});

app.get("/api/progress", (req, res) => {
  const { studentId } = req.query;
  if (studentId) {
    const list = db.evolucoes.filter(e => e.aluno_id === studentId);
    return res.json(list.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
  }
  res.json(db.evolucoes);
});

app.post("/api/progress", (req, res) => {
  const { studentId, peso, braço, peito, coxa, observacoes, foto_url } = req.body;
  
  const newProgress = {
    id: `evo_${Date.now()}`,
    aluno_id: studentId,
    peso: Number(peso) || 80,
    medidas: {
      braço: braço || "38cm",
      peito: peito || "102cm",
      coxa: coxa || "58cm"
    },
    foto_url: foto_url || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop",
    observacoes: observacoes || "Mais um registro de treino concluído.",
    created_at: new Date().toISOString()
  };

  db.evolucoes.push(newProgress);

  // Update current student weight
  const index = db.alunos.findIndex(s => s.id === studentId);
  if (index !== -1) {
    db.alunos[index].peso = Number(peso);
  }

  res.json({ status: "success", progress: newProgress });
});

// --- REAL GEMINI CHAT ENGINE WITH FALLBACK ---
app.get("/api/ai/conversations", (req, res) => {
  const { studentId } = req.query;
  if (studentId) {
    const list = db.ia_conversas.filter(c => c.aluno_id === studentId);
    return res.json(list);
  }
  res.json(db.ia_conversas);
});

app.get("/api/ai/conversations/:id", (req, res) => {
  const { id } = req.params;
  const list = db.ia_mensagens.filter(m => m.conversa_id === id);
  res.json(list);
});

app.post("/api/ai/chat", async (req, res) => {
  const { studentId, conversationId, message } = req.body;
  
  const student = db.alunos.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ status: "error", message: "Aluno não encontrado." });

  let convId = conversationId;
  if (!convId) {
    convId = `con_${Date.now()}`;
    db.ia_conversas.push({
      id: convId,
      aluno_id: studentId,
      titulo: message.substring(0, 30) + (message.length > 30 ? "..." : ""),
      created_at: new Date().toISOString()
    });
  }

  // Save student message
  const userMsg = {
    id: `msg_u_${Date.now()}`,
    conversa_id: convId,
    role: "user",
    conteudo: message,
    intencao: "pergunta_geral",
    tokens: Math.round(message.length / 4),
    created_at: new Date().toISOString()
  };
  db.ia_mensagens.push(userMsg);

  // Retrieve last 6 messages for context
  const previousMessages = db.ia_mensagens
    .filter(m => m.conversa_id === convId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-6);

  // Build AI context
  const workoutDetails = db.treinos
    .filter(t => t.aluno_id === studentId)
    .map(t => {
      const tes = db.treino_exercicios.filter(te => te.treino_id === t.id);
      const exes = tes.map(te => {
        const exe = db.exercicios.find(e => e.id === te.exercicio_id);
        return `${exe?.nome || 'Exercício'}: ${te.series} séries x ${te.repeticoes} reps (${te.carga})`;
      }).join(", ");
      return `- ${t.nome}: [${exes}]`;
    }).join("\n");

  const studentContext = `
DADOS DO ALUNO EM CONTEXTO:
Nome: ${student.nome}
Objetivo: ${student.objetivo}
Nível de Experiência: ${student.nivel}
Frequência Semanal Estimada: ${student.frequencia_semanal} dias
Peso Atual: ${student.peso} kg
Altura: ${student.altura} m
Restrições Físicas/Dor: ${student.restricoes || "Nenhuma"}
Treinos Atuais Vinculados:
${workoutDetails || "Nenhum treino ativo cadastrado no momento."}
`;

  const systemInstruction = `
Você é o CA.RO Fitness AI Assistant, um assistente virtual de treino e bem-estar para alunos de academia integrado na plataforma SaaS CA.RO Fitness AI.

Você ajuda o aluno a entender treinos, organizar rotina de exercícios, explicar a correta execução de exercícios, sugerir ajustes gerais e acompanhar a evolução física de forma motivadora, empática e prática.

REGRA CRÍTICA DE SEGURANÇA:
- Você NÃO é e NÃO deve se apresentar como médico, fisioterapeuta ou nutricionista.
- Sempre que houver menção a dor forte, lesão física, tontura severa, falta de ar, palpitações cardíacas, ou problemas de saúde médica, oriente expressamente e de forma educada o aluno a suspender o exercício e procurar um profissional médico ou fisioterapeuta qualificado imediatamente.
- Nunca prescreva tratamentos de saúde, lesões ou doenças.
- Nunca recomende ou sugira o uso de substâncias controladas, anabolizantes, esteroides, ou medicamentos.
- Se o aluno fizer perguntas sobre anabolizantes ou drogas, informe com firmeza que seu escopo é focado em treinos saudáveis, consistência e bem-estar natural.

DIRETRIZ DE TREINO:
- Quando sugerir ajustes de treinos, faça-os alinhados ao nível, objetivo, frequência e restrições informadas no contexto do aluno.
- Sempre incentive a execução controlada, o aquecimento articular inicial, o aumento progressivo e seguro de cargas, e respeite os períodos de descanso e sono.
- Responda em Português do Brasil com tom encorajador, focado na superação pessoal e consistência.
`;

  let responseText = "";
  let tokensInput = 0;
  let tokensOutput = 0;

  if (hasGeminiKey && ai) {
    try {
      // Build messages array
      const historyParts = previousMessages.map(m => {
        return `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.conteudo}`;
      }).join("\n");

      const promptPayload = `
${studentContext}

Histórico recente da conversa:
${historyParts}

Mensagem atual do usuário: ${message}

Responda agora de acordo com as instruções do sistema.
`;

      const geminiRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptPayload,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      responseText = geminiRes.text || "Desculpe, tive um problema ao formular sua resposta.";
      tokensInput = Math.round(promptPayload.length / 4);
      tokensOutput = Math.round(responseText.length / 4);
    } catch (err: any) {
      console.error("Gemini runtime error, falling back to simulator:", err);
      responseText = getSimulatedResponse(message, student);
    }
  } else {
    // Elegant simulation response based on intention
    responseText = getSimulatedResponse(message, student);
    tokensInput = 100;
    tokensOutput = 200;
  }

  // Save AI response
  const aiMsg = {
    id: `msg_a_${Date.now()}`,
    conversa_id: convId,
    role: "assistant",
    conteudo: responseText,
    intencao: "ajuda_geral",
    tokens: tokensOutput,
    created_at: new Date().toISOString()
  };
  db.ia_mensagens.push(aiMsg);

  // Log in AI Analytics
  db.ia_logs.push({
    id: `log_${Date.now()}`,
    empresa_id: "emp_1",
    aluno_id: studentId,
    provider: hasGeminiKey ? "google" : "simulador_local",
    modelo: hasGeminiKey ? "gemini-3.5-flash" : "simulador-caro-ai",
    tokens_input: tokensInput,
    tokens_output: tokensOutput,
    custo_estimado: (tokensInput + tokensOutput) * 0.000001,
    created_at: new Date().toISOString()
  });

  res.json({
    status: "success",
    conversationId: convId,
    message: aiMsg
  });
});

// --- QUICK SUGGESTIONS / ANALYTICS BY IA ---
app.post("/api/ai/workout-suggestion", async (req, res) => {
  const { studentId, userPrompt } = req.body;
  const student = db.alunos.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ status: "error", message: "Aluno não encontrado" });

  const systemInstruction = `Você é o arquiteto de treinos da CA.RO Fitness AI. Crie um cronograma semanal de treinos personalizado em formato estruturado.`;
  const prompt = `Gere uma rotina de treino personalizada com base nas seguintes informações do aluno:
Nome: ${student.nome}
Objetivo: ${student.objetivo}
Nível: ${student.nivel}
Frequência: ${student.frequencia_semanal} dias por semana
Restrições: ${student.restricoes || "Nenhuma"}
Foco adicional pedido pelo aluno: ${userPrompt || "Nenhum"}

Forneça a resposta em formato estruturado com Divisão Semanal (ex: Treino A, Treino B), lista de exercícios sugeridos com séries e repetições sugeridas e observações de segurança.`;

  let resultText = "";
  if (hasGeminiKey && ai) {
    try {
      const geminiRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { systemInstruction }
      });
      resultText = geminiRes.text || "";
    } catch (err) {
      resultText = getSimulatedWorkoutSuggestion(student);
    }
  } else {
    resultText = getSimulatedWorkoutSuggestion(student);
  }

  res.json({ status: "success", suggestion: resultText });
});

app.post("/api/ai/exercise-explanation", async (req, res) => {
  const { exerciseName, studentId } = req.body;
  const student = db.alunos.find(s => s.id === studentId);
  const prompt = `Explique de forma pedagógica e detalhada como realizar o exercício: "${exerciseName}".
Considere que o aluno se chama ${student?.nome || "Rony"}, possui o nível ${student?.nivel || "Intermediário"} e tem como restrição: ${student?.restricoes || "Nenhuma"}.
Indique:
1. Como executar passo a passo
2. Músculos principais e sinergistas
3. Erros comuns para evitar
4. Cuidados importantes de acordo com a restrição.`;

  let resultText = "";
  if (hasGeminiKey && ai) {
    try {
      const geminiRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      resultText = geminiRes.text || "";
    } catch (err) {
      resultText = `### Guia de Execução Segura: ${exerciseName}
Olá Rony! Aqui está o passo-a-passo detalhado elaborado por nossa IA para você realizar o **${exerciseName}** com segurança máxima:

1. **Posicionamento**: Certifique-se de manter os pés firmes no chão, a coluna neutra e as escápulas aduzidas (fechadas nas costas) para proteger os ombros.
2. **Execução**: Execute a fase excêntrica (descida) de maneira controlada (entre 2 a 3 segundos) e empurre a carga com foco na contração muscular, sem dar trancos.
3. **Músculos Ativados**: Foco primário na musculatura do tórax/membros inferiores e sinergistas auxiliares.
4. **Alerta de Segurança**: Devido ao seu desconforto leve no joelho direito, evite sobrecargas extremas de uma vez. Mantenha a articulação sob controle e use joelheira se preferir maior estabilidade.`;
    }
  } else {
    resultText = `### Guia de Execução Segura: ${exerciseName}
Olá Rony! Aqui está o passo-a-passo detalhado elaborado por nossa IA para você realizar o **${exerciseName}** com segurança máxima:

1. **Posicionamento**: Certifique-se de manter os pés firmes no chão, a coluna neutra e as escápulas aduzidas (fechadas nas costas) para proteger os ombros.
2. **Execução**: Execute a fase excêntrica (descida) de maneira controlada (entre 2 a 3 segundos) e empurre a carga com foco na contração muscular, sem dar trancos.
3. **Músculos Ativados**: Foco primário na musculatura do tórax/membros inferiores e sinergistas auxiliares.
4. **Alerta de Segurança**: Devido ao seu desconforto leve no joelho direito, evite sobrecargas extremas de uma vez. Mantenha a articulação sob controle e use joelheira se preferir maior estabilidade.`;
  }

  res.json({ status: "success", explanation: resultText });
});

// --- SIMULATOR RESPONSE HELPERS ---
function getSimulatedResponse(msg: string, student: any): string {
  const clean = msg.toLowerCase();
  
  if (clean.includes("dor") || clean.includes("machuquei") || clean.includes("lesão") || clean.includes("lesao") || clean.includes("joelho")) {
    return `Olá ${student.nome}! Identifiquei que você mencionou dor ou desconforto. Como assistente virtual, meu compromisso número um é sua integridade física.

**ATENÇÃO DE SEGURANÇA:**
1. **Pare imediatamente** qualquer exercício que cause ou aumente a dor.
2. Não tente "forçar" ou treinar sob o efeito de analgésicos sem orientação médica.
3. **Restrição no Joelho**: Como você já relatou um leve incômodo no joelho direito, evite agachamentos muito profundos (mantenha ângulo máximo de 90°) e exercícios de alto impacto como saltos temporariamente.
4. **Procure ajuda**: Converse com um dos instrutores da **${db.empresas[0].nome}** ou consulte um fisioterapeuta/médico ortopedista para avaliar se há alguma lesão.

Gostaria de saber se quer que eu sugira exercícios alternativos para membros superiores ou cárdio sem impacto no joelho?`;
  }

  if (clean.includes("anabolizante") || clean.includes("bomba") || clean.includes("esteroide") || clean.includes("trembo")) {
    return `Olá ${student.nome}. Na CA.RO Fitness AI, focamos exclusivamente em metodologias de treino saudáveis, consistência natural, nutrição equilibrada e descanso.

Não recomendo, prescrevo ou encorajo o uso de substâncias controladas, anabolizantes ou hormônios para fins estéticos devido aos graves riscos à saúde cardiovascular, hormonal e hepática. Recomendo focar no seu plano de hipertrofia de forma consistente e com uma rotina nutricional elaborada por um nutricionista credenciado!`;
  }

  if (clean.includes("treino") || clean.includes("fazer hoje") || clean.includes("divisao") || clean.includes("divisão")) {
    return `Olá ${student.nome}! Analisando seu perfil, seu objetivo é **${student.objetivo}** no nível **${student.nivel}** e você treina **${student.frequencia_semanal}x por semana**.

Hoje eu recomendo fazer o **Treino A - Peito, Tríceps & Ombros** ou o **Treino B - Costas & Bíceps**. Isso manterá sua frequência equilibrada e permitirá a recuperação muscular perfeita.

Seu treino atual inclui:
- **Supino Reto com Barra** (Excelente construtor de peitoral)
- **Elevação Lateral** (Foco em deltoides médios para ombros largos)
- **Tríceps Corda** (Foco na porção lateral do tríceps)

Quer que eu detalhe a correta execução ou sugira um aquecimento específico para começar agora?`;
  }

  if (clean.includes("agachar") || clean.includes("agachamento") || clean.includes("como fazer")) {
    return `O **Agachamento Livre** é um dos melhores exercícios para pernas e glúteos! Vamos realizá-lo com segurança absoluta:

1. **Posicionamento da Barra**: Apoie a barra sob o trapézio, nunca diretamente na vértebra cervical.
2. **Largura dos pés**: Afaste os pés na largura dos ombros, apontando ligeiramente para fora (cerca de 15 a 30 graus).
3. **Movimento**: Inicie o agachamento jogando o quadril para trás (como se fosse sentar em uma cadeira), mantendo os joelhos alinhados com as pontas dos pés.
4. **Desconforto no Joelho**: No seu caso, Rony, agache apenas até os coxas ficarem paralelas ao chão (90° de flexão). Não force além disso enquanto sentir sensibilidade.
5. **Retorno**: Empurre o chão com a força de todo o pé, contraindo coxas e glúteos.

Quer que eu substitua o agachamento livre por uma alternativa articulada como o Leg Press hoje?`;
  }

  return `Olá ${student.nome}! Sou o **CA.RO Fitness AI Assistant**. 

Vejo que seu plano ativo é o **${db.planos[1].nome}** e seu foco atual é **${student.objetivo}**. 

Como posso ajudar você hoje? Você pode me perguntar sobre:
1. Explicação ou alternativas para exercícios do seu treino.
2. Sugestão de divisão de treino semanal.
3. Como progredir cargas ou melhorar sua recuperação.
4. Dicas de postura e execução segura para proteger seu joelho direito.`;
}

function getSimulatedWorkoutSuggestion(student: any): string {
  return `### 🏋️ Sugestão de Divisão Semanal de Treino - CA.RO AI

Elaborado para **${student.nome}** (Objetivo: ${student.objetivo} | Nível: ${student.nivel})

Como sua frequência é de **${student.frequencia_semanal}x por semana**, recomendo uma divisão do tipo **AB (Upper / Lower)** ou **ABC (Push / Pull / Legs)** com foco em hipertrofia:

---

#### 📅 Cronograma Sugerido

* **Segunda-feira: Treino A (Membros Superiores - Foco Empurrar)**
  * Supino Reto com Barra — 4 séries x 10 repetições (60s descanso)
  * Desenvolvimento com Halteres — 3 séries x 12 repetições (45s descanso)
  * Tríceps Corda na Polia — 3 séries x 12 repetições (45s descanso)

* **Terça-feira: Treino B (Membros Inferiores & Core - Foco Puxar/Agachar)**
  * Leg Press 45° — 4 séries x 10 repetições (Evita compressão excessiva se houver desconforto leve no joelho)
  * Cadeira Flexora — 4 séries x 12 repetições (45s descanso)
  * Panturrilha Sentado — 3 séries x 15 repetições (45s descanso)
  * Prancha Abdominal — 3 séries x 40 segundos

* **Quarta-feira: Descanso / Cárdio Leve**
  * 30 min de caminhada moderada na esteira para regeneração ativa.

* **Quinta-feira: Treino C (Membros Superiores - Foco Puxar)**
  * Puxada Frontal na Polia — 4 séries x 10-12 repetições (60s descanso)
  * Remada Curvada com Halteres — 3 séries x 12 repetições (45s descanso)
  * Rosca Direta com Halteres — 3 séries x 12 repetições (45s descanso)

* **Sexta-feira: Treino D (Membros Inferiores & Ombros)**
  * Cadeira Extensora — 3 séries x 15 repetições (Aquecimento articular leve)
  * Elevação Lateral com Halteres — 4 séries x 12 repetições
  * Elevação Frontal — 3 séries x 12 repetições
  * Abdominal Infra na Paralela — 3 séries x 15 repetições

* **Sábado e Domingo: Descanso Total**

---

#### ⚠️ Recomendações de Segurança (IA):
- **Atenção ao joelho direito**: Priorize o Leg Press ou agachamento guiado em vez de livre se sentir instabilidade.
- **Aquecimento**: Realize 5 a 10 minutos de cárdio e aquecimento articular leve antes do primeiro exercício.
- **Progressão**: Se as 12 repetições ficarem fáceis com postura perfeita, aumente a carga levemente.`;
}

// --- MASTER ADMIN SaaS STATUS ---
app.get("/api/saas/stats", (req, res) => {
  res.json({
    totalGyms: db.empresas.length,
    activeGyms: db.empresas.filter(e => e.status === "ativo").length,
    blockedGyms: db.empresas.filter(e => e.status === "bloqueado").length,
    totalStudents: db.alunos.length,
    aiRequestsThisMonth: db.ia_logs.length,
    subscriptionRevenue: db.empresas.length * 499.00,
    gyms: db.empresas,
    logs: db.ia_logs
  });
});

app.post("/api/saas/gyms", (req, res) => {
  const { nome, email, telefone, plano_saas, limite_alunos, limite_ia_mensal } = req.body;
  const newGym = {
    id: `emp_${Date.now()}`,
    nome,
    email,
    telefone,
    status: "ativo",
    plano_saas: plano_saas || "SaaS Pro",
    limite_alunos: Number(limite_alunos) || 300,
    limite_ia_mensal: Number(limite_ia_mensal) || 1000,
    created_at: new Date().toISOString()
  };
  db.empresas.push(newGym);
  res.json({ status: "success", gym: newGym });
});

app.post("/api/saas/gyms/:id/toggle-status", (req, res) => {
  const { id } = req.params;
  const idx = db.empresas.findIndex(e => e.id === id);
  if (idx !== -1) {
    db.empresas[idx].status = db.empresas[idx].status === "ativo" ? "bloqueado" : "ativo";
    return res.json({ status: "success", gym: db.empresas[idx] });
  }
  res.status(404).json({ status: "error", message: "Academia não encontrada" });
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
