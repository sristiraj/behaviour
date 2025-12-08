import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Connectors } from './components/Connectors';
import { DataModel } from './components/DataModel';
import { Rules } from './components/Rules';
import { NLQ } from './components/NLQ';
import { Scorecard } from './components/Scorecard';
import { Settings } from './components/Settings';
import { HCP, Connector, User, DataSourceLink, EntityAttribute, SegmentationRule } from './types';
import { Search, Filter, ChevronRight, Loader2, Database as DbIcon } from 'lucide-react';
import { getUsers } from './services/userService';
import { dbService } from './services/db';
import { MOCK_USERS } from './constants';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scorecards');
  const [selectedHCP, setSelectedHCP] = useState<HCP | null>(null);
  
  // App State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [dataLinks, setDataLinks] = useState<DataSourceLink[]>([]);
  const [attributes, setAttributes] = useState<EntityAttribute[]>([]);
  const [rules, setRules] = useState<SegmentationRule[]>([]);
  const [hcps, setHcps] = useState<HCP[]>([]);

  // Initialization
  useEffect(() => {
    const initApp = async () => {
        try {
            await dbService.init();
            
            const [fetchedUsers, fetchedConns, fetchedHcps, fetchedRules, fetchedAttrs, fetchedLinks] = await Promise.all([
                getUsers(),
                dbService.getAll('connectors'),
                dbService.getAll('hcps'),
                dbService.getAll('rules'),
                dbService.getAll('attributes'),
                dbService.getAll('links')
            ]);

            setUsers(fetchedUsers);
            setCurrentUser(fetchedUsers[0] || MOCK_USERS[0]);
            setConnectors(fetchedConns);
            setHcps(fetchedHcps);
            setRules(fetchedRules);
            setAttributes(fetchedAttrs);
            setDataLinks(fetchedLinks);

            setLoading(false);
        } catch (error) {
            console.error("Failed to initialize app DB", error);
        }
    };

    initApp();
  }, []);

  const handleSwitchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
        setCurrentUser(user);
        setActiveTab('scorecards');
        setSelectedHCP(null);
    }
  };

  // --- Connector Actions ---
  const handleAddConnector = async (newConnector: Connector) => {
    await dbService.upsert('connectors', newConnector);
    setConnectors(await dbService.getAll('connectors'));
  };

  const handleUpdateConnector = async (updatedConnector: Connector) => {
    await dbService.upsert('connectors', updatedConnector);
    setConnectors(await dbService.getAll('connectors'));
  };

  const handleDeleteConnector = async (connectorId: string) => {
    await dbService.delete('connectors', connectorId);
    setConnectors(await dbService.getAll('connectors'));
  };

  // --- Rule Actions ---
  const handleUpdateRules = async (updatedRules: SegmentationRule[]) => {
      // Find diff or just re-save all? For prototype, saving all is safe but inefficient.
      // Better: check which one changed. But `Rules.tsx` passes the whole array.
      // We'll iterate and upsert active ones, delete missing ones.
      
      const currentIds = updatedRules.map(r => r.id);
      const prevIds = rules.map(r => r.id);
      const toDelete = prevIds.filter(id => !currentIds.includes(id));

      for (const id of toDelete) await dbService.delete('rules', id);
      for (const rule of updatedRules) await dbService.upsert('rules', rule);

      setRules(await dbService.getAll('rules'));
  };

  const handleRunSegmentation = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update HCPs in DB
    const updatedHcps = hcps.map(hcp => ({
        ...hcp,
        segmentation_result: hcp.segmentation_result ? {
            ...hcp.segmentation_result,
            confidence: Math.min(0.99, Math.max(0.6, hcp.segmentation_result.confidence + (Math.random() * 0.1 - 0.05))),
            run_date: new Date().toISOString()
        } : undefined
    }));
    
    for(const h of updatedHcps) {
        await dbService.upsert('hcps', h);
    }
    setHcps(updatedHcps);
  };

  // --- Data Model Actions ---
  const handleUpdateAttributes = async (newAttrs: EntityAttribute[]) => {
      // Similar sync logic
      const currentKeys = newAttrs.map(a => a.key);
      const prevKeys = attributes.map(a => a.key);
      const toDelete = prevKeys.filter(k => !currentKeys.includes(k));

      for(const k of toDelete) await dbService.delete('attributes', k);
      for(const attr of newAttrs) await dbService.upsert('attributes', { ...attr, id: attr.key });

      setAttributes(await dbService.getAll('attributes'));
  };

  const handleUpdateLinks = async (newLinks: DataSourceLink[]) => {
      const currentIds = newLinks.map(l => l.id);
      const prevIds = dataLinks.map(l => l.id);
      const toDelete = prevIds.filter(id => !currentIds.includes(id));

      for(const id of toDelete) await dbService.delete('links', id);
      for(const link of newLinks) await dbService.upsert('links', link);

      setDataLinks(await dbService.getAll('links'));
  };


  // Glassy HCP List
  const HCPList = () => (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">HCP Scorecards</h1>
            <p className="text-slate-500 mt-1">Qualitative segmentation profiles & insights.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by name or NPI..." 
                    className="w-full sm:w-64 pl-9 pr-4 py-2 glass-panel rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-700 placeholder-slate-400" 
                />
             </div>
             <button className="flex items-center glass-panel hover:bg-white/80 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                Filter
            </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/50">
                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">HCP Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialty</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Persona (AI)</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Influence</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Readiness</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 bg-white/30">
                    {hcps.map((hcp) => (
                        <tr 
                            key={hcp.npi} 
                            className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                            onClick={() => setSelectedHCP(hcp)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-slate-200/50 flex-shrink-0 overflow-hidden shadow-sm border border-white/50">
                                        <img src={`https://picsum.photos/seed/${hcp.npi}/100/100`} alt="" className="h-full w-full object-cover" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-bold text-slate-900">{hcp.last_name}, {hcp.first_name}</div>
                                        <div className="text-xs text-slate-500">NPI: {hcp.npi}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">{hcp.specialty}</div>
                                <div className="text-xs text-slate-500">{hcp.primary_address.state}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100/80 text-blue-800 border border-blue-200/50">
                                    {hcp.segmentation_result?.persona}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                                {hcp.segmentation_result?.influence}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                    hcp.segmentation_result?.engagement_readiness === 'Hot' ? 'bg-red-100/80 text-red-800 border-red-200/50' :
                                    hcp.segmentation_result?.engagement_readiness === 'Warm' ? 'bg-orange-100/80 text-orange-800 border-orange-200/50' :
                                    'bg-slate-100/80 text-slate-800 border-slate-200/50'
                                }`}>
                                    {hcp.segmentation_result?.engagement_readiness}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (selectedHCP) {
        return <Scorecard hcp={selectedHCP} onBack={() => setSelectedHCP(null)} />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard hcps={hcps} rules={rules} connectors={connectors} />;
      case 'connectors': return <Connectors connectors={connectors} onAddConnector={handleAddConnector} onUpdateConnector={handleUpdateConnector} onDeleteConnector={handleDeleteConnector} />;
      case 'datamodel': return <DataModel connectors={connectors} onUpdateConnector={handleUpdateConnector} links={dataLinks} onUpdateLinks={handleUpdateLinks} attributes={attributes} onUpdateAttributes={handleUpdateAttributes} />;
      case 'rules': return <Rules attributes={attributes} rules={rules} onUpdateRules={handleUpdateRules} onRunSegmentation={handleRunSegmentation} />;
      case 'scorecards': return <HCPList />;
      case 'nlq': return <NLQ currentUser={currentUser || undefined} />;
      case 'admin': return <Settings />;
      default: return <div className="p-10 text-center text-slate-500">Module under development.</div>;
    }
  };

  if (loading || !currentUser) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-500">
              <div className="bg-white/50 p-6 rounded-full mb-4 animate-pulse shadow-lg">
                  <DbIcon className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Loading Database...</h2>
              <p className="text-sm">Initializing SQLite (WASM) & Syncing Data</p>
          </div>
      );
  }

  return (
    <Layout 
        activeTab={selectedHCP ? 'scorecards' : activeTab} 
        onTabChange={(tab) => { setActiveTab(tab); setSelectedHCP(null); }}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        availableUsers={users}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;