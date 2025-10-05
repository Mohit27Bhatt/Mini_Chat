import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { MessageCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg p-4">
      <div className="text-center bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-lg max-w-md w-full text-white animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>

        <h1 className="mb-3 text-6xl font-bold text-white drop-shadow-lg">404</h1>
        <p className="mb-6 text-lg text-white/80">Oops! The page you're looking for doesn’t exist.</p>

        <Link
          to="/"
          className="inline-block gradient-primary text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-glow transition-transform hover:-translate-y-1"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
