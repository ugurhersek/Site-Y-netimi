import React, { useState } from 'react';
import { Send, X, Mail, MessageCircle, Bot, RefreshCw, Server } from 'lucide-react';
import { TicketSource } from '../types';
import * as IntegrationService from '../services/integrationService';

interface IntegrationSimulatorModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const IntegrationSimulatorModal: React.FC<IntegrationSimulatorModalProps> = ({ onClose, onSuccess }) => {
  const [source, setSource] = useState<TicketSource>(TicketSource.EMAIL);
  const [senderIdentifier, setSenderIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isBotRunning, setIsBotRunning] = useState(false);

  // Manual Simulation Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderIdentifier || !message) return;

    const res = IntegrationService.processIncomingMessage(source, senderIdentifier, message);
    setResult(res);

    if (res.success) {
        setTimeout(() => {
            onSuccess();
        }, 1000);
    }
  };

  // Bot Simulation Handler (ugurhersek@gmail.com)
  const handleCheckInbox = async () => {
      setIsBotRunning(true);
      setResult(null);
      
      try {
          const res = await IntegrationService.checkAdminEmailInbox();
          setResult(res);
          setTimeout(() => {
              onSuccess();
              setIsBotRunning(false);
          }, 1000);
      } catch (e) {
          setIsBotRunning(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-purple-600" />
            <h2 className="text-lg font-bold text-gray-800">Entegrasyon Simülatörü</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
            
            {/* 1. Automatic Inbox Check Simulation */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Server size={18} className="text-indigo-600" />
                    <h3 className="font-bold text-gray-800 text-sm">Otomatik E-Posta Botu</h3>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                    Sistem arka planda <strong>ugurhersek@gmail.com</strong> adresini izler. Site sakinlerinden gelen mailleri otomatik olarak tanır, kullanıcıyı bulur ve talep oluşturur.
                </p>
                
                <button 
                    onClick={handleCheckInbox}
                    disabled={isBotRunning}
                    className="w-full bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-700 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    {isBotRunning ? (
                        <>
                            <RefreshCw size={16} className="animate-spin" />
                            Gelen Kutusu Taranıyor...
                        </>
                    ) : (
                        <>
                            <Mail size={16} />
                            ugurhersek@gmail.com Kontrol Et
                        </>
                    )}
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs text-gray-400 font-medium uppercase">veya Manuel Test Et</span>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {/* 2. Manual Test Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {result && (
                    <div className={`p-3 rounded-lg text-sm border whitespace-pre-line ${result.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {result.message}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kaynak</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setSource(TicketSource.EMAIL)}
                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${source === TicketSource.EMAIL ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                        >
                            <Mail size={18} />
                            E-Posta
                        </button>
                        <button
                            type="button"
                            onClick={() => setSource(TicketSource.WHATSAPP)}
                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${source === TicketSource.WHATSAPP ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                        >
                            <MessageCircle size={18} />
                            WhatsApp
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {source === TicketSource.EMAIL ? 'Gönderen E-Posta' : 'Gönderen Telefon No'}
                    </label>
                    <input 
                        type="text" 
                        value={senderIdentifier}
                        onChange={(e) => setSenderIdentifier(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder={source === TicketSource.EMAIL ? 'ornek@email.com' : '5551234567'}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mesaj İçeriği</label>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Gönderilen mesaj..."
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Send size={18} />
                    Manuel Simülasyonu Başlat
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSimulatorModal;