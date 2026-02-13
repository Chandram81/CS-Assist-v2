import React, { useState, useEffect } from 'react';
import { useParakeet } from './hooks/useParakeet';
import { useChat } from './hooks/useChat';
import { useTranscription } from './hooks/useTranscription';
import { ControlButton } from './components/ControlButton';
import { Transcription } from './components/Transcription';
import { Visualizer } from './components/Visualizer';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { TranscriptionView } from './components/TranscriptionView';
import { Status, AppMode } from './types';

const StatusIndicator: React.FC<{ status: Status, error: string | null }> = ({ status, error }) => {
    let text = '';
    let color = 'text-slate-400';

    switch (status) {
        case Status.IDLE:
            text = "Ready to talk. Press the button to start.";
            break;
        case Status.LISTENING:
            text = "Listening...";
            color = 'text-cyan-400';
            break;
        case Status.THINKING:
            text = "Thinking...";
            color = 'text-amber-400';
            break;
        case Status.SPEAKING:
            text = "Speaking...";
            color = 'text-emerald-400';
            break;
        case Status.RECORDING:
            text = "Recording audio...";
            color = 'text-red-400';
            break;
        case Status.ERROR:
            text = error || "An error occurred. Please try again.";
            color = 'text-red-500';
            break;
    }

    return (
        <div className="h-10 flex items-center justify-center">
            <p className={`text-center text-lg transition-colors duration-300 ${color}`}>{text}</p>
        </div>
    );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('VOICE');
  
  const voice = useParakeet();
  const proChat = useChat('gemini-3-pro-preview');
  const liteChat = useChat('gemini-2.5-flash-lite-latest');
  const transcribe = useTranscription();

  // Stop voice when switching modes
  useEffect(() => {
    if (mode !== 'VOICE' && (voice.status === Status.LISTENING || voice.status === Status.SPEAKING)) {
      voice.stopConversation();
    }
  }, [mode, voice]);

  const renderContent = () => {
    switch (mode) {
      case 'VOICE':
        return (
          <div className="flex flex-col h-full bg-slate-900">
            <header className="p-4 text-center shrink-0 border-b border-slate-800">
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
                  Chandram <span className="text-cyan-400">Voice</span>
              </h1>
              <p className="text-slate-400 text-sm">Real-time conversational AI</p>
            </header>
            
            <main className="flex-grow flex flex-col items-center justify-between overflow-hidden">
              <Transcription history={voice.transcriptionHistory} interimText={voice.interimTranscription} />
              
              <div className="w-full h-36 flex items-center justify-center border-t border-slate-800/30 bg-slate-800/20">
                  {(voice.status !== Status.IDLE && voice.status !== Status.ERROR) ? (
                      <Visualizer analyserNode={voice.analyserNode} status={voice.status} />
                  ) : (
                    <div className="text-slate-600 uppercase tracking-widest text-xs font-semibold">Audio Visualizer Offline</div>
                  )}
              </div>
            </main>

            <footer className="w-full flex flex-col items-center justify-center p-8 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800">
              <StatusIndicator status={voice.status} error={voice.error} />
              <div className="mt-4">
                  <ControlButton status={voice.status} onStart={voice.startConversation} onStop={voice.stopConversation} />
              </div>
            </footer>
          </div>
        );
      case 'PRO_CHAT':
        return (
          <ChatView 
            title="Pro Chat (Gemini 3 Pro)"
            messages={proChat.messages}
            status={proChat.status}
            onSend={proChat.sendMessage}
            onClear={proChat.clearChat}
          />
        );
      case 'LITE_CHAT':
        return (
          <ChatView 
            title="Lite Chat (Fast Responses)"
            messages={liteChat.messages}
            status={liteChat.status}
            onSend={liteChat.sendMessage}
            onClear={liteChat.clearChat}
          />
        );
      case 'TRANSCRIBE':
        return (
          <TranscriptionView
            transcription={transcribe.transcription}
            status={transcribe.status}
            error={transcribe.error}
            onStart={transcribe.startRecording}
            onStop={transcribe.stopRecording}
            onClear={transcribe.clearTranscription}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans overflow-hidden">
      <Sidebar currentMode={mode} setMode={setMode} />
      <div className="flex-grow relative shadow-2xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;