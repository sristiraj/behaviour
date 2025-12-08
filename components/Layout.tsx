import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  BrainCircuit, 
  MessageSquareText, 
  Settings, 
  LogOut,
  Menu,
  ChevronDown,
  User as UserIcon,
  X,
  FileJson
} from 'lucide-react';
import clsx from 'clsx';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User;
  onSwitchUser: (userId: string) => void;
  availableUsers: User[];
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  id, 
  isActive, 
  onClick 
}: { 
  icon: React.ElementType, 
  label: string, 
  id: string, 
  isActive: boolean, 
  onClick: (id: string) => void 
}) => (
  <button
    onClick={() => onClick(id)}
    className={clsx(
      "flex items-center w-full px-4 py-3 text-sm font-medium transition-all rounded-xl my-1",
      isActive 
        ? "bg-white/10 text-white shadow-lg border border-white/10 backdrop-blur-sm" 
        : "text-slate-400 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon className="w-5 h-5 mr-3" />
    {label}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange,
  currentUser,
  onSwitchUser,
  availableUsers
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-900">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 glass-sidebar flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out lg:transform-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 font-bold text-lg text-white shadow-lg shadow-blue-500/30">
                B
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Behaviour</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-4">
            Analysis
          </div>
          <NavItem icon={Users} label="HCP Scorecards" id="scorecards" isActive={activeTab === 'scorecards'} onClick={handleNavClick} />
          <NavItem icon={MessageSquareText} label="NLQ / What-If" id="nlq" isActive={activeTab === 'nlq'} onClick={handleNavClick} />
          
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-8 px-4">
            Data & Admin
          </div>
          <NavItem icon={LayoutDashboard} label="Control Center" id="dashboard" isActive={activeTab === 'dashboard'} onClick={handleNavClick} />
          <NavItem icon={Database} label="Connectors" id="connectors" isActive={activeTab === 'connectors'} onClick={handleNavClick} />
          <NavItem icon={FileJson} label="Data Model" id="datamodel" isActive={activeTab === 'datamodel'} onClick={handleNavClick} />
          <NavItem icon={BrainCircuit} label="Rules & Ontology" id="rules" isActive={activeTab === 'rules'} onClick={handleNavClick} />
          <NavItem icon={Settings} label="Settings" id="admin" isActive={activeTab === 'admin'} onClick={handleNavClick} />
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="relative group">
            <button className="flex items-center w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 border border-white/10 shadow-md">
                  {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                      <UserIcon className="w-5 h-5" />
                  )}
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>
            
            {/* User Dropdown */}
            <div className="absolute bottom-full left-0 w-full mb-2 glass-sidebar rounded-xl border border-white/10 shadow-2xl overflow-hidden hidden group-hover:block animate-in slide-in-from-bottom-2 duration-200">
                <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase bg-black/20">Switch User</div>
                <div className="max-h-48 overflow-y-auto">
                    {availableUsers.map(user => (
                        <button
                            key={user.id}
                            onClick={() => onSwitchUser(user.id)}
                            className={clsx(
                                "w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors flex items-center",
                                currentUser.id === user.id ? "text-white bg-white/5" : "text-slate-400"
                            )}
                        >
                            <div className="w-2 h-2 rounded-full mr-3 bg-blue-500 transition-opacity" style={{ opacity: currentUser.id === user.id ? 1 : 0 }} />
                            {user.name}
                        </button>
                    ))}
                </div>
                <div className="border-t border-white/10 p-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center rounded-lg transition-colors">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden glass-panel border-b-0 border-b-slate-200/50 p-4 flex items-center justify-between sticky top-0 z-30">
            <span className="font-bold text-lg text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Behaviour</span>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-white/50 rounded-lg transition-colors">
                <Menu className="w-6 h-6" />
            </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};