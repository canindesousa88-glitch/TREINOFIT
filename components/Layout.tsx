
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, onBack, actions, className }) => {
  return (
    <div className={`flex flex-col min-h-screen max-w-md mx-auto shadow-2xl relative ${className || 'bg-slate-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        </div>
        <div className="flex items-center">
          {actions}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 overflow-y-auto pb-24">
        {children}
      </main>
    </div>
  );
};

export default Layout;
