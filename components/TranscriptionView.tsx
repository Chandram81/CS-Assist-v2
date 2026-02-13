
import React from 'react';
import { Status } from '../types';
import { Icon } from './Icon';

interface TranscriptionViewProps {
  transcription: string;
  status: Status;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
}

export const TranscriptionView: React.FC<TranscriptionViewProps> = ({ 
  transcription, status, error, onStart, onStop, onClear 
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Audio Transcription
          {status === Status.THINKING && (
            <span className="text-xs text-amber-400 animate-pulse font-normal">Processing...</span>
          )}
        </h2>
        <button 
          onClick={onClear} 
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
        >
          <Icon type="trash" className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-8 flex flex-col items-center gap-8 min-h-[400px]">
          
          <div className="flex-grow w-full flex flex-col">
            {status === Status.IDLE && !transcription && !error && (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 gap-4">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                  <Icon type="transcribe" className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg">Hold the button to record audio for transcription.</p>
              </div>
            )}

            {status === Status.RECORDING && (
              <div className="flex-grow flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                  <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-red-500/30">
                    <div className="w-4 h-4 bg-white rounded-sm animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-red-400 font-bold text-xl mb-1">RECORDING</p>
                  <p className="text-slate-400 text-sm">Release or stop when finished</p>
                </div>
              </div>
            )}

            {status === Status.THINKING && (
               <div className="flex-grow flex flex-col items-center justify-center gap-4">
                  <Icon type="thinking" className="w-12 h-12 text-cyan-400 animate-spin" />
                  <p className="text-slate-300">Transcribing with Gemini 3 Flash...</p>
               </div>
            )}

            {error && (
               <div className="flex-grow flex flex-col items-center justify-center text-red-400 gap-2">
                 <p className="font-bold">Error</p>
                 <p className="text-sm opacity-80">{error}</p>
               </div>
            )}

            {transcription && (
              <div className="flex-grow flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Result</h3>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Icon type="copy" className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <div className="flex-grow bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 overflow-y-auto max-h-[300px]">
                  <p className="text-slate-100 leading-relaxed italic">"{transcription}"</p>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <button
              onMouseDown={onStart}
              onMouseUp={onStop}
              onTouchStart={onStart}
              onTouchEnd={onStop}
              disabled={status === Status.THINKING}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${
                status === Status.RECORDING 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-cyan-500 text-white hover:bg-cyan-600'
              } disabled:opacity-30 disabled:grayscale`}
            >
              <Icon type={status === Status.RECORDING ? 'stop' : 'microphone'} className="w-8 h-8" />
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-slate-500 text-xs text-center max-w-md">
          Capture high-fidelity audio transcriptions powered by Gemini 3 Flash. Perfect for meetings, notes, and quick thoughts.
        </p>
      </div>
    </div>
  );
};
