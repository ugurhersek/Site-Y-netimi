import React, { useState, useEffect } from 'react';
import { User, UserRole, Ticket, TicketStatus, TicketType, TicketCategory } from './types';
import * as StorageService from './services/storageService';
import DashboardStats from './components/DashboardStats';
import { TicketCard } from './components/TicketCard';
import TicketDetail from './components/TicketDetail';
import CreateTicketModal from './components/CreateTicketModal';
import CreateUserModal from './components/CreateUserModal';
import BulkUserUploadModal from './components/BulkUserUploadModal';
import IntegrationSimulatorModal from './components/IntegrationSimulatorModal';
import LoginPage from './components/LoginPage';
import { LayoutDashboard, Plus, Building2, LogOut, Search, Filter, UserPlus, Upload, XCircle, Bot } from 'lucide-react';

const App: React.FC = () => {
  // Initialize from session storage if available
  const [currentUser, setCurrentUser] = useState<User | null>(StorageService.getSession());
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<TicketType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Load tickets on mount
  useEffect(() => {
    refreshTickets();
  }, []);

  const refreshTickets = () => {
    setTickets(StorageService.getTickets());
  };

  const handleCreateTicket = (data: Partial<Ticket>) => {
    if (!currentUser) return;
    const newTicket = {
      ...data,
      status: TicketStatus.OPEN,
      authorId: currentUser.id,
      authorName: currentUser.name,
    };
    // @ts-ignore
    StorageService.createTicket(newTicket);
    refreshTickets();
  };

  const handleAddComment = (ticketId: string, content: string) => {
    if (!currentUser) return;
    const updated = StorageService.addComment(ticketId, {
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content
    });
    
    if (updated) {
      refreshTickets();
      setSelectedTicket(updated); // Update the detailed view
    }
  };

  const handleStatusChange = (ticketId: string, status: TicketStatus) => {
    const updated = StorageService.updateTicketStatus(ticketId, status);
    if (updated) {
      refreshTickets();
      setSelectedTicket(updated);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    StorageService.saveSession(user); // Persist login
    setSelectedTicket(null); // Reset selection
  };

  const handleLogout = () => {
    setCurrentUser(null);
    StorageService.clearSession(); // Clear persistent login
    setSelectedTicket(null);
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setCategoryFilter('ALL');
    setSearchTerm('');
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setCategoryFilter('ALL');
    setSearchTerm('');
  };

  // If not logged in, show login page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Filter Logic
  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Residents only see their own tickets, Admins see all
    const matchesUser = currentUser.role === UserRole.ADMIN || t.authorId === currentUser.id;

    return matchesStatus && matchesType && matchesCategory && matchesSearch && matchesUser;
  });

  const hasActiveFilters = statusFilter !== 'ALL' || typeFilter !== 'ALL' || categoryFilter !== 'ALL' || searchTerm !== '';

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="bg-indigo-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-indigo-800">
          <div className="bg-white p-2 rounded-lg">
             <Building2 className="text-indigo-900" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Site Asistanı</h1>
            <p className="text-indigo-300 text-xs">Yönetim Paneli</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
           <button 
             onClick={() => { setSelectedTicket(null); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${!selectedTicket ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800/50'}`}
           >
             <LayoutDashboard size={20} />
             <span>Panel</span>
           </button>

           {/* Admin Only Actions */}
           {currentUser.role === UserRole.ADMIN && (
             <div className="pt-4 mt-4 border-t border-indigo-800/50">
               <p className="px-4 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Yönetim</p>
               <button 
                 onClick={() => setIsCreateUserModalOpen(true)}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-indigo-200 hover:bg-indigo-800/50"
               >
                 <UserPlus size={20} />
                 <span>Kullanıcı Ekle</span>
               </button>
               <button 
                 onClick={() => setIsBulkUploadModalOpen(true)}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-indigo-200 hover:bg-indigo-800/50"
               >
                 <Upload size={20} />
                 <span>Toplu Yükle (Excel)</span>
               </button>
               <button 
                 onClick={() => setIsSimulatorOpen(true)}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-purple-200 hover:bg-purple-900/50"
               >
                 <Bot size={20} />
                 <span>Entegrasyon Simülatörü</span>
               </button>
             </div>
           )}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <div className="mb-4 px-4">
             <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider mb-2">Aktif Kullanıcı</p>
             <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${currentUser.role === UserRole.ADMIN ? 'bg-red-400' : 'bg-green-400'}`}></div>
                <span className="truncate">{currentUser.name}</span>
             </div>
             <div className="text-xs text-indigo-300 mt-1 pl-4">
                 {currentUser.role === UserRole.ADMIN ? 'Yönetici' : 'Site Sakini'}
             </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-950 hover:bg-indigo-800 rounded-lg text-sm transition-colors text-red-200 hover:text-red-100"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50/50">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
             <h2 className="text-2xl font-bold text-gray-800">
                {currentUser.role === UserRole.ADMIN ? 'Site Genel Durumu' : 'Taleplerim'}
             </h2>
             <p className="text-gray-500 text-sm mt-1">
                 {currentUser.role === UserRole.ADMIN 
                    ? 'Tüm bloklardan gelen talep ve şikayetleri yönetin.' 
                    : 'Geçmiş taleplerinizi görüntüleyin veya yeni bir tane oluşturun.'}
             </p>
          </div>

          {currentUser.role === UserRole.RESIDENT && (
             <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
             >
                <Plus size={20} />
                Yeni Talep Oluştur
             </button>
          )}
        </div>

        {/* Admin Stats Dashboard */}
        {currentUser.role === UserRole.ADMIN && (
            <DashboardStats tickets={tickets} />
        )}

        {/* Improved Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
           
           <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full lg:w-1/3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Talep başlığı veya içerik ara..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
              </div>

              {/* Filters Group */}
              <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                  {/* Status Filter */}
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'ALL')}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="ALL">Tüm Durumlar</option>
                    {Object.values(TicketStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  {/* Type Filter */}
                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as TicketType | 'ALL')}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="ALL">Tüm Türler</option>
                    {Object.values(TicketType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  {/* Category Filter */}
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as TicketCategory | 'ALL')}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="ALL">Tüm Kategoriler</option>
                    {Object.values(TicketCategory).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Clear Filter Button */}
                  {hasActiveFilters && (
                    <button 
                      onClick={clearFilters}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <XCircle size={18} />
                      <span className="sm:hidden lg:inline">Temizle</span>
                    </button>
                  )}
              </div>
           </div>
        </div>

        {/* Ticket List */}
        {filteredTickets.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Filter className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Sonuç Bulunamadı</h3>
                <p className="text-gray-500">Seçtiğiniz filtreleme kriterlerine uygun talep yok.</p>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="mt-4 text-indigo-600 font-medium hover:text-indigo-800"
                  >
                    Filtreleri Temizle
                  </button>
                )}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTickets.map(ticket => (
                <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    onClick={() => setSelectedTicket(ticket)} 
                />
            ))}
            </div>
        )}
      </main>

      {/* Modals */}
      {selectedTicket && currentUser && (
        <TicketDetail 
            ticket={selectedTicket} 
            currentUser={currentUser}
            onClose={() => setSelectedTicket(null)}
            onAddComment={handleAddComment}
            onStatusChange={handleStatusChange}
        />
      )}

      {isCreateModalOpen && (
          <CreateTicketModal 
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateTicket}
          />
      )}

      {isCreateUserModalOpen && (
        <CreateUserModal 
          onClose={() => setIsCreateUserModalOpen(false)}
        />
      )}

      {isBulkUploadModalOpen && (
        <BulkUserUploadModal 
          onClose={() => setIsBulkUploadModalOpen(false)}
        />
      )}

      {isSimulatorOpen && (
          <IntegrationSimulatorModal
            onClose={() => setIsSimulatorOpen(false)}
            onSuccess={() => {
                refreshTickets();
                // setIsSimulatorOpen(false); // Optional: Keep open for more tests
            }}
          />
      )}
    </div>
  );
};

export default App;