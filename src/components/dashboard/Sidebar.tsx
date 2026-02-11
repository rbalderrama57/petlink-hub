import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Syringe,
  FolderOpen,
  PawPrint,
  Upload,
  Stethoscope,
  Heart,
  Ticket,
  CreditCard,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole: 'vet' | 'tutor';
}

export function Sidebar({ userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut, profile } = useAuth();

  const vetMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Pacientes', path: '/dashboard/patients' },
    { icon: Search, label: 'Identidade Universal', path: '/dashboard/search' },
    { icon: Stethoscope, label: 'Nova Consulta', path: '/dashboard/consultation' },
    { icon: Upload, label: 'Importação Mágica', path: '/dashboard/import' },
    { icon: Ticket, label: 'Golden Tickets', path: '/dashboard/golden-tickets' },
    { icon: CalendarDays, label: 'Agenda', path: '/dashboard/schedule' },
    { icon: CreditCard, label: 'Planos', path: '/dashboard/plans' },
  ];

  const tutorMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: PawPrint, label: 'Meus Pets', path: '/dashboard/pets' },
    { icon: Syringe, label: 'Carteirinha', path: '/dashboard/vaccines' },
    { icon: FolderOpen, label: 'Cofre Digital', path: '/dashboard/documents' },
    { icon: Bell, label: 'Alertas', path: '/dashboard/alerts' },
    { icon: FileText, label: 'Histórico', path: '/dashboard/history' },
    { icon: CreditCard, label: 'Planos', path: '/dashboard/plans' },
  ];

  const menuItems = userRole === 'vet' ? vetMenuItems : tutorMenuItems;

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
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Logo size="sm" />
            </motion.div>
          ) : (
            <motion.div
              key="mini-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Logo size="sm" showText={false} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* User Info */}
      <div className={cn(
        "p-4 border-b border-sidebar-border",
        collapsed && "flex justify-center"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "flex-col"
        )}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-medium">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {userRole === 'vet' ? (
                  <>
                    <Stethoscope className="w-3 h-3" />
                    Veterinário
                  </>
                ) : (
                  <>
                    <Heart className="w-3 h-3" />
                    Tutor
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active",
                  collapsed && "justify-center px-2"
                )}
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
        <NavLink
          to="/dashboard/settings"
          className={cn(
            "sidebar-item",
            location.pathname === '/dashboard/settings' && "sidebar-item-active",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span>Configurações</span>}
        </NavLink>
        
        <button
          onClick={signOut}
          className={cn(
            "sidebar-item w-full text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </motion.aside>
  );
}
