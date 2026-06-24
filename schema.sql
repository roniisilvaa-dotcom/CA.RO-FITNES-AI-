-- Database Schema for CA.RO Fitness AI MVP

-- 1. Empresas
CREATE TABLE IF NOT EXISTS empresas (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'ativo',
    plano_saas VARCHAR(50) DEFAULT 'SaaS Pro',
    limite_alunos INTEGER DEFAULT 300,
    limite_ia_mensal INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Unidades
CREATE TABLE IF NOT EXISTS unidades (
    id VARCHAR(50) PRIMARY KEY,
    empresa_id VARCHAR(50) REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    endereco TEXT,
    status VARCHAR(20) DEFAULT 'ativo'
);

-- 3. Usuarios (Painel Admin/Profissionais)
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(50) PRIMARY KEY,
    empresa_id VARCHAR(50) REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'academia' | 'master'
    status VARCHAR(20) DEFAULT 'ativo'
);

-- 4. Planos
CREATE TABLE IF NOT EXISTS planos (
    id VARCHAR(50) PRIMARY KEY,
    empresa_id VARCHAR(50) REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    duracao_dias INTEGER NOT NULL,
    beneficios TEXT,
    status VARCHAR(20) DEFAULT 'ativo'
);

-- 5. Alunos
CREATE TABLE IF NOT EXISTS alunos (
    id VARCHAR(50) PRIMARY KEY,
    empresa_id VARCHAR(50) REFERENCES empresas(id) ON DELETE CASCADE,
    unidade_id VARCHAR(50) REFERENCES unidades(id) ON DELETE SET NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(30),
    foto_url TEXT,
    data_nascimento DATE,
    altura NUMERIC(5, 2),
    peso NUMERIC(5, 2),
    objetivo VARCHAR(50),
    nivel VARCHAR(50),
    frequencia_semanal INTEGER,
    restricoes TEXT,
    status VARCHAR(20) DEFAULT 'ativo',
    plano_id VARCHAR(50) REFERENCES planos(id) ON DELETE SET NULL
);

-- 6. Exercicios
CREATE TABLE IF NOT EXISTS exercicios (
    id VARCHAR(50) PRIMARY KEY,
    empresa_id VARCHAR(50) REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    grupo_muscular VARCHAR(50),
    instrucoes TEXT,
    erros_comuns TEXT,
    cuidados TEXT,
    midia_url TEXT,
    nivel VARCHAR(50)
);

-- 7. Treinos
CREATE TABLE IF NOT EXISTS treinos (
    id VARCHAR(50) PRIMARY KEY,
    empresa_id VARCHAR(50) REFERENCES empresas(id) ON DELETE CASCADE,
    aluno_id VARCHAR(50) REFERENCES alunos(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    objetivo VARCHAR(50),
    nivel VARCHAR(50),
    frequencia VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ativo'
);

-- 8. Treino Exercicios (Pivot/Details)
CREATE TABLE IF NOT EXISTS treino_exercicios (
    id VARCHAR(50) PRIMARY KEY,
    treino_id VARCHAR(50) REFERENCES treinos(id) ON DELETE CASCADE,
    exercicio_id VARCHAR(50) REFERENCES exercicios(id) ON DELETE CASCADE,
    series INTEGER,
    repeticoes VARCHAR(30),
    carga VARCHAR(30),
    descanso VARCHAR(30),
    observacoes TEXT,
    ordem INTEGER
);

-- 9. Aulas
CREATE TABLE IF NOT EXISTS aulas (
    id VARCHAR(50) PRIMARY KEY,
    unidade_id VARCHAR(50) REFERENCES unidades(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    professor VARCHAR(100),
    data_hora TIMESTAMP NOT NULL,
    vagas INTEGER DEFAULT 20,
    status VARCHAR(20) DEFAULT 'ativo'
);

-- 10. Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id VARCHAR(50) PRIMARY KEY,
    aula_id VARCHAR(50) REFERENCES aulas(id) ON DELETE CASCADE,
    aluno_id VARCHAR(50) REFERENCES alunos(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'confirmado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Notificacoes
CREATE TABLE IF NOT EXISTS notificacoes (
    id VARCHAR(50) PRIMARY KEY,
    empresa_id VARCHAR(50) REFERENCES empresas(id) ON DELETE CASCADE,
    aluno_id VARCHAR(50) REFERENCES alunos(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'alerta',
    status VARCHAR(20) DEFAULT 'nao_lida',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Presenças (Log Catraca)
CREATE TABLE IF NOT EXISTS presencas (
    id VARCHAR(50) PRIMARY KEY,
    aluno_id VARCHAR(50) REFERENCES alunos(id) ON DELETE CASCADE,
    unidade_id VARCHAR(50) REFERENCES unidades(id) ON DELETE CASCADE,
    entrada_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    saida_at TIMESTAMP,
    metodo VARCHAR(50) DEFAULT 'QR Code - Catraca Virtual',
    status VARCHAR(20) DEFAULT 'concluido'
);

-- 13. Evolucoes (Medidas corporais)
CREATE TABLE IF NOT EXISTS evolucoes (
    id VARCHAR(50) PRIMARY KEY,
    aluno_id VARCHAR(50) REFERENCES alunos(id) ON DELETE CASCADE,
    peso NUMERIC(5, 2),
    medidas JSONB,
    foto_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Conversas da IA
CREATE TABLE IF NOT EXISTS ia_conversas (
    id VARCHAR(50) PRIMARY KEY,
    aluno_id VARCHAR(50) REFERENCES alunos(id) ON DELETE CASCADE,
    titulo VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Mensagens da IA
CREATE TABLE IF NOT EXISTS ia_mensagens (
    id VARCHAR(50) PRIMARY KEY,
    conversa_id VARCHAR(50) REFERENCES ia_conversas(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' | 'assistant'
    conteudo TEXT NOT NULL,
    intencao VARCHAR(50),
    tokens INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Logs de requisição de IA (Auditabilidade)
CREATE TABLE IF NOT EXISTS ia_logs (
    id VARCHAR(50) PRIMARY KEY,
    empresa_id VARCHAR(50) REFERENCES empresas(id) ON DELETE CASCADE,
    aluno_id VARCHAR(50) REFERENCES alunos(id) ON DELETE CASCADE,
    provider VARCHAR(50) DEFAULT 'google',
    modelo VARCHAR(50) DEFAULT 'gemini-3.5-flash',
    tokens_input INTEGER,
    tokens_output INTEGER,
    custo_estimado NUMERIC(10, 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSERÇÃO DE DADOS DE TESTE INICIAIS
INSERT INTO empresas (id, nome, email, telefone, status, plano_saas, limite_alunos, limite_ia_mensal)
VALUES ('emp_1', 'CA.RO Alpha Gym', 'contato@carogym.com.br', '(11) 98888-7777', 'ativo', 'Premium SaaS', 500, 2000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO unidades (id, empresa_id, nome, endereco, status)
VALUES 
('uni_1', 'emp_1', 'Unidade Jardins', 'Alameda Lorena, 1500 - Jardins, São Paulo - SP', 'ativo'),
('uni_2', 'emp_1', 'Unidade Paulista', 'Av. Paulista, 2000 - Bela Vista, São Paulo - SP', 'ativo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO usuarios (id, empresa_id, nome, email, senha_hash, role, status)
VALUES 
('usr_admin', 'emp_1', 'Professor Carlos', 'carlos@carogym.com.br', '123456', 'academia', 'ativo'),
('usr_master', 'emp_1', 'CA.RO Master Admin', 'master@carofitness.ai', '123456', 'master', 'ativo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO planos (id, empresa_id, nome, valor, duracao_dias, beneficios, status)
VALUES 
('pla_1', 'emp_1', 'Plano Gold Mensal', 149.90, 30, 'Acesso total à musculação, Área cárdio, 2 agendamentos de aulas coletivas simultâneos.', 'ativo'),
('pla_2', 'emp_1', 'Plano Black VIP Anual', 119.90, 365, 'Acesso livre a todas as unidades, Aulas coletivas ilimitadas, Carteirinha Black, Assistente de IA Premium.', 'ativo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO alunos (id, empresa_id, unidade_id, nome, email, telefone, foto_url, data_nascimento, altura, peso, objetivo, nivel, frequencia_semanal, restricoes, status, plano_id)
VALUES 
('alu_rony', 'emp_1', 'uni_1', 'Rony Silva', 'ronysiilvaa1@gmail.com', '(11) 97777-1234', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=250&auto=format&fit=crop', '1995-08-15', 1.78, 82.5, 'Hipertrofia e Definição', 'Intermediário', 4, 'Leve desconforto no joelho direito ao fazer agachamento profundo', 'ativo', 'pla_2'),
('alu_2', 'emp_1', 'uni_1', 'Beatriz Santos', 'beatriz@gmail.com', '(11) 98888-4321', 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=250&auto=format&fit=crop', '1998-04-20', 1.65, 60.2, 'Perda de Gordura e Condicionamento', 'Iniciante', 3, 'Nenhuma', 'ativo', 'pla_1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercicios (id, empresa_id, nome, grupo_muscular, instrucoes, erros_comuns, cuidados, midia_url, nivel)
VALUES 
('exe_supino', 'emp_1', 'Supino Reto com Barra', 'Peito', 'Deite-se no banco, segure a barra um pouco além da largura dos ombros. Desça a barra controladamente até o peitoral e empurre para cima estendendo os braços sem bloquear os cotovelos.', 'Bater a barra no peito, tirar as costas do banco, abrir demais os cotovelos.', 'Mantenha as escápulas retraídas e conte com a ajuda de um parceiro/professor para cargas altas.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop', 'Todos'),
('exe_agachamento', 'emp_1', 'Agachamento Livre', 'Pernas', 'Apoie a barra nos trapézios. Afaste os pés na largura dos ombros. Flexione joelhos e quadril descendo como se fosse sentar em uma cadeira. Mantenha as costas retas e empurre o chão para subir.', 'Projetar joelhos para dentro, arquear a coluna vertebral, tirar calcanhares do chão.', 'Não descer excessivamente se sentir dor no joelho. Ativar o abdômen para proteger a lombar.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop', 'Intermediário'),
('exe_puxada', 'emp_1', 'Puxada Frontal na Polia', 'Costas', 'Ajuste o apoio das pernas. Segure a barra longa com pegada pronada aberta. Incline levemente o tronco para trás e puxe a barra em direção à parte superior do peito, contraindo as costas.', 'Usar o impulso do corpo para puxar, curvar as costas excessivamente.', 'Evite puxar atrás da nuca para não sobrecarregar as articulações dos ombros.', 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=400&auto=format&fit=crop', 'Iniciante'),
('exe_rosca', 'emp_1', 'Rosca Direta com Halteres', 'Bíceps', 'Em pé, segure os halteres ao lado do corpo com as palmas voltadas para a frente. Flexione os cotovelos trazendo os halteres até os ombros. Desça lentamente até estender os braços.', 'Balançar o tronco (roubar), afastar os cotovelos da lateral do corpo.', 'Mantenha o abdômen e os glúteos contraídos para estabilizar o corpo.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop', 'Iniciante'),
('exe_triceps', 'emp_1', 'Tríceps Corda na Polia', 'Tríceps', 'De frente para o cabo, segure as pontas da corda. Mantendo os cotovelos fixos ao lado do corpo, empurre a corda para baixo abrindo as mãos no final do movimento.', 'Mover os cotovelos para frente e para trás, curvar os ombros.', 'Mantenha a postura ereta e os punhos firmes.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop', 'Iniciante'),
('exe_elevacao', 'emp_1', 'Elevação Lateral com Halteres', 'Ombros', 'Segure halteres ao lado do corpo. Eleve os braços para os lados até a altura dos ombros, mantendo uma leve flexão nos cotovelos. Desça de forma controlada.', 'Elevar acima da linha do ombro, usar impulso excessivo, tensionar o trapézio.', 'Evite cargas excessivas para manter a execução perfeita.', 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=400&auto=format&fit=crop', 'Todos')
ON CONFLICT (id) DO NOTHING;

INSERT INTO treinos (id, empresa_id, aluno_id, nome, objetivo, nivel, frequencia, status)
VALUES 
('tre_rony_a', 'emp_1', 'alu_rony', 'Treino A - Peito, Tríceps & Ombros', 'Hipertrofia', 'Intermediário', 'A / B / C', 'ativo'),
('tre_rony_b', 'emp_1', 'alu_rony', 'Treino B - Costas, Bíceps & Abdômen', 'Hipertrofia', 'Intermediário', 'A / B / C', 'ativo'),
('tre_rony_c', 'emp_1', 'alu_rony', 'Treino C - Pernas Completo', 'Hipertrofia', 'Intermediário', 'A / B / C', 'ativo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO treino_exercicios (id, treino_id, exercicio_id, series, repeticoes, carga, descanso, observacoes, ordem)
VALUES 
('te_1', 'tre_rony_a', 'exe_supino', 4, '10-12', '60kg', '60s', 'Focar na descida lenta e controlada.', 1),
('te_2', 'tre_rony_a', 'exe_elevacao', 4, '12-15', '12kg', '45s', 'Não balançar o corpo.', 2),
('te_3', 'tre_rony_a', 'exe_triceps', 3, '12', '25kg', '45s', 'Estender totalmente embaixo abrindo as mãos.', 3),
('te_4', 'tre_rony_b', 'exe_puxada', 4, '10-12', '55kg', '60s', 'Contrair bem o dorsal embaixo.', 1),
('te_5', 'tre_rony_b', 'exe_rosca', 4, '12', '14kg', '45s', 'Controlar a descida.', 2),
('te_6', 'tre_rony_c', 'exe_agachamento', 4, '10', '80kg', '90s', 'Cuidado com o joelho. Descer até 90 graus devido à restrição.', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO aulas (id, unidade_id, nome, professor, data_hora, vagas, status)
VALUES 
('aul_1', 'uni_1', 'Spinning Indoor', 'Profª Juliana', '2026-06-25 18:30:00', 20, 'ativo'),
('aul_2', 'uni_1', 'Power Yoga', 'Profª Alice', '2026-06-25 19:30:00', 15, 'ativo'),
('aul_3', 'uni_1', 'CrossFit HIIT', 'Prof. Marcos', '2026-06-26 07:00:00', 12, 'ativo'),
('aul_4', 'uni_1', 'Muay Thai', 'Prof. Anderson', '2026-06-26 19:00:00', 18, 'ativo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO agendamentos (id, aula_id, aluno_id, status)
VALUES 
('age_1', 'aul_1', 'alu_rony', 'confirmado')
ON CONFLICT (id) DO NOTHING;

INSERT INTO notificacoes (id, empresa_id, aluno_id, titulo, mensagem, tipo, status)
VALUES 
('not_1', 'emp_1', 'alu_rony', 'Seja bem-vindo!', 'Olá Rony, sua carteirinha digital está pronta para acesso. Aproveite o CA.RO Fitness AI!', 'alerta', 'lida'),
('not_2', 'emp_1', 'alu_rony', 'Agendamento Confirmado', 'Sua vaga na aula de Spinning Indoor (Amanhã às 18:30) foi confirmada!', 'comunicado', 'nao_lida')
ON CONFLICT (id) DO NOTHING;

INSERT INTO presencas (id, aluno_id, unidade_id, entrada_at, saida_at, metodo, status)
VALUES 
('pre_1', 'alu_rony', 'uni_1', '2026-06-23 18:00:00', '2026-06-23 19:15:00', 'QR Code - Catraca Virtual', 'concluido'),
('pre_2', 'alu_rony', 'uni_1', '2026-06-21 07:15:00', '2026-06-21 08:30:00', 'QR Code - Catraca Virtual', 'concluido'),
('pre_3', 'alu_rony', 'uni_1', '2026-06-19 18:02:00', '2026-06-19 19:20:00', 'QR Code - Catraca Virtual', 'concluido')
ON CONFLICT (id) DO NOTHING;

INSERT INTO evolucoes (id, aluno_id, peso, medidas, foto_url, observacoes)
VALUES 
('evo_1', 'alu_rony', 84.00, '{"braço": "38cm", "peito": "102cm", "coxa": "59cm"}', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop', 'Início do protocolo de hipertrofia. Percentual de gordura inicial 16%.'),
('evo_2', 'alu_rony', 82.50, '{"braço": "38.5cm", "peito": "104cm", "coxa": "60cm"}', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop', 'Segunda medição. Redução de gordura visceral e melhora no desenho muscular.')
ON CONFLICT (id) DO NOTHING;
