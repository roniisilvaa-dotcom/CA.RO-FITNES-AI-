export interface Empresa {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: 'ativo' | 'bloqueado';
  plano_saas: string;
  limite_alunos: number;
  limite_ia_mensal: number;
  created_at: string;
}

export interface Unidade {
  id: string;
  empresa_id: string;
  nome: string;
  endereco: string;
  status: string;
}

export interface Aluno {
  id: string;
  empresa_id: string;
  unidade_id: string;
  nome: string;
  email: string;
  telefone: string;
  foto_url: string;
  data_nascimento: string;
  altura: number;
  peso: number;
  objetivo: string;
  nivel: string;
  frequencia_semanal: number;
  restricoes: string;
  status: 'ativo' | 'inativo';
  plano_id: string;
}

export interface Plano {
  id: string;
  empresa_id: string;
  nome: string;
  valor: number;
  duracao_dias: number;
  beneficios: string;
  status: string;
}

export interface Exercicio {
  id: string;
  empresa_id: string;
  nome: string;
  grupo_muscular: string;
  instrucoes: string;
  erros_comuns: string;
  cuidados: string;
  midia_url: string;
  nivel: string;
}

export interface TreinoExercicio {
  id: string;
  treino_id: string;
  exercicio_id: string;
  series: number;
  repeticoes: string;
  carga: string;
  descanso: string;
  observacoes: string;
  ordem: number;
  exercicio?: Exercicio;
}

export interface Treino {
  id: string;
  empresa_id: string;
  aluno_id: string;
  nome: string;
  objetivo: string;
  nivel: string;
  frequencia: string;
  status: string;
  exercicios?: TreinoExercicio[];
}

export interface Aula {
  id: string;
  unidade_id: string;
  nome: string;
  professor: string;
  data_hora: string;
  vagas: number;
  status: string;
  vagas_restantes?: number;
  agendada?: boolean;
}

export interface Notification {
  id: string;
  empresa_id: string;
  aluno_id: string;
  titulo: string;
  mensagem: string;
  tipo: 'alerta' | 'comunicado' | 'confirmacao';
  status: 'lida' | 'nao_lida';
  created_at: string;
}

export interface Presenca {
  id: string;
  aluno_id: string;
  unidade_id: string;
  entrada_at: string;
  saida_at: string;
  metodo: string;
  status: string;
}

export interface Evolucao {
  id: string;
  aluno_id: string;
  peso: number;
  medidas: {
    braço: string;
    peito: string;
    coxa: string;
  };
  foto_url: string;
  observacoes: string;
  created_at: string;
}

export interface IaConversa {
  id: string;
  aluno_id: string;
  titulo: string;
  created_at: string;
}

export interface IaMensagem {
  id: string;
  conversa_id: string;
  role: 'user' | 'assistant';
  conteudo: string;
  intencao: string;
  tokens: number;
  created_at: string;
}

export interface IaLog {
  id: string;
  empresa_id: string;
  aluno_id: string;
  provider: string;
  modelo: string;
  tokens_input: number;
  tokens_output: number;
  custo_estimado: number;
  created_at: string;
}
