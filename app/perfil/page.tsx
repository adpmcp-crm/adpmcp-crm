'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  Loader2, 
  Shield, 
  Calendar,
  CircleCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    role: 'Usuário'
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            displayName: data.display_name || user.displayName || '',
            email: user.email || '',
            phone: data.phone || '',
            bio: data.bio || '',
            role: data.role || 'Usuário'
          });
        } else {
          setFormData({
            displayName: user.displayName || '',
            email: user.email || '',
            phone: '',
            bio: '',
            role: 'Usuário'
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `profiles/${user.uid}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const docRef = doc(db, 'profiles', user.uid);
      await setDoc(docRef, {
        display_name: formData.displayName,
        phone: formData.phone,
        bio: formData.bio,
        updated_at: new Date().toISOString()
      }, { merge: true });

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `profiles/${user.uid}`);
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Faça login para visualizar seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Meu Perfil</h2>
        <p className="text-gray-500 mt-1">Gerencie suas informações pessoais e preferências.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden relative">
                {user.photoURL ? (
                  <Image 
                    src={user.photoURL} 
                    alt={user.displayName || ''} 
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-16 h-16 text-blue-600" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all border-2 border-white">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{formData.displayName || 'Usuário'}</h3>
            <p className="text-sm text-gray-500 mb-4">{formData.role}</p>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit mx-auto">
              <CircleCheck className="w-3.5 h-3.5" />
              Conta Verificada
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Nível de Acesso</p>
                <p className="text-gray-500">{formData.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Membro desde</p>
                <p className="text-gray-500">{user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR') : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            {message.text && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl text-sm font-medium ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nome Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text"
                    value={formData.displayName}
                    onChange={e => setFormData({...formData, displayName: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full bg-gray-100 border-none rounded-2xl py-3.5 pl-12 pr-4 text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Biografia</label>
              <textarea 
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
