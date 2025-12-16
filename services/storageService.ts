import { Ticket, TicketStatus, TicketType, TicketCategory, UserRole, Comment, User, TicketSource } from "../types";

const STORAGE_KEY_TICKETS = 'site_asistan_tickets_v1'; // Versioning keys helps prevent conflicts
const STORAGE_KEY_USERS = 'site_asistan_users_v1';
const STORAGE_KEY_SESSION = 'site_asistan_session_v1';

// Seed Users
const SEED_USERS: User[] = [
  {
    id: 'admin1',
    name: 'Site Yönetimi',
    username: 'admin',
    password: '123',
    role: UserRole.ADMIN,
    email: 'yonetim@site.com',
    phone: '5550000000'
  },
  {
    id: 'u1',
    name: 'Ahmet Yılmaz (Daire 14)',
    username: 'ahmet',
    password: '123',
    role: UserRole.RESIDENT,
    email: 'ahmet@gmail.com',
    phone: '5551112233'
  },
  {
    id: 'u2',
    name: 'Ayşe Demir (Daire 5)',
    username: 'ayse',
    password: '123',
    role: UserRole.RESIDENT,
    email: 'ayse@hotmail.com',
    phone: '5554445566'
  }
];

// Initial dummy ticket data
const SEED_TICKETS: Ticket[] = [
  {
    id: '1',
    title: 'Asansör yine çalışmıyor',
    description: 'B Blok sağ asansör 3. katta takılıyor ve garip sesler çıkarıyor. Acil kontrol edilmeli.',
    type: TicketType.COMPLAINT,
    category: TicketCategory.TECHNICAL,
    status: TicketStatus.OPEN,
    source: TicketSource.WEB,
    authorId: 'u1',
    authorName: 'Ahmet Yılmaz (Daire 14)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    comments: []
  },
  {
    id: '2',
    title: 'Havuz temizliği hakkında',
    description: 'Havuzun dip temizliği yeterince sık yapılmıyor gibi görünüyor. Programı sıklaştırabilir miyiz?',
    type: TicketType.SUGGESTION,
    category: TicketCategory.CLEANING,
    status: TicketStatus.IN_PROGRESS,
    source: TicketSource.WEB,
    authorId: 'u2',
    authorName: 'Ayşe Demir (Daire 5)',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    comments: [
      {
        id: 'c1',
        authorId: 'admin1',
        authorName: 'Yönetim',
        authorRole: UserRole.ADMIN,
        content: 'Merhaba Ayşe Hanım, konuyla ilgili temizlik firmasıyla görüştük. Bu hafta ekstra bir temizlik yapılacak.',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  },
  {
    id: '3',
    title: 'Misafir otoparkı sorunu',
    description: 'Misafir otoparkına sürekli yabancı araçlar park ediyor. Güvenlik daha dikkatli olmalı.',
    type: TicketType.COMPLAINT,
    category: TicketCategory.SECURITY,
    status: TicketStatus.RESOLVED,
    source: TicketSource.WHATSAPP,
    authorId: 'u3',
    authorName: 'Mehmet Öz (Daire 22)',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    comments: []
  }
];

// Helper for safe storage access
const safeGet = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
};

const safeSet = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
};

// Initialize if empty
const initStorage = () => {
    if (!localStorage.getItem(STORAGE_KEY_USERS)) {
        safeSet(STORAGE_KEY_USERS, SEED_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEY_TICKETS)) {
        safeSet(STORAGE_KEY_TICKETS, SEED_TICKETS);
    }
};

// Run initialization immediately
initStorage();

// --- User Functions ---

export const getUsers = (): User[] => {
  return safeGet<User[]>(STORAGE_KEY_USERS, SEED_USERS);
};

export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.id === id);
};

export const findUserByContact = (identifier: string): User | undefined => {
  const users = getUsers();
  const cleanId = identifier.replace(/\s/g, '').toLowerCase();
  
  return users.find(u => {
    const emailMatch = u.email?.toLowerCase() === cleanId;
    const phoneMatch = u.phone?.replace(/\s/g, '') === cleanId;
    return emailMatch || phoneMatch;
  });
};

export const loginUser = (username: string, password: string): User | null => {
  const users = getUsers();
  // Simple auth check
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

export const createUser = (name: string, username: string, password: string, email?: string, phone?: string): User => {
  const users = getUsers();
  
  if (users.find(u => u.username === username)) {
    throw new Error("Bu kullanıcı adı zaten kullanımda.");
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    username,
    password,
    role: UserRole.RESIDENT,
    email,
    phone
  };

  const updatedUsers = [...users, newUser];
  
  if (!safeSet(STORAGE_KEY_USERS, updatedUsers)) {
      throw new Error("Kullanıcı kaydedilirken bir hata oluştu (Depolama sorunu).");
  }
  
  return newUser;
};

export const createUsersBatch = (usersData: {name: string, username: string, password: string, email?: string, phone?: string}[]): { success: number, errors: string[] } => {
  const currentUsers = getUsers();
  const errors: string[] = [];
  let successCount = 0;
  const newUsers: User[] = [];

  usersData.forEach((userData, index) => {
    if (!userData.name || !userData.username || !userData.password) {
      errors.push(`Satır ${index + 1}: Eksik bilgi (Ad, Kullanıcı Adı veya Şifre boş).`);
      return;
    }

    if (currentUsers.some(u => u.username === userData.username) || newUsers.some(u => u.username === userData.username)) {
      errors.push(`Satır ${index + 1}: "${userData.username}" kullanıcı adı zaten mevcut.`);
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name,
      username: userData.username,
      password: userData.password,
      email: userData.email,
      phone: userData.phone,
      role: UserRole.RESIDENT
    };

    newUsers.push(newUser);
    successCount++;
  });

  if (newUsers.length > 0) {
    const updatedUsers = [...currentUsers, ...newUsers];
    safeSet(STORAGE_KEY_USERS, updatedUsers);
  }

  return { success: successCount, errors };
};

export const resetPassword = (username: string, newPassword: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.username === username);
  
  if (userIndex === -1) {
    return false;
  }

  users[userIndex].password = newPassword;
  safeSet(STORAGE_KEY_USERS, users);
  return true;
};

// --- Session Management ---

export const getSession = (): User | null => {
  return safeGet<User | null>(STORAGE_KEY_SESSION, null);
};

export const saveSession = (user: User) => {
  safeSet(STORAGE_KEY_SESSION, user);
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY_SESSION);
};

// --- Ticket Functions ---

export const getTickets = (): Ticket[] => {
  return safeGet<Ticket[]>(STORAGE_KEY_TICKETS, SEED_TICKETS);
};

export const createTicket = (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Ticket => {
  const tickets = getTickets();
  const newTicket: Ticket = {
    ...ticket,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: []
  };
  const updatedTickets = [newTicket, ...tickets];
  safeSet(STORAGE_KEY_TICKETS, updatedTickets);
  return newTicket;
};

export const addComment = (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Ticket | null => {
  const tickets = getTickets();
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex === -1) return null;

  const newComment: Comment = {
    ...comment,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };

  tickets[ticketIndex].comments.push(newComment);
  tickets[ticketIndex].updatedAt = new Date().toISOString();
  
  safeSet(STORAGE_KEY_TICKETS, tickets);
  return tickets[ticketIndex];
};

export const updateTicketStatus = (ticketId: string, status: TicketStatus): Ticket | null => {
  const tickets = getTickets();
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex === -1) return null;

  tickets[ticketIndex].status = status;
  tickets[ticketIndex].updatedAt = new Date().toISOString();
  
  safeSet(STORAGE_KEY_TICKETS, tickets);
  return tickets[ticketIndex];
};
