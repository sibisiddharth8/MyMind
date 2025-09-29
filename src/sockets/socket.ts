import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// console.log('BASE_URL:', BASE_URL);

const SOCKET_URL = BASE_URL.replace(/\/api$/, '');
// console.log('SOCKET_URL:', SOCKET_URL);

export const socket = io(SOCKET_URL, {
  path: '/api/socket.io',
});
