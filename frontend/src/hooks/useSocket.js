import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    try {
      console.log('🔌 Connecting to Socket.io at:', SOCKET_URL);
      
      socketRef.current = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        console.log('✓ Socket.io connected:', socketRef.current.id);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('✗ Socket.io connection error:', error.message);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('⚠ Socket.io disconnected:', reason);
      });
    } catch (error) {
      console.error('❌ Failed to initialize Socket.io:', error);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};
