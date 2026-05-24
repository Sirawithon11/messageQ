import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useStockSocket(onStockUpdate) {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

    socket.on('stock:update', onStockUpdate);

    return () => { socket.disconnect(); };
  }, [onStockUpdate]);
}
