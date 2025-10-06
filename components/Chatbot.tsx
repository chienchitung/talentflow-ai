import React, { useState, useRef, useEffect } from 'react';
import { XIcon, PaperAirplaneIcon, SparklesIcon } from './Icons';
import { sendMessageToChat } from '../services/geminiService';
import { useTranslation } from '../i18n';
import { Job, Applicant } from '../types';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    jobs: Job[];
    applicants: Applicant[];
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, jobs, applicants }) => {
    const { t, language } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', text: t('chatbot.welcomeMessage'), sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        setMessages(currentMessages => {
            if (currentMessages.length > 0 && currentMessages[0].id === 'welcome') {
                const updatedWelcomeMessage = { ...currentMessages[0], text: t('chatbot.welcomeMessage') };
                return [updatedWelcomeMessage, ...currentMessages.slice(1)];
            }
            return currentMessages;
        });
    }, [language, t]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 300); // Focus after transition
        }
    }, [isOpen, messages]);


    useEffect(() => {
        const textarea = inputRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [input]);

    const sendMessage = async (messageText: string) => {
        if (messageText.trim() === '') return;

        const userInput: Message = { id: Date.now().toString(), text: messageText, sender: 'user' };
        setMessages(prev => [...prev, userInput]);
        setIsLoading(true);

        try {
            const aiResponseText = await sendMessageToChat(messageText, { jobs, applicants });
            const aiResponse: Message = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error(error);
            const errorResponse: Message = { id: (Date.now() + 1).toString(), text: t('chatbot.error'), sender: 'ai' };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = () => {
        if (isLoading || input.trim() === '') return;
        sendMessage(input);
        setInput('');
    };
    
    const promptKeys = ['chatbot.prompt1', 'chatbot.prompt2', 'chatbot.prompt3'];
    
    const handlePromptClick = (promptKey: string) => {
        const promptText = t(promptKey);
        setInput(promptText);
        inputRef.current?.focus();
    };

    return (
        <div className="h-full bg-slate-50 flex flex-col w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-indigo-500" />
                    {t('chatbot.title')}
                </h2>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                    <XIcon />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                    AI
                                </div>
                            )}
                            <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                AI
                            </div>
                            <div className="max-w-xs md:max-w-sm px-4 py-3 rounded-2xl bg-white shadow-sm text-slate-800 rounded-bl-none">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white flex-shrink-0">
                 <div className="mb-3 flex flex-wrap gap-2">
                    {promptKeys.map(key => (
                        <button
                            key={key}
                            onClick={() => handlePromptClick(key)}
                            disabled={isLoading}
                            className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {t(key)}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={t('chatbot.inputPlaceholder')}
                        className="flex-1 p-2 border border-slate-300 rounded-md resize-none focus:ring-indigo-500 focus:border-indigo-500"
                        rows={2}
                        style={{ maxHeight: '120px' }}
                    />
                    <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-2.5 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-slate-400 flex-shrink-0">
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;