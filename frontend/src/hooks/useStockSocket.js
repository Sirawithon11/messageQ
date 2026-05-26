import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useStockSocket(onStockUpdate, onStockEmpty) {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');  // เชื่อมต่อ WebSocket ไปยัง backend server

    socket.on('stock:update', onStockUpdate); //Subscribe รอฟัง event ชื่อ 'stock:update'  จาก server ถ้า event มา ส่ง callback function เข้าไปรับเข้อมูล + คำนวณ logic ภายใน
    if (onStockEmpty) socket.on('stock:empty', onStockEmpty);

    return () => { socket.disconnect(); };
  }, [onStockUpdate, onStockEmpty]);
}
