export type PapelUsuario = 'socio' | 'funcionario'
export type AreaPrincipal = 'dev' | 'design' | 'trafego' | 'seo' | 'geral'
export type TipoServico = 'landing_page' | 'integracao_sistemas' | 'microsaas' | 'trafego_pago' | 'seo'
export type StatusProjeto = 'prospeccao' | 'em_andamento' | 'em_revisao' | 'entregue' | 'pausado' | 'cancelado'
export type StatusTarefa = 'pendente' | 'em_andamento' | 'concluida'
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta'
export type TipoLancamento = 'receita' | 'custo'

export interface Profile {
  id: string
  nome: string
  papel: PapelUsuario
  area_principal: AreaPrincipal
  created_at: string
}

export interface Client {
  id: string
  nome: string
  empresa: string | null
  contato_email: string | null
  contato_telefone: string | null
  origem: string | null
  created_at: string
}

export interface Project {
  id: string
  client_id: string
  nome: string
  tipo_servico: TipoServico
  status: StatusProjeto
  valor_fechado: number | null
  data_inicio: string | null
  prazo_entrega: string | null
  descricao: string | null
  created_at: string
  clients?: Client
  project_members?: ProjectMember[]
}

export interface ProjectMember {
  project_id: string
  profile_id: string
  papel_no_projeto: string | null
  contribution?: number | null
  profiles?: Profile
}

export interface Task {
  id: string
  project_id: string
  titulo: string
  descricao: string | null
  responsavel_id: string
  status: StatusTarefa
  prioridade: PrioridadeTarefa
  prazo: string | null
  created_at: string
  projects?: Project
  profiles?: Profile
}

export interface FinancialEntry {
  id: string
  project_id: string | null
  tipo: TipoLancamento
  descricao: string
  valor: number
  data: string
  projects?: Project
}

export interface CompanySettings {
  id: string
  percentual_reserva: number
  percentual_fixo: number
  percentual_variavel: number
  updated_at: string
}

export interface ProjectRevenueSplit {
  id: string
  financial_entry_id: string
  valor_bruto: number
  valor_reserva: number
  valor_lucro_distribuivel: number
  valor_base_fixa_total: number
  valor_variavel_total: number
  created_at: string
  financial_entries?: FinancialEntry
  revenue_split_details?: RevenueSplitDetail[]
}

export interface RevenueSplitDetail {
  id: string
  split_id: string
  profile_id: string
  valor_base_fixa: number
  valor_variavel: number
  valor_total: number
  profiles?: Profile
}

export interface ActivityLog {
  id: string
  project_id: string
  profile_id: string
  descricao: string
  created_at: string
  profiles?: Profile
}

export type AcaoFinanceira = 'criacao' | 'edicao' | 'exclusao'

export interface FinancialLog {
  id: string
  financial_entry_id: string | null
  acao: AcaoFinanceira
  usuario_id: string | null
  usuario_nome: string | null
  dados_anteriores: Record<string, unknown> | null
  dados_novos: Record<string, unknown> | null
  created_at: string
}

export const TIPO_SERVICO_LABELS: Record<TipoServico, string> = {
  landing_page: 'Landing Page',
  integracao_sistemas: 'Integração de Sistemas',
  microsaas: 'MicroSaaS',
  trafego_pago: 'Tráfego Pago',
  seo: 'SEO',
}

export const STATUS_PROJETO_LABELS: Record<StatusProjeto, string> = {
  prospeccao: 'Prospecção',
  em_andamento: 'Em Andamento',
  em_revisao: 'Em Revisão',
  entregue: 'Entregue',
  pausado: 'Pausado',
  cancelado: 'Cancelado',
}

export const STATUS_TAREFA_LABELS: Record<StatusTarefa, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
}

export const PRIORIDADE_LABELS: Record<PrioridadeTarefa, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
}

export const AREA_LABELS: Record<AreaPrincipal, string> = {
  dev: 'Desenvolvimento',
  design: 'Design',
  trafego: 'Tráfego Pago',
  seo: 'SEO',
  geral: 'Geral',
}

export const tipoServicoOptions = Object.entries(TIPO_SERVICO_LABELS).map(([value, label]) => ({ value, label }))
export const statusProjetoOptions = Object.entries(STATUS_PROJETO_LABELS).map(([value, label]) => ({ value, label }))
export const statusTarefaOptions = Object.entries(STATUS_TAREFA_LABELS).map(([value, label]) => ({ value, label }))
export const prioridadeOptions = Object.entries(PRIORIDADE_LABELS).map(([value, label]) => ({ value, label }))
export const areaOptions = Object.entries(AREA_LABELS).map(([value, label]) => ({ value, label }))
