import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, X, DollarSign, Users, Package, UserX, 
  Search, Plus, Trash2, Monitor, Building2,
  ChevronDown, Check, AlertCircle
} from 'lucide-react';

interface VendorLicense {
  vendor: string; // 'Coast' | 'Tiled' | 'Synthesia'
  status: 'Active' | 'Inactive';
  licenseStartDate: string; // YYYY-MM-DD
  lastLogin?: string;
  linkedAssetId?: string; // For Coast Workspace or Tiled Pool
}

interface Person {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  function: string;
  assignedUnits: string[]; // BU IDs
  vendorLicenses?: VendorLicense[];
}

interface BusinessUnit {
  id: string;
  name: string;
  level: string;
  fullPath: string;
}

interface Asset {
  id: string;
  name: string;
  type: 'Coast Workspace' | 'Tiled Pool' | 'Live Environment' | 'Demo Technology';
  businessUnit: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  conditionalFields: Record<string, any>;
}

interface VendorManagerProps {
  onNotification?: (type: 'success' | 'error', message: string) => void;
  onClose?: () => void;
}

const VENDORS = ['Coast', 'Tiled', 'Synthesia'];

export default function VendorManager({ onNotification, onClose }: VendorManagerProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedBU, setSelectedBU] = useState<string>('All'); // BU name or 'All'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddLicenseModal, setShowAddLicenseModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showBUDropdown, setShowBUDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ person: Person; licenseIndex: number; license: VendorLicense } | null>(null);
  
  // License form state
  const [licenseForm, setLicenseForm] = useState({
    vendor: '',
    status: 'Active' as 'Active' | 'Inactive',
    licenseStartDate: new Date().toISOString().split('T')[0],
    lastLogin: '',
    linkedAssetId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch business units
      const buResponse = await fetch('http://localhost:3001/api/business-units');
      const buData = await buResponse.json();
      if (buData.success) {
        const buList = buData.units.filter((u: BusinessUnit) => u.level === 'BU');
        setBusinessUnits(buList);
        
        // Auto-select 'All' if nothing selected
        if (buList.length > 0 && !selectedBU) {
          setSelectedBU('All');
        }
      }
      
      // Fetch people
      const peopleResponse = await fetch('http://localhost:3001/api/people');
      const peopleData = await peopleResponse.json();
      if (peopleData.success) {
        setPeople(peopleData.people);
      }

      // Fetch assets from Asset Manager
      const assetsResponse = await fetch('http://localhost:3001/api/assets');
      const assetsData = await assetsResponse.json();
      if (assetsData.success && Array.isArray(assetsData.data)) {
        // Filter for only Coast Workspace and Tiled Pool assets
        const vendorAssets = assetsData.data.filter((asset: Asset) => 
          asset.type === 'Coast Workspace' || asset.type === 'Tiled Pool'
        );
        setAssets(vendorAssets);
      } else {
        setAssets([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      onNotification?.('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Get people assigned to selected BU
  const getPeopleForBU = (): Person[] => {
    if (!selectedBU) return [];
    
    // Return all people if 'All' is selected
    if (selectedBU === 'All') return people;
    
    const bu = businessUnits.find(u => u.name === selectedBU);
    if (!bu) return [];
    
    // Filter people who have this BU in their assignedUnits
    return people.filter(person => 
      person.assignedUnits.some(unitId => {
        // Check if unit is under this BU hierarchy
        const unit = businessUnits.find(u => u.id === unitId);
        return unit && (unit.id === bu.id || unit.fullPath.startsWith(bu.name));
      })
    );
  };
  
  // Get person's primary BU name
  const getPersonBU = (person: Person): string => {
    if (person.assignedUnits.length === 0) return 'Unassigned';
    const firstUnit = businessUnits.find(u => u.id === person.assignedUnits[0]);
    return firstUnit?.name || 'Unknown';
  };

  // Get available assets for selected vendor and BU
  const getAvailableAssets = (vendor: string): Asset[] => {
    if (!selectedBU) return [];
    
    const assetTypeMap: Record<string, string> = {
      'Coast': 'Coast Workspace',
      'Tiled': 'Tiled Pool'
    };
    
    const assetType = assetTypeMap[vendor];
    if (!assetType) return []; // Synthesia has no assets
    
    // If 'All' is selected, show all active assets of this type
    if (selectedBU === 'All') {
      return assets.filter(asset => 
        asset.type === assetType && 
        asset.status === 'Active'
      );
    }
    
    // Show assets that are:
    // 1. Assigned to this BU, OR
    // 2. Global (no BU assigned - empty businessUnit field)
    return assets.filter(asset => 
      asset.type === assetType && 
      (asset.businessUnit === selectedBU || !asset.businessUnit) &&
      asset.status === 'Active'
    );
  };

  // Calculate metrics for selected BU
  const calculateMetrics = () => {
    const buPeople = getPeopleForBU();
    
    const metrics = {
      totalSpend: '$690.0K', // TODO: Get from vendor-performance data
      licensesByVendor: {} as Record<string, number>,
      assetsByVendor: {} as Record<string, number>,
      inactiveByVendor: {} as Record<string, number>,
      totalPoolCapacity: {} as Record<string, number>
    };

    VENDORS.forEach(vendor => {
      // Count licenses
      const licenses = buPeople.filter(p => 
        p.vendorLicenses?.some(vl => vl.vendor === vendor)
      );
      metrics.licensesByVendor[vendor] = licenses.length;
      
      // Count inactive
      const inactive = buPeople.filter(p =>
        p.vendorLicenses?.some(vl => vl.vendor === vendor && vl.status === 'Inactive')
      );
      metrics.inactiveByVendor[vendor] = inactive.length;
      
      // Count assets by vendor type
      const assetTypeMap: Record<string, string> = {
        'Coast': 'Coast Workspace',
        'Tiled': 'Tiled Pool'
      };
      const assetType = assetTypeMap[vendor];
      if (assetType) {
        // Include both BU-specific and global assets
        const assetFilter = selectedBU === 'All' 
          ? (a: Asset) => a.type === assetType && a.status === 'Active'
          : (a: Asset) => a.type === assetType && (a.businessUnit === selectedBU || !a.businessUnit) && a.status === 'Active';
        
        metrics.assetsByVendor[vendor] = assets.filter(assetFilter).length;
      } else {
        metrics.assetsByVendor[vendor] = 0;
      }
      
      // For Tiled, calculate total pool capacity
      if (vendor === 'Tiled') {
        const poolFilter = selectedBU === 'All'
          ? (a: Asset) => a.type === 'Tiled Pool' && a.status === 'Active'
          : (a: Asset) => a.type === 'Tiled Pool' && (a.businessUnit === selectedBU || !a.businessUnit) && a.status === 'Active';
        
        const tiledPools = assets.filter(poolFilter);
        metrics.totalPoolCapacity['Tiled'] = tiledPools.reduce((sum, pool) => {
          const capacity = pool.conditionalFields?.poolCapacity || 0;
          return sum + (typeof capacity === 'number' ? capacity : parseInt(capacity) || 0);
        }, 0);
      }
    });

    return metrics;
  };

  // Get all licenses for selected BU
  const getAllLicenses = () => {
    const buPeople = getPeopleForBU();
    const licenses: Array<{
      person: Person;
      license: VendorLicense;
    }> = [];

    buPeople.forEach(person => {
      person.vendorLicenses?.forEach(license => {
        licenses.push({ person, license });
      });
    });

    return licenses;
  };

  // Filter licenses by search term
  const getFilteredLicenses = () => {
    let licenses = getAllLicenses();

    if (searchTerm) {
      licenses = licenses.filter(({ person, license }) =>
        person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return licenses;
  };

  // Add license to person
  const handleAddLicense = async () => {
    if (!selectedPerson || !licenseForm.vendor) {
      onNotification?.('error', 'Please fill in all required fields');
      return;
    }

    // Validate asset selection for Coast and Tiled
    if ((licenseForm.vendor === 'Coast' || licenseForm.vendor === 'Tiled') && !licenseForm.linkedAssetId) {
      onNotification?.('error', `Please select a ${licenseForm.vendor === 'Coast' ? 'workspace' : 'pool'} for ${licenseForm.vendor}`);
      return;
    }

    // Validate Tiled pool capacity
    if (licenseForm.vendor === 'Tiled' && licenseForm.linkedAssetId) {
      const pool = assets.find(a => a.id === licenseForm.linkedAssetId);
      if (pool) {
        const capacity = pool.conditionalFields.poolCapacity || 0;
        const currentAssignments = people.filter(p => 
          p.vendorLicenses?.some(vl => 
            vl.vendor === 'Tiled' && 
            vl.linkedAssetId === licenseForm.linkedAssetId &&
            vl.status === 'Active'
          )
        ).length;

        if (currentAssignments >= capacity) {
          onNotification?.('error', `Pool capacity reached (${capacity}/${capacity}). Cannot assign more licenses.`);
          return;
        }
      }
    }

    try {
      const updatedPerson = {
        ...selectedPerson,
        vendorLicenses: [
          ...(selectedPerson.vendorLicenses || []),
          {
            vendor: licenseForm.vendor,
            status: licenseForm.status,
            licenseStartDate: licenseForm.licenseStartDate,
            lastLogin: licenseForm.lastLogin || undefined,
            linkedAssetId: licenseForm.linkedAssetId || undefined
          }
        ]
      };

      const response = await fetch(`http://localhost:3001/api/people/${selectedPerson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPerson)
      });

      const data = await response.json();

      if (data.success) {
        onNotification?.('success', `Added ${licenseForm.vendor} license to ${selectedPerson.firstName} ${selectedPerson.lastName}`);
        fetchData(); // Refresh data
        setShowAddLicenseModal(false);
        setSelectedPerson(null);
        resetLicenseForm();
      } else {
        onNotification?.('error', data.error || 'Failed to add license');
      }
    } catch (error) {
      console.error('Error adding license:', error);
      onNotification?.('error', 'Failed to add license');
    }
  };

  // Confirm and remove license from person
  const confirmRemoveLicense = async () => {
    if (!pendingDelete) return;
    
    const { person, licenseIndex } = pendingDelete;
    
    try {
      const updatedPerson = {
        ...person,
        vendorLicenses: person.vendorLicenses?.filter((_, idx) => idx !== licenseIndex) || []
      };

      const response = await fetch(`http://localhost:3001/api/people/${person.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPerson)
      });

      const data = await response.json();

      if (data.success) {
        onNotification?.('success', 'License removed');
        fetchData();
        setShowDeleteModal(false);
        setPendingDelete(null);
      } else {
        onNotification?.('error', data.error || 'Failed to remove license');
      }
    } catch (error) {
      console.error('Error removing license:', error);
      onNotification?.('error', 'Failed to remove license');
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (person: Person, licenseIndex: number, license: VendorLicense) => {
    setPendingDelete({ person, licenseIndex, license });
    setShowDeleteModal(true);
  };

  const resetLicenseForm = () => {
    setLicenseForm({
      vendor: '',
      status: 'Active',
      licenseStartDate: new Date().toISOString().split('T')[0],
      lastLogin: '',
      linkedAssetId: ''
    });
  };

  const openAddLicenseModal = (person: Person) => {
    setSelectedPerson(person);
    resetLicenseForm();
    setShowAddLicenseModal(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();
  const filteredLicenses = getFilteredLicenses();
  const totalLicenses = Object.values(metrics.licensesByVendor).reduce((a, b) => a + b, 0);
  // Count only client-facing assets (Live Environment, Demo Technology)
  const clientAssetFilter = selectedBU === 'All'
    ? (a: Asset) => (a.type === 'Live Environment' || a.type === 'Demo Technology') && a.status === 'Active'
    : (a: Asset) => (a.type === 'Live Environment' || a.type === 'Demo Technology') && (a.businessUnit === selectedBU || !a.businessUnit) && a.status === 'Active';
  
  const totalAssets = assets.filter(clientAssetFilter).length;
  const totalInactive = Object.values(metrics.inactiveByVendor).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShoppingBag className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-roobert-bold text-white">Vendor Manager</h2>
              <p className="text-sm text-slate-400">Manage vendor licenses by Business Unit</p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* BU Selector */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-3">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-roobert-medium text-slate-400">Business Unit:</span>
          
          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBUDropdown(!showBUDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
            >
              <span className="font-roobert-semibold">{selectedBU || 'Select BU'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showBUDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showBUDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-10">
                {/* All Business Units Option */}
                <button
                  onClick={() => {
                    setSelectedBU('All');
                    setShowBUDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700/40 ${
                    selectedBU === 'All' ? 'bg-purple-600/20 text-purple-300' : 'text-white'
                  }`}
                >
                  <div className="font-roobert-medium">All Business Units</div>
                  <div className="text-xs text-slate-400 mt-0.5">View all licenses across all BUs</div>
                </button>
                
                {businessUnits.map(bu => (
                  <button
                    key={bu.id}
                    onClick={() => {
                      setSelectedBU(bu.name);
                      setShowBUDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700/40 last:border-b-0 ${
                      selectedBU === bu.name ? 'bg-purple-600/20 text-purple-300' : 'text-white'
                    }`}
                  >
                    <div className="font-roobert-medium">{bu.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{bu.fullPath}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="ml-auto text-sm text-slate-400">
            {getPeopleForBU().length} people in this BU • {filteredLicenses.length} licenses
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedBU ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Select a Business Unit to view vendor licenses</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Spend */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <h3 className="text-sm font-roobert-semibold text-slate-400 uppercase tracking-wide">Total Spend</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-4">{metrics.totalSpend}</div>
                <div className="space-y-2">
                  {VENDORS.map(vendor => (
                    <div key={vendor} className="flex justify-between text-sm">
                      <span className="text-slate-400">{vendor}</span>
                      <span className="text-white font-medium">$--K</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Licenses */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-roobert-semibold text-slate-400 uppercase tracking-wide">Licenses</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-4">{totalLicenses}</div>
                <div className="space-y-2">
                  {VENDORS.map(vendor => (
                    <div key={vendor} className="flex justify-between text-sm">
                      <span className="text-slate-400">{vendor}</span>
                      <span className="text-white font-medium">
                        {vendor === 'Tiled' && metrics.totalPoolCapacity['Tiled'] ? 
                          `${metrics.licensesByVendor[vendor] || 0}/${metrics.totalPoolCapacity['Tiled']}` :
                          (metrics.licensesByVendor[vendor] || 0)
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client-Facing Assets */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-orange-400" />
                  <h3 className="text-sm font-roobert-semibold text-slate-400 uppercase tracking-wide">Client Assets</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-4">{totalAssets}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Live Environments</span>
                    <span className="text-white font-medium">
                      {assets.filter(selectedBU === 'All' 
                        ? (a: Asset) => a.type === 'Live Environment' && a.status === 'Active'
                        : (a: Asset) => a.type === 'Live Environment' && (a.businessUnit === selectedBU || !a.businessUnit) && a.status === 'Active'
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Demo Technologies</span>
                    <span className="text-white font-medium">
                      {assets.filter(selectedBU === 'All'
                        ? (a: Asset) => a.type === 'Demo Technology' && a.status === 'Active'
                        : (a: Asset) => a.type === 'Demo Technology' && (a.businessUnit === selectedBU || !a.businessUnit) && a.status === 'Active'
                      ).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inactive Users */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserX className="w-5 h-5 text-red-400" />
                  <h3 className="text-sm font-roobert-semibold text-slate-400 uppercase tracking-wide">Inactive Users</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-4">{totalInactive}</div>
                <div className="space-y-2">
                  {VENDORS.map(vendor => (
                    <div key={vendor} className="flex justify-between text-sm">
                      <span className="text-slate-400">{vendor}</span>
                      <span className="text-red-400 font-medium">{metrics.inactiveByVendor[vendor] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Licenses Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              {/* Table Header */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-roobert-semibold text-white">User Licenses</h2>
                  <div className="text-sm text-slate-400">{filteredLicenses.length} licenses</div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or vendor..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-slate-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-slate-400 uppercase tracking-wider">FIS Product</th>
                      <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-slate-400 uppercase tracking-wider">Demo Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-slate-400 uppercase tracking-wider">Linked Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-slate-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-slate-400 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-right text-xs font-roobert-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredLicenses.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400 mb-4">No licenses in this BU yet</p>
                          <button
                            onClick={() => {
                              const buPeople = getPeopleForBU();
                              if (buPeople.length > 0) {
                                openAddLicenseModal(buPeople[0]);
                              }
                            }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add First License
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredLicenses.map(({ person, license }, idx) => {
                        const linkedAsset = license.linkedAssetId 
                          ? assets.find(a => a.id === license.linkedAssetId) 
                          : null;
                        
                        return (
                          <tr key={`${person.id}-${idx}`} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-white font-medium">{person.firstName} {person.lastName}</div>
                              <div className="text-xs text-slate-400">{person.email}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">{selectedBU === 'All' ? getPersonBU(person) : selectedBU}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm font-medium">
                                {license.vendor}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {linkedAsset ? (
                                <div>
                                  <div className="text-slate-300 text-sm">{linkedAsset.name}</div>
                                  <div className="text-xs text-slate-500">{linkedAsset.type}</div>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-sm italic">No asset</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                license.status === 'Active' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {license.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-300">{license.licenseStartDate}</td>
                            <td className="px-6 py-4 text-slate-300">{license.lastLogin || 'Never'}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => {
                                  const licenseIdx = person.vendorLicenses?.indexOf(license) ?? -1;
                                  if (licenseIdx >= 0) {
                                    openDeleteModal(person, licenseIdx, license);
                                  }
                                }}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Remove license"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add License Button */}
              {getPeopleForBU().length > 0 && (
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                  <button
                    onClick={() => {
                      const buPeople = getPeopleForBU();
                      if (buPeople.length > 0) {
                        // Open modal with first person or let user select
                        setSelectedPerson(null);
                        setShowAddLicenseModal(true);
                      }
                    }}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-roobert-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    Assign Vendor License to Person
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add License Modal */}
      <AnimatePresence>
        {showAddLicenseModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-roobert-semibold text-white">Assign Vendor License</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddLicenseModal(false);
                      setSelectedPerson(null);
                      resetLicenseForm();
                    }}
                    className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Select Person */}
                <div>
                  <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                    Select Person *
                  </label>
                  <select
                    value={selectedPerson?.id || ''}
                    onChange={(e) => {
                      const person = people.find(p => p.id === e.target.value);
                      setSelectedPerson(person || null);
                    }}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select a person</option>
                    {getPeopleForBU().map(person => (
                      <option key={person.id} value={person.id}>
                        {person.firstName} {person.lastName} ({person.email})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-400">
                    {selectedBU === 'All' ? 'Showing all people across all Business Units' : `Only showing people assigned to ${selectedBU}`}
                  </p>
                </div>

                {/* Select Vendor */}
                <div>
                  <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                    Vendor *
                  </label>
                  <select
                    value={licenseForm.vendor}
                    onChange={(e) => setLicenseForm({ ...licenseForm, vendor: e.target.value, linkedAssetId: '' })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select vendor</option>
                    {VENDORS.map(vendor => (
                      <option key={vendor} value={vendor}>{vendor}</option>
                    ))}
                  </select>
                </div>

                {/* Asset Picker - Only for Coast and Tiled */}
                {(licenseForm.vendor === 'Coast' || licenseForm.vendor === 'Tiled') && (
                  <div>
                    <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                      {licenseForm.vendor === 'Coast' ? 'Coast Workspace *' : 'Tiled Pool *'}
                    </label>
                    <select
                      value={licenseForm.linkedAssetId}
                      onChange={(e) => setLicenseForm({ ...licenseForm, linkedAssetId: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select {licenseForm.vendor === 'Coast' ? 'workspace' : 'pool'}</option>
                      {getAvailableAssets(licenseForm.vendor).map(asset => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name}
                          {asset.type === 'Tiled Pool' && asset.conditionalFields.poolCapacity 
                            ? ` (Capacity: ${asset.conditionalFields.poolCapacity})` 
                            : ''}
                        </option>
                      ))}
                    </select>
                    {getAvailableAssets(licenseForm.vendor).length === 0 && (
                      <p className="mt-1 text-xs text-yellow-400">
                        No {licenseForm.vendor === 'Coast' ? 'workspaces' : 'pools'} available{selectedBU !== 'All' ? ` for ${selectedBU}` : ''}. Create one in Asset Manager first.
                      </p>
                    )}
                    {licenseForm.vendor === 'Tiled' && licenseForm.linkedAssetId && (() => {
                      const pool = assets.find(a => a.id === licenseForm.linkedAssetId);
                      if (pool) {
                        const capacity = pool.conditionalFields.poolCapacity || 0;
                        const currentAssignments = people.filter(p => 
                          p.vendorLicenses?.some(vl => 
                            vl.vendor === 'Tiled' && 
                            vl.linkedAssetId === licenseForm.linkedAssetId &&
                            vl.status === 'Active'
                          )
                        ).length;
                        return (
                          <p className="mt-1 text-xs text-slate-400">
                            Pool usage: {currentAssignments}/{capacity} licenses assigned
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={licenseForm.status}
                    onChange={(e) => setLicenseForm({ ...licenseForm, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* License Start Date */}
                <div>
                  <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                    License Start Date *
                  </label>
                  <input
                    type="date"
                    value={licenseForm.licenseStartDate}
                    onChange={(e) => setLicenseForm({ ...licenseForm, licenseStartDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Last Login (Optional) */}
                <div>
                  <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                    Last Login (Optional)
                  </label>
                  <input
                    type="text"
                    value={licenseForm.lastLogin}
                    onChange={(e) => setLicenseForm({ ...licenseForm, lastLogin: e.target.value })}
                    placeholder="e.g., Today, 2d ago, 1w ago"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddLicenseModal(false);
                    setSelectedPerson(null);
                    resetLicenseForm();
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLicense}
                  disabled={!selectedPerson || !licenseForm.vendor}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Assign License
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete License Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && pendingDelete && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-700"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-roobert-semibold text-white mb-2">
                      Remove License
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">
                      Are you sure you want to remove the <span className="text-purple-400 font-medium">{pendingDelete.license.vendor}</span> license from{' '}
                      <span className="text-white font-medium">{pendingDelete.person.firstName} {pendingDelete.person.lastName}</span>?
                    </p>
                    {pendingDelete.license.linkedAssetId && (
                      <p className="text-xs text-slate-500">
                        This will free up capacity in the linked {pendingDelete.license.vendor === 'Coast' ? 'workspace' : 'pool'}.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/50 px-6 py-4 flex gap-3 justify-end border-t border-slate-700">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPendingDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-roobert-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveLicense}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-roobert-semibold transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove License
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
