import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Zap, ThermometerSnowflake, 
  Wind, Battery, Anchor, Satellite, MapPin, LayoutDashboard, 
  Package, Server, Ship, Search, User, CheckCircle2, 
  HardDrive, List, ChevronRight, ActivitySquare, Network, BrainCircuit, ShieldAlert, Navigation,
  Factory, ArrowRight, ArrowDown, Info, Database, Play
} from 'lucide-react';
import ReactFlow, { Background, Controls, MarkerType, useNodesState, useEdgesState, Handle, Position } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';

// --- DATA ---
const energyDataNominal = [
  { time: '00:00', pv_array: 0, wind_turbine_1: 45, wind_turbine_2: 42, diesel_gen_a: 150, demand: 210, bess_soc: 85 },
  { time: '04:00', pv_array: 5, wind_turbine_1: 48, wind_turbine_2: 44, diesel_gen_a: 140, demand: 205, bess_soc: 83 },
  { time: '08:00', pv_array: 65, wind_turbine_1: 52, wind_turbine_2: 49, diesel_gen_a: 80, demand: 220, bess_soc: 88 },
  { time: '12:00', pv_array: 125, wind_turbine_1: 40, wind_turbine_2: 38, diesel_gen_a: 0, demand: 180, bess_soc: 100 },
  { time: '16:00', pv_array: 85, wind_turbine_1: 35, wind_turbine_2: 32, diesel_gen_a: 40, demand: 230, bess_soc: 92 },
  { time: '20:00', pv_array: 0, wind_turbine_1: 65, wind_turbine_2: 60, diesel_gen_a: 120, demand: 215, bess_soc: 86 },
];

const energyDataRecovering = [
  { time: '00:00', pv_array: 0, wind_turbine_1: 45, wind_turbine_2: 42, diesel_gen_a: 0, demand: 130, bess_soc: 85 },
  { time: '04:00', pv_array: 5, wind_turbine_1: 48, wind_turbine_2: 44, diesel_gen_a: 0, demand: 125, bess_soc: 82 },
  { time: '08:00', pv_array: 65, wind_turbine_1: 52, wind_turbine_2: 49, diesel_gen_a: 0, demand: 140, bess_soc: 95 },
  { time: '12:00', pv_array: 125, wind_turbine_1: 40, wind_turbine_2: 38, diesel_gen_a: 0, demand: 145, bess_soc: 100 },
  { time: '16:00', pv_array: 85, wind_turbine_1: 35, wind_turbine_2: 32, diesel_gen_a: 0, demand: 150, bess_soc: 98 },
  { time: '20:00', pv_array: 0, wind_turbine_1: 65, wind_turbine_2: 60, diesel_gen_a: 0, demand: 135, bess_soc: 90 },
];

const initialNodes: Node[] = [
  { id: '1', position: { x: 50, y: 300 }, data: { label: 'Global Suppliers', icon: Factory, status: 'Active' }, type: 'custom' },
  { id: '2', position: { x: 350, y: 300 }, data: { label: 'India Consolidation Hub', icon: Package, status: 'Active' }, type: 'custom' },
  { id: '3', position: { x: 650, y: 300 }, data: { label: 'Cape Town Logistics Hub', icon: Anchor, status: 'Active' }, type: 'custom' },
  { id: '4', position: { x: 950, y: 150 }, data: { label: 'Maitri Station', icon: MapPin, status: 'Nominal' }, type: 'custom' },
  { id: '5', position: { x: 950, y: 450 }, data: { label: 'Bharati Station', icon: Satellite, status: 'Nominal' }, type: 'custom' },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#475569', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#475569', strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, label: 'S104 (Fuel/Med)', style: { stroke: '#475569', strokeWidth: 2 }, labelStyle: { fill: '#94a3b8', fontWeight: 600 }, labelBgStyle: { fill: '#ffffff' } },
  { id: 'e3-5', source: '3', target: '5', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, label: 'S105 (Food/Eqp)', style: { stroke: '#475569', strokeWidth: 2 }, labelStyle: { fill: '#94a3b8', fontWeight: 600 }, labelBgStyle: { fill: '#ffffff' } },
];

const supplyPosition = [
  { mat: 'Fuel', maitri: '23d', bharati: '42d', incoming: '12d', risk: 'HIGH', maitriRaw: 23 },
  { mat: 'Medical', maitri: '18d', bharati: '35d', incoming: '20d', risk: 'MED', maitriRaw: 18 },
  { mat: 'Food', maitri: '31d', bharati: '46d', incoming: '15d', risk: 'LOW', maitriRaw: 31 },
  { mat: 'Spare Parts', maitri: '12d', bharati: '29d', incoming: '25d', risk: 'HIGH', maitriRaw: 12 },
];



// --- COMPONENTS ---
const CustomNode = ({ data }: any) => {
  const Icon = data.icon || Package;
  const isDelayed = data.status === 'BLOCKED / DELAYED';
  return (
    <div className={`react-flow__node-custom ${isDelayed ? 'is-delayed' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white left-[-6px]" />
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md ${isDelayed ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
            <Icon size={16} className={isDelayed ? 'text-red-600' : 'text-blue-600'} />
          </div>
          <span className="font-semibold text-slate-800 leading-none text-[13px]">{data.label}</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-300 flex items-center justify-between w-full">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDelayed ? 'text-red-600' : 'text-emerald-600'}`}>
          {data.status}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white right-[-6px]" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="font-mono text-xs font-medium bg-slate-200 px-3 py-1.5 rounded-md text-slate-700 border border-slate-300 shadow-inner">
      {time.toISOString().replace('T', ' ').substring(0, 19)} UTC
    </span>
  );
};

const SupplyNetworkView = ({ nodes, edges, onNodesChange, onEdgesChange, nodeTypes }: any) => (
  <div className="p-8 max-w-7xl mx-auto flex flex-col h-[750px] gap-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Supply Network</h1>
      <p className="text-sm text-slate-500 mt-1">Real-time material movement and logistics topology.</p>
    </div>
    <div className="card flex-1 p-2 bg-slate-50 relative border-slate-200">
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} nodeTypes={nodeTypes} fitView>
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="bg-white border border-slate-300 shadow-xl rounded-md overflow-hidden fill-slate-300" showInteractive={false} />
      </ReactFlow>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('control_tower');
  const [systemStatus, setSystemStatus] = useState<'NOMINAL' | 'CRITICAL' | 'RECOVERING'>('NOMINAL');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('14-day');
  
  const [auditLog, setAuditLog] = useState<{id: string, timestamp: string, event: string, source: string, level: string}[]>([
    { id: 'PR-AUD-982110', timestamp: new Date(Date.now() - 7200000).toISOString(), event: 'Inventory sync completed (SIMULATED).', source: 'System', level: 'info' },
  ]);
  const triggerDisruption = async (scenario: string) => {
    setShowScenarioModal(false);
    setSystemStatus('CRITICAL');
    setNodes((nds) => nds.map(node => node.id === '3' ? { ...node, data: { ...node.data, status: 'BLOCKED / DELAYED' } } : node));
    
    let delayStr = '+14d';
    if (scenario === '7-day') delayStr = '+7d';
    if (scenario === '18-day') delayStr = '+18d';
    if (scenario === 'no-reroute') delayStr = 'NO REROUTE';
    
    setEdges((eds) => eds.map(edge => edge.source === '3' ? { ...edge, animated: false, style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '4,4' }, label: `DELAYED (${delayStr})`, labelStyle: { fill: '#ef4444', fontWeight: 700 } } : edge));
    
    try {
      const response = await fetch('http://localhost:8000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await response.json();
      console.log("Backend simulation plan received:", data);
    } catch (error) {
      console.error("Backend error:", error);
    }

    const now = new Date();
    setAuditLog(prev => [
      { id: `PR-AUD-${Math.floor(100000 + Math.random() * 900000)}`, timestamp: now.toISOString(), event: `Disruption detected: Primary resupply delayed (${scenario}).`, source: 'Disruption_Agent', level: 'error' },
      { id: `PR-AUD-${Math.floor(100000 + Math.random() * 900000)}`, timestamp: new Date(now.getTime() + 100).toISOString(), event: 'Generated 7/14/18-day & no-reroute scenarios.', source: 'Scenario_Agent', level: 'info' },
      { id: `PR-AUD-${Math.floor(100000 + Math.random() * 900000)}`, timestamp: new Date(now.getTime() + 200).toISOString(), event: 'Analyzed 27 material positions. Found 4 shortage risks.', source: 'Inventory_Agent', level: 'error' },
      { id: `PR-AUD-${Math.floor(100000 + Math.random() * 900000)}`, timestamp: new Date(now.getTime() + 300).toISOString(), event: 'Evaluated 8 logistics options. Rejected 5.', source: 'Logistics_Agent', level: 'warn' },
      { id: `PR-AUD-${Math.floor(100000 + Math.random() * 900000)}`, timestamp: new Date(now.getTime() + 400).toISOString(), event: 'Generated capacity allocation based on critical limits.', source: 'Optimization_Engine', level: 'info' },
      { id: `PR-AUD-${Math.floor(100000 + Math.random() * 900000)}`, timestamp: new Date(now.getTime() + 500).toISOString(), event: 'Forecasted 18% increase in diesel demand.', source: 'Energy_Agent', level: 'warn' },
      { id: `PR-AUD-${Math.floor(100000 + Math.random() * 900000)}`, timestamp: new Date(now.getTime() + 600).toISOString(), event: 'Validated emergency reserve constraints. 2 options rejected.', source: 'Safety_Agent', level: 'info' },
      { id: `PR-AUD-${Math.floor(100000 + Math.random() * 900000)}`, timestamp: new Date(now.getTime() + 700).toISOString(), event: 'Awaiting human decision on recovery plan.', source: 'Approval_Agent', level: 'info' },
      ...prev
    ]);
  };

  const executeRecovery = async () => {
    setSystemStatus('RECOVERING');
    
    try {
      const response = await fetch('http://localhost:8000/api/recover', { method: 'POST' });
      const data = await response.json();
      console.log("Backend recovery response:", data);
    } catch (error) {
      console.error("Backend error:", error);
    }
    
    let recoveryLabel = 'CAPACITY REALLOCATED';
    if (selectedScenario === 'no-reroute') {
      recoveryLabel = 'DEMAND CURTAILED';
    }
    
    setEdges((eds) => eds.map(edge => edge.source === '3' ? { ...edge, animated: true, style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4,4' }, label: recoveryLabel, labelStyle: { fill: '#10b981', fontWeight: 700 } } : edge));

    const now = new Date();
    setAuditLog(prev => [
      { id: `PR-AUD-${Math.floor(100000 + Math.random() * 900000)}`, timestamp: now.toISOString(), event: 'Operator approved Recovery Plan.', source: 'Operator_Auth', level: 'success' },
      { id: `PR-AUD-${Math.floor(100000 + Math.random() * 900000)}`, timestamp: new Date(now.getTime() + 100).toISOString(), event: selectedScenario === 'no-reroute' ? 'Non-critical shipments deferred. Inventory preserved.' : 'Capacity optimally allocated to Fuel and Medical.', source: 'Inventory_Agent', level: 'success' },
      { id: `PR-AUD-${Math.floor(100000 + Math.random() * 900000)}`, timestamp: new Date(now.getTime() + 200).toISOString(), event: 'Tier 3 Loads deferred to offset residual fuel risk.', source: 'Energy_Agent', level: 'info' },
      ...prev
    ]);
  };

  const Sidebar = () => (
    <aside className="w-64 bg-slate-100 border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <Network size={18} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-sm leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-600">PolarResilience AI</span>
          <span className="text-[9px] text-blue-600 font-mono tracking-widest font-bold">CONTROL TOWER</span>
        </div>
      </div>

      <div className="px-5 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Modules</div>
      <nav className="flex-1 px-3 space-y-1">
        {[
          { id: 'control_tower', icon: LayoutDashboard, label: 'Control Tower' },
          { id: 'supply_network', icon: Network, label: 'Supply Network' },
          { id: 'supply_inventory', icon: Package, label: 'Shipments & Inventory' },
          { id: 'scenario', icon: ActivitySquare, label: 'Scenario Planning' },
          { id: 'energy', icon: Zap, label: 'Energy Impact' },
          { id: 'agents', icon: BrainCircuit, label: 'Agent Activity' },
          { id: 'audit', icon: List, label: 'Audit Trail' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800 border border-transparent'
            }`}
          >
            <item.icon size={16} className={activeTab === item.id ? 'text-blue-600' : 'text-slate-500'} />
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-100 rounded-lg border border-slate-200 p-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          <span className="text-xs font-mono text-slate-700">System Online</span>
        </div>
      </div>
    </aside>
  );

  const Topbar = () => (
    <header className="h-16 glass-panel border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shrink-0 shadow-sm">
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <Clock />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 border border-slate-300 rounded-md px-3 py-1.5 bg-white">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">BACKBONE:</span>
          <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></span> Phase 1 Local Sim</span>
          <span className="text-slate-600 mx-1">|</span>
          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full border border-slate-500"></span> Phase 2 SAP HANA</span>
        </div>

        {systemStatus === 'NOMINAL' ? (
          <button onClick={() => setShowScenarioModal(true)} className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 border border-red-500 rounded-md text-xs font-bold text-white hover:from-red-500 hover:to-rose-500 transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] flex items-center gap-2">
            <ShieldAlert size={14} className="text-white"/> SIMULATE DISRUPTION
          </button>
        ) : systemStatus === 'RECOVERING' ? (
          <button onClick={() => { setSystemStatus('NOMINAL'); setNodes(initialNodes); setEdges(initialEdges); }} className="px-4 py-2 bg-slate-200 border border-slate-300 rounded-md text-xs font-bold text-slate-800 hover:bg-[#334155] transition-all shadow-sm flex items-center gap-2">
            RESET SCENARIO
          </button>
        ) : null}
      </div>
    </header>
  );

  const ControlTowerView = () => (
    <div className="p-8 max-w-[1400px] mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Supply-Chain Resilience Control Tower</h1>
        <p className="text-sm text-slate-500 mt-1">Monitoring logistics constraints, critical cargo, and inventory recovery across Antarctic operations.</p>
        <div className="mt-4 flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200">
            <span className="text-slate-500 uppercase text-[10px]">Status:</span> 
            <span className="text-emerald-600 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div> SYSTEM OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200">
            <span className="text-slate-500 uppercase text-[10px]">Simulation:</span> 
            <span className="text-blue-600 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div> ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'ACTIVE DISRUPTIONS', val: systemStatus === 'NOMINAL' ? '00' : '01', color: systemStatus === 'NOMINAL' ? 'text-slate-800' : 'text-red-600' },
          { label: 'AT-RISK SHIPMENTS', val: systemStatus === 'NOMINAL' ? '00' : '04', color: systemStatus === 'NOMINAL' ? 'text-slate-800' : 'text-red-600' },
          { label: 'CRITICAL MATERIALS', val: '07', color: 'text-slate-800' },
          { label: 'CAPACITY UTILIZATION', val: systemStatus === 'NOMINAL' ? '82%' : '100%', color: 'text-slate-800' },
          { label: 'PROJECTED SHORTAGE', val: systemStatus === 'NOMINAL' ? '00' : systemStatus === 'RECOVERING' ? '00' : '03', color: systemStatus === 'CRITICAL' ? 'text-red-600' : 'text-slate-800' },
          { label: 'RECOVERY STATUS', val: systemStatus, color: systemStatus === 'NOMINAL' ? 'text-emerald-600' : systemStatus === 'CRITICAL' ? 'text-red-600' : 'text-blue-600' },
        ].map((k, i) => (
          <div key={i} className="card p-4 flex flex-col justify-between h-24 hover:border-slate-300 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <ActivitySquare size={40} className="text-slate-500" />
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest z-10">{k.label}</div>
            <div className={`text-2xl font-mono font-medium z-10 ${k.color}`}>{k.val}</div>
          </div>
        ))}
      </div>

      {systemStatus !== 'NOMINAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
          <div className="card flex flex-col col-span-1 overflow-hidden">
            <div className="bg-white px-5 py-4 border-b border-slate-200">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2"><Zap size={14} className="text-blue-500"/> Agentic Reasoning Flow</h2>
            </div>
            <div className="p-6 flex-1 overflow-y-auto max-h-[500px]">
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-slate-300 before:to-slate-300">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-3 md:ml-0"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded bg-blue-50 border border-blue-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-[10px] uppercase mb-1">1. Sense Disruption</h3>
                    <p className="text-[10px] text-slate-600 leading-tight">Expedition vessel ETA changed from Day 7 → Day 18 (sea-ice).</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-3 md:ml-0"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded bg-white border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-[10px] uppercase mb-1">2. Understand Impact</h3>
                    <p className="text-[10px] text-slate-600 leading-tight">Checking Fuel, Food, Medicine. JET A1 FUEL: 72 days stock, Risk HIGH.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-3 md:ml-0"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded bg-white border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-[10px] uppercase mb-1">3. Predict Shortage</h3>
                    <p className="text-[10px] text-slate-600 leading-tight">Fuel remains safe, but medical supplies fall below minimum in 6 days.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-3 md:ml-0"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded bg-white border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-[10px] uppercase mb-1">4. Generate Scenarios</h3>
                    <p className="text-[10px] text-slate-600 leading-tight">Evaluated +7d, +14d, +18d cascading "what-if" impacts.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-3 md:ml-0"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded bg-white border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-[10px] uppercase mb-1">5. Logistics Options</h3>
                    <p className="text-[10px] text-slate-600 leading-tight">Constraints checked: seasonal air ops, 1500kg flight limit.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-3 md:ml-0"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded bg-white border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-[10px] uppercase mb-1">6. Prioritize Capacity</h3>
                    <p className="text-[10px] text-slate-600 leading-tight">1. Emergency 2. Medicine 3. Critical Spares</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-blue-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-3 md:ml-0"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded bg-white border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-[10px] uppercase mb-1">7. Energy Consequences</h3>
                    <p className="text-[10px] text-slate-600 leading-tight">Fuel delivery delayed → reserve decreases → prioritize loads.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-3 md:ml-0 animate-pulse"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded bg-emerald-50 border border-emerald-200 shadow-sm">
                    <h3 className="font-bold text-emerald-700 text-[10px] uppercase mb-1">8. Joint Optimization</h3>
                    <p className="text-[10px] text-emerald-700 font-bold leading-tight">BEST FEASIBLE RECOVERY PLAN GENERATED</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`card col-span-2 overflow-hidden flex flex-col ${systemStatus === 'CRITICAL' ? 'border-red-500/30 shadow-[0_0_20px_rgba(225,29,72,0.1)]' : 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'}`}>
            <div className={`${systemStatus === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} px-6 py-4 border-b flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {systemStatus === 'CRITICAL' ? <ShieldAlert size={18} className="text-red-600" /> : <CheckCircle2 size={18} className="text-emerald-600" />}
                <h2 className={`text-sm font-bold tracking-widest ${systemStatus === 'CRITICAL' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {systemStatus === 'CRITICAL' ? 'ACTIVE DISRUPTION EVENT' : 'RECOVERY PLAN ENACTED'}
                </h2>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col gap-6">
              {systemStatus === 'CRITICAL' ? (
                <>
                  <div className="grid grid-cols-1 gap-8">
                    <div className="flex flex-col h-full">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">RECOMMENDED RECOVERY PLAN</h3>
                      {selectedScenario === 'no-reroute' ? (
                        <>
                          <p className="text-sm text-red-600 font-bold mb-3 flex items-center gap-2">🔴 NO FEASIBLE LOGISTICS RECOVERY AVAILABLE</p>
                          <div className="text-xs text-slate-700 border-l-2 border-red-500 pl-4 py-3 bg-red-500/10 rounded-r flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2 font-bold text-slate-800"><span className="text-red-600">✗</span> No feasible transport</div>
                            <div className="w-0.5 h-3 bg-red-300 ml-2 mb-2"></div>
                            <div className="flex items-center gap-2 mb-2 font-bold text-slate-800"><span className="text-blue-500">🛡️</span> Protect critical inventory</div>
                            <div className="w-0.5 h-3 bg-red-300 ml-2 mb-2"></div>
                            <div className="flex items-center gap-2 mb-2 font-bold text-slate-800"><span className="text-amber-500">⚡</span> Prioritize essential loads</div>
                            <div className="w-0.5 h-3 bg-red-300 ml-2 mb-2"></div>
                            <div className="flex items-center gap-2 mb-2 font-bold text-slate-800"><span className="text-emerald-600">🔌</span> Reduce non-critical consumption</div>
                            <div className="w-0.5 h-3 bg-red-300 ml-2 mb-2"></div>
                            <div className="flex items-center gap-2 font-bold text-slate-800"><span className="text-indigo-600">👤</span> Escalate to human decision-maker</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-slate-700 border-l-2 border-blue-500 pl-4 py-3 bg-blue-500/10 rounded-r flex-1 space-y-2 font-mono">
                            <p><span className="font-bold text-slate-900 w-44 inline-block">Disruption:</span> Vessel delay</p>
                            <p><span className="font-bold text-slate-900 w-44 inline-block">Impact:</span> 3 shipments affected</p>
                            <p><span className="font-bold text-slate-900 w-44 inline-block">Critical risk:</span> <span className="text-red-600 font-bold">Medicine shortage in 6 days</span></p>
                            <p><span className="font-bold text-slate-900 w-44 inline-block">Proposed action:</span> Prioritize medical + emergency cargo</p>
                            <p><span className="font-bold text-slate-900 w-44 inline-block">Alternative evaluated:</span> Scientific cargo deferred</p>
                            <p><span className="font-bold text-slate-900 w-44 inline-block">Expected recovery:</span> 9 days</p>
                            <p><span className="font-bold text-slate-900 w-44 inline-block">Energy impact:</span> <span className="text-amber-600 font-bold">Moderate</span></p>
                            <p><span className="font-bold text-slate-900 w-44 inline-block">Constraint violations:</span> <span className="text-emerald-600 font-bold">None</span></p>
                          </div>
                        </>
                      )}
                      <div className="flex gap-3 mt-4">
                        <button onClick={executeRecovery} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] flex-1">APPROVE</button>
                        <button className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 rounded text-xs font-bold transition-colors">MODIFY</button>
                        <button className="px-5 py-2.5 bg-slate-200 hover:bg-red-500/20 hover:text-red-600 hover:border-red-500/30 border border-slate-300 text-slate-800 rounded text-xs font-bold transition-colors">REJECT</button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">MEASURABLE OUTCOMES</h3>
                    <div className="text-xs font-mono text-slate-700 space-y-3 bg-white p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-200"><span className="text-emerald-600">✓</span><span className="text-slate-800 font-bold">Alternate route activated</span></div>
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-200"><span className="text-emerald-600">✓</span><span className="text-slate-800 font-bold">Critical inventory protected</span></div>
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-200"><span className="text-emerald-600">✓</span><span className="text-slate-800 font-bold">Fuel reserve preserved</span></div>
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-200"><span className="text-emerald-600">✓</span><span className="text-slate-800 font-bold">Critical energy demand maintained</span></div>
                      <div className="flex items-center gap-3"><span className="text-emerald-600">✓</span><span className="text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Recovery plan executed</span></div>
                    </div>
                  </div>
                  <div>
                     <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">DECISION EVIDENCE</h3>
                     <div className="flex gap-4">
                       <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200">
                         <div className="text-[9px] font-bold text-slate-500 mb-3 tracking-widest uppercase">INPUT DATA</div>
                         <ul className="text-[10px] text-slate-700 font-mono space-y-2">
                           <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> Shipment: SHP-ANT-002</li>
                           <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> Delay: {selectedScenario}</li>
                           <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> Inventory: 420 units</li>
                           <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> Consumption: 35 u/d</li>
                           <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> Available cap: 1,200u</li>
                         </ul>
                       </div>
                       <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200">
                         <div className="text-[9px] font-bold text-slate-500 mb-3 tracking-widest uppercase">CONSTRAINTS</div>
                         <ul className="text-[10px] text-slate-700 font-mono space-y-2">
                           <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Emergency reserve</li>
                           <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Transport capacity</li>
                           <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Cargo priority</li>
                           <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Seasonal window</li>
                           <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Station demand</li>
                         </ul>
                       </div>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {systemStatus === 'CRITICAL' && (
        <div className="mt-2 animate-in slide-in-from-bottom-4 duration-500 delay-150 fade-in fill-mode-both">
          <h3 className="text-xs font-bold text-slate-700 tracking-widest mb-4">CAPACITY ALLOCATION & REROUTING OPTIONS EVALUATED</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-5 border-slate-200 opacity-50 bg-slate-100">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-bold text-slate-700">Primary Vessel</h4>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 font-mono text-red-600 font-bold tracking-wider">✕ REJECTED</span>
              </div>
              <div className="text-xs font-mono text-slate-500 space-y-1.5 pt-3 border-t border-slate-200">
                <p>Status: Unavailable</p>
                <p className="text-red-600">Reason: Disruption Event</p>
              </div>
            </div>
            <div className={`card p-5 relative overflow-hidden transition-all ${selectedScenario !== 'no-reroute' ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-white' : 'opacity-50 border-slate-200 bg-slate-100'}`}>
              {selectedScenario !== 'no-reroute' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]"></div>}
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-bold text-slate-800">Secondary Vessel</h4>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold tracking-wider ${selectedScenario !== 'no-reroute' ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' : 'text-red-600 bg-red-500/10 border-red-500/20'}`}>
                  {selectedScenario !== 'no-reroute' ? '✓ RECOMMENDED' : '✕ REJECTED'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-500 space-y-1.5 pt-3 border-t border-slate-200">
                <p>Capacity: <span className="text-slate-800">1,200 units</span></p>
                <p>ETA: <span className="text-slate-800">10 days</span></p>
                <p>Risk: <span className="text-amber-600">Medium</span></p>
              </div>
            </div>
            <div className="card p-5 border-slate-200 opacity-50 bg-slate-100">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-bold text-slate-700">Emergency Air Cargo</h4>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 font-mono text-red-600 font-bold tracking-wider">✕ REJECTED</span>
              </div>
              <div className="text-xs font-mono text-slate-500 space-y-1.5 pt-3 border-t border-slate-200">
                <p>Capacity: <span className="text-slate-800">250 units</span></p>
                <p>ETA: <span className="text-slate-800">3 days</span></p>
                <p className="text-red-600">Reason: Capacity too low</p>
              </div>
            </div>
            <div className={`card p-5 relative overflow-hidden transition-all ${selectedScenario === 'no-reroute' ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-white' : 'border-slate-200 bg-white'}`}>
              {selectedScenario === 'no-reroute' && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)]"></div>}
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-bold text-slate-800">Deferred Shipment</h4>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold tracking-wider ${selectedScenario === 'no-reroute' ? 'text-amber-600 bg-amber-500/10 border-amber-500/20' : 'text-slate-500 bg-slate-200 border-slate-300'}`}>
                  {selectedScenario === 'no-reroute' ? '⚠ FORCED OPTION' : 'AVAILABLE'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-500 space-y-1.5 pt-3 border-t border-slate-200">
                <p>Capacity: <span className="text-slate-800">Unlimited</span></p>
                <p>ETA: <span className="text-slate-800">25 days</span></p>
                <p>Risk: <span className="text-red-600">High</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-5 border border-slate-200 rounded-xl bg-white/50 flex justify-between items-center backdrop-blur-sm">
        <div>
          <h3 className="text-xs font-bold text-slate-700 tracking-widest uppercase">SAP Integration Status</h3>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">Architecture Note: Phase 1 Local Simulation Sandbox</p>
        </div>
        <div className="flex gap-6 flex-wrap">
          <div className="flex items-center gap-2"><Database size={14} className="text-slate-500" /><span className="text-[10px] font-bold font-mono tracking-wider text-slate-500">SAP HANA Cloud: <span className="text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded">SIMULATED</span></span></div>
          <div className="flex items-center gap-2"><BrainCircuit size={14} className="text-slate-500" /><span className="text-[10px] font-bold font-mono tracking-wider text-slate-500">SAP AI Launchpad: <span className="text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded">SIMULATED</span></span></div>
          <div className="flex items-center gap-2"><Network size={14} className="text-slate-500" /><span className="text-[10px] font-bold font-mono tracking-wider text-slate-500">SAP Build Work Zone: <span className="text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded">SIMULATED</span></span></div>
        </div>
      </div>
    </div>
  );


  const SupplyInventoryView = () => {
    const nominalData = [
      { name: 'Emergency Kit', priority: 100, allocated: 200 },
      { name: 'Medical', priority: 95, allocated: 100 },
      { name: 'Fuel', priority: 90, allocated: 700 },
      { name: 'Food', priority: 80, allocated: 500 },
      { name: 'Scientific', priority: 40, allocated: 900 },
    ];
    
    const criticalData = [
      { name: 'Emergency Kit', priority: 100, allocated: 200 },
      { name: 'Medical', priority: 95, allocated: 100 },
      { name: 'Fuel', priority: 90, allocated: 700 },
      { name: 'Food', priority: 80, allocated: 500 },
      { name: 'Scientific', priority: 40, allocated: 0 },
    ];
    
    const capacityAllocationData = systemStatus === 'NOMINAL' ? nominalData : criticalData;
    const totalAllocated = capacityAllocationData.reduce((acc, curr) => acc + curr.allocated, 0);
    const capacityLimit = systemStatus === 'NOMINAL' ? '2400 kg' : '1500 kg (Constrained)';

    return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shipments & Inventory</h1>
        <p className="text-sm text-slate-500 mt-1">Cross-station supply position and capacity allocation priority.</p>
      </div>
      
      <div className="card overflow-hidden">
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">INVENTORY POSITION (SAP MOCK DATA)</h2>
        </div>
        <div className="overflow-x-auto bg-slate-100">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="px-6 py-4 font-bold font-mono text-[10px] uppercase tracking-wider">Material ID</th>
                <th className="px-6 py-4 font-bold font-mono text-[10px] uppercase tracking-wider">Material</th>
                <th className="px-6 py-4 font-bold font-mono text-[10px] uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-4 font-bold font-mono text-[10px] uppercase tracking-wider">Daily Consumption</th>
                <th className="px-6 py-4 font-bold font-mono text-[10px] uppercase tracking-wider">Days of Supply</th>
                <th className="px-6 py-4 font-bold font-mono text-[10px] uppercase tracking-wider">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-xs text-slate-700">
              <tr className="hover:bg-white transition-colors">
                <td className="px-6 py-4 font-bold text-blue-600">SAP-MAT-001</td>
                <td className="px-6 py-4 text-slate-800">Aviation Turbine Fuel</td>
                <td className="px-6 py-4">420 units</td>
                <td className="px-6 py-4">35 units/day</td>
                <td className={`px-6 py-4 ${systemStatus === 'CRITICAL' ? 'text-red-600 font-bold bg-red-500/5' : ''}`}>{systemStatus === 'CRITICAL' ? '12 days (Depleting)' : '42 days'}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${systemStatus === 'CRITICAL' ? 'bg-red-500/10 text-red-600 border-red-500/30' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'}`}>
                    {systemStatus === 'CRITICAL' ? 'HIGH' : 'LOW'}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white transition-colors">
                <td className="px-6 py-4 font-bold text-blue-600">SAP-MAT-002</td>
                <td className="px-6 py-4 text-slate-800">Medical Supplies</td>
                <td className="px-6 py-4">180 units</td>
                <td className="px-6 py-4">5 units/day</td>
                <td className="px-6 py-4">36 days</td>
                <td className="px-6 py-4"><span className="badge bg-amber-500/10 text-amber-600 border-amber-500/30">MEDIUM</span></td>
              </tr>
              <tr className="hover:bg-white transition-colors">
                <td className="px-6 py-4 font-bold text-blue-600">SAP-MAT-003</td>
                <td className="px-6 py-4 text-slate-800">Emergency Rations</td>
                <td className="px-6 py-4">500 units</td>
                <td className="px-6 py-4">10 units/day</td>
                <td className="px-6 py-4">50 days</td>
                <td className="px-6 py-4"><span className="badge bg-emerald-500/10 text-emerald-600 border-emerald-500/30">LOW</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6 border-slate-200">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-6 border-b border-slate-200 pb-3">CRITICAL MATERIAL PRIORITY ENGINE ALLOCATION</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">When transport capacity is constrained, the Optimization Engine calculates allocation priority based strictly on criticality scores, predicted shortages, and emergency reserves.</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capacityAllocationData} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={10} stroke="#64748b" />
                  <Tooltip cursor={{fill: '#ffffff'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace', color: '#1e293b' }} />
                  <Bar dataKey="priority" name="Criticality Score" fill="#334155" barSize={12} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="allocated" name="Allocated Capacity" fill="#3b82f6" barSize={12} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="bg-white p-5 border border-slate-200 rounded-lg font-mono text-xs shadow-inner">
              <div className="flex justify-between border-b border-slate-300 pb-3 mb-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                <span>Material Entity</span><span>Allocated Cap.</span>
              </div>
              {capacityAllocationData.map(d => (
                <div key={d.name} className="flex justify-between py-1.5">
                  <span className="text-slate-700">{d.name}</span>
                  <span className={d.allocated > 0 ? 'text-blue-600 font-bold' : 'text-slate-600 font-bold'}>{d.allocated} kg</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-slate-300 pt-3 mt-3 font-bold text-slate-800">
                <span>Total Capacity Utilized</span><span className={systemStatus === 'CRITICAL' ? 'text-amber-600' : 'text-emerald-600'}>{totalAllocated} kg / {capacityLimit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );}

  const ScenarioPlanningView = () => (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Scenario Planning Space</h1>
        <p className="text-sm text-slate-500 mt-1">Multi-dimensional deterministic simulation of constrained supply-chain disruptions.</p>
      </div>
      <div className="card p-0 overflow-hidden flex flex-col md:flex-row border-slate-200">
        <div className="w-full md:w-80 bg-white p-6 border-r border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-6">SCENARIO PARAMETERS</h3>
            <div className="space-y-5 text-sm">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Delay Constraints (Days)</label>
                    <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-slate-700 focus:border-blue-500 outline-none transition-colors">
                        <option>7 Days</option>
                        <option>14 Days</option>
                        <option>18 Days</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Renewable Energy Yield</label>
                    <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-slate-700 focus:border-blue-500 outline-none transition-colors">
                        <option>Nominal (P50)</option>
                        <option>Low Yield (P90)</option>
                        <option>Severe Deficit</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Transport Capacity Risk</label>
                    <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-slate-700 focus:border-blue-500 outline-none transition-colors">
                        <option>Nominal</option>
                        <option>Constrained</option>
                        <option>Severe</option>
                    </select>
                </div>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs mt-6 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">RUN DETERMINISTIC SOLVER</button>
            </div>
        </div>
        <div className="flex-1 p-6 bg-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-6">COMPUTED SCENARIO PROJECTIONS</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                <tr className="bg-white border-b border-slate-200 text-slate-500">
                    <th className="px-5 py-4 font-bold font-mono text-[10px] uppercase tracking-wider">Scenario Profile</th>
                    <th className="px-5 py-4 font-bold font-mono text-[10px] uppercase tracking-wider">Critical Coverage</th>
                    <th className="px-5 py-4 font-bold font-mono text-[10px] uppercase tracking-wider">Fuel Risk</th>
                    <th className="px-5 py-4 font-bold font-mono text-[10px] uppercase tracking-wider">Delay Delta</th>
                    <th className="px-5 py-4 font-bold font-mono text-[10px] uppercase tracking-wider">Composite Risk</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-xs text-slate-700">
                <tr className="hover:bg-white transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-800">7-Day Disruption</td>
                    <td className="px-5 py-4 text-emerald-600">96%</td>
                    <td className="px-5 py-4 text-emerald-600">Low</td>
                    <td className="px-5 py-4">+7d</td>
                    <td className="px-5 py-4"><span className="badge bg-emerald-500/10 text-emerald-600 border-emerald-500/30">LOW</span></td>
                </tr>
                <tr className="bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                    <td className="px-5 py-4 font-bold text-amber-700">14-Day Disruption</td>
                    <td className="px-5 py-4 text-amber-600">82%</td>
                    <td className="px-5 py-4 text-amber-600">Medium</td>
                    <td className="px-5 py-4">+14d</td>
                    <td className="px-5 py-4"><span className="badge bg-amber-500/10 text-amber-600 border-amber-500/30">MEDIUM</span></td>
                </tr>
                <tr className="hover:bg-white transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-800">18-Day Disruption</td>
                    <td className="px-5 py-4 text-red-600">64%</td>
                    <td className="px-5 py-4 text-red-600">High</td>
                    <td className="px-5 py-4">+18d</td>
                    <td className="px-5 py-4"><span className="badge bg-red-500/10 text-red-600 border-red-500/30">HIGH</span></td>
                </tr>
                <tr className="hover:bg-white transition-colors bg-red-500/5">
                    <td className="px-5 py-4 font-bold text-red-300">No Feasible Reroute</td>
                    <td className="px-5 py-4 text-red-500">42%</td>
                    <td className="px-5 py-4 text-red-500 font-bold">Critical</td>
                    <td className="px-5 py-4">N/A</td>
                    <td className="px-5 py-4"><span className="badge bg-red-500/20 text-red-600 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]">CRITICAL</span></td>
                </tr>
                </tbody>
            </table>
            </div>
        </div>
      </div>
    </div>
  );

  const EnergyImpactView = () => (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 h-full overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Energy Consequence Impact</h1>
        <p className="text-sm text-slate-500 mt-1">Modeling the downstream consequences of supply-chain disruptions on station energy resilience.</p>
      </div>

      <div className="card p-4 bg-white border-slate-200 flex items-center justify-center gap-3 flex-wrap">
        <div className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-500 tracking-wider">SUPPLY DISRUPTION</div>
        <ArrowRight size={14} className="text-slate-600"/>
        <div className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-[10px] font-mono font-bold text-slate-500 tracking-wider">FUEL DELAY</div>
        <ArrowRight size={14} className="text-slate-600"/>
        <div className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-[10px] font-mono font-bold text-amber-500/80 tracking-wider">FUEL DEFICIT</div>
        <ArrowRight size={14} className="text-slate-600"/>
        <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-[10px] font-mono font-bold text-red-600 tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.2)]">ENERGY RISK CRITICAL</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="card p-6 flex flex-col border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-6">Downstream Energy Risk Forecast</h3>
          <div className="flex-1 min-h-[280px] -ml-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={systemStatus === 'RECOVERING' ? energyDataRecovering : energyDataNominal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDiesel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', color: '#1e293b' }} />
                <Area type="monotone" dataKey="demand" stroke="#94a3b8" strokeWidth={2} fill="url(#colorDemand)" name="Predicted Load" />
                <Area type="monotone" dataKey="diesel_gen_a" stroke="#ef4444" strokeWidth={2} fill="url(#colorDiesel)" stackId="1" name="Diesel Dispatch" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card p-6 border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-6">Tiered Load Management (Response)</h3>
            <div className="space-y-3">
              <div className="p-3.5 border border-slate-300 rounded-lg flex justify-between items-center bg-white">
                <div>
                  <div className="text-sm font-bold text-slate-800 font-mono">TIER 1 — CRITICAL</div>
                  <div className="text-xs text-slate-500 mt-1">Life Support, Heating, Communication</div>
                </div>
                <span className="badge bg-emerald-500/10 text-emerald-600 border-emerald-500/30">ENERGIZED</span>
              </div>
              <div className="p-3.5 border border-slate-300 rounded-lg flex justify-between items-center bg-white">
                <div>
                  <div className="text-sm font-bold text-slate-800 font-mono">TIER 2 — IMPORTANT</div>
                  <div className="text-xs text-slate-500 mt-1">Laboratories, Primary Scientific Data</div>
                </div>
                <span className="badge bg-emerald-500/10 text-emerald-600 border-emerald-500/30">ENERGIZED</span>
              </div>
              <div className={`p-3.5 border rounded-lg flex justify-between items-center transition-all ${systemStatus === 'RECOVERING' ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-300 bg-white'}`}>
                <div>
                  <div className={`text-sm font-bold font-mono ${systemStatus === 'RECOVERING' ? 'text-amber-600' : 'text-slate-800'}`}>TIER 3 — NON-CRITICAL</div>
                  <div className={`text-xs mt-1 ${systemStatus === 'RECOVERING' ? 'text-amber-500/70' : 'text-slate-500'}`}>Optional thermal loads, secondary experiments</div>
                </div>
                <span className={`badge ${systemStatus === 'RECOVERING' ? 'bg-amber-500/20 text-amber-600 border-amber-500/50' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'}`}>
                  {systemStatus === 'RECOVERING' ? 'CURTAILED' : 'ENERGIZED'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization & Dispatch Architecture */}
      <div className="card p-6 border-slate-200 mt-6 flex-shrink-0">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-6">Optimization & Dispatch Architecture</h3>
        <div className="flex flex-col gap-2 font-mono text-xs">
          
          <div className="p-3 border border-blue-500/30 rounded bg-blue-500/10">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">TOP TIER - Data Acquisition & QC</span>
            <span className="text-slate-700">Sensors / SCADA → Data QC (missing/icing flags)</span>
          </div>
          
          <div className="flex justify-center"><ArrowDown size={16} className="text-slate-500" /></div>
          
          <div className="p-3 border border-pink-500/30 rounded bg-pink-500/10">
            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block mb-1">SECOND TIER - Forecasting</span>
            <div className="flex flex-col gap-1 text-slate-700">
              <div className="font-bold">Probabilistic Forecasts (P10/P50/P90)</div>
              <div className="flex gap-4 mt-2 pt-2 border-t border-pink-500/20 text-[10px]">
                <span className="bg-pink-500/20 px-2 py-1 rounded">Load (science/heating)</span>
                <span className="bg-pink-500/20 px-2 py-1 rounded">Solar (snow-aware)</span>
                <span className="bg-pink-500/20 px-2 py-1 rounded">Wind (icing-aware)</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center"><ArrowDown size={16} className="text-slate-500" /></div>
          
          <div className="p-3 border border-amber-500/30 rounded bg-amber-500/10">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-1">THIRD TIER - Scenarios</span>
            <span className="text-slate-700">Scenario Builder (storm / low-renewable / generator-fault)</span>
          </div>
          
          <div className="flex justify-center"><ArrowDown size={16} className="text-slate-500" /></div>
          
          <div className="p-3 border border-emerald-500/30 rounded bg-emerald-500/10">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">FOURTH TIER - Optimization</span>
            <span className="text-slate-700">Rolling-horizon MPC / MILP (fuel, start-stop, battery temp+SOC, tiered load shedding)</span>
          </div>
          
          <div className="flex justify-center"><ArrowDown size={16} className="text-slate-500" /></div>
          
          <div className="p-3 border border-purple-500/30 rounded bg-purple-500/10">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">BOTTOM TIER - Safety & Dispatch</span>
            <span className="text-slate-700">Safety Layer (hard limits) → Operator Override → Dispatch</span>
          </div>
          
        </div>
      </div>
    </div>
  );

  const AgentActivityView = () => (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agent Execution Timeline</h1>
        <p className="text-sm text-slate-500 mt-1">Immutable trace of the automated technical reasoning chain.</p>
      </div>
      <div className="card p-8 bg-slate-100 relative border-slate-200">
        <div className="absolute top-12 bottom-12 left-12 w-[1px] bg-[#334155] z-0"></div>
        <div className="space-y-8 relative z-10 font-mono text-xs">
          
          <div className="flex gap-5 items-start group">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 border border-slate-300 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors shadow-lg z-10"><AlertTriangle size={18}/></div>
            <div className="pt-1.5 flex-1">
              <div className="font-bold text-slate-800 tracking-wider text-[11px] mb-2">01 DISRUPTION SENSING AGENT</div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-slate-500 space-y-1.5 leading-relaxed">
                <p className="text-amber-600 font-bold mb-1 border-b border-slate-200 pb-2">EVENT DETECTED: Primary resupply shipment ETA moved.</p>
                <p>Affected nodes: <span className="text-slate-800">Cape Town → Maitri</span></p>
                <p>Affected materials: <span className="text-slate-800">Aviation Fuel, Medical Supplies, Food</span></p>
              </div>
            </div>
          </div>

          <div className="flex gap-5 items-start group">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 border border-slate-300 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors shadow-lg z-10"><ActivitySquare size={18}/></div>
            <div className="pt-1.5 flex-1">
              <div className="font-bold text-slate-800 tracking-wider text-[11px] mb-2">02 SCENARIO PLANNING AGENT</div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-500 space-y-1.5 leading-relaxed">
                <p>Generated determinist scenarios: 7-day, 14-day, 18-day, and NO-REROUTE.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-5 items-start group">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 border border-slate-300 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors shadow-lg z-10"><Package size={18}/></div>
            <div className="pt-1.5 flex-1">
              <div className="font-bold text-slate-800 tracking-wider text-[11px] mb-2">03 INVENTORY REBALANCING AGENT</div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-slate-500 space-y-1.5 leading-relaxed">
                <p>Analyzed baseline parameters: Current Stock: 420u | Burn Rate: 35u/d | ETA: 18d</p>
                <p className="text-red-600 font-bold py-1">Identified aviation fuel as critical shortage risk.</p>
                <p>Optimization target updated: Preserve emergency reserve.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-5 items-start group">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 border border-slate-300 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors shadow-lg z-10"><Network size={18}/></div>
            <div className="pt-1.5 flex-1">
              <div className="font-bold text-slate-800 tracking-wider text-[11px] mb-2">04 REROUTING & LOGISTICS AGENT</div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-slate-500 space-y-1.5 leading-relaxed">
                <p>Evaluated 4 available logistics nodes in constrained network.</p>
                <p>Node A: Primary Vessel <span className="text-red-600">(Unavailable)</span></p>
                <p>Node B: Secondary Vessel <span className="text-emerald-600">(Feasible: Cap 1,200u, ETA 10d)</span></p>
              </div>
            </div>
          </div>

          <div className="flex gap-5 items-start group">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 border border-slate-300 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors shadow-lg z-10"><BrainCircuit size={18}/></div>
            <div className="pt-1.5 flex-1">
              <div className="font-bold text-slate-800 tracking-wider text-[11px] mb-2">05 OPTIMIZATION ENGINE</div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-500 space-y-1.5 leading-relaxed">
                <p>Allocated scalar priority limits: Fuel (500), Medical (200), Emergency (150)</p>
              </div>
            </div>
          </div>

          <div className="flex gap-5 items-start group">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 border border-slate-300 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors shadow-lg z-10"><ShieldAlert size={18}/></div>
            <div className="pt-1.5 flex-1">
              <div className="font-bold text-slate-800 tracking-wider text-[11px] mb-2">06 SAFETY & CONSTRAINT AGENT</div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-500 space-y-1.5 leading-relaxed">
                <p className="text-emerald-600">Validated emergency reserve constraints. Matrix check passed.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-5 items-start group">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 border border-slate-300 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors shadow-lg z-10"><User size={18}/></div>
            <div className="pt-1.5 flex-1">
              <div className="font-bold text-slate-800 tracking-wider text-[11px] mb-2">07 HUMAN APPROVAL</div>
              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30 text-blue-600 space-y-1.5 leading-relaxed shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <p className="font-bold">Execution suspended pending operator decision threshold.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const AuditView = () => (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Trail</h1>
        <p className="text-sm text-slate-500 mt-1">Immutable ledger of execution events and automated decisions.</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="badge bg-blue-500/10 text-blue-600 border-blue-500/30 font-mono text-[9px]">STATUS: SIMULATED ENVIRONMENT</span>
        </div>
      </div>
      <div className="card flex-1 p-0 overflow-hidden border-slate-200">
        <div className="overflow-x-auto h-full bg-slate-100">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-6 py-4 font-bold font-mono text-[10px] text-slate-500 uppercase tracking-widest">Transaction ID</th>
                <th className="px-6 py-4 font-bold font-mono text-[10px] text-slate-500 uppercase tracking-widest">Timestamp (UTC)</th>
                <th className="px-6 py-4 font-bold font-mono text-[10px] text-slate-500 uppercase tracking-widest">Level</th>
                <th className="px-6 py-4 font-bold font-mono text-[10px] text-slate-500 uppercase tracking-widest">Agent Source</th>
                <th className="px-6 py-4 font-bold font-mono text-[10px] text-slate-500 uppercase tracking-widest w-[50%]">Event Payload Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px] text-slate-700">
              {auditLog.map((log) => (
                <tr key={log.id} className="hover:bg-white transition-colors">
                  <td className="px-6 py-4 text-slate-500">{log.id}</td>
                  <td className="px-6 py-4 text-slate-500">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] uppercase font-bold tracking-wider ${
                      log.level === 'error' ? 'bg-red-500/10 text-red-600 border border-red-500/30' :
                      log.level === 'warn' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30' :
                      log.level === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' :
                      'bg-slate-200 text-slate-500 border border-slate-300'
                    }`}>{log.level}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-bold">{log.source}</td>
                  <td className="px-6 py-4 text-slate-700 font-sans text-xs">{log.event}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans selection:bg-blue-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'control_tower' && <ControlTowerView />}
          {activeTab === 'supply_network' && <SupplyNetworkView nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} nodeTypes={nodeTypes} />}
          {activeTab === 'supply_inventory' && <SupplyInventoryView />}
          {activeTab === 'scenario' && <ScenarioPlanningView />}
          {activeTab === 'energy' && <EnergyImpactView />}
          {activeTab === 'agents' && <AgentActivityView />}
          {activeTab === 'audit' && <AuditView />}
        </main>
        
        {/* Scenario Selection Modal */}
        {showScenarioModal && (
          <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-100">
                <h2 className="text-sm font-bold text-slate-800 tracking-wider">SELECT DISRUPTION SCENARIO</h2>
                <button onClick={() => setShowScenarioModal(false)} className="text-slate-500 hover:text-slate-700 transition-colors">✕</button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <p className="text-xs text-slate-500 mb-2 font-mono">Inject a constraint violation event into the simulated Antarctic supply network.</p>
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedScenario === '7-day' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-slate-300 hover:border-slate-500 bg-slate-200/50'}`}
                  onClick={() => setSelectedScenario('7-day')}
                >
                  <div className="text-sm font-bold text-slate-800">Scenario A: Minor Disruption</div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">Primary Resupply Delayed – 7 Days</div>
                </div>
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedScenario === '14-day' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-slate-300 hover:border-slate-500 bg-slate-200/50'}`}
                  onClick={() => setSelectedScenario('14-day')}
                >
                  <div className="text-sm font-bold text-slate-800">Scenario B: Significant Disruption</div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">Primary Resupply Delayed – 14 Days</div>
                </div>
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedScenario === '18-day' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-slate-300 hover:border-slate-500 bg-slate-200/50'}`}
                  onClick={() => setSelectedScenario('18-day')}
                >
                  <div className="text-sm font-bold text-slate-800">Scenario C: Critical Disruption</div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">Primary Resupply Delayed – 18 Days</div>
                </div>
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedScenario === 'no-reroute' ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-slate-300 hover:border-red-500/30 bg-slate-200/50'}`}
                  onClick={() => setSelectedScenario('no-reroute')}
                >
                  <div className="text-sm font-bold text-red-600">Scenario I: No Feasible Reroute</div>
                  <div className="text-xs text-red-600 font-mono font-bold mt-1">Logistics capacity completely exhausted. (Forced Conservation)</div>
                </div>
              </div>
              <div className="px-6 py-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-100">
                <button onClick={() => setShowScenarioModal(false)} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">CANCEL</button>
                <button onClick={() => triggerDisruption(selectedScenario)} className="px-6 py-2.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 rounded-md transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2">
                  <Play size={14}/> EXECUTE SIMULATION
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
