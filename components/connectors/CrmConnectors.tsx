import React from 'react';
import { Stethoscope, Briefcase, Cloud } from 'lucide-react';

interface ConnectorFormProps {
    config: any;
    onChange: (config: any) => void;
}

export const DoximityForm: React.FC<ConnectorFormProps> = ({ config, onChange }) => {
    const update = (field: string, value: any) => onChange({ ...config, [field]: value });

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
             <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-4 flex items-start">
                 <Stethoscope className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                 <div className="text-sm text-orange-900">
                     <p className="font-bold">Doximity Professional Network</p>
                     <p className="text-xs mt-1">Connect to Doximity APIs for HCP verification and network data.</p>
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
        </div>
    );
};

export const VeevaForm: React.FC<ConnectorFormProps> = ({ config, onChange }) => {
    const update = (field: string, value: any) => onChange({ ...config, [field]: value });

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
             <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-4 flex items-start">
                 <Briefcase className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                 <div className="text-sm text-orange-900">
                     <p className="font-bold">Veeva CRM / Vault</p>
                     <p className="text-xs mt-1">Extract Call Notes, Rep Interactions, and Suggestions via Vault API.</p>
                 </div>
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vault Domain URL</label>
                 <input required type="text" value={config.url || ''} onChange={(e) => update('url', e.target.value)} placeholder="https://myvault.veevavault.com" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                 <input required type="text" value={config.username || ''} onChange={(e) => update('username', e.target.value)} placeholder="user@company.com" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                 <input required type="password" value={config.password || ''} onChange={(e) => update('password', e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
        </div>
    );
};

export const SalesforceForm: React.FC<ConnectorFormProps> = ({ config, onChange }) => {
    const update = (field: string, value: any) => onChange({ ...config, [field]: value });

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
             <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4 flex items-start">
                 <Cloud className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                 <div className="text-sm text-blue-900">
                     <p className="font-bold">Salesforce CRM</p>
                     <p className="text-xs mt-1">Integration via Connected App (Username-Password Flow for backend sync).</p>
                 </div>
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Instance URL</label>
                 <input required type="text" value={config.instanceUrl || ''} onChange={(e) => update('instanceUrl', e.target.value)} placeholder="https://na1.salesforce.com" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client ID (Consumer Key)</label>
                    <input required type="text" value={config.clientId || ''} onChange={(e) => update('clientId', e.target.value)} className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client Secret</label>
                    <input required type="password" value={config.clientSecret || ''} onChange={(e) => update('clientSecret', e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                </div>
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Salesforce Username</label>
                 <input required type="text" value={config.username || ''} onChange={(e) => update('username', e.target.value)} placeholder="user@domain.com" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password + Security Token</label>
                 <input required type="password" value={config.password || ''} onChange={(e) => update('password', e.target.value)} placeholder="pass123TOKENxyz..." className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
             </div>
        </div>
    );
};