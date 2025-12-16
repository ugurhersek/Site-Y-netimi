import React, { useState } from 'react';
import { KeyRound, X, Check, ArrowRight } from 'lucide-react';
import * as StorageService from '../services/storageService';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword.trim() || !username.trim()) {
        setError('Lütfen tüm alanları doldurun.');
        return;
    }

    const result = StorageService.resetPassword(username, newPassword);

    if (result) {
      setSuccess('Şifreniz başarıyla güncellendi. Giriş ekranına yönlendiriliyorsunuz...');
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError('Bu kullanıcı adına sahip bir kayıt bulunamadı.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <KeyRound size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-800">Şifremi Unuttum</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-sm text-gray-600 mb-2">
            Şifrenizi sıfırlamak için kullanıcı adınızı ve yeni şifrenizi giriniz.
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          {success && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-2"><Check size={16}/> {success}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Kullanıcı adınız"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Yeni şifreniz"
              required
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Şifreyi Güncelle
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;