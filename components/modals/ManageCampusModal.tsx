'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Mail, 
  Phone, 
  Search,
  Loader2,
  Church,
  Briefcase,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ManageCampusModalProps {
  isOpen: boolean;
  onClose: () => void;
  campus: any;
}

export function ManageCampusModal({ isOpen, onClose, campus }: ManageCampusModalProps) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'team'>('members');

  useEffect(() => {
    if (!isOpen || !campus?.id) return;

    // Fetch Members for this campus (using both ID and Name for compatibility)
    const qMembers = query(
      collection(db, 'members'), 
      or(
        where('campusId', '==', campus.id),
        where('church', '==', campus.name)
      )
    );
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Team for this campus (using both ID and Name for compatibility)
    const qTeam = query(
      collection(db, 'team'), 
      or(
        where('campusId', '==', campus.id),
        where('church', '==', campus.name)
      )
    );
    const unsubTeam = onSnapshot(qTeam, (snapshot) => {
      setTeam(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubMembers();
      unsubTeam();
      setLoading(true); // Reset for next time
    };
  }, [isOpen, campus?.id, campus?.name]);

  const filteredData = (activeTab === 'members' ? members : team).filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.function?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const title = `Lista de Membros - ${campus?.name}`;
    
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text(title, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-PT')}`, 14, 28);
    
    const tableData = members.map(m => [
      m.name,
      m.function || 'Membro',
      m.phone || 'N/A',
      m.email || 'N/A',
      m.status || 'N/A'
    ]);
    
    autoTable(doc, {
      startY: 35,
      head: [['Nome', 'Função', 'Telefone', 'E-mail', 'Status']],
      body: tableData,
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 9 }
    });
    
    doc.save(`Membros_${campus?.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <Church className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{campus?.name}</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Gestão de Unidade</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 flex-1 overflow-hidden flex flex-col space-y-6">
              {/* Tabs & Search */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto">
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeTab === 'members' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Membros ({members.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('team')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeTab === 'team' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Liderança ({team.length})
                  </button>
                </div>

                <div className="relative w-full md:w-72 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Carregando dados...</p>
                  </div>
                ) : filteredData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredData.map((item) => (
                      <div 
                        key={item.id}
                        className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 font-bold text-lg">
                            {item.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <Briefcase className="w-3 h-3" />
                              <span className="truncate">{item.function || 'Membro'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                            <Phone className="w-3 h-3" />
                            <span className="truncate">{item.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{item.email || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-gray-300" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">Nenhum resultado</h4>
                    <p className="text-sm text-gray-500">Não encontramos registros para esta busca.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={handleDownloadPDF}
                disabled={members.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Lista (PDF)</span>
              </button>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
