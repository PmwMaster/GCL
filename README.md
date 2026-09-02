# GCL Agency — Sistema Interno de Gestão

Plataforma completa de gestão empresarial desenvolvida sob medida para a **GCL Agency**, integrando controle de projetos, clientes, tarefas, finanças e divisão automatizada de lucros entre sócios e equipe.

![GCL Agency](https://raw.githubusercontent.com/pmwmasters/app/main/public/favicon.svg)

---

## 🚀 Tecnologias Utilizadas

- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) (Design System customizado com suporte nativo a Dark Mode)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Backend & Banco de Dados**: [Supabase](https://supabase.com/) (Autenticação, PostgreSQL e Row Level Security)
- **Hospedagem & Deploy**: [Vercel](https://vercel.com/) (com reescrita de rotas SPA no `vercel.json`)

---

## ⚡ Funcionalidades Principais

### 1. 🎨 Design System & Dark Mode
- Alternância completa entre **Modo Claro** e **Modo Escuro** em toda a aplicação.
- Salva a preferência de tema no `localStorage`.
- Tela de login premium com efeito glassmorphism e iluminação em gradiente.

### 2. 🔐 Autenticação & Níveis de Acesso
- **Sócios (`socio`)**: Acesso total a todas as áreas, incluindo Financeiro, Gestão de Equipe e Configurações de Reserva.
- **Funcionários (`funcionario`)**: Acesso restrito a Projetos, Clientes e Minhas Tarefas.

### 3. 📊 Dashboard Executivo
- Visão geral de projetos ativos, tarefas atrasadas e distribuição de carga de trabalho entre os sócios.
- Tabela com os próximos prazos de entrega e progresso por tipo de serviço.

### 4. 📂 Gestão de Clientes & Projetos
- CRM completo para cadastro de empresas, origens de lead e contatos.
- Acompanhamento detalhado do progresso dos projetos (Landing Pages, E-commerce, Sistemas Web, Tráfego Pago, etc.).
- Registro de tarefas por projeto com prioridades e logs de atividades.

### 5. 💰 Financeiro & Divisão Automática de Receitas (`Revenue Split`)
- Lançamento de receitas e custos operacionais com cálculo automático de lucro líquido.
- Regra de divisão configurável:
  - **Reserva de Caixa (%)**: Retido antes da distribuição.
  - **Base Fixa (%)**: Distribuído igualmente entre os sócios.
  - **Variável (%)**: Distribuído entre os membros vinculados ao projeto.

### 6. 📱 Responsividade Mobile
- Cabeçalho móvel com menu lateral gaveta (`drawer`) ativado via botão Hambúrguer.
- Layouts e tabelas com suporte a telas pequenas (smartphones e tablets).

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase configurada

### Passos

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/pmwmasters/app.git
   cd app
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do diretório `app`:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

4. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Gerar Build de Produção:**
   ```bash
   npm run build
   ```

---

## 📄 Licença

Propriedade exclusiva da **GCL Agency**. Todos os direitos reservados.
