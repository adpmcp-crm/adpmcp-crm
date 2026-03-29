'use client';

import React, { useRef } from 'react';
import { read, utils } from 'xlsx';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { Download } from 'lucide-react';

interface SpreadsheetUploadButtonProps {
  collectionName: 'members' | 'team';
}

export function SpreadsheetUploadButton({ collectionName }: SpreadsheetUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = utils.sheet_to_json(worksheet);

      try {
        const colRef = collection(db, collectionName);
        for (const row of json as any[]) {
          await addDoc(colRef, {
            ...row,
            createdAt: serverTimestamp(),
          });
        }
        alert('Dados importados com sucesso!');
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, collectionName);
        alert('Erro ao importar dados.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
      >
        <Download className="w-5 h-5" />
        <span>Subir Planilha</span>
      </button>
    </>
  );
}
