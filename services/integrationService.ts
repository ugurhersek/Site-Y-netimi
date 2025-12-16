import * as StorageService from './storageService';
import { TicketCategory, TicketSource, TicketStatus, TicketType } from '../types';

// Helper: Determine Ticket Type based on keywords
const analyzeTicketType = (text: string): TicketType => {
  const t = text.toLowerCase();
  
  const complaintKeywords = [
    'şikayet', 'bozuk', 'çalışmıyor', 'arızalı', 'kötü', 'rezalet', 'berbat', 
    'kirli', 'kokuyor', 'yanmıyor', 'akıtıyor', 'patlak', 'tehlike', 'sorun', 
    'rahatsız', 'gürültü', 'yavaş', 'kırık'
  ];
  
  const suggestionKeywords = [
    'öneri', 'tavsiye', 'fikir', 'olsa iyi olur', 'yapılmalı', 'eklense', 
    'düşünülebilir', 'bence', 'koysak', 'yapsak', 'daha iyi olur'
  ];
  
  // Default fallback is usually Request, but here are specific keywords
  // const requestKeywords = ['istiyorum', 'talep', 'rica', 'lütfen', 'lazım', 'gerek', 'ihtiyaç', 'alabilir miyim'];

  if (complaintKeywords.some(k => t.includes(k))) return TicketType.COMPLAINT;
  if (suggestionKeywords.some(k => t.includes(k))) return TicketType.SUGGESTION;
  
  return TicketType.REQUEST;
};

// Helper: Determine Ticket Category based on keywords
const analyzeTicketCategory = (text: string): TicketCategory => {
  const t = text.toLowerCase();

  if (t.includes('güvenlik') || t.includes('bekçi') || t.includes('kapı') || t.includes('hırsız') || t.includes('kamera') || t.includes('giriş') || t.includes('kimlik')) return TicketCategory.SECURITY;
  if (t.includes('temizlik') || t.includes('çöp') || t.includes('kir') || t.includes('paspas') || t.includes('süpürge') || t.includes('hijyen') || t.includes('toz') || t.includes('leke')) return TicketCategory.CLEANING;
  if (t.includes('elektrik') || t.includes('lamba') || t.includes('ampul') || t.includes('asansör') || t.includes('su') || t.includes('musluk') || t.includes('tamir') || t.includes('bakım') || t.includes('internet') || t.includes('sigorta')) return TicketCategory.TECHNICAL;
  if (t.includes('bahçe') || t.includes('çim') || t.includes('ağaç') || t.includes('sulama') || t.includes('çiçek') || t.includes('peyzaj') || t.includes('budama')) return TicketCategory.LANDSCAPE;
  if (t.includes('ses') || t.includes('gürültü') || t.includes('müzik') || t.includes('bağırma') || t.includes('köpek') || t.includes('havlama') || t.includes('tadilat')) return TicketCategory.NOISE;
  if (t.includes('park') || t.includes('otopark') || t.includes('araç') || t.includes('araba') || t.includes('plaka') || t.includes('yer')) return TicketCategory.PARKING;

  return TicketCategory.GENERAL;
};

/**
 * Simulates receiving a message from WhatsApp or Email.
 * Tries to find the user by phone or email.
 * If found, creates a ticket for them.
 * If not found, creates a generic ticket marked as "Unknown".
 */
export const processIncomingMessage = (
    source: TicketSource, 
    senderIdentifier: string, 
    messageContent: string
): { success: boolean; message: string; ticketId?: string } => {
    
    // 1. Try to identify the user
    const user = StorageService.findUserByContact(senderIdentifier);
    
    let authorId = 'unknown';
    let authorName = `${senderIdentifier} (Kayıtsız)`;

    if (user) {
        authorId = user.id;
        authorName = user.name;
    }

    // 2. Analyze Content for Type and Category
    const detectedType = analyzeTicketType(messageContent);
    const detectedCategory = analyzeTicketCategory(messageContent);

    // 3. Create the ticket
    const newTicket = StorageService.createTicket({
        title: `${source} Bildirimi: ${messageContent.substring(0, 30)}...`,
        description: messageContent,
        type: detectedType,
        category: detectedCategory,
        status: TicketStatus.OPEN,
        source: source,
        authorId: authorId,
        authorName: authorName
    });

    // 4. Return result
    const typeLabel = detectedType === TicketType.COMPLAINT ? 'Şikayet' : detectedType === TicketType.SUGGESTION ? 'Öneri' : 'İstek';
    
    if (user) {
        return { 
            success: true, 
            message: `Kullanıcı bulundu (${user.name}). ${typeLabel} olarak kaydedildi (${detectedCategory}).`,
            ticketId: newTicket.id
        };
    } else {
        return { 
            success: true, 
            message: `Kullanıcı bulunamadı. Kayıtsız kullanıcı adına ${typeLabel} oluşturuldu (${detectedCategory}).`,
            ticketId: newTicket.id
        };
    }
};

/**
 * Simulates checking the inbox of ugurhersek@gmail.com for new resident emails.
 * Picks a random scenario for demonstration purposes.
 */
export const checkAdminEmailInbox = async (): Promise<{ success: boolean; message: string }> => {
    // Simulation of possible incoming emails to ugurhersek@gmail.com
    const mockEmails = [
        {
            sender: 'ahmet@gmail.com', // Exists in seed
            content: 'Merhaba Uğur Bey, dairemdeki banyo musluğu sürekli damlatıyor, teknik servis bakabilir mi? (Daire 14)',
            subject: 'Musluk Arızası'
        },
        {
            sender: 'ayse@hotmail.com', // Exists in seed
            content: 'Uğur Bey selamlar, sitenin girişindeki otomatik kapı çok yavaş açılıyor, güvenlik riski oluşturabilir.',
            subject: 'Kapı Hakkında'
        },
        {
            sender: 'mehmet_yeni@gmail.com', // Likely doesn't exist
            content: 'İyi günler, alt komşunun köpeği gece çok havlıyor uyuyamıyoruz. Lütfen uyarır mısınız?',
            subject: 'Gürültü Şikayeti'
        }
    ];

    // Pick a random email
    const randomEmail = mockEmails[Math.floor(Math.random() * mockEmails.length)];

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`[MAIL BOT] Checking ugurhersek@gmail.com...`);
            console.log(`[MAIL BOT] Found new email from ${randomEmail.sender}`);
            
            const result = processIncomingMessage(
                TicketSource.EMAIL,
                randomEmail.sender,
                `${randomEmail.subject}: ${randomEmail.content}`
            );

            resolve({
                success: true,
                message: `[ugurhersek@gmail.com] Gelen Kutusu: 1 yeni mail işlendi.\nKimden: ${randomEmail.sender}\nSonuç: ${result.message}`
            });
        }, 1500); // Simulate network delay
    });
};
