import { useNavigate, useLocation } from "react-router-dom";
import { RocketLaunchIcon, FlagIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

function ScalePadLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 500 146.4" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path d="M131.9,52.7c-4.9,0-8.8,2.5-8.8,7c0,4.7,5.9,6.5,10.6,8.2c8.8,3,18.6,6.9,18.6,18.9c0,13.1-11.9,18.4-21.8,18.4c-9,0-15.8-3.1-22.3-9.5l7.1-6.9c5.2,5,9.1,7.3,15.2,7.3c5.3,0,10.5-2.5,10.5-8.8c0-5.7-6-7.8-12.2-10c-8-2.9-16.4-6.8-16.4-17.1c0-11.3,9-16.6,18.8-16.6c7.4,0,13.4,2.3,19.2,6.6l-6.2,7.6C141.3,55.1,136.5,52.7,131.9,52.7z"/>
      <path d="M196.9,100.2c-3.8,3.3-8.9,4.9-14.8,4.9c-12.8,0-22.3-9.3-22.3-23c0-12.8,9.5-22.9,22.7-22.9c5.4,0,10.2,1.7,14.1,4.7l-5.1,7.7c-2.5-2.1-5.4-3.3-8.7-3.3c-7.1,0-12.6,6.2-12.6,13.9c0,8.2,5.7,13.9,12.5,13.9c3.1,0,6.3-1.1,8.8-3.2L196.9,100.2z"/>
      <path d="M231.6,104.1l-0.5-4.1c-3.1,3.7-7.4,5.1-12.4,5.1c-8.2,0-15.7-4.5-15.7-13.7c0-10.9,10-14.3,19.3-14.3c2.3,0,5,0.3,8.2,0.9v-1c0-6-2.6-9.5-9.4-9.5c-4.9,0-9.8,1.9-13.5,3.8l-2.8-7.7c5.2-2.5,11.9-4.3,18.2-4.3c12.4,0,17.8,7,17.8,18.4v26.4H231.6z M230.5,84.7c-2.6-0.6-4.8-0.9-6.7-0.9c-4.8,0-10.7,1.5-10.7,7.2c0,4.4,3.5,6.4,7.5,6.4c3.8,0,7-1.8,9.9-4.3V84.7z"/>
      <path d="M263.4,104.1h-10.3V40.4h10.3V104.1z"/>
      <path d="M283.3,84.8c0.7,6.5,5.1,11.9,12.2,11.9c5.7,0,9.4-2.2,12.1-6.8l7,4.7c-4.8,7.1-10.5,10.5-19.6,10.5c-13.5,0-22-9.6-22-22.6c0-13.2,9.6-23.2,22-23.2c11.9,0,20.7,8.6,20.7,20.3c0,1.6-0.2,3.6-0.4,5.2H283.3z M295.2,67.6c-6.3,0-9.9,4.2-11.3,9.9h21.2C304.8,71.7,300.7,67.6,295.2,67.6z"/>
      <path d="M344.5,44.6c9.9,0,21.8,4.8,21.8,18.2c0,13.4-11.7,18.3-21.8,18.3h-7.9v23H326V44.6H344.5z M336.6,72.1h5.9c7.2,0,12.6-2.4,12.6-9c0-5.9-4.4-9.4-10.9-9.4h-7.6V72.1z"/>
      <path d="M400.4,104.1l-0.5-4.1c-3.1,3.7-7.4,5.1-12.4,5.1c-8.2,0-15.7-4.5-15.7-13.7c0-10.9,10-14.3,19.3-14.3c2.3,0,5,0.3,8.2,0.9v-1c0-6-2.6-9.5-9.4-9.5c-4.9,0-9.8,1.9-13.5,3.8l-2.8-7.7c5.2-2.5,11.9-4.3,18.2-4.3c12.4,0,17.8,7,17.8,18.4v26.4H400.4z M399.3,84.7c-2.6-0.6-4.8-0.9-6.7-0.9c-4.8,0-10.7,1.5-10.7,7.2c0,4.4,3.5,6.4,7.5,6.4c3.8,0,7-1.8,9.9-4.3V84.7z"/>
      <path d="M463.4,104.1h-9.4l-0.5-5.6c-3.1,4.8-8.8,6.6-13.7,6.6c-12.1,0-21-10.3-21-23c0-12,8.6-22.8,21.2-22.8c4.5,0,9.7,1.8,13.1,5.5V40.4h10.4V104.1z M453,73.9c-3-3.8-7.1-5.5-11.1-5.5c-8.6,0-12.7,7.3-12.7,14c0,7.1,4.8,13.8,12.5,13.8c4.1,0,8.8-2,11.3-6.8V73.9z"/>
      <rect x="79" y="65.6" width="17.7" height="17.7" rx="3.8"/>
      <rect x="79" y="43.3" width="17.7" height="17.7" rx="3.8"/>
      <rect x="79" y="87.9" width="17.7" height="17.7" rx="3.8"/>
      <rect x="34.4" y="87.9" width="17.7" height="17.7" rx="3.8"/>
      <rect x="56.7" y="87.9" width="17.7" height="17.7" rx="3.8"/>
      <rect x="56.7" y="65.6" width="17.7" height="17.7" rx="3.8"/>
    </svg>
  );
}

const tools = [
  { path: "/initiatives", icon: RocketLaunchIcon, label: "Initiative Manager" },
  { path: "/goals",       icon: FlagIcon,          label: "Goal Manager"       },
  { path: "/opportunities", icon: CurrencyDollarIcon, label: "Opportunities"  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border/15 flex flex-col z-30">

      {/* Brand */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2.5 px-4 h-16 border-b border-border/15 shrink-0 cursor-pointer hover:bg-surface-container transition-colors"
      >
        <ScalePadLogo className="h-[26px] w-auto text-foreground shrink-0" />
        <div className="w-px h-4 bg-border/40 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">LM Copilot</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Tools</p>
        {tools.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm tracking-tight transition-colors duration-150 ${
              isActive(path)
                ? "bg-surface-container-highest text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-container"
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
