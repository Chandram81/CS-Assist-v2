import React from 'react';
import { AppMode } from '../types';
import { Icon } from './Icon';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const items: { mode: AppMode; icon: 'microphone' | 'chat' | 'bolt' | 'transcribe'; label: string; sub: string }[] = [
    { mode: 'VOICE', icon: 'microphone', label: 'Voice Assistant', sub: 'Real-time' },
    { mode: 'PRO_CHAT', icon: 'chat', label: 'Pro Chat', sub: 'Gemini 3 Pro' },
    { mode: 'LITE_CHAT', icon: 'bolt', label: 'Lite Chat', sub: 'Fast Responses' },
    { mode: 'TRANSCRIBE', icon: 'transcribe', label: 'Transcribe', sub: 'Speech to Text' },
  ];

  return (
    <nav className="w-20 md:w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-full transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
          <span className="text-white font-bold text-xl">C</span>
        </div>
        <h1 className="hidden md:block text-xl font-bold text-white tracking-tight">Chandram AI</h1>
      </div>
      
      <div className="flex-grow px-3 space-y-2 mt-4">
        {items.map((item) => (
          <button
            key={item.mode}
            onClick={() => setMode(item.mode)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              currentMode === item.mode 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner' 
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Icon type={item.icon} className="w-6 h-6 shrink-0" />
            <div className="hidden md:flex flex-col items-start overflow-hidden text-left">
              <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
              <span className="text-[10px] opacity-60 uppercase tracking-tighter">{item.sub}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-700/50">
        <p className="hidden md:block text-[10px] text-slate-500 text-center uppercase tracking-widest font-semibold">
          Powered by Gemini
        </p>
      </div>
    </nav>
  );
};