import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAddEmoji = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative border-t border-border bg-card/80 backdrop-blur-md p-4"
    >
      <div className="flex items-end gap-3">
        {/* Emoji Button */}
        <div className="relative">
          <Button
            type="button"
            className="text-muted-foreground hover:text-foreground flex-shrink-0 bg-transparent"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-label="Add emoji"
          >
            <Smile className="h-5 w-5" />
          </Button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-30">
              <EmojiPicker
                onEmojiClick={handleAddEmoji}
              />
            </div>
          )}
        </div>

        {/* Textarea */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[44px] max-h-32 resize-none focus:ring-2 focus:ring-primary transition-shadow"
          rows={1}
        />

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!message.trim()}
          className="gradient-primary text-white flex-shrink-0 shadow-glow hover:shadow-lg transition-transform active:scale-95"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2 ml-12">
        Press <kbd>Enter</kbd> to send • <kbd>Shift + Enter</kbd> for new line
      </p>
    </form>
  );
};

export default MessageInput;
