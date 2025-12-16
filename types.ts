export enum UserRole {
  RESIDENT = 'RESIDENT',
  ADMIN = 'ADMIN'
}

export enum TicketType {
  COMPLAINT = 'Şikayet',
  REQUEST = 'İstek',
  SUGGESTION = 'Öneri'
}

export enum TicketCategory {
  GENERAL = 'Genel',
  SECURITY = 'Güvenlik',
  CLEANING = 'Temizlik',
  LANDSCAPE = 'Peyzaj',
  TECHNICAL = 'Teknik/Tamirat',
  NOISE = 'Gürültü',
  PARKING = 'Otopark'
}

export enum TicketStatus {
  OPEN = 'Açık',
  IN_PROGRESS = 'İşlemde',
  RESOLVED = 'Çözüldü',
  CLOSED = 'Kapandı'
}

export enum TicketSource {
  WEB = 'Web Paneli',
  EMAIL = 'E-Posta',
  WHATSAPP = 'WhatsApp'
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string; // ISO string
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  category: TicketCategory;
  status: TicketStatus;
  source: TicketSource;
  authorId: string;
  authorName: string; // Eg: Daire 12
  createdAt: string; // ISO string
  updatedAt: string;
  comments: Comment[];
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  password?: string;
  email?: string;
  phone?: string;
}