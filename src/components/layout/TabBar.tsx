interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 h-10 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === tab.id
              ? "bg-gradient-to-r from-primary to-[hsl(195,90%,50%)] text-primary-foreground shadow-lg shadow-primary/20"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 text-xs ${activeTab === tab.id ? "opacity-80" : "opacity-50"}`}>
              ({tab.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
