import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  History,
  X,
  MapPin,
  Building2,
  Boxes,
  ExternalLink,
  Database,
  ArrowDownCircle,
  Truck,
  ArrowRightLeft,
  ChevronRight,
  User,
  Phone,
  FileText,
  Scan,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

const App = () => {
  // --- Core Reference Data (Material Master) ---
  const INITIAL_MASTER_LIST = [
    { id: 'm-1', name: 'Complete Kits', category: 'Kits', basePrice: 1200, unit: 'Kit' },
    { id: 'm-2', name: 'Complete Kits without Container', category: 'Kits', basePrice: 950, unit: 'Kit' },
    { id: 'm-3', name: 'Kits (Sst & Edta)', category: 'Kits', basePrice: 450, unit: 'Kit' },
    { id: 'm-4', name: 'Band-Aid', category: 'Medical Supplies', basePrice: 5, unit: 'Box' },
    { id: 'm-5', name: 'Blood Ziplock', category: 'Supplies', basePrice: 12, unit: 'Pack' },
    { id: 'm-6', name: 'Bp Machine', category: 'Equipment', basePrice: 2500, unit: 'Unit' },
    { id: 'm-7', name: 'Ecg Gel', category: 'Medical Supplies', basePrice: 180, unit: 'Bottle' },
    { id: 'm-8', name: 'Edta Vial', category: 'Vials', basePrice: 45, unit: 'Unit' },
    { id: 'm-9', name: 'Fluoride Vial', category: 'Vials', basePrice: 45, unit: 'Unit' },
    { id: 'm-10', name: 'Gloves', category: 'Safety', basePrice: 350, unit: 'Box' },
    { id: 'm-11', name: 'Holder', category: 'Medical Supplies', basePrice: 15, unit: 'Unit' },
    { id: 'm-12', name: 'Lbc Kits', category: 'Kits', basePrice: 1500, unit: 'Kit' },
    { id: 'm-13', name: 'Lithium Heparin', category: 'Vials', basePrice: 60, unit: 'Unit' },
    { id: 'm-14', name: 'Marker', category: 'Stationery', basePrice: 25, unit: 'Pc' },
    { id: 'm-15', name: 'Mask', category: 'Safety', basePrice: 10, unit: 'Pc' },
    { id: 'm-16', name: 'Needle', category: 'Medical Supplies', basePrice: 8, unit: 'Pc' },
    { id: 'm-17', name: 'Sanitizer', category: 'Safety', basePrice: 150, unit: 'Bottle' },
    { id: 'm-18', name: 'Sodium Citrate', category: 'Vials', basePrice: 55, unit: 'Unit' },
    { id: 'm-19', name: 'Sodium Heparin', category: 'Vials', basePrice: 60, unit: 'Unit' },
    { id: 'm-20', name: 'Sst Vial', category: 'Vials', basePrice: 50, unit: 'Unit' }
  ];

  // --- State Management ---
  const [view, setView] = useState('dashboard');
  const [masterItems, setMasterItems] = useState(INITIAL_MASTER_LIST);
  const [hubs, setHubs] = useState([
    { id: 'h1', name: 'Mumbai Main Hub', location: 'Mumbai', capacity: '85%' },
    { id: 'h2', name: 'Delhi North Hub', location: 'Delhi', capacity: '40%' },
    { id: 'h3', name: 'Bangalore South Hub', location: 'Bangalore', capacity: '25%' },
  ]);

  const [products, setProducts] = useState(
    INITIAL_MASTER_LIST.map((m, index) => ({
      id: `p-${index}`,
      masterId: m.id,
      name: m.name,
      category: m.category,
      price: m.basePrice,
      stock: index < 5 ? 500 : 50,
      minStock: 20,
      hubId: index % 3 === 0 ? 'h1' : index % 3 === 1 ? 'h2' : 'h3'
    }))
  );

  const [history, setHistory] = useState([
    { id: 1, action: 'Initial Setup', product: 'System', change: 'Master Data Loaded', date: new Date().toLocaleString(), type: 'system' },
  ]);

  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  
  const [editingMaster, setEditingMaster] = useState(null);
  const [editingHub, setEditingHub] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHubFilter, setSelectedHubFilter] = useState('all');

  // --- Intake Flow State (Vendor Facing) ---
  const [intakeForm, setIntakeForm] = useState({
    source: 'Vendor',
    vendorId: '',
    invoiceNo: '',
    gateEntryNo: '',
    destinationHubId: 'h1',
  });
  const [intakeCart, setIntakeCart] = useState([]);
  const [tempIntakeItem, setTempIntakeItem] = useState({ masterId: '', qty: 1, batchNo: '' });

  // --- Release Flow State (Dispatch Facing) ---
  const [releaseForm, setReleaseForm] = useState({
    destType: 'Camp',
    campCode: '',
    clientName: '',
    city: '',
    spocName: '',
    spocPhone: '',
    sourceHubId: 'h1',
    dispatchMode: 'Courier'
  });
  const [releaseCart, setReleaseCart] = useState([]); 
  const [tempReleaseItem, setTempReleaseItem] = useState({ productId: '', qty: 1 });

  // Forms
  const [masterFormData, setMasterFormData] = useState({ name: '', category: 'Medical Supplies', basePrice: '', unit: 'Unit' });
  const [hubFormData, setHubFormData] = useState({ name: '', location: '', capacity: '0%' });

  // --- Calculations ---
  const stats = useMemo(() => {
    const totalItems = products.reduce((acc, curr) => acc + Number(curr.stock), 0);
    const lowStockItems = products.filter(p => p.stock <= p.minStock).length;
    return { totalItems, lowStockItems };
  }, [products]);

  const filteredItems = useMemo(() => {
    let source = products;
    return source.filter(p => {
      const name = p.name || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHub = selectedHubFilter === 'all' || p.hubId === selectedHubFilter;
      return matchesSearch && matchesHub;
    });
  }, [products, searchTerm, selectedHubFilter]);

  // --- Handlers ---
  const addHistory = (action, product, change, type = 'update') => {
    const entry = { id: Date.now(), action, product, change, date: new Date().toLocaleString(), type };
    setHistory(prev => [entry, ...prev]);
  };

  const submitIntake = () => {
    if (intakeCart.length === 0) return;
    const newProducts = [...products];
    intakeCart.forEach(item => {
      const existing = newProducts.find(p => p.masterId === item.masterId && p.hubId === intakeForm.destinationHubId);
      if (existing) {
        existing.stock += item.qty;
      } else {
        const master = masterItems.find(m => m.id === item.masterId);
        newProducts.push({
          id: Math.random().toString(36).substr(2, 9),
          masterId: master.id, name: master.name, category: master.category,
          price: master.basePrice, stock: item.qty, minStock: 20, hubId: intakeForm.destinationHubId
        });
      }
    });
    setProducts(newProducts);
    addHistory('Inward', `Invoice: ${intakeForm.invoiceNo}`, `Received ${intakeCart.length} lines from ${intakeForm.vendorId}`, 'intake');
    setIsIntakeModalOpen(false);
    setIntakeCart([]);
  };

  const submitRelease = () => {
    if (releaseCart.length === 0) return;
    setProducts(products.map(p => {
      const cartItem = releaseCart.find(item => item.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
    }));
    addHistory('Outward', `${releaseForm.clientName}`, `Dispatched to ${releaseForm.city} via ${releaseForm.dispatchMode}`, 'release');
    setIsReleaseModalOpen(false);
    setReleaseCart([]);
  };

  const openMasterModal = (master = null) => {
    if (master) { setEditingMaster(master); setMasterFormData(master); }
    else { setEditingMaster(null); setMasterFormData({ name: '', category: 'Medical Supplies', basePrice: '', unit: 'Unit' }); }
    setIsMasterModalOpen(true);
  };

  const openHubModal = (hub = null) => {
    if (hub) { setEditingHub(hub); setHubFormData(hub); }
    else { setEditingHub(null); setHubFormData({ name: '', location: '', capacity: '0%' }); }
    setIsHubModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex">
      {/* Sidebar Navigation */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 p-6 hidden md:block z-20 shadow-sm">
        <div className="flex items-center gap-2 mb-10 text-indigo-600">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <Boxes size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-800">MEDLOG</h1>
        </div>
        <div className="space-y-1.5">
          <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutGrid size={18} />} label="Overview" />
          <div className="pt-4 pb-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory</div>
          <NavButton active={view === 'master'} onClick={() => setView('master')} icon={<Database size={18} />} label="Material Master" />
          <NavButton active={view === 'inventory'} onClick={() => setView('inventory')} icon={<Package size={18} />} label="Stock Ledger" />
          <div className="pt-4 pb-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Operations</div>
          <NavButton active={view === 'intake'} onClick={() => setView('intake')} icon={<ArrowDownCircle size={18} />} label="Inward Entry" color="text-emerald-600" />
          <NavButton active={view === 'release'} onClick={() => setView('release')} icon={<ExternalLink size={18} />} label="Outward Entry" color="text-orange-600" />
          <div className="pt-4 pb-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Admin</div>
          <NavButton active={view === 'hubs'} onClick={() => setView('hubs')} icon={<Building2 size={18} />} label="Hub Master" />
          <NavButton active={view === 'history'} onClick={() => setView('history')} icon={<History size={18} />} label="Logistics Logs" />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="md:ml-64 flex-1 p-8 pb-32">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tight">{view.replace('-', ' ')}</h2>
            <p className="text-slate-500 text-sm font-medium">Enterprise Healthcare Logistics Management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-64 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
        </header>

        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Global Inventory" value={stats.totalItems.toLocaleString()} icon={<Package className="text-blue-500" />} />
              <StatCard title="Active Logistics Hubs" value={hubs.length} icon={<Building2 className="text-indigo-500" />} />
              <StatCard title="Critical Stock Alerts" value={stats.lowStockItems} icon={<AlertTriangle className="text-rose-500" />} highlight={stats.lowStockItems > 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Distinct Intake Card */}
              <div 
                onClick={() => { setView('intake'); setIsIntakeModalOpen(true); }}
                className="relative overflow-hidden group p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-12 bg-emerald-50 rounded-bl-[100px] -mr-6 -mt-6 group-hover:bg-emerald-100 transition-colors">
                  <ArrowDownCircle size={64} className="text-emerald-500 opacity-20 group-hover:opacity-40" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ArrowDownCircle size={28}/>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Material Inward</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[240px]">Record vendor arrivals, manage GRN (Goods Received Notes) and update hub inventory levels.</p>
                  <div className="mt-8 flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider">
                    Process Receipt <ChevronRight size={16}/>
                  </div>
                </div>
              </div>

              {/* Distinct Release Card */}
              <div 
                onClick={() => { setView('release'); setIsReleaseModalOpen(true); }}
                className="relative overflow-hidden group p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-12 bg-orange-50 rounded-bl-[100px] -mr-6 -mt-6 group-hover:bg-orange-100 transition-colors">
                  <ExternalLink size={64} className="text-orange-500 opacity-20 group-hover:opacity-40" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ExternalLink size={28}/>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Material Outward</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[240px]">Dispatch items to camps or clinics. Generate delivery challans and track logistics mode.</p>
                  <div className="mt-8 flex items-center gap-2 text-orange-600 font-bold text-sm uppercase tracking-wider">
                    Process Dispatch <ChevronRight size={16}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(view === 'inventory' || view === 'intake' || view === 'release') && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
             <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Selected Warehouse</span>
                  <select 
                    className="bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={selectedHubFilter} 
                    onChange={(e) => setSelectedHubFilter(e.target.value)}
                  >
                    <option value="all">Consolidated Network</option>
                    {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                {view === 'intake' && (
                  <button onClick={() => setIsIntakeModalOpen(true)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100">
                    <ArrowDownCircle size={18}/> New Inward
                  </button>
                )}
                {view === 'release' && (
                  <button onClick={() => setIsReleaseModalOpen(true)} className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-orange-700 shadow-lg shadow-orange-100">
                    <ExternalLink size={18}/> New Outward
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Material Description</th>
                    <th className="px-8 py-5">Hub Storage</th>
                    <th className="px-8 py-5">Stock Level</th>
                    <th className="px-8 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 group transition-all">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <MapPin size={14} className="text-slate-300"/>
                          {hubs.find(h => h.id === item.hubId)?.name}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-lg font-black ${item.stock <= item.minStock ? 'text-rose-500' : 'text-slate-900'}`}>
                          {item.stock.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {item.stock <= item.minStock ? (
                          <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full uppercase">Critical</span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase">Healthy</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'hubs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
            {hubs.map((hub) => (
              <div key={hub.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Building2 size={24}/>
                  </div>
                  <button onClick={() => openHubModal(hub)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                    <MoreVertical size={20}/>
                  </button>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-1">{hub.name}</h4>
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                  <MapPin size={14}/> {hub.location}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Capacity Utilization</span>
                    <span>{hub.capacity}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: hub.capacity }}></div>
                  </div>
                </div>
              </div>
            ))}
            <div 
              onClick={() => openHubModal()}
              className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all cursor-pointer group"
            >
              <Plus size={32} className="mb-2 group-hover:scale-125 transition-transform" />
              <span className="font-bold text-sm uppercase tracking-widest">Register New Hub</span>
            </div>
          </div>
        )}

        {view === 'master' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Catalog Reference (Master Data)</h4>
              <button onClick={() => openMasterModal()} className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all">
                + Register Material
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <tr><th className="px-8 py-5">Technical Name</th><th className="px-8 py-5">Category</th><th className="px-8 py-5">Unit</th><th className="px-8 py-5 text-right">Standard Rate</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {masterItems.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 group transition-all">
                    <td className="px-8 py-5 font-bold text-slate-800">{m.name}</td>
                    <td className="px-8 py-5 font-medium text-slate-500">{m.category}</td>
                    <td className="px-8 py-5 text-slate-400 font-bold text-xs uppercase">{m.unit}</td>
                    <td className="px-8 py-5 text-right font-black text-slate-800">₹{m.basePrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-4">
            {history.map(h => (
              <div key={h.id} className="bg-white p-5 border border-slate-200 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-6">
                  <div className={`p-3 rounded-xl ${
                    h.type === 'intake' ? 'bg-emerald-100 text-emerald-600' : 
                    h.type === 'release' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {h.type === 'intake' ? <ArrowDownCircle size={20}/> : h.type === 'release' ? <ExternalLink size={20}/> : <History size={20}/>}
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-0.5">{h.action}</h5>
                    <p className="text-sm font-bold text-slate-600">{h.product}</p>
                    <p className="text-xs text-slate-400 mt-1">{h.change}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-300 block mb-1 uppercase">Logged At</span>
                  <span className="text-xs font-bold text-slate-600">{h.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- INTAKE MODAL (Vendor & Arrival Focused) --- */}
      {isIntakeModalOpen && (
        <OperationModal 
          title="Material Inward (Receipt)" 
          theme="emerald" 
          onClose={() => setIsIntakeModalOpen(false)}
          onCommit={submitIntake}
          commitText="Complete Receipt"
          isValid={intakeCart.length > 0}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="space-y-6">
              {/* Receipt Context */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">General Info</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Receiving Hub</label>
                    <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold outline-none" value={intakeForm.destinationHubId} onChange={e => setIntakeForm({...intakeForm, destinationHubId: e.target.value})}>
                      {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Invoice / DC No.</label>
                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold" value={intakeForm.invoiceNo} onChange={e => setIntakeForm({...intakeForm, invoiceNo: e.target.value})} placeholder="INV-000" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Vendor Name</label>
                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold" value={intakeForm.vendorId} onChange={e => setIntakeForm({...intakeForm, vendorId: e.target.value})} placeholder="LifeCare Medical" />
                  </div>
                </div>
              </div>

              {/* Item Adder */}
              <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Plus size={16} className="text-emerald-600" />
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Add Materials</span>
                </div>
                <select className="w-full bg-white border border-emerald-200 p-3 rounded-xl font-bold outline-none" value={tempIntakeItem.masterId} onChange={e => setTempIntakeItem({...tempIntakeItem, masterId: e.target.value})}>
                  <option value="">Search Material Catalog...</option>
                  {masterItems.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Quantity" className="bg-white border border-emerald-200 p-3 rounded-xl font-bold" value={tempIntakeItem.qty} onChange={e => setTempIntakeItem({...tempIntakeItem, qty: e.target.value})} />
                  <button 
                    onClick={() => {
                      if (!tempIntakeItem.masterId) return;
                      const master = masterItems.find(m => m.id === tempIntakeItem.masterId);
                      setIntakeCart([...intakeCart, { ...master, qty: parseInt(tempIntakeItem.qty), masterId: master.id }]);
                      setTempIntakeItem({ masterId: '', qty: 1, batchNo: '' });
                    }}
                    className="bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                  >
                    Add to Batch
                  </button>
                </div>
              </div>
            </div>

            {/* Batch List */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <h4 className="text-lg font-black tracking-tight">Incoming Batch <span className="text-emerald-400 ml-2">●</span></h4>
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{intakeCart.length} Items</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {intakeCart.map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-colors">
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-[10px] font-black text-emerald-400 uppercase mt-1">Ready for Receipt (Qty: {item.qty})</p>
                    </div>
                    <button onClick={() => setIntakeCart(intakeCart.filter((_, i) => i !== idx))} className="p-2 text-white/20 hover:text-rose-400 transition-colors">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
                {intakeCart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-white/20 opacity-40">
                    <Scan size={48} className="mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">No Items Added</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </OperationModal>
      )}

      {/* --- RELEASE MODAL (Dispatch & Destination Focused) --- */}
      {isReleaseModalOpen && (
        <OperationModal 
          title="Material Outward (Dispatch)" 
          theme="orange" 
          onClose={() => setIsReleaseModalOpen(false)}
          onCommit={submitRelease}
          commitText="Generate Dispatch Note"
          isValid={releaseCart.length > 0}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="space-y-6">
              {/* Destination Context */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={16} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dispatch Details</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Source Warehouse</label>
                    <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold outline-none" value={releaseForm.sourceHubId} onChange={e => setReleaseForm({...releaseForm, sourceHubId: e.target.value})}>
                      {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Client / Camp Name</label>
                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold" value={releaseForm.clientName} onChange={e => setReleaseForm({...releaseForm, clientName: e.target.value})} placeholder="Apollo Clinic" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Destination City</label>
                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold" value={releaseForm.city} onChange={e => setReleaseForm({...releaseForm, city: e.target.value})} placeholder="Pune" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">SPOC Name</label>
                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold font-mono" value={releaseForm.spocName} onChange={e => setReleaseForm({...releaseForm, spocName: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Mobile Number</label>
                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold" value={releaseForm.spocPhone} onChange={e => setReleaseForm({...releaseForm, spocPhone: e.target.value})} placeholder="+91..." />
                  </div>
                </div>
              </div>

              {/* Stock Selector */}
              <div className="bg-orange-50/50 rounded-2xl border border-orange-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scan size={16} className="text-orange-600" />
                  <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Select From Hub Stock</span>
                </div>
                <select className="w-full bg-white border border-orange-200 p-3 rounded-xl font-bold outline-none" value={tempReleaseItem.productId} onChange={e => setTempReleaseItem({...tempReleaseItem, productId: e.target.value})}>
                  <option value="">Search Hub Stock...</option>
                  {products.filter(p => p.hubId === releaseForm.sourceHubId).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Avl: {p.stock})</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Quantity" className="bg-white border border-orange-200 p-3 rounded-xl font-bold" value={tempReleaseItem.qty} onChange={e => setTempReleaseItem({...tempReleaseItem, qty: e.target.value})} />
                  <button 
                    onClick={() => {
                      if (!tempReleaseItem.productId) return;
                      const p = products.find(x => x.id === tempReleaseItem.productId);
                      if (p && p.stock >= tempReleaseItem.qty) {
                        setReleaseCart([...releaseCart, { ...p, qty: parseInt(tempReleaseItem.qty) }]);
                        setTempReleaseItem({ productId: '', qty: 1 });
                      } else {
                        alert("Insufficient Stock!");
                      }
                    }}
                    className="bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
                  >
                    Release Stock
                  </button>
                </div>
              </div>
            </div>

            {/* Release List */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <h4 className="text-lg font-black tracking-tight">Outward Batch <span className="text-orange-400 ml-2">●</span></h4>
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{releaseCart.length} Items</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {releaseCart.map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-colors">
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-[10px] font-black text-orange-400 uppercase mt-1">Ready for Dispatch (Qty: {item.qty})</p>
                    </div>
                    <button onClick={() => setReleaseCart(releaseCart.filter((_, i) => i !== idx))} className="p-2 text-white/20 hover:text-rose-400 transition-colors">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </OperationModal>
      )}

      {/* Admin Modals */}
      {isMasterModalOpen && (
        <AdminModal title={editingMaster ? "Update Asset" : "Register Asset"} onClose={() => setIsMasterModalOpen(false)}>
          <div className="space-y-4">
            <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Material Name</label><input className="w-full border border-slate-200 p-2.5 rounded-xl font-bold" value={masterFormData.name} onChange={e => setMasterFormData({...masterFormData, name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Standard Rate</label><input type="number" className="w-full border border-slate-200 p-2.5 rounded-xl font-bold" value={masterFormData.basePrice} onChange={e => setMasterFormData({...masterFormData, basePrice: e.target.value})} /></div>
              <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Inventory Unit</label><select className="w-full border border-slate-200 p-2.5 rounded-xl font-bold" value={masterFormData.unit} onChange={e => setMasterFormData({...masterFormData, unit: e.target.value})}><option>Unit</option><option>Kit</option><option>Box</option><option>Pack</option></select></div>
            </div>
            <button 
              onClick={() => {
                const newItem = { ...masterFormData, id: editingMaster ? editingMaster.id : 'm-' + Date.now(), basePrice: parseFloat(masterFormData.basePrice) };
                if (editingMaster) setMasterItems(masterItems.map(m => m.id === editingMaster.id ? newItem : m));
                else setMasterItems([...masterItems, newItem]);
                setIsMasterModalOpen(false);
              }}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold mt-4"
            >
              Commit to Master
            </button>
          </div>
        </AdminModal>
      )}

      {isHubModalOpen && (
        <AdminModal title={editingHub ? "Modify Hub Info" : "Register Logistics Hub"} onClose={() => setIsHubModalOpen(false)}>
           <div className="space-y-4">
              <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Hub Name</label><input className="w-full border border-slate-200 p-2.5 rounded-xl font-bold" value={hubFormData.name} onChange={e => setHubFormData({...hubFormData, name: e.target.value})} /></div>
              <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Base Location</label><input className="w-full border border-slate-200 p-2.5 rounded-xl font-bold" value={hubFormData.location} onChange={e => setHubFormData({...hubFormData, location: e.target.value})} /></div>
              <button 
                onClick={() => {
                  const newHub = { ...hubFormData, id: editingHub ? editingHub.id : 'h' + Date.now() };
                  if (editingHub) setHubs(hubs.map(h => h.id === editingHub.id ? newHub : h));
                  else setHubs([...hubs, newHub]);
                  setIsHubModalOpen(false);
                }}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold mt-4"
              >
                Register Hub
              </button>
           </div>
        </AdminModal>
      )}
    </div>
  );
};

/* Reusable Components */

const NavButton = ({ active, onClick, icon, label, color }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
        : `text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold`
    }`}
  >
    <span className={`${active ? 'text-white' : color || 'text-slate-400'}`}>{icon}</span>
    <span className="text-[13px] font-black tracking-tight">{label}</span>
  </button>
);

const StatCard = ({ title, value, icon, highlight }) => (
  <div className={`p-6 rounded-3xl border bg-white shadow-sm hover:shadow-md transition-all ${highlight ? 'ring-2 ring-rose-500 ring-offset-4' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{title}</span>
      <div className="p-2.5 bg-slate-50 rounded-xl">{icon}</div>
    </div>
    <div className="text-3xl font-black text-slate-900">{value}</div>
  </div>
);

const OperationModal = ({ title, theme, children, onClose, onCommit, commitText, isValid }) => {
  const themeClasses = theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700';
  const accentText = theme === 'emerald' ? 'text-emerald-500' : 'text-orange-500';

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
      <div className="bg-[#F8FAFC] w-full max-w-6xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${theme === 'emerald' ? 'bg-emerald-500' : 'bg-orange-500'} animate-pulse`}/>
             <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-200 rounded-full text-slate-400 transition-all"><X size={20}/></button>
        </div>
        
        <div className="flex-1 overflow-hidden p-10">
          {children}
        </div>

        <div className="px-10 py-6 border-t border-slate-100 bg-white flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Discard</button>
          <button 
            onClick={onCommit} 
            disabled={!isValid}
            className={`px-10 py-3 text-white font-black rounded-2xl transition-all shadow-xl disabled:opacity-30 disabled:shadow-none flex items-center gap-2 ${themeClasses}`}
          >
            {commitText} <CheckCircle2 size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminModal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={18}/></button>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  </div>
);

export default App;