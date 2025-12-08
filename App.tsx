import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Connectors } from './components/Connectors';
import { DataModel } from './components/DataModel';
import { Rules } from './components/Rules';
import { NLQ } from './components/NLQ';
import { Scorecard } from './components/Scorecard';
import { Settings } from './components/Settings';
import { MOCK_HCPS, MOCK_CONNECTORS, MOCK_USERS, DEFAULT_ATTRIBUTES, MOCK_RULES } from './constants';
import { HCP, Connector, User, DataSourceLink, EntityAttribute, SegmentationRule } from './types';
import { Search, Filter, ChevronRight } from 'lucide-react';
import { getUsers } from './services/userService';

const App = () => {
  const [activeTab, setActiveTab] = useState('scorecards');
  const [selectedHCP, setSelectedHCP] = useState<HCP | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  
  // Lifted State for Persistence & Interactivity
  const [connectors, setConnectors] = useState<Connector[]>(MOCK_CONNECTORS);
  const [dataLinks, setDataLinks] = useState<DataSourceLink[]>([]);
  const [attributes, setAttributes] = useState<EntityAttribute[]>(DEFAULT_ATTRIBUTES);
  const [rules, setRules] = useState<SegmentationRule[]>(MOCK_RULES);
  const [hcps, setHcps] = useState<HCP[]>(MOCK_HCPS);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleSwitchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
        setCurrentUser(user);
        setActiveTab('scorecards');
        setSelectedHCP(null);
    }
  };

  const handleAddConnector = (newConnector: Connector) => {
    setConnectors([...connectors, newConnector]);
  };

  const handleUpdateConnector = (updatedConnector: Connector) => {
    setConnectors(connectors.map(c => c.id === updatedConnector.id ? updatedConnector : c));
  };

  const handleDeleteConnector = (connectorId: string) => {
    setConnectors(prevConnectors => prevConnectors.filter(c => c.id !== connectorId));
    setDataLinks(prev => prev.filter(l => l.sourceConnectorId !== connectorId && l.targetConnectorId !== connectorId));
  };

  const handleRunSegmentation = async () => {
    // Simulate backend processing latency
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate an update to HCP data based on "new rules"
    // In a real app, this would be a fetch call to the backend
    const updatedHcps = hcps.map(hcp => ({
        ...hcp,
        segmentation_result: hcp.segmentation_result ? {
            ...hcp.segmentation_result,
            // Simulate score variations based on a "new run"
            confidence: Math.min(0.99, Math.max(0.6, hcp.segmentation_result.confidence + (Math.random() * 0.1 - 0.05))),
            run_date: new Date().toISOString()
        } : undefined
    }));
    
    setHcps(updatedHcps);
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
      case 'datamodel': return <DataModel connectors={connectors} onUpdateConnector={handleUpdateConnector} links={dataLinks} onUpdateLinks={setDataLinks} attributes={attributes} onUpdateAttributes={setAttributes} />;
      case 'rules': return <Rules attributes={attributes} rules={rules} onUpdateRules={setRules} onRunSegmentation={handleRunSegmentation} />;
      case 'scorecards': return <HCPList />;
      case 'nlq': return <NLQ currentUser={currentUser} />;
      case 'admin': return <Settings />;
      default: return <div className="p-10 text-center text-slate-500">Module under development.</div>;
    }
  };

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