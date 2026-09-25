import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form'
import { LogoIcon } from '@/components/ui/Logo'
import { ArrowRight, Lock, Mail, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      console.error('Erro de login detalhado:', signInError)
      setError(signInError || 'E-mail ou senha inválidos')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 overflow-hidden relative selection:bg-primary-500 selection:text-white">
      {/* Esquerda: Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative z-10">
        {/* Ambient background glow for dark mode */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />

        <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-xl dark:shadow-2xl dark:shadow-black/50 transition-all duration-300">
          <div className="mb-8 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-2xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
                <LogoIcon className="h-16 w-auto" />
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
              Bem-vindo de volta! Insira suas credenciais para acessar o painel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  E-mail institucional
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="seu.nome@gclagency.com"
                    className="h-12 pl-10 !bg-gray-50 dark:!bg-gray-950/60 !border-gray-200 dark:!border-gray-800 focus:!border-primary-500 dark:focus:!border-primary-500 focus:!bg-white dark:focus:!bg-gray-900 transition-all text-sm rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12 pl-10 !bg-gray-50 dark:!bg-gray-950/60 !border-gray-200 dark:!border-gray-800 focus:!border-primary-500 dark:focus:!border-primary-500 focus:!bg-white dark:focus:!bg-gray-900 transition-all text-sm rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 rounded-xl p-3.5 text-center">
                <p className="text-xs text-red-600 dark:text-red-300 font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.01] active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 group"
              disabled={loading}
            >
              {loading ? (
                'Entrando...'
              ) : (
                <>
                  Entrar na Plataforma
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Direita: Imagem / Background Decorativo */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gray-900 justify-center items-center p-12">
        {/* Animated Gradient Grids */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 animate-pulse-glow" />
        
        {/* Decorative Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Content Card with Glassmorphism */}
        <div className="relative z-10 max-w-lg w-full">
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-2xl space-y-6 text-left transform hover:scale-[1.01] transition-transform duration-500">
            <div className="inline-flex p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <LogoIcon className="h-12 w-auto" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                Desenvolvimento e Inovação sem Limites.
              </h2>
              <p className="text-blue-100/90 text-sm leading-relaxed font-normal">
                O hub definitivo para gerenciamento financeiro, métricas de sócios, controle de tarefas e portfólio de clientes da GCL Agency.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2.5 text-xs text-white/90 font-medium">
                <div className="p-1.5 rounded-lg bg-white/10 border border-white/10">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-300" />
                </div>
                <span>Divisão Automática</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90 font-medium">
                <div className="p-1.5 rounded-lg bg-white/10 border border-white/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <span>Gestão de Projetos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
