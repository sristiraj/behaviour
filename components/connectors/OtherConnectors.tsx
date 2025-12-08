import React from 'react';
import { GraduationCap, MessageSquare } from 'lucide-react';

interface ConnectorFormProps {
    config: any;
    onChange: (config: any) => void;
}

export const GoogleScholarForm: React.FC<ConnectorFormProps> = ({ config, onChange }) => {
    const update = (field: string, value: any) => onChange({ ...config, [field]: value });

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
             <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200 mb-4 flex items-start">
                 <GraduationCap className="w-5 h-5 text-slate-700 mr-3 mt-0.5" />
                 <div className="text-sm text-slate-900">
                     <p className="font-bold">Google Scholar (via API Wrapper)</p>
                     <p className="text-xs mt-1">Connects to services like SerpApi or custom scrapers to fetch publication metadata.</p>
                 </div>
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">API Key</label>
                 <input required type="text" value={config.apiKey || ''} onChange={(e) => update('apiKey', e.target.value)} placeholder="e.g. SerpApi Key" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
        </div>
    );
};

export const RepFeedbackForm: React.FC<ConnectorFormProps> = ({ config, onChange }) => {
    const update = (field: string, value: any) => onChange({ ...config, [field]: value });

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
             <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mb-4 flex items-start">
                 <MessageSquare className="w-5 h-5 text-emerald-600 mr-3 mt-0.5" />
                 <div className="text-sm text-emerald-900">
                     <p className="font-bold">Rep Feedback Aggregator</p>
                     <p className="text-xs mt-1">Ingest structured feedback from field surveys, voice-of-customer tools, or internal databases.</p>
                 </div>
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Source Endpoint URL</label>
                 <input required type="text" value={config.url || ''} onChange={(e) => update('url', e.target.value)} placeholder="https://internal.pharma.com/api/feedback" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Auth Token / API Key</label>
                 <input required type="password" value={config.apiKey || ''} onChange={(e) => update('apiKey', e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
        </div>
    );
};