'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Heart, 
  ShieldCheck, 
  Church,
  Loader2,
  Calendar,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: any;
  type: 'member' | 'team';
}

export function MemberModal({ isOpen, onClose, member, type }: MemberModalProps) {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    function: '',
    workplace: '',
    maritalStatus: '',
    baptismStatus: 'Não Batizado',
    status: type === 'member' ? 'ativo' : 'Pastor',
    campusId: '',
    birthDate: '',
    address: '',
    department: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'campuses'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCampuses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        function: member.function || '',
        workplace: member.workplace || '',
        maritalStatus: member.maritalStatus || '',
        baptismStatus: member.baptismStatus || 'Não Batizado',
        status: member.status || (type === 'member' ? 'ativo' : 'Pastor'),
        campusId: member.campusId || '',
        birthDate: member.birthDate || '',
        address: member.address || '',
        department: member.department || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        function: '',
        workplace: '',
        maritalStatus: '',
        baptismStatus: 'Não Batizado',
        status: type === 'member' ? 'ativo' : 'Pastor',
        campusId: '',
        birthDate: '',
        address: '',
        department: ''
      });
    }
  }, [member, type, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const collectionName = type === 'member' ? 'members' : 'team';
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
        createdAt: member ? member.createdAt : serverTimestamp()
      };

      if (member?.id) {
        // Atualiza na coleção original (membros ou equipa)
        await updateDoc(doc(db, collectionName, member.id), data);
        
        // Se for membro da equipa, também sincroniza na coleção de membros
        if (type === 'team') {
          try {
            await updateDoc(doc(db, 'members', member.id), data);
          } catch (e) {
            // Se o documento não existir na coleção de membros (ex: registros antigos), cria-o
            await setDoc(doc(db, 'members', member.id), data);
          }
        }
      } else {
        if (type === 'team') {
          // Para novos membros da equipa, criamos em ambas as coleções com o mesmo ID
          const teamRef = await addDoc(collection(db, 'team'), data);
          await setDoc(doc(db, 'members', teamRef.id), data);
        } else {
          // Membro comum
          await addDoc(collection(db, 'members'), data);
        }
      }
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erro ao salvar. Verifique as permissões.');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = type === 'member' 
    ? ['ativo', 'inativo', 'baptizado', 'discipulado', 'não baptizado']
    : ['Pastor', 'Evangelista', 'Ancião', 'Diacono', 'Diaconisa', 'Cooperador', 'Cooperadora'];

  const departmentOptions = [
    'Geração de Samuel', 
    'Juventude', 
    'Crianças', 
    'Filhas de Sara', 
    'Filhos de Abraão', 
    'Comunicação e Imagem', 
    'Direção do Ministério', 
    'Discipulado', 
    'Evangelismo e Missões'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {member ? 'Editar' : 'Cadastrar'} {type === 'member' ? 'Membro' : 'Líder'}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nome Completo *</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Nome do membro"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">E-mail</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="exemplo@email.com"
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Telefone *</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="+244 9xx xxx xxx"
                    />
                  </div>
                </div>

                {/* Função */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Função *</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      value={formData.function}
                      onChange={e => setFormData({...formData, function: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Ex: Secretário, Líder de Louvor"
                    />
                  </div>
                </div>

                {/* Trabalha em */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Trabalha em (Emprego/Empresa)</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      value={formData.workplace}
                      onChange={e => setFormData({...formData, workplace: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>

                {/* Estado Civil */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Estado Civil</label>
                  <div className="relative group">
                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <select 
                      value={formData.maritalStatus}
                      onChange={e => setFormData({...formData, maritalStatus: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm appearance-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                  </div>
                </div>

                {/* Status de Batismo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Status de Batismo *</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <select 
                      required
                      value={formData.baptismStatus}
                      onChange={e => setFormData({...formData, baptismStatus: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm appearance-none"
                    >
                      <option value="Baptizado">Baptizado</option>
                      <option value="Não Batizado">Não Batizado</option>
                    </select>
                  </div>
                </div>

                {/* Status Geral */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Status Geral *</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <select 
                      required
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm appearance-none capitalize"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Data de Nascimento */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Data de Nascimento *</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      type="date"
                      value={formData.birthDate}
                      onChange={e => setFormData({...formData, birthDate: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Endereço *</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Rua, Bairro, Cidade"
                    />
                  </div>
                </div>

                {/* Departamento */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Departamento *</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <select 
                      required
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm appearance-none"
                    >
                      <option value="">Selecione o Departamento...</option>
                      {departmentOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Igreja (Campus) */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Igreja *</label>
                  <div className="relative group">
                    <Church className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <select 
                      required
                      value={formData.campusId}
                      onChange={e => setFormData({...formData, campusId: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm appearance-none"
                    >
                      <option value="">Selecione a Igreja...</option>
                      {campuses.map(campus => (
                        <option key={campus.id} value={campus.id}>{campus.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Dados'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
