import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (!this.socket) {
      this.socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL ??
          process.env.NEXT_PUBLIC_API_URL!,
        {
          transports: ["websocket"],
          auth: {
            token,
          },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        }
      );
    } else {
      this.socket.auth = { token };
      this.socket.connect();
    }

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();