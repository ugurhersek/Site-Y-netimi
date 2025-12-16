import React, { useState } from 'react';
import { Ticket, Comment, User, UserRole, TicketStatus } from '../types';
import { Send, User as UserIcon, Shield, X, Sparkles, BrainCircuit } from 'lucide-react';
import { generateAdminReplySuggestion, summarizeTicketThread } from '../services/geminiService';

interface TicketDetailProps {
  ticket: Ticket;
  currentUser: User;
  onClose: () => void;
  onAddComment: (ticketId: string, content: string) => void;
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ 
  ticket, 
  currentUser, 
  onClose, 
  onAddComment,
  onStatusChange 
}) => {
  const [newComment, setNewComment] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(ticket.id, newComment);
    setNewComment('');
  };

  const handleAiSuggest = async () => {
    setIsAiLoading(true);
    const suggestion = await generateAdminReplySuggestion(ticket);
    setNewComment(suggestion);
    setIsAiLoading(false);
  };
  
  const handleSummarize = async () => {
      setIsAiLoading(true);
      const sum = await summarizeTicketThread(ticket);
      setSummary(sum);
      setIsAiLoading(false);
  };

  const handleStatusChangeInternal = (newStatus: TicketStatus) => {
      onStatusChange(ticket.id, newStatus);
  };

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700">{ticket.category}</span>
               <span className="text-gray-400 text-xs">#{ticket.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{ticket.title}</h2>
            <div className="text-sm text-gray-500 mt-1">
                Açan: <span className="font-medium text-gray-800">{ticket.authorName}</span> • {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            
            {/* Status Bar (Admin Only) */}
            {isAdmin && (
                <div className="bg-white p-4 rounded-lg border border-indigo-100 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">Durum Değiştir:</span>
                        <select 
                            value={ticket.status} 
                            onChange={(e) => handleStatusChangeInternal(e.target.value as TicketStatus)}
                            className="border-gray-300 border rounded-md text-sm py-1.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {Object.values(TicketStatus).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleSummarize}
                        disabled={isAiLoading}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium disabled:opacity-50"
                    >
                        <BrainCircuit size={16} />
                        {isAiLoading ? 'Analiz ediliyor...' : 'Özetle (AI)'}
                    </button>
                </div>
            )}
            
            {summary && (
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-800 text-sm">
                    <span className="font-bold block mb-1">💡 AI Özeti:</span>
                    {summary}
                </div>
            )}

            {/* Original Ticket Description */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 relative">
                <div className="absolute -left-3 top-6 w-6 h-6 bg-white rounded-full border border-gray-200 flex items-center justify-center">
                    <UserIcon size={14} className="text-gray-400"/>
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{ticket.description}</p>
            </div>

            {/* Comments Timeline */}
            <div className="space-y-6 relative ml-4 border-l-2 border-gray-200 pl-8 pb-4">
                {ticket.comments.map((comment) => (
                    <div key={comment.id} className="relative group">
                        <div className={`absolute -left-[41px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${comment.authorRole === UserRole.ADMIN ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                            {comment.authorRole === UserRole.ADMIN ? <Shield size={14} className="text-white"/> : <UserIcon size={14} className="text-gray-500"/>}
                        </div>
                        <div className={`p-4 rounded-lg shadow-sm border ${comment.authorRole === UserRole.ADMIN ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={`font-semibold text-sm ${comment.authorRole === UserRole.ADMIN ? 'text-indigo-700' : 'text-gray-800'}`}>
                                    {comment.authorName} {comment.authorRole === UserRole.ADMIN && '(Yönetici)'}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString('tr-TR')}</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Reply Box */}
        <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {isAdmin && (
                    <div className="flex justify-end">
                        <button 
                            type="button" 
                            onClick={handleAiSuggest}
                            disabled={isAiLoading}
                            className="text-xs flex items-center gap-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors font-medium"
                        >
                            <Sparkles size={14} />
                            {isAiLoading ? 'Yazılıyor...' : 'AI Cevap Önerisi'}
                        </button>
                    </div>
                )}
                <div className="flex gap-2">
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Bir cevap yazın..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 text-sm"
                    />
                    <button 
                        type="submit" 
                        disabled={!newComment.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white p-3 rounded-lg self-end transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  );
};

export default TicketDetail;