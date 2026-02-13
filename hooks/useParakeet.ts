import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Status, TranscriptionEntry } from '../types';
import { decode, encode, decodeAudioData } from '../lib/audioUtils';

// Constants for audio processing
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const SCRIPT_PROCESSOR_BUFFER_SIZE = 4096;

export const useParakeet = () => {
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
  const [interimTranscription, setInterimTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sessionPromise = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContext = useRef<AudioContext | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSource = useRef<MediaStreamAudioSourceNode | null>(null);

  const analyserNode = useRef<AnalyserNode | null>(null);
  const outputSources = useRef<Set<AudioBufferSourceNode>>(new Set());
  let nextStartTime = 0;

  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  const stopConversation = useCallback(() => {
    if (sessionPromise.current) {
        sessionPromise.current.then(session => session.close());
        sessionPromise.current = null;
    }

    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }

    if(scriptProcessor.current) {
        scriptProcessor.current.disconnect();
        scriptProcessor.current = null;
    }

    if(mediaStreamSource.current) {
        mediaStreamSource.current.disconnect();
        mediaStreamSource.current = null;
    }

    if (inputAudioContext.current && inputAudioContext.current.state !== 'closed') {
      inputAudioContext.current.close();
    }
    
    outputSources.current.forEach(source => source.stop());
    outputSources.current.clear();
    nextStartTime = 0;
    
    if (outputAudioContext.current && outputAudioContext.current.state !== 'closed') {
        outputAudioContext.current.close();
    }

    setInterimTranscription('');
    currentInputTranscription.current = '';
    currentOutputTranscription.current = '';

    setStatus(Status.IDLE);
  }, []);

  const startConversation = useCallback(async () => {
    setError(null);
    setTranscriptionHistory([]);
    setStatus(Status.LISTENING);

    try {
      if (!process.env.API_KEY) {
        throw new Error('API_KEY environment variable not set.');
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
      
      analyserNode.current = outputAudioContext.current.createAnalyser();
      const outputGain = outputAudioContext.current.createGain();
      outputGain.connect(analyserNode.current);
      outputGain.connect(outputAudioContext.current.destination);

      sessionPromise.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are Chandram, a friendly and helpful AI assistant. Keep your responses concise and conversational.',
        },
        callbacks: {
            onopen: async () => {
                try {
                    mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaStreamSource.current = inputAudioContext.current!.createMediaStreamSource(mediaStream.current);
                    scriptProcessor.current = inputAudioContext.current!.createScriptProcessor(SCRIPT_PROCESSOR_BUFFER_SIZE, 1, 1);
        
                    scriptProcessor.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
                        };
        
                        if (sessionPromise.current) {
                            sessionPromise.current.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        }
                    };
        
                    mediaStreamSource.current.connect(scriptProcessor.current);
                    scriptProcessor.current.connect(inputAudioContext.current!.destination);
                } catch(err) {
                    console.error('Microphone access denied:', err);
                    setError('Microphone access was denied. Please allow microphone access in your browser settings.');
                    setStatus(Status.ERROR);
                    stopConversation();
                }
            },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setStatus(Status.SPEAKING);
              nextStartTime = Math.max(nextStartTime, outputAudioContext.current!.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext.current!, OUTPUT_SAMPLE_RATE, 1);
              const source = outputAudioContext.current!.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputGain);
              source.addEventListener('ended', () => {
                outputSources.current.delete(source);
                if (outputSources.current.size === 0) {
                    setStatus(Status.LISTENING);
                }
              });
              source.start(nextStartTime);
              nextStartTime += audioBuffer.duration;
              outputSources.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              outputSources.current.forEach(source => source.stop());
              outputSources.current.clear();
              nextStartTime = 0;
            }

            if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
              setInterimTranscription(currentInputTranscription.current);
              setStatus(Status.THINKING);
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
                if(currentInputTranscription.current.trim()) {
                    setTranscriptionHistory(prev => [...prev, { speaker: 'You', text: currentInputTranscription.current.trim() }]);
                }
                if(currentOutputTranscription.current.trim()) {
                    setTranscriptionHistory(prev => [...prev, { speaker: 'Chandram', text: currentOutputTranscription.current.trim() }]);
                }
                currentInputTranscription.current = '';
                currentOutputTranscription.current = '';
                setInterimTranscription('');
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('API Error:', e);
            setError(`An API error occurred: ${e.message}`);
            setStatus(Status.ERROR);
            stopConversation();
          },
          onclose: () => {
            // This is called when the session is closed, either by us or the server.
            // We call stopConversation to ensure all resources are cleaned up.
            stopConversation();
          },
        },
      });
    } catch (err: any) {
      console.error('Failed to start conversation:', err);
      setError(`Failed to start: ${err.message}`);
      setStatus(Status.ERROR);
      stopConversation();
    }
  }, [stopConversation]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, [stopConversation]);

  return { status, transcriptionHistory, interimTranscription, error, analyserNode: analyserNode.current, startConversation, stopConversation };
};