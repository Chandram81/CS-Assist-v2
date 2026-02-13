
import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyserNode: AnalyserNode | null;
  status: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR';
}

export const Visualizer: React.FC<VisualizerProps> = ({ analyserNode, status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        
        const isSpeakingOrListening = status === 'LISTENING' || status === 'SPEAKING';
        const amplitude = isSpeakingOrListening ? barHeight / 2.0 : 2;
        const colorIntensity = Math.min(255, (amplitude * 2));
        
        let gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, canvas.height - amplitude);
        
        if (isSpeakingOrListening) {
             gradient.addColorStop(0, `rgb(0, ${Math.floor(colorIntensity * 0.8)}, ${Math.floor(colorIntensity)})`); // Cyan
             gradient.addColorStop(1, `rgb(${Math.floor(colorIntensity * 0.5)}, 0, ${Math.floor(colorIntensity)})`); // Purple tint
        } else {
             gradient.addColorStop(0, 'rgb(55, 65, 81)');
             gradient.addColorStop(1, 'rgb(107, 114, 128)');
        }

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - amplitude, barWidth, amplitude);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyserNode, status]);

  return <canvas ref={canvasRef} width="600" height="150" className="w-full h-full" />;
};
