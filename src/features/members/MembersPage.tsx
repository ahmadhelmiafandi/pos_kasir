import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Phone, MapPin, QrCode, Trash2, X, Printer, MessageSquare, Pencil, History, TrendingUp } from 'lucide-react';
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
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [memberHistory, setMemberHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

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

  const handleViewHistory = async (member: any) => {
    setSelectedMember(member);
    setIsHistoryModalOpen(true);
    setIsHistoryLoading(true);
    try {
      const history = await memberService.getHistory(member.id);
      setMemberHistory(history);
    } catch (error) {
      toast.error('Gagal mengambil riwayat transaksi');
    } finally {
      setIsHistoryLoading(false);
    }
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
          <title>Member Card - ${member.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
            body { 
              font-family: 'Plus Jakarta Sans', sans-serif; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0;
              background-color: #f8fafc;
            }
            .card { 
              width: 350px;
              background: white;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
              border: 1px solid #e2e8f0;
              position: relative;
            }
            .header {
              background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
              padding: 30px 20px;
              text-align: center;
              color: white;
            }
            .header h1 { 
              margin: 0; 
              font-size: 24px; 
              letter-spacing: 2px;
              font-weight: 800;
              font-style: italic;
            }
            .header p { 
              margin: 5px 0 0; 
              font-size: 10px; 
              opacity: 0.8;
              font-weight: 600;
              letter-spacing: 4px;
              text-transform: uppercase;
            }
            .content {
              padding: 30px;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-wrapper {
              background: white;
              padding: 15px;
              border-radius: 20px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
              border: 1px solid #f1f5f9;
              margin-bottom: 25px;
            }
            .member-info h2 {
              margin: 0;
              color: #1e293b;
              font-size: 20px;
              font-weight: 800;
            }
            .member-info p {
              margin: 5px 0 0;
              color: #64748b;
              font-size: 14px;
              font-weight: 600;
            }
            .footer {
              background: #f8fafc;
              padding: 20px;
              text-align: center;
              border-top: 1px dashed #e2e8f0;
            }
            .footer p {
              margin: 0;
              font-size: 10px;
              color: #94a3b8;
              line-height: 1.5;
              font-weight: 500;
            }
            .badge {
              position: absolute;
              top: 15px;
              right: 15px;
              background: rgba(255,255,255,0.2);
              padding: 4px 10px;
              border-radius: 100px;
              font-size: 8px;
              font-weight: 800;
              color: white;
              backdrop-filter: blur(4px);
              border: 1px solid rgba(255,255,255,0.3);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">VIP LOYALTY</div>
            <div class="header">
              <h1>AGMAL PARFUM</h1>
              <p>Member Card</p>
            </div>
            <div class="content">
              <div class="qr-wrapper">
                <div id="qr-container"></div>
              </div>
              <div class="member-info">
                <h2>${member.name}</h2>
                <p>${member.phone}</p>
              </div>
            </div>
            <div class="footer">
              <p>Tunjukkan kartu ini setiap transaksi<br>Kumpulkan 10x Transaksi untuk <b>GRATIS ISI ULANG</b></p>
            </div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            new QRCode(document.getElementById("qr-container"), {
              text: "${member.id}",
              width: 160,
              height: 160,
              colorDark: "#0f172a",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H
            });
            setTimeout(() => { 
              window.print(); 
              window.onafterprint = () => window.close();
            }, 800);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
                  onClick={() => handleViewHistory(member)}
                  className="px-4 py-3 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-primary transition-colors"
                  title="Riwayat Belanja"
                >
                  <History size={16} />
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

      {/* Modal Riwayat Belanja */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsHistoryModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 font-display">Riwayat Belanja</h3>
                    <p className="text-sm text-slate-500 font-medium">{selectedMember.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {isHistoryLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium">Mengambil data...</p>
                  </div>
                ) : memberHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp size={32} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-medium">Belum ada riwayat transaksi</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Statistik Singkat */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Belanja</p>
                        <p className="text-xl font-black text-slate-800">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                            memberHistory.reduce((acc, curr) => acc + curr.total, 0)
                          )}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Produk Terlaris</p>
                        <p className="text-xl font-black text-brand-primary">
                          {(() => {
                            const counts: any = {};
                            memberHistory.forEach(h => h.transaction_items.forEach((i: any) => {
                              counts[i.name] = (counts[i.name] || 0) + i.quantity;
                            }));
                            const top = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0];
                            return top ? top[0].split(' ')[0] : '-'; // Ambil kata pertama (biasanya ukuran atau nama brand)
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {memberHistory.map((trx) => (
                        <div key={trx.id} className="p-4 rounded-2xl border border-slate-100 hover:border-brand-primary/20 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-xs font-bold text-slate-400">{new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                              <p className="text-sm font-bold text-slate-800">ID: #{trx.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <p className="font-black text-brand-primary">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(trx.total)}
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                            {trx.transaction_items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-xs font-medium">
                                <span className="text-slate-600">{item.name} x{item.quantity}</span>
                                <span className="text-slate-400">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
