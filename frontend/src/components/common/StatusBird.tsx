import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatusBirdProps {
  doctorId: string;
}

type BirdStatus = 'grey' | 'yellow' | 'green';

const STATUS_COLORS = {
  grey: '#9CA3AF',
  yellow: '#F59E0B',
  green: '#10B981',
};

const STATUS_LABELS = {
  grey: 'Aucun statut',
  yellow: 'Chardo juvénile',
  green: 'Chardo adulte',
};

const STORAGE_KEY = 'doctor-bird-statuses';

export const StatusBird: React.FC<StatusBirdProps> = ({ doctorId }) => {
  const [status, setStatus] = useState<BirdStatus>('grey');

  // Load status from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const statuses = JSON.parse(stored);
        if (statuses[doctorId]) {
          setStatus(statuses[doctorId]);
        }
      }
    } catch (error) {
      console.error('Error loading bird status:', error);
    }
  }, [doctorId]);

  // Save status to localStorage whenever it changes
  const handleClick = () => {
    const nextStatus: BirdStatus = 
      status === 'grey' ? 'yellow' : 
      status === 'yellow' ? 'green' : 
      'grey';
    
    setStatus(nextStatus);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const statuses = stored ? JSON.parse(stored) : {};
      statuses[doctorId] = nextStatus;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch (error) {
      console.error('Error saving bird status:', error);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className="inline-flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded"
            aria-label={STATUS_LABELS[status]}
            data-testid={`status-bird-${doctorId}`}
            style={{ cursor: 'pointer' }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={STATUS_COLORS[status]}
              className="transition-all duration-200"
              style={{ 
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
              }}
            >
              <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{STATUS_LABELS[status]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
