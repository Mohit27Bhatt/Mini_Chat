import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { MessageCircle, Users } from "lucide-react";

interface ChatWindowProps {
  chatId: string | null;
  isSidebarOpen: boolean;
  currentUser?: string | null;
}

interface Message {
  id: string;
  chatId: string;
  sender: string;
  content: string;
  timestamp: string;
  type: "CHAT" | "JOIN" | "LEAVE";
}

const ChatWindow = ({ chatId, currentUser }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<any>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  //  Setup WebSocket with username in connect headers
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return;

    const socket = new SockJS(`${API_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        username: currentUser,
      },
      reconnectDelay: 5000,
      debug: (msg) => console.log("[STOMP]", msg),
      onConnect: () => console.log(" WebSocket Connected as:", currentUser),
      onStompError: (frame) =>
        console.error(" WebSocket error:", frame.headers["message"]),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      client.deactivate();
    };
  }, [currentUser]);

  //  Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!chatId) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/messages/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("💾 Loaded history for chat:", chatId, res.data);
        setMessages(res.data || []);
      } catch (err) {
        console.error(" Failed to load chat history:", err);
      }
    };

    loadChatHistory();
  }, [chatId]);

  //  Subscribe to WebSocket for this chat or group
  useEffect(() => {
    if (!chatId || !stompClientRef.current?.connected) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    let destination: string;
    if (chatId.startsWith("group_")) {
      destination = `/user/queue/group/${chatId.replace("group_", "")}`;
    } else {
      destination = `/topic/chat/${chatId}`;
    }

    console.log("🛰 Subscribing to:", destination);

    subscriptionRef.current = stompClientRef.current.subscribe(destination, (msg) => {
      try {
        const message: Message = JSON.parse(msg.body);
        console.log("📥 Received message:", message);

        if (message.sender === currentUser) {
          console.log("⏭ Skipping own message");
          return;
        }

        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          const updated = [...prev, message];

          //  Notify sidebar (real-time last message)
          localStorage.setItem(`lastMessage_${chatId}`, JSON.stringify({
            content: message.content,
            timestamp: message.timestamp,
          }));

          return updated;
        });
      } catch (err) {
        console.error(" Error parsing message:", err);
      }
      setIsTyping(false);
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [chatId, stompClientRef.current?.connected, currentUser]);

  //  Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //  Send message handler
  const handleSendMessage = (content: string) => {
    if (!chatId || !content.trim() || !stompClientRef.current?.connected || !currentUser)
      return;

    const isGroup = chatId.startsWith("group_");
    const destination = isGroup
      ? `/app/group/${chatId.replace("group_", "")}`
      : `/app/chat/${chatId}`;

    const message: Message = {
      id: Date.now().toString(),
      chatId,
      sender: currentUser,
      content,
      timestamp: new Date().toISOString(),
      type: "CHAT",
    };

    console.log("📤 Sending to:", destination, message);

    stompClientRef.current.publish({
      destination,
      body: JSON.stringify(message),
    });

    //  Local echo for sender
    setMessages((prev) => [...prev, message]);
    //  Tell ChatSidebar to refresh immediately (simple cross-component trigger)
localStorage.setItem("refreshChats", Date.now().toString());


    //  Notify sidebar instantly
    localStorage.setItem(`lastMessage_${chatId}`, JSON.stringify({
      content: content,
      timestamp: new Date().toISOString(),
    }));
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-bg">
        <div className="text-center">
          <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome to Mini Chat
          </h2>
          <p className="text-muted-foreground">
            Select a chat or group to start messaging.
          </p>
        </div>
      </div>
    );
  }

 
let displayName = "";
try {
  const savedChats = JSON.parse(localStorage.getItem("recentChats") || "[]");
  const match = savedChats.find((c: any) => c.id === chatId);
  if (match && match.name) {
    displayName = match.name;
  } else if (chatId.startsWith("private_")) {
    // fallback for private chat
    displayName = chatId
      .split("_")
      .filter((n) => n !== currentUser && n !== "private")
      .join("");
  } else if (chatId.startsWith("group_")) {
    displayName = `Group ${chatId.replace("group_", "")}`;
  }
} catch {
  displayName = chatId;
}

  return (
    <div className="flex-1 flex flex-col bg-chat-bg">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
            {chatId.startsWith("group_") ? (
              <Users className="w-5 h-5" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{displayName}</h2>
            <p className="text-xs text-muted-foreground">
              {isTyping ? "typing..." : "Online"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg.id || index}
            message={{
              id: msg.id || index.toString(),
              senderId: msg.sender,
              senderName: msg.sender,
              content: msg.content,
              timestamp: msg.timestamp,
              type: msg.type,
            }}
            isOwnMessage={msg.sender === currentUser}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
