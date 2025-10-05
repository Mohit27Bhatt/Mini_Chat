import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Chat {
  id: string;
  name: string;
  type: 'private' | 'group';
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  online?: boolean;
}

interface UserListItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

const UserListItem = ({ chat, isSelected, onClick }: UserListItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200
        hover:bg-gray-100 dark:hover:bg-gray-800
        ${isSelected ? 'bg-primary/10 border-l-4 border-primary' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
              chat.type === 'group'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                : 'bg-gradient-to-br from-green-500 to-emerald-600'
            }`}
          >
            {chat.type === 'group' ? (
              <Users className="h-6 w-6" />
            ) : (
              chat.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Online Status Dot */}
          {chat.type === 'private' && chat.online !== undefined && (
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${
                chat.online ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
            {chat.timestamp && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {chat.timestamp}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground truncate">
              {chat.lastMessage || 'No messages yet'}
            </p>
            {chat.unreadCount && chat.unreadCount > 0 && (
              <Badge
                className="ml-2 bg-primary text-white min-w-[1.5rem] h-6 flex items-center justify-center rounded-full"
              >
                {chat.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserListItem;
