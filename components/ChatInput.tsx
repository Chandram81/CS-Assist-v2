
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-slate-900/50 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-2xl p-2 px-4 shadow-xl focus-within:ring-2 ring-cyan-500/30 transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask anything..."
          rows={1}
          className="flex-grow bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 py-2 resize-none max-h-48 overflow-y-auto"
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="p-2 mb-0.5 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-40 disabled:bg-slate-700 transition-all"
        >
          <Icon type="send" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
