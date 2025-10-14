interface TabNavigationProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  color?: string;
}

export const TabNavigation = ({ tabs, activeTab, onTabChange, color = '#4CAF50' }: TabNavigationProps) => {
  return (
    <div 
      className="flex shadow-sm" 
      style={{ 
        background: `linear-gradient(180deg, ${color} 0%, ${color}ee 100%)`,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-smooth relative ${
            activeTab === tab
              ? 'text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full shadow-lg" />
          )}
        </button>
      ))}
    </div>
  );
};
