'use client';

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebase } from '@/components/providers/FirebaseProvider';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Briefcase, 
  Loader2,
  Trash2,
  Edit2,
  ChevronRight,
  FileText,
  MoreVertical,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityModal } from '@/components/modals/ActivityModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AgendaAnualPage() {
  const { user, loading: authLoading } = useFirebase();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'activities'), orderBy('month', 'asc'), orderBy('day', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching activities:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const nextActivity = activities.find(a => a.status !== 'Completed');
  const departmentalFestivals = activities.filter(a => a.department && a.department !== 'Geral').slice(0, 2);

  const handleDelete = async () => {
    if (!activityToDelete) return;
    try {
      await deleteDoc(doc(db, 'activities', activityToDelete));
      setActivityToDelete(null);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text(`Agenda Anual ${currentYear}`, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-PT')}`, 14, 30);

    const tableData = activities.map(activity => [
      `${activity.day} ${activity.month}`,
      activity.title,
      activity.department || 'Geral',
      activity.status === 'Completed' ? 'Concluído' : 
      activity.status === 'Confirmed' ? 'Confirmado' : 
      activity.status === 'Next Week' ? 'Próxima Semana' : 'Pendente',
      activity.successFeedback || '-',
      activity.failureFeedback || '-'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Data', 'Actividade', 'Departamento', 'Status', 'O que deu certo', 'O que deu errado']],
      body: tableData,
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        4: { cellWidth: 40 }, // Success column
        5: { cellWidth: 40 }  // Failure column
      },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    doc.save(`Agenda_Anual_${currentYear}.pdf`);
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
            <span>Ministério</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Planeamento Anual</span>
          </nav>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Agenda Anual</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">Visão estratégica de todos os cultos, festivais e assembleias administrativas.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            className="px-5 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl text-sm flex items-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>
          <button 
            onClick={() => {
              setSelectedActivity(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nova Actividade
          </button>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total de Eventos</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black text-gray-900">{activities.length}</span>
            <span className="text-emerald-500 font-bold text-sm">+12%</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-[75%]"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pico de Atividade</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black text-gray-900">Ago</span>
            <span className="text-gray-500 text-sm font-medium">18 Eventos</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 font-bold italic uppercase tracking-wider">Mês de Baptismo</p>
        </div>
        <div className="md:col-span-2 bg-blue-600 p-8 rounded-[32px] shadow-xl shadow-blue-100 relative overflow-hidden flex flex-col justify-between text-white">
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Destaque Próximo</span>
            {nextActivity ? (
              <>
                <h3 className="text-2xl font-bold mt-1">{nextActivity.title}</h3>
                <p className="text-blue-100 text-sm mt-1">Agendado para {nextActivity.day} de {nextActivity.month}</p>
              </>
            ) : (
              <h3 className="text-2xl font-bold mt-1">Nenhuma actividade próxima</h3>
            )}
          </div>
          <div className="mt-6 flex -space-x-2 relative z-10">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-blue-600 bg-blue-400 flex items-center justify-center text-xs font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-[10px] font-bold border-2 border-blue-600">+42</div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {months.map(month => {
            const monthActivities = activities.filter(a => a.month === month);
            if (monthActivities.length === 0) return null;

            return (
              <div key={month} className="space-y-6">
                <div className="flex items-center gap-6">
                  <h2 className="text-2xl font-black text-gray-900">{month}</h2>
                  <div className="h-px flex-1 bg-gray-100"></div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{monthActivities.length} Eventos</span>
                </div>
                <div className="space-y-4">
                  {monthActivities.map(activity => (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex gap-6 p-6 bg-white rounded-[32px] border border-gray-100 hover:shadow-xl transition-all duration-300 relative"
                    >
                      <div className="flex flex-col items-center justify-center min-w-[70px] h-[70px] bg-gray-50 rounded-2xl border-l-4 border-blue-600">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{month.substring(0, 3)}</span>
                        <span className="text-2xl font-black text-gray-900">{activity.day}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{activity.title}</h4>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" />
                                {activity.department || 'Geral'}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {activity.location || 'Templo Sede'}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              activity.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                              activity.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' :
                              activity.status === 'Next Week' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
                            }`}>
                              {activity.status === 'Completed' ? 'Concluído' :
                               activity.status === 'Confirmed' ? 'Confirmado' :
                               activity.status === 'Next Week' ? 'Próxima Semana' : 'Pendente'}
                            </span>
                            <div className="relative">
                              <button 
                                onClick={() => setActiveMenu(activeMenu === activity.id ? null : activity.id)}
                                className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                              {activeMenu === activity.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-10 p-2">
                                  <button 
                                    onClick={() => {
                                      setSelectedActivity(activity);
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
                                      setActivityToDelete(activity.id);
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
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}

          {!loading && activities.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">Nenhuma atividade cadastrada para este ano.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Adicionar primeira atividade
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Festivais Departamentais</h3>
            <div className="space-y-4">
              {departmentalFestivals.length > 0 ? departmentalFestivals.map((festival, idx) => (
                <div key={festival.id} className="p-5 bg-white rounded-3xl shadow-sm hover:translate-y-[-4px] transition-all duration-300 border border-gray-100">
                  <div className={`w-10 h-10 ${idx % 2 === 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center rounded-2xl mb-4`}>
                    {idx % 2 === 0 ? <Users className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                  </div>
                  <h4 className="font-bold text-gray-900">{festival.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{festival.day} de {festival.month}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {festival.status === 'Completed' ? 'CONCLUÍDO' : 'PLANEAMENTO'}
                    </span>
                    <div className="w-16 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                      <div className={`h-full ${festival.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-600'} w-[${festival.status === 'Completed' ? '100%' : '60%'}]`}></div>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 italic">Nenhum festival agendado.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Índice Litúrgico</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <span className="text-sm font-bold text-gray-700">Sacramentos & Baptismos</span>
                </div>
                <span className="text-sm font-black text-blue-600">12</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-bold text-gray-700">Comunidade & Festivais</span>
                </div>
                <span className="text-sm font-black text-emerald-600">24</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-sm font-bold text-gray-700">Sessões Administrativas</span>
                </div>
                <span className="text-sm font-black text-amber-600">8</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ActivityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={selectedActivity}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Atividade"
        message="Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
