import React from 'react';
import { Globe, Braces } from 'lucide-react';

interface RestApiFormProps {
    config: any;
    onChange: (config: any) => void;
}

export const RestApiForm: React.FC<RestApiFormProps> = ({ config, onChange }) => {
    const update = (field: string, value: any) => onChange({ ...config, [field]: value });

    return (
        <div className="space-y-6">
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">API Endpoint</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                            required
                            type="text" 
                            value={config.endpoint || ''}
                            onChange={(e) => update('endpoint', e.target.value)}
                            placeholder="https://api.example.com/v1"
                            className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Authentication Type</label>
                    <select 
                        value={config.authType || 'none'}
                        onChange={(e) => update('authType', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                    >
                        <option value="none">No Auth</option>
                        <option value="pat">Bearer Token / API Key</option>
                        <option value="oauth2">OAuth 2.0</option>
                        <option value="jwt">JWT</option>
                    </select>
                </div>

                {(config.authType === 'pat' || config.authType === 'jwt') && (
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Token / Key</label>
                        <input 
                            required
                            type="password" 
                            value={config.token || ''}
                            onChange={(e) => update('token', e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                        />
                    </div>
                )}

                {config.authType === 'oauth2' && (
                    <div className="space-y-4 p-4 bg-slate-100/50 rounded-xl border border-slate-200">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Token URL</label>
                            <input 
                                required
                                type="text" 
                                value={config.tokenUrl || ''}
                                onChange={(e) => update('tokenUrl', e.target.value)}
                                placeholder="https://auth.example.com/oauth/token"
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client ID</label>
                                <input 
                                    required
                                    type="text" 
                                    value={config.clientId || ''}
                                    onChange={(e) => update('clientId', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client Secret</label>
                                <input 
                                    required
                                    type="password" 
                                    value={config.clientSecret || ''}
                                    onChange={(e) => update('clientSecret', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Scopes (Space separated)</label>
                            <input 
                                type="text" 
                                value={config.scopes || ''}
                                onChange={(e) => update('scopes', e.target.value)}
                                placeholder="read write"
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-2 border-t border-slate-200/50">
                 <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm uppercase tracking-wide mb-4">
                    <Braces className="w-4 h-4 text-purple-500" />
                    <span>Source Definition</span>
                </div>
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">
                        <span>Response JSON Sample</span>
                        <span className="text-xs font-normal text-slate-500">Paste a sample response to guide mapping</span>
                    </label>
                    <div className="relative">
                        <Braces className="absolute top-3 left-3 w-4 h-4 text-slate-400" />
                        <textarea 
                            rows={6}
                            value={config.jsonSample || ''}
                            onChange={(e) => update('jsonSample', e.target.value)}
                            placeholder='{ "results": [ { "id": "123", "name": "Dr. Smith" } ] }'
                            className="w-full pl-10 pr-4 py-3 bg-slate-900 text-slate-200 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none font-mono text-xs leading-relaxed"
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};