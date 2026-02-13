import React, { useRef, useEffect } from 'react';
import { ChatMessage, Status } from '../types';
import { ChatInput } from './ChatInput';
import { Icon } from './Icon';

interface ChatViewProps {
  messages: ChatMessage[];
  status: Status;
  onSend: (text: string) => void;
  onClear: () => void;
  title: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, status, onSend, onClear, title }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, status]);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {title}
            {status === Status.STREAMING && (
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            )}
          </h2>
        </div>
        <button 
          onClick={onClear} 
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
          title="Clear Conversation"
        >
          <Icon type="trash" className="w-5 h-5" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Icon type="chat" className="w-8 h-8" />
            </div>
            <p className="text-xl font-medium">Start a conversation</p>
            <p className="text-sm">Type a message below to begin chatting with Chandram.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {status === Status.SENDING && (
           <div className="flex justify-start">
             <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-4 border border-slate-700">
                <Icon type="thinking" className="w-6 h-6 animate-pulse" />
             </div>
           </div>
        )}
      </div>

      <ChatInput onSend={onSend} disabled={status === Status.SENDING || status === Status.STREAMING} />
    </div>
  );
};