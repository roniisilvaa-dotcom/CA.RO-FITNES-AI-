import { Pool } from "pg";
import path from "path";
import fs from "fs";

// Mock Database State (in-memory fallback)
let mockDb: any = {
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
    { id: "exe_triceps", empresa_id: "emp_1", nome: "Tríceps Corda na Polia", grupo_muscular: "Tríceps", instrucoes: "De frente para o cabo, segure as pontas da corda. Mantendo os cotovelos fixos ao lado do corpo, empurde a corda para baixo abrindo as mãos no final do movimento.", erros_comuns: "Mover os cotovelos para frente e para trás, curvar os ombros.", cuidados: "Mantenha a postura ereta e os punhos firmes.", midia_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop", nivel: "Iniciante" },
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

// PostgreSQL Connection
let pool: Pool | null = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log("Connected to Neon PostgreSQL database.");
}

async function executeQuery<T>(text: string, params: any[] = []): Promise<T[]> {
  if (pool) {
    const res = await pool.query(text, params);
    return res.rows;
  }
  return [];
}

export async function setupDatabase() {
  if (!pool) return;
  try {
    const schemaPath = path.join(process.cwd(), "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf-8");
      await pool.query(sql);
      console.log("Neon database schema initialized successfully.");
    }
  } catch (error) {
    console.error("Failed to setup Neon database schema:", error);
  }
}

export const dbService = {
  // Auth
  findUsuario: async (email: string, role: string) => {
    if (pool) {
      const users = await executeQuery<any>("SELECT * FROM usuarios WHERE email = $1 AND role = $2", [email, role]);
      return users[0] || null;
    }
    return mockDb.usuarios.find((u: any) => u.email === email && u.role === role) || null;
  },
  findAlunoByEmail: async (email: string) => {
    if (pool) {
      const students = await executeQuery<any>("SELECT * FROM alunos WHERE email = $1", [email]);
      return students[0] || null;
    }
    return mockDb.alunos.find((a: any) => a.email === email) || null;
  },

  // Students
  getAlunos: async () => {
    if (pool) return await executeQuery<any>("SELECT * FROM alunos");
    return mockDb.alunos;
  },
  getAlunoById: async (id: string) => {
    if (pool) {
      const list = await executeQuery<any>("SELECT * FROM alunos WHERE id = $1", [id]);
      return list[0] || null;
    }
    return mockDb.alunos.find((a: any) => a.id === id) || null;
  },
  addAluno: async (aluno: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO alunos (id, empresa_id, unidade_id, nome, email, telefone, foto_url, data_nascimento, altura, peso, objetivo, nivel, frequencia_semanal, restricoes, status, plano_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [aluno.id, aluno.empresa_id, aluno.unidade_id, aluno.nome, aluno.email, aluno.telefone, aluno.foto_url, aluno.data_nascimento, aluno.altura, aluno.peso, aluno.objetivo, aluno.nivel, aluno.frequencia_semanal, aluno.restricoes, aluno.status, aluno.plano_id]
      );
    } else {
      mockDb.alunos.push(aluno);
    }
  },
  updateAluno: async (id: string, data: any) => {
    if (pool) {
      const fields = Object.keys(data).filter(k => k !== 'id');
      const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
      const values = fields.map(f => data[f]);
      await executeQuery(`UPDATE alunos SET ${setClause} WHERE id = $1`, [id, ...values]);
      return await dbService.getAlunoById(id);
    } else {
      const idx = mockDb.alunos.findIndex((a: any) => a.id === id);
      if (idx !== -1) {
        mockDb.alunos[idx] = { ...mockDb.alunos[idx], ...data };
        return mockDb.alunos[idx];
      }
      return null;
    }
  },
  deleteAluno: async (id: string) => {
    if (pool) {
      await executeQuery("DELETE FROM alunos WHERE id = $1", [id]);
    } else {
      mockDb.alunos = mockDb.alunos.filter((a: any) => a.id !== id);
    }
  },

  // Workouts
  getTreinos: async (alunoId?: string) => {
    if (pool) {
      if (alunoId) return await executeQuery<any>("SELECT * FROM treinos WHERE aluno_id = $1", [alunoId]);
      return await executeQuery<any>("SELECT * FROM treinos");
    }
    if (alunoId) return mockDb.treinos.filter((t: any) => t.aluno_id === alunoId);
    return mockDb.treinos;
  },
  addTreino: async (treino: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO treinos (id, empresa_id, aluno_id, nome, objetivo, nivel, frequencia, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [treino.id, treino.empresa_id, treino.aluno_id, treino.nome, treino.objetivo, treino.nivel, treino.frequencia, treino.status]
      );
    } else {
      mockDb.treinos.push(treino);
    }
  },
  deleteTreino: async (id: string) => {
    if (pool) {
      await executeQuery("DELETE FROM treinos WHERE id = $1", [id]);
    } else {
      mockDb.treinos = mockDb.treinos.filter((t: any) => t.id !== id);
      mockDb.treino_exercicios = mockDb.treino_exercicios.filter((te: any) => te.treino_id !== id);
    }
  },

  // Workout Exercises
  getTreinoExercicios: async (treinoId: string) => {
    if (pool) {
      return await executeQuery<any>("SELECT * FROM treino_exercicios WHERE treino_id = $1 ORDER BY ordem ASC", [treinoId]);
    }
    return mockDb.treino_exercicios.filter((te: any) => te.treino_id === treinoId);
  },
  addTreinoExercicio: async (te: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO treino_exercicios (id, treino_id, exercicio_id, series, repeticoes, carga, descanso, observacoes, ordem)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [te.id, te.treino_id, te.exercicio_id, te.series, te.repeticoes, te.carga, te.descanso, te.observacoes, te.ordem]
      );
    } else {
      mockDb.treino_exercicios.push(te);
    }
  },

  // Exercises
  getExercicios: async () => {
    if (pool) return await executeQuery<any>("SELECT * FROM exercicios");
    return mockDb.exercicios;
  },
  getExercicioById: async (id: string) => {
    if (pool) {
      const list = await executeQuery<any>("SELECT * FROM exercicios WHERE id = $1", [id]);
      return list[0] || null;
    }
    return mockDb.exercicios.find((e: any) => e.id === id) || null;
  },
  addExercicio: async (exe: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO exercicios (id, empresa_id, nome, grupo_muscular, instrucoes, erros_comuns, cuidados, midia_url, nivel)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [exe.id, exe.empresa_id, exe.nome, exe.grupo_muscular, exe.instrucoes, exe.erros_comuns, exe.cuidados, exe.midia_url, exe.nivel]
      );
    } else {
      mockDb.exercicios.push(exe);
    }
  },
  updateExercicio: async (id: string, data: any) => {
    if (pool) {
      const fields = Object.keys(data).filter(k => k !== 'id');
      const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
      const values = fields.map(f => data[f]);
      await executeQuery(`UPDATE exercicios SET ${setClause} WHERE id = $1`, [id, ...values]);
      return await dbService.getExercicioById(id);
    } else {
      const idx = mockDb.exercicios.findIndex((e: any) => e.id === id);
      if (idx !== -1) {
        mockDb.exercicios[idx] = { ...mockDb.exercicios[idx], ...data };
        return mockDb.exercicios[idx];
      }
      return null;
    }
  },
  deleteExercicio: async (id: string) => {
    if (pool) {
      await executeQuery("DELETE FROM exercicios WHERE id = $1", [id]);
    } else {
      mockDb.exercicios = mockDb.exercicios.filter((e: any) => e.id !== id);
    }
  },

  // Classes / Bookings
  getAulas: async () => {
    if (pool) return await executeQuery<any>("SELECT * FROM aulas");
    return mockDb.aulas;
  },
  addAula: async (aula: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO aulas (id, unidade_id, nome, professor, data_hora, vagas, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [aula.id, aula.unidade_id, aula.nome, aula.professor, aula.data_hora, aula.vagas, aula.status]
      );
    } else {
      mockDb.aulas.push(aula);
    }
  },
  getAgendamento: async (aulaId: string, alunoId: string) => {
    if (pool) {
      const list = await executeQuery<any>("SELECT * FROM agendamentos WHERE aula_id = $1 AND aluno_id = $2", [aulaId, alunoId]);
      return list[0] || null;
    }
    return mockDb.agendamentos.find((a: any) => a.aula_id === aulaId && a.aluno_id === alunoId) || null;
  },
  countAgendamentosByAula: async (aulaId: string) => {
    if (pool) {
      const countRes = await executeQuery<any>("SELECT COUNT(*) as count FROM agendamentos WHERE aula_id = $1 AND status = 'confirmado'", [aulaId]);
      return Number(countRes[0]?.count || 0);
    }
    return mockDb.agendamentos.filter((a: any) => a.aula_id === aulaId && a.status === "confirmado").length;
  },
  isAulaBookedByAluno: async (aulaId: string, alunoId: string) => {
    if (pool) {
      const list = await executeQuery<any>("SELECT 1 FROM agendamentos WHERE aula_id = $1 AND aluno_id = $2 AND status = 'confirmado'", [aulaId, alunoId]);
      return list.length > 0;
    }
    return mockDb.agendamentos.some((a: any) => a.aula_id === aulaId && a.aluno_id === alunoId && a.status === "confirmado");
  },
  addAgendamento: async (age: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO agendamentos (id, aula_id, aluno_id, status)
         VALUES ($1, $2, $3, $4)`,
        [age.id, age.aula_id, age.aluno_id, age.status]
      );
    } else {
      mockDb.agendamentos.push(age);
    }
  },
  cancelAgendamento: async (aulaId: string, alunoId: string) => {
    if (pool) {
      await executeQuery("DELETE FROM agendamentos WHERE aula_id = $1 AND aluno_id = $2", [aulaId, alunoId]);
    } else {
      mockDb.agendamentos = mockDb.agendamentos.filter((a: any) => !(a.aula_id === aulaId && a.aluno_id === alunoId));
    }
  },

  // Notifications
  getNotificacoes: async (alunoId?: string) => {
    if (pool) {
      if (alunoId) return await executeQuery<any>("SELECT * FROM notificacoes WHERE aluno_id = $1", [alunoId]);
      return await executeQuery<any>("SELECT * FROM notificacoes");
    }
    if (alunoId) return mockDb.notificacoes.filter((n: any) => n.aluno_id === alunoId);
    return mockDb.notificacoes;
  },
  addNotificacao: async (not: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO notificacoes (id, empresa_id, aluno_id, titulo, mensagem, tipo, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [not.id, not.empresa_id, not.aluno_id, not.titulo, not.mensagem, not.tipo, not.status]
      );
    } else {
      mockDb.notificacoes.push(not);
    }
  },
  markNotificacoesLidas: async (alunoId: string) => {
    if (pool) {
      await executeQuery("UPDATE notificacoes SET status = 'lida' WHERE aluno_id = $1", [alunoId]);
    } else {
      mockDb.notificacoes = mockDb.notificacoes.map((n: any) => n.aluno_id === alunoId ? { ...n, status: "lida" } : n);
    }
  },

  // Presences (QR checkins)
  getPresencas: async (alunoId?: string) => {
    if (pool) {
      if (alunoId) return await executeQuery<any>("SELECT * FROM presencas WHERE aluno_id = $1", [alunoId]);
      return await executeQuery<any>("SELECT * FROM presencas");
    }
    if (alunoId) return mockDb.presencas.filter((p: any) => p.aluno_id === alunoId);
    return mockDb.presencas;
  },
  addPresenca: async (presence: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO presencas (id, aluno_id, unidade_id, entrada_at, saida_at, metodo, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [presence.id, presence.aluno_id, presence.unidade_id, presence.entrada_at, presence.saida_at, presence.metodo, presence.status]
      );
    } else {
      mockDb.presencas.push(presence);
    }
  },

  // Progress (Medidas / Evolucoes)
  getEvolucoes: async (alunoId?: string) => {
    if (pool) {
      if (alunoId) return await executeQuery<any>("SELECT * FROM evolucoes WHERE aluno_id = $1 ORDER BY created_at ASC", [alunoId]);
      return await executeQuery<any>("SELECT * FROM evolucoes ORDER BY created_at ASC");
    }
    const list = alunoId ? mockDb.evolucoes.filter((e: any) => e.aluno_id === alunoId) : mockDb.evolucoes;
    return list.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },
  addEvolucao: async (evo: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO evolucoes (id, aluno_id, peso, medidas, foto_url, observacoes, created_at)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
        [evo.id, evo.aluno_id, evo.peso, JSON.stringify(evo.medidas), evo.foto_url, evo.observacoes, evo.created_at]
      );
    } else {
      mockDb.evolucoes.push(evo);
    }
  },

  // AI Chat & Logs
  getConversas: async (alunoId?: string) => {
    if (pool) {
      if (alunoId) return await executeQuery<any>("SELECT * FROM ia_conversas WHERE aluno_id = $1", [alunoId]);
      return await executeQuery<any>("SELECT * FROM ia_conversas");
    }
    if (alunoId) return mockDb.ia_conversas.filter((c: any) => c.aluno_id === alunoId);
    return mockDb.ia_conversas;
  },
  getMensagens: async (conversaId: string) => {
    if (pool) {
      return await executeQuery<any>("SELECT * FROM ia_mensagens WHERE conversa_id = $1 ORDER BY created_at ASC", [conversaId]);
    }
    return mockDb.ia_mensagens.filter((m: any) => m.conversa_id === conversaId);
  },
  addConversa: async (c: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO ia_conversas (id, aluno_id, titulo, created_at)
         VALUES ($1, $2, $3, $4)`,
        [c.id, c.aluno_id, c.titulo, c.created_at]
      );
    } else {
      mockDb.ia_conversas.push(c);
    }
  },
  addMensagem: async (m: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO ia_mensagens (id, conversa_id, role, conteudo, intencao, tokens, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [m.id, m.conversa_id, m.role, m.conteudo, m.intencao, m.tokens, m.created_at]
      );
    } else {
      mockDb.ia_mensagens.push(m);
    }
  },
  getIaLogs: async () => {
    if (pool) return await executeQuery<any>("SELECT * FROM ia_logs");
    return mockDb.ia_logs;
  },
  addIaLog: async (log: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO ia_logs (id, empresa_id, aluno_id, provider, modelo, tokens_input, tokens_output, custo_estimado, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [log.id, log.empresa_id, log.aluno_id, log.provider, log.modelo, log.tokens_input, log.tokens_output, log.custo_estimado, log.created_at]
      );
    } else {
      mockDb.ia_logs.push(log);
    }
  },

  // SaaS Portal
  getEmpresas: async () => {
    if (pool) return await executeQuery<any>("SELECT * FROM empresas");
    return mockDb.empresas;
  },
  addEmpresa: async (gym: any) => {
    if (pool) {
      await executeQuery(
        `INSERT INTO empresas (id, nome, email, telefone, status, plano_saas, limite_alunos, limite_ia_mensal, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [gym.id, gym.nome, gym.email, gym.telefone, gym.status, gym.plano_saas, gym.limite_alunos, gym.limite_ia_mensal, gym.created_at]
      );
    } else {
      mockDb.empresas.push(gym);
    }
  },
  toggleEmpresaStatus: async (id: string) => {
    if (pool) {
      const list = await executeQuery<any>("SELECT status FROM empresas WHERE id = $1", [id]);
      if (list.length > 0) {
        const newStatus = list[0].status === "ativo" ? "bloqueado" : "ativo";
        await executeQuery("UPDATE empresas SET status = $1 WHERE id = $2", [newStatus, id]);
        const updated = await executeQuery<any>("SELECT * FROM empresas WHERE id = $1", [id]);
        return updated[0];
      }
      return null;
    } else {
      const idx = mockDb.empresas.findIndex((e: any) => e.id === id);
      if (idx !== -1) {
        mockDb.empresas[idx].status = mockDb.empresas[idx].status === "ativo" ? "bloqueado" : "ativo";
        return mockDb.empresas[idx];
      }
      return null;
    }
  }
};
