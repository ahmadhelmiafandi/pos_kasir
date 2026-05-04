import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Shield, User as UserIcon, Trash2, Key, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { userService } from '../../services/userService';
import { toast } from 'sonner';

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'KASIR' as 'ADMIN' | 'KASIR'
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Gagal mengambil data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'KASIR' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
        toast.success('Pengguna berhasil diperbarui');
      } else {
        await userService.create(formData);
        toast.success('Pengguna baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus akun ini?')) {
      try {
        await userService.delete(id);
        toast.success('Akun berhasil dihapus');
        fetchUsers();
      } catch (error) {
        toast.error('Gagal menghapus akun');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 font-display">Manajemen Akun</h2>
          <p className="text-slate-400 mt-1">Kelola hak akses Admin dan Kasir</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
        >
          <UserPlus size={20} />
          Tambah Akun
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading users...</div>
        ) : (
          users.map((user) => (
            <motion.div 
              layout
              key={user.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-100 text-slate-500'}`}>
                  {user.role === 'ADMIN' ? <Shield size={24} /> : <UserIcon size={24} />}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(user)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl">
                    <Key size={18} />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-brand-danger hover:bg-red-50 rounded-xl">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
                <p className="text-slate-400 text-sm">{user.email}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {user.role}
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium italic">Sejak {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal CRUD User */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 font-display">
                  {editingUser ? 'Edit Akun' : 'Tambah Akun Baru'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
                  <input 
                    required value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all"
                    placeholder="Contoh: Ahmad Kasir"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                  <input 
                    type="email" required value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all"
                    placeholder="nama@agmal.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                  <input 
                    type="text" required value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all"
                    placeholder="Min. 6 karakter"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Role / Hak Akses</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as 'ADMIN' | 'KASIR'})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all"
                  >
                    <option value="KASIR">KASIR (Hanya POS)</option>
                    <option value="ADMIN">ADMIN (Semua Akses)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/25 hover:bg-sky-600 transition-all text-lg active:scale-[0.98]">
                    {editingUser ? 'Simpan Perubahan' : 'Buat Akun Sekarang'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersPage;
