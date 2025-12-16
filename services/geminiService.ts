import { GoogleGenAI } from "@google/genai";
import { Ticket } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAdminReplySuggestion = async (ticket: Ticket): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing for Gemini");
    return "API Anahtarı eksik. Lütfen yapılandırmayı kontrol edin.";
  }

  try {
    const prompt = `
      Sen profesyonel, nazik ve çözüm odaklı bir site yöneticisisin.
      Aşağıdaki talebe site sakini için uygun bir cevap taslağı oluştur.
      Cevap kısa, net ve güven verici olsun. Türkçe yanıt ver.

      Talep Detayları:
      Başlık: ${ticket.title}
      Kategori: ${ticket.category}
      İçerik: ${ticket.description}
      Durum: ${ticket.status}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Bir öneri oluşturulamadı.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Yapay zeka servisine şu an ulaşılamıyor.";
  }
};

export const summarizeTicketThread = async (ticket: Ticket): Promise<string> => {
  if (!apiKey) return "";

  try {
    const conversation = ticket.comments.map(c => `${c.authorName}: ${c.content}`).join('\n');
    const prompt = `
      Aşağıdaki talep ve konuşma geçmişini yöneticiler için 1 cümlelik bir özet haline getir.
      Önemli noktayı vurgula.

      Talep: ${ticket.description}
      Konuşmalar:
      ${conversation}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};