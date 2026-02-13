import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { ChatMessage, Status } from '../types';

export const useChat = (modelName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);

  const initChat = useCallback(() => {
    if (!process.env.API_KEY) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatRef.current = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: 'You are Chandram, a helpful and concise AI assistant.',
      },
    });
  }, [modelName]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (!chatRef.current) initChat();

    const userMsg: ChatMessage = {
      role: 'user',
      text,
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setStatus(Status.SENDING);
    setError(null);

    try {
      const response = await chatRef.current!.sendMessageStream({ message: text });
      
      const modelMsgId = (Date.now() + 1).toString();
      let fullText = '';
      
      setStatus(Status.STREAMING);
      
      for await (const chunk of response) {
        const c = chunk as GenerateContentResponse;
        fullText += c.text || '';
        setMessages((prev) => {
          const filtered = prev.filter(m => m.id !== modelMsgId);
          return [...filtered, { role: 'model', text: fullText, id: modelMsgId }];
        });
      }
      
      setStatus(Status.IDLE);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message');
      setStatus(Status.ERROR);
    }
  }, [initChat]);

  const clearChat = useCallback(() => {
    setMessages([]);
    chatRef.current = null;
    setStatus(Status.IDLE);
    setError(null);
  }, []);

  return { messages, status, error, sendMessage, clearChat };
};