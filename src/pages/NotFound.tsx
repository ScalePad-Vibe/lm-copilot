import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: No route matched:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        {/* Big muted 404 */}
        <div className="relative mb-6 select-none">
          <span className="text-[9rem] font-bold leading-none text-surface-container-highest tracking-tighter">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-0.5 bg-gradient-to-r from-primary/60 to-primary-dim/60 rounded-full" />
          </div>
        </div>

        <h1 className="text-lg font-semibold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The route{" "}
          <code className="font-mono text-xs bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant">
            {location.pathname}
          </code>{" "}
          doesn't exist.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
