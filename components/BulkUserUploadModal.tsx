import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import * as StorageService from '../services/storageService';
import * as XLSX from 'xlsx';

interface BulkUserUploadModalProps {
  onClose: () => void;
}

const BulkUserUploadModal: React.FC<BulkUserUploadModalProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null); // Reset previous results
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Map excel data to our structure
        const usersToCreate = jsonData.map((row: any) => ({
          name: row['Ad Soyad'] || row['ad soyad'] || row['Name'],
          username: row['Kullanıcı Adı'] || row['kullanıcı adı'] || row['Username'],
          password: row['Şifre'] || row['şifre'] || row['Password'] ? String(row['Şifre'] || row['şifre'] || row['Password']) : '',
          email: row['E-Posta'] || row['e-posta'] || row['Email'] || '',
          phone: row['Telefon'] || row['telefon'] || row['Phone'] ? String(row['Telefon'] || row['telefon'] || row['Phone']) : ''
        }));

        const result = StorageService.createUsersBatch(usersToCreate);
        setResult(result);
      } catch (error) {
        console.error("Excel parse error", error);
        setResult({ success: 0, errors: ['Dosya okunurken bir hata oluştu. Formatı kontrol edin.'] });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-green-600" />
            <h2 className="text-lg font-bold text-gray-800">Toplu Kullanıcı Yükle (Excel)</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!result ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p className="font-semibold mb-1">Excel Dosya Formatı:</p>
                <p>Dosyanızın ilk satırında şu başlıklar olmalıdır:</p>
                <ul className="list-disc list-inside mt-1 ml-1 text-blue-700">
                  <li>Ad Soyad</li>
                  <li>Kullanıcı Adı</li>
                  <li>Şifre</li>
                  <li>E-Posta (Opsiyonel)</li>
                  <li>Telefon (Opsiyonel)</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload size={32} className="text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {file ? file.name : 'Dosya seçmek için tıklayın veya sürükleyin'}
                </p>
                <p className="text-xs text-gray-400 mt-1">.xlsx veya .csv</p>
              </div>

              <button 
                onClick={handleUpload}
                disabled={!file || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Yükleniyor...' : 'Kullanıcıları Yükle'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                 {result.success > 0 ? <CheckCircle size={48} className="text-green-500" /> : <AlertCircle size={48} className="text-red-500" />}
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">İşlem Tamamlandı</h3>
                <p className="text-gray-600 mt-1">
                  <span className="font-bold text-green-600">{result.success}</span> kullanıcı başarıyla eklendi.
                </p>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <h4 className="text-sm font-bold text-red-800 mb-2">Hatalar ({result.errors.length}):</h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button 
                onClick={onClose}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Pencereyi Kapat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUserUploadModal;