import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PawPrint,
  FolderOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
  CreditCard,
  Syringe,
  Pill,
  FileText,
  Bell,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/tutor/dashboard' },
  { icon: PawPrint, label: 'Meus Pets', path: '/app/tutor/pets' },
  { icon: Syringe, label: 'Vacinas', path: '/app/tutor/vacinas' },
  { icon: Pill, label: 'Receitas', path: '/app/tutor/receitas' },
  { icon: FileText, label: 'Documentos', path: '/app/tutor/documentos' },
  { icon: Bell, label: 'Lembretes', path: '/app/tutor/lembretes' },
  { icon: FolderOpen, label: 'Cofre Digital', path: '/app/tutor/cofre' },
  { icon: CreditCard, label: 'Planos', path: '/planos/tutor' },
];

export function TutorSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut, profile } = useAuth();

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0"
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Logo size="sm" />
            </motion.div>
          ) : (
            <motion.div key="mini" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Logo size="sm" showText={false} />
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors">
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* User */}
      <div className={cn("p-4 border-b border-sidebar-border", collapsed && "flex justify-center")}>
        <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-accent-foreground font-medium">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.full_name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Heart className="w-3 h-3" /> Tutor
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn("sidebar-item", isActive && "sidebar-item-active", collapsed && "justify-center px-2")}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={signOut}
          className={cn("sidebar-item w-full text-destructive hover:bg-destructive/10", collapsed && "justify-center px-2")}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </motion.aside>
  );
}
