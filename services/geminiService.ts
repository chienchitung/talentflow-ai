import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Job, Applicant } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

let chat: Chat | null = null;

function initializeChat() {
    if (!API_KEY) return;
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: '你是 TalentFlow AI 招募管理系統中的 AI 助理。你的任務是協助人資 (HR) 和招募經理。使用者會提供系統中的即時職位和應徵者數據，請根據這些數據來回答問題。你可以回答關於招募流程、數據分析、職位描述優化等問題。請以專業、友善的口吻，使用繁體中文回答。',
        },
    });
}

const formatContext = (jobs: Job[], applicants: Applicant[]): string => {
    const jobSummary = jobs.map(j => ({ 
        id: j.id, 
        title: j.title, 
        status: j.status, 
        department: j.department 
    }));
    const applicantSummary = applicants.map(a => ({ 
        id: a.id, 
        name: a.name, 
        jobId: a.jobId, 
        stage: a.stage, 
        source: a.source 
    }));

    return `
---SYSTEM DATA START---
Here is the current data from the recruitment system. Use this to answer the user's question.

JOBS:
${JSON.stringify(jobSummary, null, 2)}

APPLICANTS:
${JSON.stringify(applicantSummary, null, 2)}
---SYSTEM DATA END---
    `;
};


export const sendMessageToChat = async (message: string, context: { jobs: Job[], applicants: Applicant[] }): Promise<string> => {
    if (!API_KEY) {
        return "API Key is not configured. AI feature is disabled.";
    }
    if (!chat) {
        initializeChat();
    }
    if (!chat) {
        return "Chat initialization failed.";
    }

    try {
        const contextString = formatContext(context.jobs, context.applicants);
        const fullMessage = `${contextString}\n\nUser question: "${message}"`;

        const response = await chat.sendMessage({ message: fullMessage });
        return response.text;
    } catch (error) {
        console.error("Error sending message to chat:", error);
        return "抱歉，我現在無法回覆。請稍後再試。";
    }
};


export interface GeneratedJobDescription {
    description: string;
    requirements: string;
    benefits: string;
    niceToHave: string;
    teamIntro: string;
    techStack: string;
    growthOpportunities: string;
}

const emptyDescription: GeneratedJobDescription = {
    description: "", requirements: "", benefits: "", niceToHave: "", teamIntro: "", techStack: "", growthOpportunities: ""
};

export const generateJobDescription = async (jobTitle: string, department: string): Promise<GeneratedJobDescription> => {
    if (!API_KEY) {
        return Promise.resolve({ ...emptyDescription, description: "API Key is not configured. AI feature is disabled." });
    }

    const prompt = `請為「${department}」部門的「${jobTitle}」這個職位，撰寫一份專業、吸引人的職位描述，內容需以繁體中文呈現。請以 JSON 格式回傳，並包含以下七個 key：\n1.  description: 職位職責 (Responsibilities)，條列說明主要工作內容。\n2.  requirements: 職位要求 (Requirements)，條列說明必要的技能、經驗與學歷要求。\n3.  benefits: 福利待遇 (Benefits)，條列說明公司提供的福利與待遇。\n4.  niceToHave: 加分項目 (Nice to Have)，條列說明非必要但加分的技能或經驗。\n5.  teamIntro: 團隊介紹 (Team Intro)，簡要介紹團隊文化與工作氛圍。\n6.  techStack: 技術棧 (Tech Stack)，條列說明團隊主要使用的技術工具。\n7.  growthOpportunities: 職涯發展 (Growth Opportunities)，說明此職位的未來發展與學習機會。`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        requirements: { type: Type.STRING },
                        benefits: { type: Type.STRING },
                        niceToHave: { type: Type.STRING },
                        teamIntro: { type: Type.STRING },
                        techStack: { type: Type.STRING },
                        growthOpportunities: { type: Type.STRING },
                    },
                },
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as GeneratedJobDescription;
    } catch (error) {
        console.error("Error generating job description:", error);
        return { ...emptyDescription, description: "生成職位描述時發生錯誤，請稍後再試。" };
    }
};