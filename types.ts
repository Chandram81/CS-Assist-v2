export enum Status {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  ERROR = 'ERROR',
  SENDING = 'SENDING',
  STREAMING = 'STREAMING',
  RECORDING = 'RECORDING',
}

export type AppMode = 'VOICE' | 'PRO_CHAT' | 'LITE_CHAT' | 'TRANSCRIBE';

export interface TranscriptionEntry {
  speaker: 'You' | 'Chandram';
  text: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  id: string;
}