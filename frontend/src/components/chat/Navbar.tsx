import { Button } from '@/components/ui/button';
import { Menu, LogOut, MessageCircle } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
  username?: string | null;
}

const Navbar = ({ onToggleSidebar, onLogout, username }: NavbarProps) => {
  return (
    <nav className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          onClick={onToggleSidebar}
          className="md:hidden bg-transparent p-2"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground hidden sm:block">
            ChatApp
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
            {username?.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="text-sm font-medium hidden sm:block">
            {username}
          </span>
        </div>

        <Button
          onClick={onLogout} //  Uses prop from Chat.tsx
          className="text-muted-foreground hover:text-destructive px-2 py-1 text-sm rounded flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
