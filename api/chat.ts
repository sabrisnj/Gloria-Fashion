import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Suporta tanto 'message'/'name' quanto 'prompt'/'nome'
  const { message, name, prompt, nome } = req.body;
  const finalPrompt = prompt || message;
  const finalName = nome || name || 'visitante';

  if (!finalPrompt) {
    return res.status(400).json({ error: 'O campo "prompt" ou "message" é obrigatório.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not defined');
    return res.status(500).json({ error: 'Chave de API (GEMINI_API_KEY) não configurada na Vercel.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    const systemInstruction = `Você é a assistente virtual da Glória Fashion, um studio premium de piercing e acessórios em São Bernardo do Campo.
    Seu objetivo é ajudar os clientes com dúvidas sobre agendamentos, produtos, endereço e promoções.
    Seja sempre educada, prestativa e use um tom acolhedor.
    O nome do cliente é ${finalName}.
    
    Informações importantes:
    - Endereço: R. Mal. Rondon, 113 – Loja 65, Centro – São Bernardo do Campo.
    - Horário: Segunda a Sábado, das 09:00 às 19:30.
    - Agendamentos: Podem ser feitos pelo app na aba 'Agendar'.
    - Promoções: 'Amor Está no Ar' (5% na 2ª joia), 'Triplo de Joias' (10% na 3ª).
    - Ouvidoria: Falar com Ivone no WhatsApp 11 95069-6045.`;

    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
      config: {
        systemInstruction,
      },
    });

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error('ERRO DETALHADO DA API:', error);
    return res.status(500).json({ 
      error: 'Falha na invocação da função',
      details: error.message 
    });
  }
}
