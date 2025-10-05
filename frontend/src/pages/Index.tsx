import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Zap, Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  //  Check if token already exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/chat');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-glow">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Connect, Chat, Collaborate
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Experience seamless communication with real-time messaging, group chats, 
            and a beautiful interface designed for modern conversations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gradient-primary text-white font-semibold px-8 py-6 text-lg shadow-glow"
              onClick={() => navigate('/register')}
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-2xl glass shadow-elegant animate-fade-in">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Real-time Messaging</h3>
            <p className="text-muted-foreground">
              Experience instant message delivery with WebSocket technology. 
              Your conversations flow naturally in real-time.
            </p>
          </div>

          <div
            className="text-center p-6 rounded-2xl glass shadow-elegant animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Group Chats</h3>
            <p className="text-muted-foreground">
              Create and manage group conversations. Perfect for teams, 
              friends, and communities of any size.
            </p>
          </div>

          <div
            className="text-center p-6 rounded-2xl glass shadow-elegant animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your conversations are protected with JWT authentication 
              and secure WebSocket connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
