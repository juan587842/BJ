export interface DadosPessoais {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  dataNascimento: string;
  estadoCivil: string;
  cpf: string;
}

export interface Experiencia {
  empresa: string;
  cargo: string;
  inicio: string;
  fim: string;
  atual: boolean;
  descricao: string;
}

export interface Formacao {
  instituicao: string;
  curso: string;
  nivel: string;
  inicio: string;
  fim: string;
  status: string;
}

export interface Curso {
  nome: string;
  instituicao: string;
  cargaHoraria: string;
  ano: string;
}

export interface Idioma {
  nome: string;
  nivel: string;
}

export interface Curriculo {
  dados: DadosPessoais;
  objetivo: string;
  experiencias: Experiencia[];
  formacoes: Formacao[];
  cursos: Curso[];
  idiomas: Idioma[];
}

export type TemplateId = 'classico' | 'moderno' | 'minimalista';

export const CURRICULO_VAZIO: Curriculo = {
  dados: {
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    dataNascimento: '',
    estadoCivil: '',
    cpf: '',
  },
  objetivo: '',
  experiencias: [],
  formacoes: [],
  cursos: [],
  idiomas: [],
};
