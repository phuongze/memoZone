import { io } from "socket.io-client";

let socketInstance = null;

export function getRealtimeSocket() {
  if (!socketInstance) {
    socketInstance = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"],
    });
  }

  return socketInstance;
}
