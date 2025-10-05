import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageBubble = ({ message, isOwnMessage }: MessageBubbleProps) => {
  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch {
      return '';
    }
  };

  // System messages like JOIN/LEAVE
  if (message.type === 'JOIN' || message.type === 'LEAVE') {
    return (
      <div className="flex justify-center my-4 animate-fade-in">
        <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`flex gap-2 max-w-[70%] ${
          isOwnMessage ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        {!isOwnMessage && (
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {message.senderName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Message Content */}
        <div className="flex flex-col gap-1">
          {!isOwnMessage && (
            <span className="text-xs text-muted-foreground px-3">
              {message.senderName}
            </span>
          )}

          <div
            className={`px-4 py-2.5 rounded-2xl shadow-sm ${
              isOwnMessage
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-sm'
                : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm'
            }`}
          >
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
          </div>

          <span
            className={`text-xs text-gray-400 dark:text-gray-500 px-3 ${
              isOwnMessage ? 'text-right' : 'text-left'
            }`}
          >
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
