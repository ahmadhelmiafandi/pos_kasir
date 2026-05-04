import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuthStore } from './store';
import { toast } from 'sonner';

const LoginPage = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      if (email === 'admin@agmal.com' && password === 'admin123') {
        login(email, 'ADMIN');
        toast.success('Login Admin berhasil!');
        navigate('/dashboard');
      } else if (email === 'kasir@agmal.com' && password === 'kasir123') {
        login(email, 'KASIR');
        toast.success('Login Kasir berhasil!');
        navigate('/pos');
      } else {
        setError('Email atau Password salah!');
        toast.error('Login gagal!');
      }
    } else {
      setError('Harap isi semua field!');
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
