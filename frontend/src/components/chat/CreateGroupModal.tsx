// src/components/chat/CreateGroupModal.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onGroupCreated: (group: { id: string | number; name: string; members?: string[] }) => void;
}

interface User {
  id: number;
  username: string;
  email?: string;
  online?: boolean;
}

const CreateGroupModal = ({ open, onClose, onGroupCreated }: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setUsers(res.data || []);
        // prefill selected map
        const map: Record<string, boolean> = {};
        (res.data || []).forEach((u: User) => (map[u.username] = false));
        setSelected(map);
      } catch (err) {
        console.error("Failed to fetch users for group modal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setGroupName("");
      setSelected({});
      setCreating(false);
    }
  }, [open]);

  const toggleUser = (username: string) => {
    setSelected((s) => ({ ...s, [username]: !s[username] }));
  };

  const handleCreateGroup = async () => {
  if (!groupName.trim()) {
    alert("Please provide a group name.");
    return;
  }

  const selectedMembers = Object.keys(selected).filter((k) => selected[k]);
  
  // Add current user to members
  const currentUsername = localStorage.getItem('username'); // or get from props/context
  const members = currentUsername && !selectedMembers.includes(currentUsername)
    ? [...selectedMembers, currentUsername]
    : selectedMembers;

  if (members.length === 0) {
    alert("Group must have at least one member");
    return;
  }

  setCreating(true);
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_URL}/api/groups`,
      { name: groupName.trim(), members },
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    );

    const created = res?.data;
    if (created) {
      onGroupCreated(created);
    }

    onClose();
    setGroupName("");
    setSelected({});
  } catch (err) {
    console.error("Failed to create group:", err);
    alert("Failed to create group. Check console for details.");
  } finally {
    setCreating(false);
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!creating) onClose();
        }}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 z-10">
        <h3 className="text-lg font-semibold mb-3">Create Group</h3>

        <label className="block mb-3">
          <div className="text-sm text-muted-foreground mb-1">Group name</div>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Weekend Devs"
          />
        </label>

        <div className="mb-3">
          <div className="text-sm text-muted-foreground mb-2">Add members</div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-muted-foreground">No users available</div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {users.map((u) => (
                <label
                  key={u.username}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/20 rounded-md p-1"
                >
                  <input
                    type="checkbox"
                    checked={!!selected[u.username]}
                    onChange={() => toggleUser(u.username)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{u.username}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => !creating && onClose()}>
            Cancel
          </Button>
          <Button onClick={handleCreateGroup} className="bg-primary text-white" disabled={creating}>
            {creating ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
