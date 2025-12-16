import React from 'react';
import { Ticket, TicketStatus, TicketType, TicketSource } from '../types';
import { Clock, MessageSquare, Globe, Mail, MessageCircle } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

const statusColors = {
  [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800',
  [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [TicketStatus.CLOSED]: 'bg-gray-100 text-gray-800',
};

const typeColors = {
  [TicketType.COMPLAINT]: 'text-red-600',
  [TicketType.REQUEST]: 'text-blue-600',
  [TicketType.SUGGESTION]: 'text-purple-600',
};

const SourceIcon = ({ source }: { source: TicketSource }) => {
    switch (source) {
        case TicketSource.EMAIL: return <Mail size={14} className="text-blue-500" />;
        case TicketSource.WHATSAPP: return <MessageCircle size={14} className="text-green-500" />;
        default: return <Globe size={14} className="text-gray-400" />;
    }
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit mb-2 ${statusColors[ticket.status]}`}>
            {ticket.status}
            </span>
            <span className={`text-xs font-medium uppercase tracking-wider ${typeColors[ticket.type]}`}>
            {ticket.type}
            </span>
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock size={14} />
          {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
        </span>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{ticket.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-gray-500">
            <SourceIcon source={ticket.source} />
            <span className="font-medium text-gray-700 truncate max-w-[100px]">{ticket.authorName}</span>
            <span>•</span>
            <span>{ticket.category}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-xs">
            <MessageSquare size={14} />
            <span>{ticket.comments.length}</span>
        </div>
      </div>
    </div>
  );
};