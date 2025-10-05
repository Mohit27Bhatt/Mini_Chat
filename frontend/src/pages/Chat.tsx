import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import Navbar from "@/components/chat/Navbar";

const Chat = () => {
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  //  Validate token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (!token || !storedUsername) {
      navigate("/login");
      return;
    }

    setUsername(storedUsername);
    setIsLoading(false);
  }, [navigate]);

  //  Remember last opened chat
  useEffect(() => {
    const savedChat = localStorage.getItem("selectedChatId");
    if (savedChat) setSelectedChatId(savedChat);
  }, []);

  //  Save selected chat to localStorage
  useEffect(() => {
    if (selectedChatId) {
      localStorage.setItem("selectedChatId", selectedChatId);
    }
  }, [selectedChatId]);

  //  Automatically hide sidebar on small screens (mobile-friendly)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Run on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //  Central logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("recentChats");
    localStorage.removeItem("selectedChatId");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col gradient-bg">
      {/*  Top Navigation Bar */}
      <Navbar
        username={username}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onLogout={handleLogout}
      />

      {/*  Main Chat Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <ChatSidebar
          isOpen={isSidebarOpen}
          onSelectChat={setSelectedChatId}
          selectedChatId={selectedChatId}
          currentUser={username}
        />

        {/* Chat Window */}
        <ChatWindow
          chatId={selectedChatId}
          isSidebarOpen={isSidebarOpen}
          currentUser={username}
        />
      </div>
    </div>
  );
};

export default Chat;
