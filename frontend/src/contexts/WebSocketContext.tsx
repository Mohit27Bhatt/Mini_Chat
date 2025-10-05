import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

interface Message {
  id: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
}

interface WebSocketContextType {
  client: Client | null;
  connected: boolean;
  sendMessage: (destination: string, content: string) => void;
  subscribeToPublic: (callback: (message: Message) => void) => void;
  subscribeToPrivate: (username: string, callback: (message: Message) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log('STOMP:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log('✅ WebSocket connected');
      setConnected(true);
    };

    stompClient.onDisconnect = () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
        console.log('🔌 WebSocket disconnected manually');
      }
    };
  }, [token, user]);

  // ✅ Send message to public or private destinations
  const sendMessage = (destination: string, content: string) => {
    if (!client || !connected || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      senderName: user.username,
      content,
      timestamp: new Date().toISOString(),
      type: 'CHAT',
    };

    client.publish({
      destination,
      body: JSON.stringify(message),
    });
  };

  // ✅ Subscribe to public messages (/topic/public)
  const subscribeToPublic = (callback: (message: Message) => void) => {
    if (!client || !connected) return;

    const subscription = client.subscribe('/topic/public', (msg) => {
      const parsed = JSON.parse(msg.body);
      callback(parsed);
    });

    return () => subscription.unsubscribe();
  };

  // ✅ Subscribe to private messages (/user/{username}/queue/private)
  const subscribeToPrivate = (username: string, callback: (message: Message) => void) => {
    if (!client || !connected) return;

    const subscription = client.subscribe(`/user/${username}/queue/private`, (msg) => {
      const parsed = JSON.parse(msg.body);
      callback(parsed);
    });

    return () => subscription.unsubscribe();
  };

  return (
    <WebSocketContext.Provider
      value={{ client, connected, sendMessage, subscribeToPublic, subscribeToPrivate }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
