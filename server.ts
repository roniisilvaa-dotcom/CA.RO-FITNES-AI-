import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { dbService, setupDatabase } from "./dbService";

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

// --- AUTH ROUTE ---
app.post("/api/auth/login", async (req, res) => {
  const { email, password, role } = req.body;
  
  if (role === "academia" || role === "master") {
    const user = await dbService.findUsuario(email, role);
    if (user) {
      return res.json({ status: "success", user });
    }
  } else {
    // Check if it matches an email of a student
    const student = await dbService.findAlunoByEmail(email);
    if (student) {
      return res.json({ status: "success", user: { ...student, role: "aluno" } });
    }
  }
  return res.status(401).json({ status: "error", message: "Credenciais inválidas ou papel não encontrado." });
});

app.post("/api/auth/register", async (req, res) => {
  const { nome, email, telefone, altura, peso, objetivo, nivel, frequencia_semanal } = req.body;
  
  const existing = await dbService.findAlunoByEmail(email);
  if (existing) {
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

  await dbService.addAluno(newStudent);

  // Give them A/B Workout automatically
  const workoutA = { id: `tre_${newStudent.id}_a`, empresa_id: "emp_1", aluno_id: newStudent.id, nome: "Treino A - Peito, Tríceps e Abdômen", objetivo: newStudent.objetivo, nivel: newStudent.nivel, frequencia: "A / B", status: "ativo" };
  const workoutB = { id: `tre_${newStudent.id}_b`, empresa_id: "emp_1", aluno_id: newStudent.id, nome: "Treino B - Costas, Bíceps e Pernas", objetivo: newStudent.objetivo, nivel: newStudent.nivel, frequencia: "A / B", status: "ativo" };
  
  await dbService.addTreino(workoutA);
  await dbService.addTreino(workoutB);

  // Link exercises
  await dbService.addTreinoExercicio({ id: `te_${Date.now()}_1`, treino_id: workoutA.id, exercicio_id: "exe_supino", series: 3, repeticoes: "12", carga: "20kg", descanso: "60s", observacoes: "Manter postura.", ordem: 1 });
  await dbService.addTreinoExercicio({ id: `te_${Date.now()}_2`, treino_id: workoutA.id, exercicio_id: "exe_triceps", series: 3, repeticoes: "15", carga: "15kg", descanso: "45s", observacoes: "Cotovelos fechados.", ordem: 2 });
  await dbService.addTreinoExercicio({ id: `te_${Date.now()}_3`, treino_id: workoutB.id, exercicio_id: "exe_puxada", series: 3, repeticoes: "12", carga: "30kg", descanso: "60s", observacoes: "Contrair dorsais.", ordem: 1 });
  await dbService.addTreinoExercicio({ id: `te_${Date.now()}_4`, treino_id: workoutB.id, exercicio_id: "exe_agachamento", series: 3, repeticoes: "12", carga: "Sem peso", descanso: "60s", observacoes: "Focar na técnica.", ordem: 2 });

  // Add welcome notification
  await dbService.addNotificacao({
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
app.get("/api/students", async (req, res) => {
  const list = await dbService.getAlunos();
  res.json(list);
});

app.post("/api/students", async (req, res) => {
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
    status: "ativo",
    plano_id: data.plano_id || "pla_1"
  };

  await dbService.addAluno(newStudent);
  res.json({ status: "success", student: newStudent });
});

app.put("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  const updated = await dbService.updateAluno(id, req.body);
  if (updated) {
    return res.json({ status: "success", student: updated });
  }
  res.status(404).json({ status: "error", message: "Aluno não encontrado" });
});

app.delete("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  await dbService.deleteAluno(id);
  res.json({ status: "success" });
});

app.get("/api/students/:id/workouts", async (req, res) => {
  const { id } = req.params;
  const workouts = await dbService.getTreinos(id);
  const result = [];
  
  for (const w of workouts) {
    const tes = await dbService.getTreinoExercicios(w.id);
    const exercisesEnriched = [];
    for (const te of tes) {
      const exe = await dbService.getExercicioById(te.exercicio_id);
      exercisesEnriched.push({ ...te, exercicio: exe });
    }
    result.push({ ...w, exercicios: exercisesEnriched });
  }
  res.json(result);
});

// --- WORKOUTS CRUD ---
app.get("/api/workouts", async (req, res) => {
  const list = await dbService.getTreinos();
  res.json(list);
});

app.post("/api/workouts", async (req, res) => {
  const { aluno_id, nome, objetivo, nivel, frequencia, exercicios } = req.body;
  const newWorkout = {
    id: `tre_${Date.now()}`,
    empresa_id: "emp_1",
    aluno_id,
    nome,
    objetivo: objetivo || "Hipertrofia",
    nivel: nivel || "Iniciante",
    frequencia: frequencia || "A / B",
    status: "ativo"
  };

  await dbService.addTreino(newWorkout);

  if (Array.isArray(exercicios)) {
    for (let i = 0; i < exercicios.length; i++) {
      const exe = exercicios[i];
      await dbService.addTreinoExercicio({
        id: `te_${Date.now()}_${i}`,
        treino_id: newWorkout.id,
        exercicio_id: exe.exercicio_id,
        series: Number(exe.series) || 3,
        repeticoes: exe.repeticoes || "10",
        carga: exe.carga || "10kg",
        descanso: exe.descanso || "60s",
        observacoes: exe.observacoes || "",
        ordem: i + 1
      });
    }
  }

  res.json({ status: "success", workout: newWorkout });
});

app.delete("/api/workouts/:id", async (req, res) => {
  const { id } = req.params;
  await dbService.deleteTreino(id);
  res.json({ status: "success" });
});

// --- EXERCISES CRUD ---
app.get("/api/exercises", async (req, res) => {
  const list = await dbService.getExercicios();
  res.json(list);
});

app.post("/api/exercises", async (req, res) => {
  const data = req.body;
  const newExe = {
    id: `exe_${Date.now()}`,
    empresa_id: "emp_1",
    nome: data.nome,
    grupo_muscular: data.grupo_muscular || "Geral",
    instrucoes: data.instrucoes || "",
    erros_comuns: data.erros_comuns || "",
    cuidados: data.cuidados || "",
    midia_url: data.midia_url || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop",
    nivel: data.nivel || "Iniciante"
  };

  await dbService.addExercicio(newExe);
  res.json({ status: "success", exercise: newExe });
});

app.put("/api/exercises/:id", async (req, res) => {
  const { id } = req.params;
  const updated = await dbService.updateExercicio(id, req.body);
  if (updated) {
    return res.json({ status: "success", exercise: updated });
  }
  res.status(404).json({ status: "error", message: "Exercício não encontrado" });
});

app.delete("/api/exercises/:id", async (req, res) => {
  const { id } = req.params;
  await dbService.deleteExercicio(id);
  res.json({ status: "success" });
});

// --- CLASSES & BOOKINGS ---
app.get("/api/classes", async (req, res) => {
  const { studentId } = req.query;
  const sId = studentId ? String(studentId) : undefined;
  
  const classes = await dbService.getAulas();
  const enrichedClasses = [];
  
  for (const c of classes) {
    const totalBooked = await dbService.countAgendamentosByAula(c.id);
    const isBooked = sId ? await dbService.isAulaBookedByAluno(c.id, sId) : false;
    enrichedClasses.push({
      ...c,
      vagas_restantes: Math.max(0, c.vagas - totalBooked),
      agendado: isBooked
    });
  }
  res.json(enrichedClasses);
});

app.post("/api/classes", async (req, res) => {
  const { nome, professor, data_hora, vagas } = req.body;
  const newClass = {
    id: `aul_${Date.now()}`,
    unidade_id: "uni_1",
    nome,
    professor: professor || "Instrutor",
    data_hora,
    vagas: Number(vagas) || 20,
    status: "ativo"
  };

  await dbService.addAula(newClass);
  res.json({ status: "success", class: newClass });
});

app.post("/api/classes/:id/book", async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  const existing = await dbService.getAgendamento(id, studentId);
  if (existing) {
    return res.status(400).json({ status: "error", message: "Você já está agendado nesta aula." });
  }

  const newBooking = {
    id: `age_${Date.now()}`,
    aula_id: id,
    aluno_id: studentId,
    status: "confirmado"
  };

  await dbService.addAgendamento(newBooking);

  // Send Notification
  await dbService.addNotificacao({
    id: `not_${Date.now()}`,
    empresa_id: "emp_1",
    aluno_id: studentId,
    titulo: "Agendamento Realizado",
    mensagem: `Sua vaga para a aula foi garantida com sucesso!`,
    tipo: "comunicado",
    status: "nao_lida"
  });

  res.json({ status: "success" });
});

app.post("/api/classes/:id/cancel", async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  await dbService.cancelAgendamento(id, studentId);
  res.json({ status: "success" });
});

// --- NOTIFICATIONS ---
app.get("/api/notifications", async (req, res) => {
  const { studentId } = req.query;
  const list = await dbService.getNotificacoes(studentId ? String(studentId) : undefined);
  res.json(list);
});

app.post("/api/notifications", async (req, res) => {
  const { aluno_id, titulo, mensagem, tipo } = req.body;
  const newNot = {
    id: `not_${Date.now()}`,
    empresa_id: "emp_1",
    aluno_id,
    titulo,
    mensagem,
    tipo: tipo || "alerta",
    status: "nao_lida"
  };
  await dbService.addNotificacao(newNot);
  res.json({ status: "success", notification: newNot });
});

app.post("/api/notifications/read-all", async (req, res) => {
  const { studentId } = req.body;
  await dbService.markNotificacoesLidas(studentId);
  res.json({ status: "success" });
});

// --- PRESENCE ---
app.get("/api/presences", async (req, res) => {
  const { studentId } = req.query;
  const list = await dbService.getPresencas(studentId ? String(studentId) : undefined);
  res.json(list);
});

app.post("/api/presences", async (req, res) => {
  const { studentId } = req.body;
  const student = await dbService.getAlunoById(studentId);
  
  if (!student) return res.status(404).json({ status: "error", message: "Aluno não encontrado" });

  const newPresence = {
    id: `pre_${Date.now()}`,
    aluno_id: studentId,
    unidade_id: student.unidade_id || "uni_1",
    entrada_at: new Date().toISOString(),
    saida_at: new Date(Date.now() + 75 * 60000).toISOString(),
    metodo: "QR Code - Catraca Virtual",
    status: "concluido"
  };

  await dbService.addPresenca(newPresence);
  res.json({ status: "success", presence: newPresence });
});

// --- PROGRESS ---
app.get("/api/progress", async (req, res) => {
  const { studentId } = req.query;
  const list = await dbService.getEvolucoes(studentId ? String(studentId) : undefined);
  res.json(list);
});

app.post("/api/progress", async (req, res) => {
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

  await dbService.addEvolucao(newProgress);
  await dbService.updateAluno(studentId, { peso: Number(peso) });

  res.json({ status: "success", progress: newProgress });
});

// --- REAL GEMINI CHAT ENGINE WITH FALLBACK ---
app.get("/api/ai/conversations", async (req, res) => {
  const { studentId } = req.query;
  const list = await dbService.getConversas(studentId ? String(studentId) : undefined);
  res.json(list);
});

app.get("/api/ai/conversations/:id", async (req, res) => {
  const { id } = req.params;
  const list = await dbService.getMensagens(id);
  res.json(list);
});

app.post("/api/ai/chat", async (req, res) => {
  const { studentId, conversationId, message } = req.body;
  
  const student = await dbService.getAlunoById(studentId);
  if (!student) return res.status(404).json({ status: "error", message: "Aluno não encontrado." });

  let convId = conversationId;
  if (!convId) {
    convId = `con_${Date.now()}`;
    await dbService.addConversa({
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
  await dbService.addMensagem(userMsg);

  // Retrieve last 6 messages for context
  const messagesList = await dbService.getMensagens(convId);
  const previousMessages = messagesList.slice(-6);

  // Build AI context
  const workouts = await dbService.getTreinos(studentId);
  const workoutDetailsArr = [];
  for (const t of workouts) {
    const tes = await dbService.getTreinoExercicios(t.id);
    const exes = [];
    for (const te of tes) {
      const exe = await dbService.getExercicioById(te.exercicio_id);
      exes.push(`${exe?.nome || 'Exercício'}: ${te.series} séries x ${te.repeticoes} reps (${te.carga})`);
    }
    workoutDetailsArr.push(`- ${t.nome}: [${exes.join(", ")}]`);
  }
  const workoutDetails = workoutDetailsArr.join("\n");

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
      responseText = await getSimulatedResponse(message, student);
    }
  } else {
    responseText = await getSimulatedResponse(message, student);
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
  await dbService.addMensagem(aiMsg);

  // Log in AI Analytics
  await dbService.addIaLog({
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
  const student = await dbService.getAlunoById(studentId);
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
  const student = await dbService.getAlunoById(studentId);
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
async function getSimulatedResponse(msg: string, student: any): Promise<string> {
  const clean = msg.toLowerCase();
  const gyms = await dbService.getEmpresas();
  const gymName = gyms[0]?.nome || "CA.RO Alpha Gym";
  
  if (clean.includes("dor") || clean.includes("machuquei") || clean.includes("lesão") || clean.includes("lesao") || clean.includes("joelho")) {
    return `Olá ${student.nome}! Identifiquei que você mencionou dor ou desconforto. Como assistente virtual, meu compromisso número um é sua integridade física.

**ATENÇÃO DE SEGURANÇA:**
1. **Pare imediatamente** qualquer exercício que cause ou aumente a dor.
2. Não tente "forçar" ou treinar sob o efeito de analgésicos sem orientação médica.
3. **Restrição no Joelho**: Como você já relatou um leve incômodo no joelho direito, evite agachamentos muito profundos (mantenha ângulo máximo de 90°) e exercícios de alto impacto como saltos temporariamente.
4. **Procure ajuda**: Converse com um dos instrutores da **${gymName}** ou consulte um fisioterapeuta/médico ortopedista para avaliar se há alguma lesão.

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

Vejo que seu plano ativo é o **Plano Black VIP Anual** e seu foco atual é **${student.objetivo}**. 

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
app.get("/api/saas/stats", async (req, res) => {
  const gyms = await dbService.getEmpresas();
  const students = await dbService.getAlunos();
  const logs = await dbService.getIaLogs();
  
  res.json({
    totalGyms: gyms.length,
    activeGyms: gyms.filter(e => e.status === "ativo").length,
    blockedGyms: gyms.filter(e => e.status === "bloqueado").length,
    totalStudents: students.length,
    aiRequestsThisMonth: logs.length,
    subscriptionRevenue: gyms.length * 499.00,
    gyms: gyms,
    logs: logs
  });
});

app.post("/api/saas/gyms", async (req, res) => {
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
  await dbService.addEmpresa(newGym);
  res.json({ status: "success", gym: newGym });
});

app.post("/api/saas/gyms/:id/toggle-status", async (req, res) => {
  const { id } = req.params;
  const gym = await dbService.toggleEmpresaStatus(id);
  if (gym) {
    return res.json({ status: "success", gym });
  }
  res.status(404).json({ status: "error", message: "Academia não encontrada" });
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  // Always run database setup/migrations first
  await setupDatabase();

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

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

// Export app for Vercel Serverless integration
export default app;

if (!process.env.VERCEL) {
  startServer();
} else {
  // On serverless init
  setupDatabase().catch(err => console.error("Serverless DB init error:", err));
}
