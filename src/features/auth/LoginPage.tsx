import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuthStore } from './store';
import { toast } from 'sonner';
import { userService } from '../../services/userService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = await userService.login(email, password);
      
      if (user) {
        login({
          email: user.email,
          name: user.name,
          role: user.role as 'ADMIN' | 'KASIR',
        });
        toast.success(`Selamat datang, ${user.name}!`);
        navigate(user.role === 'ADMIN' ? '/dashboard' : '/pos');
      } else {
        toast.error('Email atau password salah');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold italic mx-auto mb-4">
            A
          </div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Selamat Datang</h1>
          <p className="text-slate-400 mt-2">Login ke Agmal Parfume POS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-hidden transition-all"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-hidden transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-brand-danger text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-sky-600 transition-all active:scale-[0.98] shadow-lg shadow-brand-primary/25"
          >
            Login
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
