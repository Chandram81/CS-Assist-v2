
import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Status } from '../types';

export const useTranscription = () => {
  const [transcription, setTranscription] = useState<string>('');
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscription('');
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processTranscription(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setStatus(Status.RECORDING);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'Failed to start recording');
      setStatus(Status.ERROR);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const processTranscription = async (audioBlob: Blob) => {
    setStatus(Status.THINKING);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Audio = await convertBlobToBase64(audioBlob);

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: base64Audio,
                  mimeType: 'audio/webm',
                },
              },
              { text: 'Transcribe the provided audio precisely. Return only the transcription text.' },
            ],
          },
        ],
      });

      setTranscription(response.text || 'No transcription found.');
      setStatus(Status.IDLE);
    } catch (err: any) {
      console.error('Transcription API error:', err);
      setError(err.message || 'Failed to transcribe audio');
      setStatus(Status.ERROR);
    }
  };

  const clearTranscription = () => {
    setTranscription('');
    setError(null);
    setStatus(Status.IDLE);
  };

  return { transcription, status, error, startRecording, stopRecording, clearTranscription };
};
