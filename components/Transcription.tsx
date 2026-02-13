
import React, { useRef, useEffect } from 'react';
import { TranscriptionEntry } from '../types';

interface TranscriptionProps {
  history: TranscriptionEntry[];
  interimText: string;
}

export const Transcription: React.FC<TranscriptionProps> = ({ history, interimText }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, interimText]);

  return (
    <div className="flex-grow w-full max-w-3xl p-4 overflow-y-auto space-y-4">
      {history.map((entry, index) => (
        <div key={index} className={`flex flex-col ${entry.speaker === 'You' ? 'items-end' : 'items-start'}`}>
          <div className={`p-3 rounded-lg max-w-xl ${entry.speaker === 'You' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
            <p className="font-bold text-sm mb-1">{entry.speaker}</p>
            <p>{entry.text}</p>
          </div>
        </div>
      ))}
       {interimText && (
         <div className="flex flex-col items-end">
             <div className="p-3 rounded-lg max-w-xl bg-cyan-600/50 text-white/70">
                <p className="font-bold text-sm mb-1">You</p>
                <p>{interimText}</p>
            </div>
         </div>
       )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};
