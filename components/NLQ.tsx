import React, { useState, useRef, useEffect } from 'react';
import { MOCK_HCPS } from '../constants';
import { runNLQAnalysis, DEFAULT_NLQ_INSTRUCTION } from '../services/geminiService';
import { updateUserInstruction } from '../services/userService';
import { ChatMessage, User } from '../types';
import { Send, Sparkles, Bot, User as UserIcon, RefreshCw, Settings, X, Save, Undo, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface NLQProps {
    currentUser?: User;
}

export const NLQ: React.FC<NLQProps> = ({ currentUser }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Config State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(DEFAULT_NLQ_INSTRUCTION);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    setMessages([
        { 
            id: 'welcome', 
            role: 'model', 
            content: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I am your Commercial Analytics Assistant. You can ask me to find specific HCP segments, perform "what-if" analysis on strategy changes, or explain segmentation rationale.`,
            timestamp: new Date()
        }
    ]);

    if (currentUser?.preferences?.nlq_instruction) {
        setSystemInstruction(currentUser.preferences.nlq_instruction);
    } else {
        setSystemInstruction(DEFAULT_NLQ_INSTRUCTION);
    }
  }, [currentUser]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: query,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    const history = messages.map(m => m.content);
    
    const responseText = await runNLQAnalysis(userMsg.content, MOCK_HCPS, history, systemInstruction);

    const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const handleSaveConfig = async () => {
      if (!currentUser) return;
      setSavingConfig(true);
      try {
        await updateUserInstruction(currentUser.id, systemInstruction);
        setIsConfigOpen(false);
      } catch (error) {
        console.error("Failed to save config", error);
        alert("Failed to save configuration.");
      } finally {
        setSavingConfig(false);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col glass-panel rounded-2xl shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-white/40 bg-white/40 flex items-center justify-between backdrop-blur-md z-10">
         <div className="flex items-center">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white mr-3 shadow-lg">
                <Sparkles className="w-5 h-5" />
            </div>
            <div>
                <h2 className="font-bold text-slate-800">Commercial Intelligence Agent</h2>
                <div className="flex items-center text-xs font-medium text-slate-500">
                    <span className="mr-2">Powered by Gemini 2.5 Flash</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/50 border border-white/50 text-slate-600 text-[10px] uppercase tracking-wide shadow-sm">
                        {currentUser?.role || 'Guest'} Mode
                    </span>
                </div>
            </div>
         </div>
         <div className="flex space-x-2">
            <button 
                onClick={() => setIsConfigOpen(true)}
                className="text-slate-500 hover:text-blue-600 text-xs flex items-center px-3 py-2 rounded-xl hover:bg-white/60 border border-transparent hover:border-white/50 transition-all font-medium"
                title="Configure Instructions"
            >
                <Settings className="w-4 h-4 mr-1.5" />
                Configure
            </button>
            <button onClick={() => setMessages([messages[0]])} className="text-slate-500 hover:text-slate-700 text-xs flex items-center px-3 py-2 rounded-xl hover:bg-white/60 border border-transparent hover:border-white/50 transition-all font-medium">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset
            </button>
         </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={clsx(
                    "max-w-[85%] rounded-2xl p-5 shadow-sm backdrop-blur-sm",
                    msg.role === 'user' 
                        ? "bg-blue-600/90 text-white rounded-tr-none shadow-blue-500/20" 
                        : "bg-white/70 border border-white/50 text-slate-800 rounded-tl-none shadow-sm"
                )}>
                    <div className={clsx("flex items-center mb-2 text-xs font-bold uppercase tracking-wide", msg.role === 'user' ? "text-blue-100" : "text-slate-400")}>
                        {msg.role === 'user' ? <UserIcon className="w-3 h-3 mr-1.5"/> : <Bot className="w-3 h-3 mr-1.5"/>}
                        {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.content}
                    </div>
                </div>
            </div>
        ))}
        {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
                 <div className="bg-white/60 border border-white/50 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/40 border-t border-white/40 backdrop-blur-md">
         <div className="relative shadow-lg rounded-2xl">
             <textarea 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask as ${currentUser?.name || 'User'}...`}
                className="w-full pl-5 pr-14 py-4 bg-white/80 border border-white/60 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none resize-none text-sm text-slate-900 shadow-inner placeholder-slate-400"
                rows={1}
                style={{ minHeight: '60px' }}
             />
             <button 
                onClick={handleSend}
                disabled={loading || !query.trim()}
                className="absolute right-2 bottom-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-md shadow-blue-500/30"
             >
                <Send className="w-5 h-5" />
             </button>
         </div>
         <div className="text-center mt-3 text-[10px] text-slate-400 font-medium">
            AI can make mistakes. Please verify important information.
         </div>
      </div>

      {/* Configuration Modal - Glass Style */}
      {isConfigOpen && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                <div className="px-6 py-4 border-b border-white/40 flex items-center justify-between bg-white/40">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Personalized Instructions</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Customize the Agent persona for 
                            <span className="text-blue-600 ml-1">{currentUser?.name}</span>.
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsConfigOpen(false)}
                        className="text-slate-500 hover:text-slate-700 transition-colors bg-white/50 p-1.5 rounded-lg hover:bg-white/80"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                    <label className="block text-sm font-bold text-slate-700 mb-2">System Prompt / Context</label>
                    <textarea 
                        value={systemInstruction}
                        onChange={(e) => setSystemInstruction(e.target.value)}
                        className="w-full h-64 p-5 font-mono text-sm bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none resize-y text-slate-800 shadow-inner"
                        placeholder="Enter system instructions here..."
                    />
                    <div className="mt-4 bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs text-blue-800">
                        <p className="font-bold mb-1">Tip:</p>
                        <p>Changes here are saved to your user profile ({currentUser?.role} role) and will persist across sessions.</p>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white/40 border-t border-white/40 flex justify-between items-center">
                    <button 
                        onClick={() => setSystemInstruction(DEFAULT_NLQ_INSTRUCTION)}
                        className="flex items-center text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors"
                    >
                        <Undo className="w-4 h-4 mr-2" />
                        Reset to Default
                    </button>
                    <div className="flex space-x-3">
                        <button 
                            onClick={() => setIsConfigOpen(false)}
                            className="px-4 py-2 text-slate-700 hover:bg-white/50 rounded-xl text-sm font-medium transition-colors border border-transparent hover:border-slate-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveConfig}
                            disabled={savingConfig}
                            className="flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-70"
                        >
                            {savingConfig ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};