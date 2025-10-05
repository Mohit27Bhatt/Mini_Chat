import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, MessageSquare, Plus } from "lucide-react";
import UserListItem from "./UserListItem";
import axios from "axios";
import { toast } from "sonner";
import CreateGroupModal from "./CreateGroupModal";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface ChatSidebarProps {
  isOpen: boolean;
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
  currentUser?: string | null;
}

interface Chat {
  id: string;
  name: string;
  type: "private" | "group";
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  online?: boolean;
}

interface User {
  id: number;
  username: string;
  email?: string;
  online?: boolean;
}

const ChatSidebar = ({
  isOpen,
  onSelectChat,
  selectedChatId,
  currentUser,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"chats" | "users">("chats");
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const isFetchingRef = useRef(false);

  // refs for stable access in async handlers
  const chatsRef = useRef<Chat[]>([]);
  const lastRefreshSeenRef = useRef<string | null>(null);

  // ensure chatsRef reflects the latest chats state
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Helper: save chats to localStorage
  const saveChats = (c: Chat[]) => {
    try {
      localStorage.setItem("recentChats", JSON.stringify(c));
    } catch (e) {
      console.warn("Failed to save recentChats:", e);
    }
  };

  //  Fetch last message for a chat (works for private + group)
  const fetchLastMessageForChat = async (chatId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await axios.get(`${API_URL}/api/messages/${chatId}/last`, {
        headers,
      });
      if (!res.data) return null;

      const data = res.data;
      return {
        content: data.content ?? data.message ?? "",
        timestamp: data.timestamp ?? data.createdAt ?? null,
      };
    } catch (err) {
      // log but don't spam errors
      // console.warn(" Failed to fetch last message for:", chatId, err);
      return null;
    }
  };

  // Refresh a provided list of chats (avoids stale closures)
  const refreshLastMessagesForList = async (chatList: Chat[]) => {
    if (!chatList || chatList.length === 0) return;

    // map sequentially or in parallel — parallel is faster (but may stress backend)
    const updatedChats = await Promise.all(
      chatList.map(async (c) => {
        try {
          const last = await fetchLastMessageForChat(c.id);
          if (last) {
            const formattedTime = last.timestamp
              ? new Date(last.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : undefined;
            return {
              ...c,
              lastMessage: last.content,
              timestamp: formattedTime,
            };
          }
        } catch (e) {
          // ignore per-chat errors
        }
        return c;
      })
    );

    setChats(updatedChats);
    saveChats(updatedChats);
  };

  // convenience wrapper that refreshes the current chatsRef
  const refreshLastMessagesForAllChats = async () => {
    await refreshLastMessagesForList(chatsRef.current);
  };

  //  Load saved chats (keep both private & group)
  useEffect(() => {
    const saved = localStorage.getItem("recentChats");
    if (saved) {
      try {
        const parsed: Chat[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setChats(parsed);
        }
      } catch (err) {
        console.error("Failed to parse saved chats:", err);
      }
    }
  }, []);

  //  Fetch users periodically
  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!mounted) return;
        const filtered = (res.data || []).filter(
          (u: User) => u.username !== currentUser
        );
        setUsers(filtered);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [currentUser]);

  //  Fetch groups and merge + update messages
  useEffect(() => {
    const fetchGroupsAndRefresh = async () => {
      if (isFetchingRef.current) return;
      if (!currentUser) return;

      isFetchingRef.current = true;
      const token = localStorage.getItem("token");
      if (!token) {
        isFetchingRef.current = false;
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/groups/${currentUser}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const groups: any[] = res.data || [];
        const groupChats: Chat[] = groups.map((g: any) => ({
          id: `group_${g.id}`,
          name: g.name || `Group ${g.id}`,
          type: "group",
        }));

        // Merge with existing chats into a concrete array
        const prev = chatsRef.current || [];
        const map = new Map<string, Chat>();
        prev.forEach((c) => map.set(c.id, c));
        groupChats.forEach((gc) => map.set(gc.id, { ...map.get(gc.id), ...gc }));
        const merged = Array.from(map.values());

        // Set state and persist
        setChats(merged);
        saveChats(merged);

        // Immediately refresh last messages for the merged list (use merged to avoid stale state)
        await refreshLastMessagesForList(merged);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchGroupsAndRefresh();
    const interval = setInterval(fetchGroupsAndRefresh, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  //  WebSocket: handle new group creation
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
      onConnect: () => {
        console.log(" Sidebar WebSocket Connected");
        client.subscribe(`/user/queue/group-created`, async (msg) => {
          try {
            const newGroup = JSON.parse(msg.body);
            const newChat: Chat = {
              id: `group_${newGroup.id}`,
              name: newGroup.name,
              type: "group",
            };
            // fetch its last message immediately
            const last = await fetchLastMessageForChat(newChat.id);
            if (last) {
              newChat.lastMessage = last.content;
              newChat.timestamp = last.timestamp
                ? new Date(last.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined;
            }
            setChats((prev) => {
              const exists = prev.find((c) => c.id === newChat.id);
              if (exists) return prev;
              const updated = [...prev, newChat];
              saveChats(updated);
              return updated;
            });
            toast.success(`Added to group: ${newGroup.name}`);
          } catch (err) {
            console.error(" Error parsing group notification:", err);
          }
        });
      },
      onStompError: (frame) => console.error(" WebSocket error:", frame),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      try {
        client.deactivate();
      } catch (err) {
        console.warn("WebSocket cleanup failed:", err);
      }
    };
  }, [currentUser]);

  // Listen for a single-chat lastMessage (fast update) AND refresh trigger
  useEffect(() => {
    const handleStorage = async (e: StorageEvent) => {
      try {
        if (!e.key) return;

        // If a specific chat's last message was written to localStorage, update that chat instantly
        if (e.key.startsWith("lastMessage_") && e.newValue) {
          const chatId = e.key.replace("lastMessage_", "");
          const parsed = JSON.parse(e.newValue);
          const content = parsed.content;
          const timestamp = parsed.timestamp;
          const formatted = timestamp
            ? new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined;

          setChats((prev) => {
            const updated = prev.map((c) =>
              c.id === chatId ? { ...c, lastMessage: content, timestamp: formatted } : c
            );
            saveChats(updated);
            return updated;
          });
          return;
        }

        // cross-tab: if refreshChats key changed in another tab, refresh entire list
        if (e.key === "refreshChats") {
          await refreshLastMessagesForAllChats();
        }
      } catch (err) {
        // ignore parsing errors
      }
    };

    window.addEventListener("storage", handleStorage);

    // also add same-tab polling for refreshChats key (storage events don't fire in same tab)
    lastRefreshSeenRef.current = localStorage.getItem("refreshChats");
    let mounted = true;
    const pollInterval = setInterval(() => {
      if (!mounted) return;
      const v = localStorage.getItem("refreshChats");
      if (v && v !== lastRefreshSeenRef.current) {
        lastRefreshSeenRef.current = v;
        // refresh using current chats
        refreshLastMessagesForAllChats();
      }
    }, 700); // small interval, tuned for responsiveness

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []); // run once

  // Start private chat and fetch last message
  const handleStartPrivateChat = async (user: User) => {
    if (!currentUser) return;

    const participants = [currentUser, user.username].sort();
    const chatId = `private_${participants.join("_")}`;

    const exists = chatsRef.current.find((c) => c.id === chatId);
    if (!exists) {
      const newChat: Chat = {
        id: chatId,
        name: user.username,
        type: "private",
      };
      const last = await fetchLastMessageForChat(chatId);
      if (last) {
        newChat.lastMessage = last.content;
        newChat.timestamp = last.timestamp
          ? new Date(last.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined;
      }
      const updated = [...chatsRef.current, newChat];
      setChats(updated);
      saveChats(updated);
    }

    onSelectChat(chatId);
  };

  // Filters
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 fixed md:relative z-20
        w-80 h-full bg-chat-sidebar border-r border-sidebar-border
        transition-transform duration-300 ease-in-out
        flex flex-col shadow-elegant
      `}
    >
      <div className="p-4 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search chats or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex border-b border-sidebar-border">
        <Button
          className={`flex-1 rounded-none py-4 ${
            activeTab === "chats"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("chats")}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Chats
        </Button>
        <Button
          className={`flex-1 rounded-none py-4 ${
            activeTab === "users"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("users")}
        >
          <Users className="h-4 w-4 mr-2" />
          Users
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === "chats" ? (
          <>
            <Button
              onClick={() => setIsCreateGroupOpen(true)}
              className="w-full mb-3 bg-primary text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> New Group
            </Button>

            {filteredChats.length === 0 ? (
              <div className="text-center text-muted-foreground mt-6">
                No chats yet.
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div key={chat.id} onClick={() => onSelectChat(chat.id)}>
                  <UserListItem
                    chat={chat}
                    isSelected={selectedChatId === chat.id}
                    onClick={() => onSelectChat(chat.id)}
                  />
                </div>
              ))
            )}
          </>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground mt-6">
                No users found.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.username}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  onClick={() => handleStartPrivateChat(user)}
                >
                  <UserListItem
                    chat={{
                      id: `private_placeholder_${user.username}`,
                      name: user.username,
                      type: "private",
                      online: user.online,
                    }}
                    isSelected={false}
                    onClick={() => handleStartPrivateChat(user)}
                  />
                </div>
              ))
            )}
          </>
        )}
      </div>

      <CreateGroupModal
        open={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={async (group: any) => {
          const newChat: Chat = {
            id: `group_${group.id}`,
            name: group.name,
            type: "group",
          };
          const last = await fetchLastMessageForChat(newChat.id);
          if (last) {
            newChat.lastMessage = last.content;
            newChat.timestamp = last.timestamp
              ? new Date(last.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : undefined;
          }
          setChats((prev) => {
            const updated = [...prev, newChat];
            saveChats(updated);
            return updated;
          });
          toast.success(`Group "${group.name}" created!`);
        }}
      />
    </aside>
  );
};

export default ChatSidebar;
