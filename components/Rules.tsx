import React, { useState, useEffect } from 'react';
import { SegmentationRule, EntityAttribute } from '../types';
import { Play, Save, Code, Plus, Trash2, CheckCircle, AlertCircle, Sparkles, AlertTriangle, BookOpen, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface RulesProps {
    attributes?: EntityAttribute[];
    rules: SegmentationRule[];
    onUpdateRules: (rules: SegmentationRule[]) => void;
    onRunSegmentation?: () => Promise<void>;
}

export const Rules: React.FC<RulesProps> = ({ attributes = [], rules, onUpdateRules, onRunSegmentation }) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0]?.id || '');
  const [notification, setNotification] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Derive selected rule from props
  const selectedRule = rules.find(r => r.id === selectedRuleId);

  // Fallback: If selectedRule becomes undefined (e.g. after deletion or initial load), select the first available rule
  useEffect(() => {
    // Only auto-select if we have rules but the current selection is invalid
    if (rules.length > 0 && !rules.find(r => r.id === selectedRuleId)) {
        // Check if we just added a rule (hack: if selectedRuleId is set to something that doesn't exist yet, it might be a race condition)
        // However, for deletion fallback, this is necessary.
        setSelectedRuleId(rules[0].id);
    }
  }, [rules, selectedRuleId]);

  const handleAddRule = () => {
    const newRule: SegmentationRule = {
      id: `rule_${Date.now()}`,
      name: 'New Segmentation Rule',
      description: 'Describe the segmentation logic here...',
      type: 'llm_instruction',
      instruction: 'Analyze the HCP profile and assign a persona based on...',
      context: '',
      active: false,
      priority: rules.length + 1
    };
    
    const newRules = [...rules, newRule];
    onUpdateRules(newRules);
    // Note: Selection might jump to first item briefly due to prop sync delay, 
    // but we set intent here.
    setSelectedRuleId(newRule.id);
    showNotification('success', 'New rule created.');
  };

  const handleDeleteRule = (e: React.MouseEvent, id: string) => {
    // Crucial: stop propagation to prevent the card click handler (selection) from firing
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this rule? This will invalidate existing segmentation results.')) return;

    const newRules = rules.filter(r => r.id !== id);
    onUpdateRules(newRules);
    
    // Smart selection logic:
    // If we deleted the currently selected rule, switch to another one immediately
    if (id === selectedRuleId) {
        if (newRules.length > 0) {
            // Prefer the previous one, or the first one
            const index = rules.findIndex(r => r.id === id);
            const nextRule = newRules[Math.max(0, index - 1)];
            setSelectedRuleId(nextRule ? nextRule.id : newRules[0].id);
        } else {
            setSelectedRuleId('');
        }
    }

    showNotification('success', 'Rule deleted. Please re-run segmentation to update HCP profiles.');
  };

  const updateRule = (field: keyof SegmentationRule, value: any) => {
    if (!selectedRule) return;
    const updatedRules = rules.map(r => 
        r.id === selectedRuleId ? { ...r, [field]: value } : r
    );
    onUpdateRules(updatedRules);
  };

  const handleRunSegmentation = async () => {
      if (isRunning) return;
      
      const activeRules = rules.filter(r => r.active);
      if (activeRules.length === 0) {
          showNotification('error', 'No active rules to run. Please activate at least one rule.');
          return;
      }

      setIsRunning(true);
      
      try {
          if (onRunSegmentation) {
              await onRunSegmentation();
          } else {
              await new Promise(resolve => setTimeout(resolve, 2500));
          }
          showNotification('success', `Segmentation complete. Applied ${activeRules.length} rules to updated HCP profiles.`);
      } catch (error) {
          showNotification('error', 'Failed to run segmentation job.');
      } finally {
          setIsRunning(false);
      }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
      setNotification({ type, text });
      setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
       {/* Notifications */}
       {notification && (
        <div className={clsx(
            "absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-4 px-4 py-2 rounded-xl shadow-lg flex items-center text-sm font-medium z-50 animate-in slide-in-from-top-4 fade-in duration-300",
            notification.type === 'success' ? "bg-green-100/90 text-green-800 border border-green-200" : "bg-red-100/90 text-red-800 border border-red-200"
        )}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
            {notification.text}
        </div>
       )}

       {/* Header */}
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Segmentation Rules</h1>
            <p className="text-slate-500 mt-1">Define LLM instructions and logic to segment HCPs.</p>
        </div>
        <div className="flex space-x-3">
             <button 
                onClick={handleRunSegmentation}
                disabled={isRunning}
                className={clsx(
                    "flex items-center glass-panel hover:bg-white/80 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border border-transparent hover:border-slate-200 disabled:opacity-70 disabled:cursor-not-allowed",
                    isRunning && "bg-blue-50 text-blue-700"
                )}
             >
                {isRunning ? (
                    <Loader2 className="w-4 h-4 mr-2 text-blue-600 animate-spin" />
                ) : (
                    <Play className="w-4 h-4 mr-2 text-indigo-500" />
                )}
                {isRunning ? "Processing..." : "Run Segmentation"}
            </button>
            <button 
                onClick={() => showNotification('success', 'Rules configuration saved.')}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30"
            >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
        {/* Rule List Sidebar */}
        <div className="w-full lg:w-1/4 glass-panel rounded-2xl shadow-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/40 bg-white/40 flex items-center justify-between">
                <h3 className="font-bold text-slate-700">Active Rules</h3>
                <button 
                    onClick={handleAddRule}
                    className="p-1.5 bg-blue-100/50 hover:bg-blue-200/50 text-blue-700 rounded-lg transition-colors"
                    title="Add Rule"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-3">
                {rules.map(rule => (
                    <div 
                        key={rule.id} 
                        onClick={() => setSelectedRuleId(rule.id)}
                        className={clsx(
                            "p-4 rounded-xl border transition-all cursor-pointer group relative",
                            selectedRuleId === rule.id 
                                ? "bg-white/80 border-blue-400 shadow-md ring-1 ring-blue-400/50" 
                                : "bg-white/40 border-white/50 hover:bg-white/60 hover:border-blue-200 hover:shadow-sm"
                        )}
                    >
                        <div className="flex justify-between mb-2">
                            <span className={clsx("font-bold text-sm truncate pr-2", selectedRuleId === rule.id ? "text-blue-900" : "text-slate-800")}>
                                {rule.name}
                            </span>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <span className={clsx(
                                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                                    rule.type === 'llm_instruction' ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"
                                )}>
                                    {rule.type === 'llm_instruction' ? 'AI' : 'Logic'}
                                </span>
                                {selectedRuleId === rule.id && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pr-6">{rule.description}</p>
                        
                        {/* Delete Button on Card - High Z-Index to ensure clickability */}
                        <button 
                            onClick={(e) => handleDeleteRule(e, rule.id)}
                            className="absolute bottom-3 right-3 p-1.5 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100 z-10"
                            title="Delete Rule"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Rule Editor */}
        <div className="w-full lg:w-3/4 glass-panel rounded-2xl shadow-xl flex flex-col overflow-hidden">
             {selectedRule ? (
                 <>
                    <div className="p-4 border-b border-white/40 bg-white/40 flex items-center justify-between">
                        <div className="flex items-center flex-1 mr-4">
                            <div className={clsx("p-2 rounded-lg mr-3 flex-shrink-0", selectedRule.type === 'llm_instruction' ? "bg-purple-100/50 text-purple-600" : "bg-amber-100/50 text-amber-600")}>
                                {selectedRule.type === 'llm_instruction' ? <Sparkles className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                            </div>
                            <input 
                                type="text"
                                value={selectedRule.name}
                                onChange={(e) => updateRule('name', e.target.value)}
                                className="bg-transparent border-none text-slate-800 font-bold text-lg focus:ring-0 focus:outline-none placeholder-slate-400 w-full"
                                placeholder="Rule Name"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-400 bg-white/50 px-2 py-1 rounded-md border border-white/50">{selectedRule.id}</span>
                            <button 
                                onClick={(e) => handleDeleteRule(e, selectedRule.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Rule"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex flex-1 overflow-hidden">
                        <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Rule Type</label>
                                    <select 
                                        value={selectedRule.type}
                                        onChange={(e) => updateRule('type', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                                    >
                                        <option value="llm_instruction">LLM Instruction (AI)</option>
                                        <option value="rule_based">Deterministic Logic (If/Then)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                                    <div className="flex items-center space-x-4 h-[42px]">
                                        <label className="flex items-center cursor-pointer">
                                            <div className="relative">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only" 
                                                    checked={selectedRule.active}
                                                    onChange={(e) => updateRule('active', e.target.checked)}
                                                />
                                                <div className={clsx("w-10 h-6 rounded-full shadow-inner transition-colors", selectedRule.active ? "bg-green-500" : "bg-slate-300")}></div>
                                                <div className={clsx("dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-transform", selectedRule.active ? "transform translate-x-4" : "")}></div>
                                            </div>
                                            <div className="ml-3 text-sm font-medium text-slate-700">
                                                {selectedRule.active ? 'Active' : 'Inactive'}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <input 
                                    type="text" 
                                    value={selectedRule.description}
                                    onChange={(e) => updateRule('description', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800 placeholder-slate-400"
                                    placeholder="Briefly describe what this rule does..."
                                />
                            </div>

                            {selectedRule.type === 'llm_instruction' && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">LLM Context (Optional)</label>
                                    <textarea 
                                        value={selectedRule.context || ''}
                                        onChange={(e) => updateRule('context', e.target.value)}
                                        className="w-full p-4 font-mono text-sm bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none shadow-sm min-h-[100px] resize-y text-slate-700"
                                        placeholder="Provide additional background information..."
                                    />
                                </div>
                            )}
                            
                            <div className="flex-1 flex flex-col min-h-[300px]">
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between">
                                    <span>{selectedRule.type === 'llm_instruction' ? 'Prompt Instruction' : 'Logic Expression'}</span>
                                    {selectedRule.type === 'llm_instruction' && <span className="text-xs font-normal text-slate-500">Supports variable interpolation</span>}
                                </label>
                                <div className="relative flex-1 flex flex-col">
                                    <textarea 
                                        value={selectedRule.instruction}
                                        onChange={(e) => updateRule('instruction', e.target.value)}
                                        className="w-full flex-1 p-5 font-mono text-sm bg-slate-900/90 text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none resize-none shadow-inner border border-slate-700 leading-relaxed"
                                        placeholder={selectedRule.type === 'llm_instruction' ? "e.g., Analyze the call notes for mentions of..." : "e.g., IF metadata.publications > 5 THEN..."}
                                    />
                                    {selectedRule.type === 'llm_instruction' && (
                                        <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                                            Approx Tokens: {Math.ceil(selectedRule.instruction.length / 4)}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 flex items-start">
                                    <AlertTriangle className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                                    {selectedRule.type === 'llm_instruction' 
                                        ? "This instruction is injected into the System Prompt along with the Ontology and HCP Profile. Keep it concise."
                                        : "Logic rules use a simplified syntax. Available objects: interactions, metadata, profile."
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Sidebar for attributes */}
                        <div className="w-64 bg-slate-50/50 border-l border-white/40 overflow-y-auto p-4 hidden xl:block">
                            <h4 className="font-bold text-slate-600 text-xs uppercase tracking-wide mb-3 flex items-center">
                                <BookOpen className="w-3 h-3 mr-1.5" /> Available Data Points
                            </h4>
                            <div className="space-y-2">
                                {attributes.map(attr => (
                                    <div key={attr.key} className="bg-white/60 p-2 rounded-lg border border-slate-200/50 text-xs">
                                        <div className="font-mono font-bold text-slate-700 break-all">{attr.key}</div>
                                        <div className="text-slate-500 flex justify-between items-center mt-1">
                                            <span className="bg-slate-100 px-1.5 rounded text-[10px]">{attr.type}</span>
                                            {attr.required && <span className="text-red-500 text-[10px]">*Req</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                 </>
             ) : (
                 <div className="flex-1 flex items-center justify-center text-slate-400 flex-col">
                     <div className="bg-white/40 p-4 rounded-full mb-4">
                        <Code className="w-8 h-8 opacity-50" />
                     </div>
                     <p>Select a rule to edit or create a new one.</p>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};