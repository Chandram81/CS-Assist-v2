
import React from 'react';
import { Status } from '../types';
import { Icon } from './Icon';

interface ControlButtonProps {
  status: Status;
  onStart: () => void;
  onStop: () => void;
}

const getButtonStyles = (status: Status) => {
  switch (status) {
    case Status.LISTENING:
    case Status.SPEAKING:
      return 'bg-red-500 hover:bg-red-600';
    case Status.THINKING:
      return 'bg-slate-500 cursor-not-allowed';
    default:
      return 'bg-cyan-500 hover:bg-cyan-600';
  }
};

const getButtonContent = (status: Status) => {
    switch(status) {
        case Status.LISTENING:
        case Status.SPEAKING:
            return <Icon type="stop" className="w-8 h-8"/>
        case Status.THINKING:
            return <Icon type="thinking" className="w-8 h-8 animate-pulse"/>
        case Status.IDLE:
        case Status.ERROR:
        default:
            return <Icon type="microphone" className="w-8 h-8"/>
    }
}

export const ControlButton: React.FC<ControlButtonProps> = ({ status, onStart, onStop }) => {
  const handleClick = () => {
    if (status === Status.IDLE || status === Status.ERROR) {
      onStart();
    } else if (status === Status.LISTENING || status === Status.SPEAKING) {
      onStop();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={status === Status.THINKING}
      className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50 ${getButtonStyles(status)}`}
    >
      {getButtonContent(status)}
    </button>
  );
};
