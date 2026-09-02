import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { LogoIcon } from '@/components/ui/Logo'
import { Menu } from 'lucide-react'

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col lg:flex-row">
      {/* Top Header for Mobile Screens */}
      <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <LogoIcon className="h-7 w-auto" />
          <span className="text-base font-bold text-gray-900 dark:text-white">GCL Agency</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Abrir Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Sidebar Component */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Content Container */}
      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
