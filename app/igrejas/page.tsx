'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  User, 
  Users, 
  MoreVertical, 
  Search, 
  Loader2,
  Trash2,
  Edit2,
  Church,
  Phone,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/components/providers/AuthProvider';
import { CampusModal } from '@/components/modals/CampusModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { ManageCampusModal } from '@/components/modals/ManageCampusModal';

export default function CampusesPage() {
  const { user, loading: authLoading } = useAuth();
  const [campuses, setCampuses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<any>(null);
  const [campusToDelete, setCampusToDelete] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const campusesQ = query(collection(db, 'campuses'), orderBy('name', 'asc'));
    const membersQ = query(collection(db, 'members'));
    const teamQ = query(collection(db, 'team'));

    const unsubCampuses = onSnapshot(campusesQ, (snapshot) => {
      setCampuses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'campuses'));

    const unsubMembers = onSnapshot(membersQ, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'members'));

    const unsubTeam = onSnapshot(teamQ, (snapshot) => {
      setTeam(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'team'));

    return () => {
      unsubCampuses();
      unsubMembers();
      unsubTeam();
    };
  }, [user]);

  const handleDelete = async () => {
    if (!campusToDelete) return;
    try {
      await deleteDoc(doc(db, 'campuses', campusToDelete));
      setCampusToDelete(null);
      setIsConfirmOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `campuses/${campusToDelete}`);
    }
  };

  const getMemberCount = (campus: any) => {
    // Use a Set to store unique identifiers (phone, email, or name) to avoid double counting
    const uniqueMembers = new Set();
    
    members.forEach(m => {
      if (m.campusId === campus.id || m.church === campus.name) {
        const id = m.phone || m.email || m.name;
        if (id) uniqueMembers.add(id);
      }
    });

    team.forEach(t => {
      if (t.campusId === campus.id || t.church === campus.name) {
        const id = t.phone || t.email || t.name;
        if (id) uniqueMembers.add(id);
      }
    });

    return uniqueMembers.size;
  };

  const filteredCampuses = campuses.filter(campus => 
    campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.pastorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Igrejas / Campi</h2>
          <p className="text-gray-500 mt-1">Gerencie as unidades e congregações da ADP MCP.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedCampus(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Igreja</span>
        </button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Pesquisar por nome ou pastor..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCampuses.map((campus, index) => (
              <motion.div
                key={campus.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  {campus.imageUrl ? (
                    <Image 
                      src={campus.imageUrl} 
                      alt={campus.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Church className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-8">
                    <h3 className="text-2xl font-bold text-white mb-1">{campus.name}</h3>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{campus.address}</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === campus.id ? null : campus.id)}
                      className="p-2 bg-white/80 backdrop-blur-md text-gray-600 rounded-xl hover:bg-white transition-colors shadow-sm"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {activeMenu === campus.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-10 p-2">
                        <button 
                          onClick={() => {
                            setSelectedCampus(campus);
                            setIsModalOpen(true);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </button>
                        <button 
                          onClick={() => {
                            setCampusToDelete(campus.id);
                            setIsConfirmOpen(true);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Pastor Responsável</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-bold text-gray-900 truncate">Pr. {campus.pastorName}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Total de Membros</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-bold text-gray-900">{getMemberCount(campus)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{campus.phone || 'N/A'}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedCampus(campus);
                        setIsManageOpen(true);
                      }}
                      className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
                    >
                      <span>Gerenciar Unidade</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div 
            onClick={() => {
              setSelectedCampus(null);
              setIsModalOpen(true);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:bg-white hover:border-blue-200 transition-all"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Church className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Adicionar Nova Congregação</h3>
            <p className="text-sm text-gray-500 max-w-[200px]">Expanda o alcance do ministério cadastrando uma nova unidade.</p>
          </motion.div>
        </div>
      )}

      <CampusModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campus={selectedCampus}
      />

      <ManageCampusModal 
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        campus={selectedCampus}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Igreja"
        message="Tem certeza que deseja excluir esta igreja? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
