import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, Transaction } from "../types";

// Initialize the client. 
// Note: In a real production SaaS, this call should likely go through a backend proxy 
// to protect the API key, or use a specific limited scope key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  summary: FinancialSummary,
  transactions: Transaction[]
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Prepare data for the prompt
    const expenseList = transactions
      .filter(t => t.type === 'expense')
      .map(t => `- ${t.name}: R$ ${t.amount.toFixed(2)}`)
      .join('\n');
      
    const incomeList = transactions
      .filter(t => t.type === 'income')
      .map(t => `- ${t.name}: R$ ${t.amount.toFixed(2)}`)
      .join('\n');

    const prompt = `
      Atue como um consultor financeiro pessoal amigável e direto.
      Analise os seguintes dados financeiros mensais de um usuário:

      RESUMO:
      - Total Entradas: R$ ${summary.totalIncome.toFixed(2)}
      - Total Saídas Fixas: R$ ${summary.totalExpense.toFixed(2)}
      - Saldo Disponível: R$ ${summary.balance.toFixed(2)}
      - Meta de Poupança: R$ ${summary.savingsGoal.toFixed(2)}
      - Situação Atual: ${summary.status}

      DETALHE DAS ENTRADAS:
      ${incomeList}

      DETALHE DAS SAÍDAS:
      ${expenseList}

      Por favor, forneça um conselho curto (máximo 3 parágrafos) e 3 dicas práticas em formato de lista (bullet points) para melhorar a saúde financeira ou atingir a meta de poupança.
      Use uma linguagem simples, encorajadora e sem jargões técnicos.
      Se o usuário estiver no vermelho (deficit), foque em redução de danos.
      Se estiver no azul, foque em otimização ou parabenize.
      Formate a resposta em Markdown simples.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Desculpe, ocorreu um erro ao conectar com o assistente financeiro. Verifique sua chave de API ou tente novamente mais tarde.";
  }
};