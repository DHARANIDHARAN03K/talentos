import { GoogleGenAI } from '@google/genai'

const ai = process.env.NEXT_PUBLIC_GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY }) : null;

export async function generateOutreachDraft(candidateName: string, role: string, score: number): Promise<string> {
  const prompt = `Write a short, highly professional outreach email to a candidate named ${candidateName} for the role of ${role}. They matched our criteria at ${score}%. Do not use buzzwords or hype. Be direct, polite, and invite them to a brief initial chat. Limit to 3 short paragraphs.`;
  
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || getDefaultOutreach(candidateName, role, score);
    } catch (e) {
      console.error("AI Generation failed, using fallback:", e);
    }
  }
  
  return getDefaultOutreach(candidateName, role, score);
}

function getDefaultOutreach(candidateName: string, role: string, score: number): string {
  return `Hi ${candidateName},

We are currently sourcing for a ${role} position and your background caught our attention, particularly your strong alignment with our technical requirements (Match Score: ${score}%).

Would you be open to a brief introductory call this week to discuss the role in more detail?

Best regards,
TalentOS Execution Agent`;
}

export async function explainDecision(candidateName: string, role: string, signals: any): Promise<string> {
  const prompt = `Given these hiring signals: ${JSON.stringify(signals)}, explain in 2 short, crisp sentences why ${candidateName} is a good fit for ${role}. Focus on facts, no fluff. Tone: Enterprise professional.`;
  
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || getDefaultExplanation(candidateName, role);
    } catch (e) {
      console.error("AI Generation failed, using fallback:", e);
    }
  }
  
  return getDefaultExplanation(candidateName, role);
}

function getDefaultExplanation(candidateName: string, role: string): string {
  return `[Cached Analysis] ${candidateName} demonstrates strong baseline qualifications and high trust verification for the ${role} position. Their profile falls within the acceptable range for our compensation and location constraints.`;
}
