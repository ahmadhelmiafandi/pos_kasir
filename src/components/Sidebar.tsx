import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, ChevronRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../features/auth/store';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { path: '/products', label: 'Produk', icon: Package, roles: ['ADMIN'] },
    { path: '/users', label: 'Kelola Akun', icon: Users, roles: ['ADMIN'] },
    { path: '/pos', label: 'Kasir (POS)', icon: ShoppingCart, roles: ['ADMIN', 'KASIR'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const NavContent = () => (
    <>
      <div className="p-6 text-center lg:text-left">
        <h1 className="text-xl font-bold text-brand-primary flex items-center justify-center lg:justify-start gap-2 font-display">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white italic">A</div>
          Agmal Parfume
        </h1>
        {user && (
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-1">
            Logged in as <span className="text-brand-primary">{user.role}</span>
          </p>
        )}
      </div>
      
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
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
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-white rounded-2xl shadow-lg border border-slate-100 text-slate-600"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white border-r border-slate-200 h-screen flex-col fixed left-0 top-0 z-40">
        <NavContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 flex flex-col shadow-2xl"
            >
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
