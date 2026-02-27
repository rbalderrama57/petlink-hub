import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  CreditCard,
  Pill,
  Bug,
  Cpu,
  Upload,
  Ticket,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/vet/dashboard' },
  { icon: Users, label: 'Clientes', path: '/app/vet/clientes' },
  { icon: Pill, label: 'Receitas', path: '/app/vet/receitas' },
  { icon: Bug, label: 'Zoonoses', path: '/app/vet/zoonoses' },
  { icon: Cpu, label: 'Microchip', path: '/app/vet/microchip' },
  { icon: Upload, label: 'Importação', path: '/app/vet/importacao' },
  { icon: Ticket, label: 'Golden Tickets', path: '/app/vet/golden-tickets' },
  { icon: CreditCard, label: 'Planos', path: '/planos/veterinario' },
];

export function VetSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut, profile } = useAuth();

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0"
    >
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

      <div className={cn("p-4 border-b border-sidebar-border", collapsed && "flex justify-center")}>
        <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-medium">
            {profile?.full_name?.charAt(0) || 'V'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.full_name || 'Veterinário'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> {profile?.crmv ? `CRMV ${profile.crmv}` : 'Veterinário'}
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
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
