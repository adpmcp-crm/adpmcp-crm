'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Church, 
  MapPin, 
  User, 
  Loader2,
  Image as ImageIcon,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CampusModalProps {
  isOpen: boolean;
  onClose: () => void;
  campus?: any;
}

export function CampusModal({ isOpen, onClose, campus }: CampusModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    pastorName: '',
    imageUrl: '',
    phone: ''
  });

  useEffect(() => {
    if (campus) {
      setFormData({
        name: campus.name || '',
        address: campus.address || '',
        pastorName: campus.pastorName || '',
        imageUrl: campus.imageUrl || '',
        phone: campus.phone || ''
      });
    } else {
      setFormData({
        name: '',
        address: '',
        pastorName: '',
        imageUrl: '',
        phone: ''
      });
    }
  }, [campus, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
        createdAt: campus ? campus.createdAt : serverTimestamp()
      };

      if (campus?.id) {
        await updateDoc(doc(db, 'campuses', campus.id), data);
      } else {
        await addDoc(collection(db, 'campuses'), data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving campus:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {campus ? 'Editar' : 'Nova'} Igreja
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                {/* Nome */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nome da Igreja *</label>
                  <div className="relative group">
                    <Church className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Ex: Templo Sede"
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
                      placeholder="Localização da igreja"
                    />
                  </div>
                </div>

                {/* Pastor */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Pastor Responsável *</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      value={formData.pastorName}
                      onChange={e => setFormData({...formData, pastorName: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Nome do pastor"
                    />
                  </div>
                </div>

                {/* Contacto */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Contacto / Telefone *</label>
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

                {/* Imagem URL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">URL da Imagem</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="https://exemplo.com/foto.jpg"
                    />
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Igreja'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
