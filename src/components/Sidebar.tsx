import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../features/auth/store';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'Kasir', path: '/pos' },
    { icon: Package, label: 'Produk', path: '/products' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6">
        <h1 className="text-xl font-bold text-brand-primary flex items-center gap-2 font-display">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white italic">A</div>
          Agmal Parfume
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-brand-primary'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {location.pathname === item.path && (
                  <motion.div layoutId="active-pill" className="ml-auto">
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-brand-danger transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
