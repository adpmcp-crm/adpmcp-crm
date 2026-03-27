'use client';

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, loginWithGoogle } from '@/lib/firebase';
import { useFirebase } from '@/components/providers/FirebaseProvider';
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Loader2,
  LogIn,
  Users,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { MemberModal } from '@/components/modals/MemberModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

export default function MembersPage() {
  const { user, loading: authLoading } = useFirebase();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'members'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching members:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      await deleteDoc(doc(db, 'members', memberToDelete));
      setMemberToDelete(null);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Faça login para gerenciar os membros da igreja.
        </p>
        <button 
          onClick={() => loginWithGoogle()}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <LogIn className="w-5 h-5" />
          <span>Entrar com Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Membros</h2>
          <p className="text-gray-500 mt-1">Gerencie a comunhão e os dados dos membros.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedMember(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          <span>Novo Membro</span>
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou e-mail..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-100 rounded-2xl px-6 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 shadow-sm outline-none appearance-none cursor-pointer"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
            <option value="baptizado">Baptizados</option>
            <option value="discipulado">Discipulado</option>
            <option value="não baptizado">Não Baptizados</option>
          </select>
          <button className="bg-white border border-gray-100 p-3.5 rounded-2xl text-gray-500 hover:text-blue-600 transition-all shadow-sm active:scale-95">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-blue-50">
                      {member.photoURL ? (
                        <Image 
                          src={member.photoURL} 
                          alt={member.name} 
                          fill 
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {member.name}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg ${
                        member.status === 'ativo' ? 'bg-emerald-50 text-emerald-600' : 
                        member.status === 'inativo' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === member.id ? null : member.id)}
                      className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {activeMenu === member.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-10 p-2">
                        <button 
                          onClick={() => {
                            setSelectedMember(member);
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
                            setMemberToDelete(member.id);
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

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email || 'Sem e-mail'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone || 'Sem telefone'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{member.campusId || 'Não vinculado'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{member.createdAt?.toDate ? member.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recente'}</span>
                  </div>
                  <button className="text-blue-600 font-bold hover:underline">Ver Perfil</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredMembers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">Nenhum membro encontrado com estes critérios.</p>
        </div>
      )}

      <MemberModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        type="member"
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Membro"
        message="Tem certeza que deseja excluir este membro? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
