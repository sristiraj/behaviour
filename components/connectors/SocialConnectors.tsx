import React from 'react';
import { Linkedin, Twitter } from 'lucide-react';

interface ConnectorFormProps {
    config: any;
    onChange: (config: any) => void;
}

export const LinkedInForm: React.FC<ConnectorFormProps> = ({ config, onChange }) => {
    const update = (field: string, value: any) => onChange({ ...config, [field]: value });

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
             <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4 flex items-start">
                 <Linkedin className="w-5 h-5 text-blue-700 mr-3 mt-0.5" />
                 <div className="text-sm text-blue-900">
                     <p className="font-bold">LinkedIn API Access</p>
                     <p className="text-xs mt-1">Requires a developer application with the 'Marketing Developer Platform' product enabled.</p>
                 </div>
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client ID</label>
                 <input required type="text" value={config.clientId || ''} onChange={(e) => update('clientId', e.target.value)} className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client Secret</label>
                 <input required type="password" value={config.clientSecret || ''} onChange={(e) => update('clientSecret', e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Organization ID (Optional)</label>
                 <input type="text" value={config.organizationId || ''} onChange={(e) => update('organizationId', e.target.value)} placeholder="e.g. 12345678" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
        </div>
    );
};

export const TwitterForm: React.FC<ConnectorFormProps> = ({ config, onChange }) => {
    const update = (field: string, value: any) => onChange({ ...config, [field]: value });

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
             <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200 mb-4 flex items-start">
                 <Twitter className="w-5 h-5 text-slate-700 mr-3 mt-0.5" />
                 <div className="text-sm text-slate-900">
                     <p className="font-bold">X (Twitter) API Access</p>
                     <p className="text-xs mt-1 text-slate-500">Requires Essential or Elevated access to the Twitter API v2.</p>
                 </div>
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">API Key</label>
                 <input required type="text" value={config.apiKey || ''} onChange={(e) => update('apiKey', e.target.value)} className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">API Secret</label>
                 <input required type="password" value={config.apiSecret || ''} onChange={(e) => update('apiSecret', e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bearer Token (Optional)</label>
                 <input type="password" value={config.bearerToken || ''} onChange={(e) => update('bearerToken', e.target.value)} placeholder="AAAA..." className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
        </div>
    );
};