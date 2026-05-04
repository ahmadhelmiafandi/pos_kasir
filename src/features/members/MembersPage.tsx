import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Phone, MapPin, QrCode, Trash2, X, Printer, MessageSquare, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { memberService } from '../../services/memberService';
import { toast } from 'sonner';

const MembersPage = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const data = await memberService.getAll();
      setMembers(data);
    } catch (error) {
      toast.error('Gagal mengambil data member');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const sendWhatsApp = (member: any) => {
    const message = `Halo *${member.name}*,\n\nSelamat! Kamu sekarang sudah resmi terdaftar sebagai *Member Agmal Parfum* 💎.\n\nNikmati promo khusus member:\n✅ *GRATIS ISI ULANG* setiap kelipatan 10x transaksi.\n✅ Info promo eksklusif lainnya.\n\nSimpan nomor ini dan tunjukkan QR Code kamu setiap kali belanja ya! Terima kasih sudah berlangganan di Agmal Parfum.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${member.phone.replace(/^0/, '62')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedMember) {
        await memberService.update(selectedMember.id, formData);
        toast.success('Data member berhasil diperbarui');
      } else {
        await memberService.create(formData);
        toast.success('Member baru berhasil terdaftar');
      }
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', address: '' });
      setSelectedMember(null);
      fetchMembers();
    } catch (error: any) {
      toast.error('Gagal menyimpan data: ' + (error.message || 'Cek koneksi database'));
    }
  };

  const handleEdit = (member: any) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      address: member.address || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus member ${name}?`)) {
      try {
        await memberService.delete(id);
        toast.success(`Member ${name} berhasil dihapus`);
        fetchMembers();
      } catch (error) {
        toast.error('Gagal menghapus member');
      }
    }
  };

  const printQR = (member: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak QR Member - ${member.name}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { border: 2px solid #0ea5e9; padding: 40px; border-radius: 20px; text-align: center; }
            h1 { color: #0ea5e9; margin-bottom: 5px; }
            p { color: #64748b; margin-bottom: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>AGMAL PARFUME</h1>
            <p>MEMBER CARD</p>
            <div id="qr-container"></div>
            <h2>${member.name}</h2>
            <p>${member.phone}</p>
            <div class="footer">Tunjukkan QR ini setiap kali transaksi untuk mendapatkan promo!</div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            new QRCode(document.getElementById("qr-container"), {
              text: "${member.id}",
              width: 256,
              height: 256
            });
            setTimeout(() => { 
              window.print(); 
              window.onafterprint = () => window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
  };

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 font-display">Loyalty Members</h2>
          <p className="text-slate-400 mt-1">Kelola data pelanggan dan program loyalitas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
        >
          <UserPlus size={20} />
          Daftar Member Baru
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          placeholder="Cari nama atau No. WA member..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 transition-all outline-hidden font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading members...</div>
        ) : (
          filtered.map((member) => (
            <motion.div 
              layout
              key={member.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Progress Indicator */}
              <div className="absolute top-0 left-0 h-1 bg-brand-primary transition-all" style={{ width: `${(member.total_transactions % 10) * 10}%` }} />

              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                  <QRCodeSVG value={member.id} size={48} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Transaksi</span>
                  <span className="text-2xl font-black text-slate-800">{member.total_transactions}</span>
                  {member.total_transactions > 0 && member.total_transactions % 10 === 0 && (
                    <span className="mt-1 px-2 py-0.5 bg-brand-success text-white text-[8px] font-bold rounded-full animate-bounce">
                      REWARD READY!
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">{member.name}</h3>
                <div className="space-y-1">
                  <p className="text-slate-500 text-xs flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" /> {member.phone}
                  </p>
                  <p className="text-slate-500 text-xs flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" /> {member.address || '-'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                <button 
                  onClick={() => printQR(member)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-white transition-all"
                >
                  <Printer size={16} /> Cetak
                </button>
                <button 
                  onClick={() => sendWhatsApp(member)}
                  className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all"
                >
                  <MessageSquare size={16} /> WA
                </button>
                <button 
                  onClick={() => handleEdit(member)}
                  className="px-4 py-3 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-primary transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(member.id, member.name)}
                  className="px-4 py-3 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-danger transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal Daftar/Edit Member */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedMember(null);
                setFormData({ name: '', phone: '', address: '' });
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 font-display">
                  {selectedMember ? 'Edit Data Member' : 'Registrasi Member'}
                </h3>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedMember(null);
                    setFormData({ name: '', phone: '', address: '' });
                  }} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
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
                    placeholder="Nama Pelanggan"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">No. WhatsApp</label>
                  <input 
                    required value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Alamat (Opsional)</label>
                  <textarea 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-hidden transition-all"
                    placeholder="Alamat lengkap..."
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/25 hover:bg-sky-600 transition-all text-lg active:scale-[0.98]">
                    {selectedMember ? 'Simpan Perubahan' : 'Daftar Sekarang'}
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

export default MembersPage;
