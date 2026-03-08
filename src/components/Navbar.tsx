import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, CreditCard, User, ShieldCheck } from 'lucide-react';
import { cn } from '../utils';

interface NavbarProps {
  isAdmin: boolean;
}

export function Navbar({ isAdmin }: NavbarProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/agendar', icon: Calendar, label: 'Agendar' },
    { path: '/pagamento', icon: CreditCard, label: 'Pagamento' },
    { path: '/perfil', icon: User, label: 'Perfil' },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', icon: ShieldCheck, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 py-2 z-50 flex justify-around items-center shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              isActive ? "text-primary scale-110" : "text-gray-400"
            )}
          >
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
