import React, { useState } from 'react';
import { Connector, DataSourceLink, EntityAttribute } from '../types';
import { Database, FileJson, ArrowRightLeft, Check, AlertCircle, Save, Layers, Link2, Plus, X, Trash2, Lock } from 'lucide-react';
import { DEFAULT_ATTRIBUTES } from '../constants';

interface DataModelProps {
  connectors: Connector[];
  onUpdateConnector: (connector: Connector) => void;
  links: DataSourceLink[];
  onUpdateLinks: (links: DataSourceLink[]) => void;
  attributes: EntityAttribute[];
  onUpdateAttributes: (attrs: EntityAttribute[]) => void;
}

export const DataModel: React.FC<DataModelProps> = ({ connectors, onUpdateConnector, links, onUpdateLinks, attributes, onUpdateAttributes }) => {
    const [activeTab, setActiveTab] = useState<'model' | 'mapping' | 'linking'>('model');
    const [selectedConnectorId, setSelectedConnectorId] = useState<string>(connectors[0]?.id || '');
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // Attribute Modal State
    const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
    const [newAttr, setNewAttr] = useState<EntityAttribute>({
        key: '',
        label: '',
        type: 'string',
        required: false,
        description: ''
    });

    // Linking State
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [newLinkSourceId, setNewLinkSourceId] = useState<string>(connectors[0]?.id || '');
    const [newLinkTargetId, setNewLinkTargetId] = useState<string>(connectors.length > 1 ? connectors[1].id : (connectors[0]?.id || ''));
    const [newLinkConditions, setNewLinkConditions] = useState<{id: string, sourceField: string, targetField: string}[]>([
        { id: 'init', sourceField: '', targetField: '' }
    ]);

    const selectedConnector = connectors.find(c => c.id === selectedConnectorId);
    
    // Check if an attribute is a system default
    const isSystemAttribute = (key: string) => {
        return DEFAULT_ATTRIBUTES.some(attr => attr.key === key);
    };
    
    const getSourceFields = (conn: Connector): string[] => {
        if (!conn) return [];
        
        // Oracle: Parse SQL Query
        if (conn.type === 'oracle' && conn.config.query) {
            try {
                // Regex to capture content between SELECT and FROM (non-greedy, case insensitive, multiline)
                const match = conn.config.query.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
                if (match && match[1]) {
                    return match[1].split(',').map(s => {
                        let field = s.trim();
                        // Remove comments if any
                        field = field.split('--')[0].trim();
                        // Handle aliases: "col AS alias" or "col alias"
                        const parts = field.split(/\s+(?:AS\s+)?/i);
                        let colName = parts[parts.length - 1];
                        
                        // If it's t1.col, strip t1.
                        if (colName.includes('.')) {
                            colName = colName.split('.').pop() || colName;
                        }
                        // Remove quotes
                        return colName.replace(/['"`]/g, '');
                    }).filter(f => f && f.length > 0);
                }
            } catch (e) {
                console.warn("Failed to parse SQL query for fields", e);
            }
            return ['(No fields detected from query)'];
        }
        
        // REST API: Parse JSON Sample
        if (conn.type === 'rest_api' && conn.config.jsonSample) {
            try {
                let sample = JSON.parse(conn.config.jsonSample);
                // Handle common wrappers
                if (!Array.isArray(sample) && (sample.results || sample.data || sample.items)) {
                    sample = sample.results || sample.data || sample.items;
                }
                const obj = Array.isArray(sample) ? sample[0] : sample;
                
                if (!obj) return ['(Empty JSON sample)'];

                const getKeys = (o: any, prefix = ''): string[] => {
                    return Object.keys(o).reduce((acc: string[], k) => {
                        const pre = prefix.length ? prefix + '.' : '';
                        if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) {
                            return acc.concat(getKeys(o[k], pre + k));
                        }
                        return acc.concat(pre + k);
                    }, []);
                };
                return getKeys(obj);
            } catch (e) {
                return ['(Invalid JSON Sample)'];
            }
        }
        
        // Local File: Mock fields based on "file content" assumption
        if (conn.type === 'local_file') {
            return ['npi', 'first_name', 'last_name', 'specialty', 'address_line_1', 'city', 'state', 'zip', 'license_state', 'email'];
        }

        // GCS: Mock fields
        if (conn.type === 'gcs') {
            return ['npi', 'first_name', 'last_name', 'specialty', 'taxonomy_code', 'metadata_json'];
        }

        return ['(No definition available)'];
    };

    const sourceFields = selectedConnector ? getSourceFields(selectedConnector) : [];
    
    const currentMapping = selectedConnector?.config?.mapping || {};

    const handleMappingChange = (targetKey: string, sourceField: string) => {
        if (!selectedConnector) return;
        const newMapping = { ...currentMapping, [targetKey]: sourceField };
        
        const updatedConnector = {
            ...selectedConnector,
            config: { ...selectedConnector.config, mapping: newMapping }
        };
        onUpdateConnector(updatedConnector);
    };

    const handleSave = () => {
        setSaveStatus('Saved successfully!');
        setTimeout(() => setSaveStatus(null), 2000);
    };

    // --- Attribute Management ---
    const handleAddAttribute = () => {
        if (!newAttr.key || !newAttr.label) return;
        onUpdateAttributes([...attributes, newAttr]);
        setIsAttrModalOpen(false);
        setNewAttr({ key: '', label: '', type: 'string', required: false, description: '' });
    };

    const handleDeleteAttribute = (key: string) => {
        if (isSystemAttribute(key)) return;
        
        const isMapped = connectors.some(c => c.config.mapping && c.config.mapping[key]);
        const confirmMessage = isMapped 
            ? `Attribute '${key}' is currently mapped in one or more connectors. Deleting it will break these mappings. Continue?`
            : "Delete this custom attribute?";

        if (!window.confirm(confirmMessage)) return;
        onUpdateAttributes(attributes.filter(a => a.key !== key));
    };

    // --- Link Management ---
    const handleAddLink = () => {
        const validConditions = newLinkConditions.filter(c => c.sourceField && c.targetField);
        if (validConditions.length === 0) return;
        
        const link: DataSourceLink = {
            id: `link_${Date.now()}`,
            sourceConnectorId: newLinkSourceId,
            targetConnectorId: newLinkTargetId,
            conditions: validConditions.map(c => ({ sourceField: c.sourceField, targetField: c.targetField }))
        };

        onUpdateLinks([...links, link]);
        setIsLinkModalOpen(false);
        setNewLinkSourceId(connectors[0]?.id || '');
        setNewLinkTargetId(connectors.length > 1 ? connectors[1].id : (connectors[0]?.id || ''));
        setNewLinkConditions([{ id: `cond_${Date.now()}`, sourceField: '', targetField: '' }]);
    };

    const handleDeleteLink = (id: string) => {
        onUpdateLinks(links.filter(l => l.id !== id));
    };

    const addConditionRow = () => {
        setNewLinkConditions([...newLinkConditions, { id: `cond_${Date.now()}`, sourceField: '', targetField: '' }]);
    };

    const removeConditionRow = (id: string) => {
        if (newLinkConditions.length > 1) {
            setNewLinkConditions(newLinkConditions.filter(c => c.id !== id));
        }
    };

    const updateCondition = (id: string, field: 'sourceField' | 'targetField', value: string) => {
        setNewLinkConditions(newLinkConditions.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Data Model</h1>
                    <p className="text-slate-500 mt-1">Define canonical entities and map ingestion sources.</p>
                </div>
                <div className="flex bg-white/50 backdrop-blur-sm rounded-xl p-1.5 border border-white/50 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('model')}
                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center ${activeTab === 'model' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Layers className="w-4 h-4 mr-2" />
                        Canonical Entities
                    </button>
                    <button 
                        onClick={() => setActiveTab('mapping')}
                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center ${activeTab === 'mapping' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        Inbound Mappings
                    </button>
                    <button 
                        onClick={() => setActiveTab('linking')}
                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center ${activeTab === 'linking' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Link2 className="w-4 h-4 mr-2" />
                        Data Linking
                    </button>
                </div>
            </div>

            {/* TAB: CANONICAL MODEL DEFINITION */}
            {activeTab === 'model' && (
                <div className="glass-panel rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-left-4">
                    <div className="p-6 border-b border-white/40 bg-white/40 flex items-center justify-between flex-shrink-0">
                         <div className="flex items-center">
                            <div className="bg-indigo-100/50 p-2 rounded-lg mr-3">
                                <FileJson className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">HCP Profile Entity</h3>
                                <p className="text-xs text-slate-500">The master record structure for Healthcare Professionals.</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => setIsAttrModalOpen(true)}
                            className="flex items-center text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                         >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Attribute
                         </button>
                    </div>
                    
                    <div className="flex-1 overflow-hidden p-0 relative">
                        <div className="absolute inset-0 overflow-auto p-6 custom-scrollbar">
                            <div className="bg-white/60 rounded-xl border border-slate-200/50 overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-200/50">
                                    <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Attribute Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Data Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Requirement</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-transparent divide-y divide-slate-200/50">
                                        {attributes.map((field) => {
                                            const isSystem = isSystemAttribute(field.key);
                                            return (
                                                <tr key={field.key} className="hover:bg-white/40 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 font-mono">
                                                        {field.key}
                                                        {isSystem && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">System</span>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                        <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-mono">{field.type}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                        {field.required ? (
                                                            <span className="text-red-600 font-medium text-xs bg-red-50 px-2 py-1 rounded-full border border-red-100">Required</span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">Optional</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">{field.label || field.description}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        {isSystem ? (
                                                            <div className="text-slate-300 flex justify-end" title="System attribute cannot be deleted">
                                                                <Lock className="w-4 h-4" />
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end">
                                                                <button 
                                                                    onClick={() => handleDeleteAttribute(field.key)}
                                                                    className="text-slate-400 hover:text-red-500 transition-colors bg-white/50 p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200"
                                                                    title="Delete Custom Attribute"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: MAPPINGS */}
            {activeTab === 'mapping' && (
                <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in slide-in-from-right-4 min-h-0">
                    {/* Sidebar: Connector List */}
                    <div className="w-full lg:w-1/4 glass-panel rounded-2xl shadow-lg flex flex-col overflow-hidden h-full">
                        <div className="p-4 border-b border-white/40 bg-white/40 font-bold text-slate-700 flex items-center flex-shrink-0">
                            <Database className="w-4 h-4 mr-2" /> Data Sources
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                            {connectors.map(conn => (
                                <button
                                    key={conn.id}
                                    onClick={() => setSelectedConnectorId(conn.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group ${selectedConnectorId === conn.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-white/50 text-slate-700'}`}
                                >
                                    <span className="font-medium truncate">{conn.name}</span>
                                    <span className={`w-2 h-2 rounded-full ${conn.status === 'active' ? 'bg-green-400' : conn.status === 'disabled' ? 'bg-slate-400' : 'bg-slate-300'}`}></span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Area: Mapping Table */}
                    <div className="flex-1 glass-panel rounded-2xl shadow-xl flex flex-col overflow-hidden h-full">
                         {selectedConnector ? (
                             <>
                                <div className="p-4 border-b border-white/40 bg-white/40 flex items-center justify-between flex-shrink-0">
                                    <div>
                                        <h3 className="font-bold text-slate-800 flex items-center">
                                            Mapping: {selectedConnector.name}
                                            <span className="ml-2 text-xs font-normal text-slate-500 bg-white/50 px-2 py-0.5 rounded border border-slate-200 capitalize">{selectedConnector.type.replace('_', ' ')}</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Map extracted source fields to the canonical HCP model.</p>
                                    </div>
                                    <button 
                                        onClick={handleSave}
                                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/30"
                                    >
                                        <Save className="w-4 h-4 mr-2" /> Save Mapping
                                    </button>
                                </div>
                                
                                {saveStatus && (
                                    <div className="bg-green-100 text-green-800 px-4 py-2 text-sm font-medium flex items-center justify-center animate-in fade-in slide-in-from-top-2 flex-shrink-0">
                                        <Check className="w-4 h-4 mr-2" /> {saveStatus}
                                    </div>
                                )}

                                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30 custom-scrollbar">
                                    <div className="bg-white/80 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-100/80 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/3">Target Attribute</th>
                                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-16"><ArrowRightLeft className="w-4 h-4 mx-auto"/></th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/3">Source Field</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {attributes.map((field) => {
                                                    const mappedValue = currentMapping[field.key] || '';
                                                    return (
                                                        <tr key={field.key} className="hover:bg-blue-50/30 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-slate-800">{field.label}</span>
                                                                    <span className="text-xs font-mono text-slate-400">{field.key} {field.required && '*'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="w-full border-t border-slate-300 group-hover:border-blue-300"></div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <select
                                                                    value={mappedValue}
                                                                    onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                                                    className={`w-full px-3 py-2 rounded-lg border text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-blue-500/50 ${mappedValue ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-white border-slate-200 text-slate-500'}`}
                                                                >
                                                                    <option value="">-- Unmapped --</option>
                                                                    {sourceFields.map(sf => (
                                                                        <option key={sf} value={sf}>{sf}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {sourceFields.length === 0 || sourceFields[0].startsWith('(') ? (
                                        <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start text-amber-800 text-sm">
                                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold">No valid source fields detected.</p>
                                                <p>Please configure the extraction query (SQL) or provide a JSON sample in the Connector settings to populate available fields.</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                             </>
                         ) : (
                             <div className="flex-1 flex items-center justify-center text-slate-400 flex-col">
                                 <Database className="w-12 h-12 mb-4 opacity-20" />
                                 <p>Select a data source to configure mapping.</p>
                             </div>
                         )}
                    </div>
                </div>
            )}

            {/* TAB: LINKING */}
            {activeTab === 'linking' && (
                <div className="glass-panel rounded-2xl shadow-xl overflow-hidden flex-1 animate-in fade-in slide-in-from-right-4 flex flex-col min-h-0">
                     <div className="p-6 border-b border-white/40 bg-white/40 flex items-center justify-between flex-shrink-0">
                         <div className="flex items-center">
                            <div className="bg-emerald-100/50 p-2 rounded-lg mr-3">
                                <Link2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Data Source Relationships</h3>
                                <p className="text-xs text-slate-500">Link data from multiple connectors using common keys (Joins).</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => setIsLinkModalOpen(true)}
                            className="flex items-center text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                         >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Link
                         </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
                        {links.length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Link2 className="w-16 h-16 mb-4 opacity-20" />
                                <h4 className="font-bold text-slate-600 mb-1">No Links Defined</h4>
                                <p className="text-sm">Connect two data sources to enrich the HCP profile.</p>
                             </div>
                        ) : (
                            <div className="space-y-4">
                                {links.map(link => {
                                    const sourceConn = connectors.find(c => c.id === link.sourceConnectorId);
                                    const targetConn = connectors.find(c => c.id === link.targetConnectorId);
                                    if(!sourceConn || !targetConn) return null;

                                    return (
                                        <div key={link.id} className="bg-white/80 border border-slate-200 p-4 rounded-xl shadow-sm flex items-start justify-between group">
                                            <div className="flex-1">
                                                 <div className="flex items-center mb-3">
                                                    <span className="font-bold text-slate-800 text-sm">{sourceConn.name}</span>
                                                    <ArrowRightLeft className="w-4 h-4 text-slate-400 mx-3" />
                                                    <span className="font-bold text-slate-800 text-sm">{targetConn.name}</span>
                                                 </div>
                                                 <div className="space-y-2">
                                                    {link.conditions.map((cond, idx) => (
                                                        <div key={idx} className="flex items-center text-xs">
                                                            <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{cond.sourceField}</span>
                                                            <span className="mx-2 text-slate-400">=</span>
                                                            <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">{cond.targetField}</span>
                                                            {idx < link.conditions.length - 1 && <span className="ml-2 text-slate-400 font-bold text-[10px] uppercase">AND</span>}
                                                        </div>
                                                    ))}
                                                 </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteLink(link.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Attribute Creation Modal */}
            {isAttrModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800">Add Profile Attribute</h3>
                            <button onClick={() => setIsAttrModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Attribute Key (Internal)</label>
                                <input 
                                    type="text" 
                                    value={newAttr.key}
                                    onChange={(e) => setNewAttr({...newAttr, key: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                                    placeholder="e.g. prescribing_volume"
                                    className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Display Label</label>
                                <input 
                                    type="text" 
                                    value={newAttr.label}
                                    onChange={(e) => setNewAttr({...newAttr, label: e.target.value})}
                                    placeholder="e.g. Prescribing Volume"
                                    className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data Type</label>
                                    <select 
                                        value={newAttr.type}
                                        onChange={(e) => setNewAttr({...newAttr, type: e.target.value as any})}
                                        className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    >
                                        <option value="string">String</option>
                                        <option value="number">Number</option>
                                        <option value="boolean">Boolean</option>
                                        <option value="date">Date</option>
                                        <option value="array">Array</option>
                                        <option value="object">JSON Object</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={newAttr.required} 
                                            onChange={(e) => setNewAttr({...newAttr, required: e.target.checked})}
                                            className="mr-3 rounded text-blue-600 focus:ring-blue-500 w-5 h-5"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Required Field</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
                                <input 
                                    type="text" 
                                    value={newAttr.description || ''}
                                    onChange={(e) => setNewAttr({...newAttr, description: e.target.value})}
                                    placeholder="Brief description for LLM usage..."
                                    className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3">
                            <button onClick={() => setIsAttrModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Cancel</button>
                            <button 
                                onClick={handleAddAttribute} 
                                disabled={!newAttr.key || !newAttr.label}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Attribute
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};