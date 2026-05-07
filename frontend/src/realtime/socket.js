import { io } from "socket.io-client";

let socketInstance = null;
let noOpSocketInstance = null;

function createNoOpSocket() {
  if (noOpSocketInstance) {
    return noOpSocketInstance;
  }

  const noop = () => {};
  noOpSocketInstance = {
    on: noop,
    off: noop,
    emit: noop,
    disconnect: noop,
  };

  return noOpSocketInstance;
}

function resolveSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl === "/api") {
      return window.location.origin;
    }

    const stripped = apiUrl.replace(/\/api\/?$/, "");
    return stripped || window.location.origin;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }

  return window.location.origin;
}

export function getRealtimeSocket() {
  if (import.meta.env.VITE_ENABLE_REALTIME !== "true") {
    return createNoOpSocket();
  }

  if (!socketInstance) {
    socketInstance = io(resolveSocketUrl(), {
      transports: ["websocket"],
      reconnection: false,
    });
  }

  return socketInstance;
}
