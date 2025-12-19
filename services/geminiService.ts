import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  summary: FinancialSummary,
  transactions: Transaction[]
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    const fixedList = transactions
      .filter(t => t.type === 'fixed_expense')
      .map(t => `- [FIXO] ${t.name}: R$ ${t.amount.toFixed(2)}`)
      .join('\n');

    const variableList = transactions
      .filter(t => t.type === 'variable_expense')
      .map(t => `- [VARIÁVEL] ${t.name}: R$ ${t.amount.toFixed(2)}`)
      .join('\n');
      
    const incomeList = transactions
      .filter(t => t.type === 'income')
      .map(t => `- ${t.name}: R$ ${t.amount.toFixed(2)}`)
      .join('\n');

    const prompt = `
      Atue como um consultor financeiro pessoal expert em economia doméstica.
      Analise os seguintes dados do mês:

      RESUMO:
      - Entradas: R$ ${summary.totalIncome.toFixed(2)}
      - Gastos Fixos (Essenciais): R$ ${summary.totalFixedExpense.toFixed(2)}
      - Gastos Variáveis (Lifestyle): R$ ${summary.totalVariableExpense.toFixed(2)}
      - Saldo Líquido: R$ ${summary.balance.toFixed(2)}
      - Meta de Poupança: R$ ${summary.savingsGoal.toFixed(2)}
      - Status: ${summary.status}

      LISTA DE GASTOS:
      ${fixedList}
      ${variableList}

      INSTRUÇÃO:
      Forneça uma análise estratégica focada em como o usuário pode atingir sua meta de poupança. 
      Se o saldo após a meta for negativo, indique especificamente quais gastos variáveis podem ser revistos.
      Se for positivo, sugira onde investir o excedente.
      Responda em Markdown, sendo direto e motivador. Máximo 3 parágrafos e 3 bullet points.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Análise indisponível.";
  } catch (error) {
    return "Erro ao consultar o assistente de IA.";
  }
};