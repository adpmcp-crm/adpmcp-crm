'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Plus, 
  Users, 
  User, 
  Briefcase, 
  MoreVertical, 
  Search, 
  Loader2,
  Trash2,
  Edit2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DepartmentModal } from '@/components/modals/DepartmentModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

export default function DepartmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [deptToDelete, setDeptToDelete] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const deptsQ = query(collection(db, 'departments'), orderBy('name', 'asc'));
    const membersQ = query(collection(db, 'members'));
    const teamQ = query(collection(db, 'team'));

    const unsubDepts = onSnapshot(deptsQ, (snapshot) => {
      setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'departments'));

    const unsubMembers = onSnapshot(membersQ, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'members'));

    const unsubTeam = onSnapshot(teamQ, (snapshot) => {
      setTeam(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'team'));

    return () => {
      unsubDepts();
      unsubMembers();
      unsubTeam();
    };
  }, [user]);

  const handleDelete = async () => {
    if (!deptToDelete) return;
    try {
      await deleteDoc(doc(db, 'departments', deptToDelete));
      setDeptToDelete(null);
      setIsConfirmOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `departments/${deptToDelete}`);
    }
  };

  const getMemberCount = (deptName: string) => {
    const memberCount = members.filter(m => m.department === deptName).length;
    const teamCount = team.filter(t => t.department === deptName).length;
    return memberCount + teamCount;
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.leaderName.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Departamentos</h2>
          <p className="text-gray-500 mt-1">Organização e liderança por áreas de atuação.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedDepartment(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Departamento</span>
        </button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Pesquisar por nome ou líder..." 
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDepartments.map((dept, index) => (
              <motion.div
                key={dept.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 bg-${dept.color || 'blue'}-50 rounded-2xl flex items-center justify-center text-${dept.color || 'blue'}-600`}>
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === dept.id ? null : dept.id)}
                      className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {activeMenu === dept.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-10 p-2">
                        <button 
                          onClick={() => {
                            setSelectedDepartment(dept);
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
                            setDeptToDelete(dept.id);
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

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {dept.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-6 min-h-[40px]">
                  {dept.description || 'Nenhuma descrição fornecida.'}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Líder</span>
                        <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{dept.leaderName}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-700">{getMemberCount(dept.name)} Membros</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">Ativo</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredDepartments.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">Nenhum departamento encontrado.</p>
        </div>
      )}

      <DepartmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={selectedDepartment}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Departamento"
        message="Tem certeza que deseja excluir este departamento? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
