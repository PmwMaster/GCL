import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  DollarSign,
  Settings,
  LogOut,
  UserCheck,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LogoIcon } from '@/components/ui/Logo'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/projetos', icon: FolderKanban, label: 'Projetos' },
  { to: '/tarefas', icon: CheckSquare, label: 'Minhas Tarefas' },
  { to: '/equipe', icon: Users, label: 'Equipe', socioOnly: true },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro', socioOnly: true },
  { to: '/configuracoes', icon: Settings, label: 'Configurações', socioOnly: true },
]

interface SidebarProps {
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { profile, signOut, isSocio } = useAuth()
  const filteredItems = navItems.filter(item => !item.socioOnly || isSocio)

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <LogoIcon className="h-12 w-auto" />
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center shrink-0">
              <UserCheck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{profile?.nome}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{profile?.papel}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors mt-2"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
