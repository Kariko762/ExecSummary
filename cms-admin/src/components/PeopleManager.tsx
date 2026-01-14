import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, Edit, Trash2, Search, X, Mail, Briefcase, Building2 } from 'lucide-react';

interface Person {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  function: string;
  assignedUnits: string[];
}

interface BusinessUnit {
  id: string;
  name: string;
  level: string;
  fullPath: string;
}

interface PeopleManagerProps {
  onNotification?: (type: 'success' | 'error', message: string) => void;
}

type FilterMode = 'byName' | 'byOrg';

export default function PeopleManager({ onNotification }: PeopleManagerProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [allUnits, setAllUnits] = useState<BusinessUnit[]>([]); // All units for org filtering
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Unit assignment filtering
  const [filterMode, setFilterMode] = useState<FilterMode>('byName');
  const [unitSearchTerm, setUnitSearchTerm] = useState('');
  const [selectedBU, setSelectedBU] = useState<string>('');
  const [selectedL3, setSelectedL3] = useState<string>('');
  const [selectedL4, setSelectedL4] = useState<string>('');
  const [selectedL5, setSelectedL5] = useState<string>('');
  const [selectedL6, setSelectedL6] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    function: '',
    assignedUnits: [] as string[]
  });

  useEffect(() => {
    fetchPeople();
    fetchUnits();
  }, []);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/people');
      const data = await response.json();
      
      if (data.success) {
        setPeople(data.people);
      }
    } catch (error) {
      console.error('Error fetching people:', error);
      onNotification?.('error', 'Failed to load people');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/business-units');
      const data = await response.json();
      
      if (data.success) {
        setAllUnits(data.units); // Store all units for hierarchical filtering
        // Filter to only L7 units (products) for the main list
        const l7Units = data.units.filter((u: BusinessUnit) => u.level === 'L7');
        setUnits(l7Units);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        onNotification?.('success', `Added ${formData.firstName} ${formData.lastName}`);
        setShowAddModal(false);
        resetForm();
        fetchPeople();
      } else {
        onNotification?.('error', data.error || 'Failed to create person');
      }
    } catch (error) {
      console.error('Error creating person:', error);
      onNotification?.('error', 'Failed to create person');
    }
  };

  const handleUpdate = async () => {
    if (!editingPerson) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/people/${editingPerson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        onNotification?.('success', `Updated ${formData.firstName} ${formData.lastName}`);
        setShowEditModal(false);
        setEditingPerson(null);
        resetForm();
        fetchPeople();
      } else {
        onNotification?.('error', data.error || 'Failed to update person');
      }
    } catch (error) {
      console.error('Error updating person:', error);
      onNotification?.('error', 'Failed to update person');
    }
  };

  const handleDelete = async (person: Person) => {
    if (!confirm(`Delete "${person.firstName} ${person.lastName}"? This action cannot be undone.`)) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/people/${person.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        onNotification?.('success', `Deleted ${person.firstName} ${person.lastName}`);
        fetchPeople();
      } else {
        onNotification?.('error', data.error || 'Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      onNotification?.('error', 'Failed to delete person');
    }
  };

  const openEditModal = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      email: person.email,
      firstName: person.firstName,
      lastName: person.lastName,
      role: person.role,
      function: person.function,
      assignedUnits: person.assignedUnits
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: '',
      function: '',
      assignedUnits: []
    });
    setFilterMode('byName');
    setUnitSearchTerm('');
    setSelectedBU('');
    setSelectedL3('');
    setSelectedL4('');
    setSelectedL5('');
    setSelectedL6('');
  };

  const toggleUnitAssignment = (unitId: string) => {
    const newAssignments = formData.assignedUnits.includes(unitId)
      ? formData.assignedUnits.filter(id => id !== unitId)
      : [...formData.assignedUnits, unitId];
    setFormData({ ...formData, assignedUnits: newAssignments });
  };

  // Get units filtered by search or hierarchy
  const getFilteredL7Units = () => {
    if (filterMode === 'byName') {
      // Search by name
      if (!unitSearchTerm) return units;
      const searchLower = unitSearchTerm.toLowerCase();
      return units.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.fullPath.toLowerCase().includes(searchLower)
      );
    } else {
      // Filter by org hierarchy
      let filtered = units;
      
      // If L6 selected, show only children of L6
      if (selectedL6) {
        filtered = filtered.filter(u => u.parentId === selectedL6);
      }
      // Else if L5 selected, show only L7 units under L5 hierarchy
      else if (selectedL5) {
        const l6Units = allUnits.filter(u => u.level === 'L6' && u.parentId === selectedL5);
        const l6Ids = l6Units.map(u => u.id);
        filtered = filtered.filter(u => l6Ids.includes(u.parentId || ''));
      }
      // Else if L4 selected, show L7 units under L4 hierarchy
      else if (selectedL4) {
        const descendants = getDescendantIds(selectedL4);
        filtered = filtered.filter(u => descendants.includes(u.parentId || ''));
      }
      // Else if L3 selected, show L7 units under L3 hierarchy
      else if (selectedL3) {
        const descendants = getDescendantIds(selectedL3);
        filtered = filtered.filter(u => descendants.includes(u.parentId || ''));
      }
      // Else if BU selected, show L7 units under BU hierarchy
      else if (selectedBU) {
        const descendants = getDescendantIds(selectedBU);
        filtered = filtered.filter(u => descendants.includes(u.parentId || ''));
      }
      
      return filtered;
    }
  };

  // Get all descendant IDs recursively
  const getDescendantIds = (parentId: string): string[] => {
    const children = allUnits.filter(u => u.parentId === parentId);
    const childIds = children.map(c => c.id);
    const grandchildIds = children.flatMap(c => getDescendantIds(c.id));
    return [...childIds, ...grandchildIds];
  };

  // Get units for dropdown based on level and selected parents
  const getBUOptions = () => allUnits.filter(u => u.level === 'BU');
  
  const getL3Options = () => {
    if (!selectedBU) return [];
    return allUnits.filter(u => u.level === 'L3' && u.parentId === selectedBU);
  };
  
  const getL4Options = () => {
    if (!selectedL3) return [];
    return allUnits.filter(u => u.level === 'L4' && u.parentId === selectedL3);
  };
  
  const getL5Options = () => {
    if (!selectedL4) return [];
    return allUnits.filter(u => u.level === 'L5' && u.parentId === selectedL4);
  };
  
  const getL6Options = () => {
    if (!selectedL5) return [];
    return allUnits.filter(u => u.level === 'L6' && u.parentId === selectedL5);
  };

  const getUnitNames = (unitIds: string[]) => {
    return unitIds
      .map(id => units.find(u => u.id === id)?.name)
      .filter(Boolean)
      .join(', ') || 'None';
  };

  const filteredPeople = people.filter(person => {
    const searchLower = searchTerm.toLowerCase();
    return (
      person.firstName.toLowerCase().includes(searchLower) ||
      person.lastName.toLowerCase().includes(searchLower) ||
      person.email.toLowerCase().includes(searchLower) ||
      person.role.toLowerCase().includes(searchLower) ||
      person.function.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Outside Container */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
            People Directory
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage people and their L7 unit assignments
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-roobert-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Person
        </button>
      </div>

      {/* Search - Outside Container */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, role, or function..."
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
      </div>

      {/* People Table - Inside Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {filteredPeople.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{searchTerm ? 'No people match your search.' : 'No people yet. Add your first person to get started.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Function
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Assigned Units
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPeople.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-roobert-semibold text-sm">
                          {person.firstName[0]}{person.lastName[0]}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-roobert-medium text-gray-900 dark:text-white">
                            {person.firstName} {person.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 mr-2" />
                        {person.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {person.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {person.function}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-start">
                        <Building2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="max-w-xs truncate" title={getUnitNames(person.assignedUnits)}>
                          {getUnitNames(person.assignedUnits)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(person)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(person)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
                    {showEditModal ? 'Edit Person' : 'Add Person'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingPerson(null);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    placeholder="john.smith@company.com"
                  />
                </div>

                {/* Role & Function */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="Senior Analyst"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                      Function
                    </label>
                    <input
                      type="text"
                      value={formData.function}
                      onChange={(e) => setFormData({ ...formData, function: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="Risk Management"
                    />
                  </div>
                </div>

                {/* Assigned Units */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                      Assigned Units (L7 Products)
                    </label>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setFilterMode('byName');
                          setSelectedBU('');
                          setSelectedL3('');
                          setSelectedL4('');
                          setSelectedL5('');
                          setSelectedL6('');
                        }}
                        className={`px-3 py-1 rounded text-xs font-roobert-medium transition-colors ${
                          filterMode === 'byName'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        By Name
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterMode('byOrg');
                          setUnitSearchTerm('');
                        }}
                        className={`px-3 py-1 rounded text-xs font-roobert-medium transition-colors ${
                          filterMode === 'byOrg'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        By Org
                      </button>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  {filterMode === 'byName' ? (
                    <div className="mb-3">
                      <input
                        type="text"
                        value={unitSearchTerm}
                        onChange={(e) => setUnitSearchTerm(e.target.value)}
                        placeholder="Search product names..."
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <select
                        value={selectedBU}
                        onChange={(e) => {
                          setSelectedBU(e.target.value);
                          setSelectedL3('');
                          setSelectedL4('');
                          setSelectedL5('');
                          setSelectedL6('');
                        }}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      >
                        <option value="">Select BU...</option>
                        {getBUOptions().map(bu => (
                          <option key={bu.id} value={bu.id}>{bu.name}</option>
                        ))}
                      </select>
                      <select
                        value={selectedL3}
                        onChange={(e) => {
                          setSelectedL3(e.target.value);
                          setSelectedL4('');
                          setSelectedL5('');
                          setSelectedL6('');
                        }}
                        disabled={!selectedBU}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50"
                      >
                        <option value="">Select L3...</option>
                        {getL3Options().map(l3 => (
                          <option key={l3.id} value={l3.id}>{l3.name}</option>
                        ))}
                      </select>
                      <select
                        value={selectedL4}
                        onChange={(e) => {
                          setSelectedL4(e.target.value);
                          setSelectedL5('');
                          setSelectedL6('');
                        }}
                        disabled={!selectedL3}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50"
                      >
                        <option value="">Select L4...</option>
                        {getL4Options().map(l4 => (
                          <option key={l4.id} value={l4.id}>{l4.name}</option>
                        ))}
                      </select>
                      <select
                        value={selectedL5}
                        onChange={(e) => {
                          setSelectedL5(e.target.value);
                          setSelectedL6('');
                        }}
                        disabled={!selectedL4}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50"
                      >
                        <option value="">Select L5...</option>
                        {getL5Options().map(l5 => (
                          <option key={l5.id} value={l5.id}>{l5.name}</option>
                        ))}
                      </select>
                      <select
                        value={selectedL6}
                        onChange={(e) => setSelectedL6(e.target.value)}
                        disabled={!selectedL5}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 col-span-2"
                      >
                        <option value="">Select L6...</option>
                        {getL6Options().map(l6 => (
                          <option key={l6.id} value={l6.id}>{l6.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Units List */}
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                    {units.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No L7 units available. Create business units first.
                      </p>
                    ) : getFilteredL7Units().length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No products match your filter. Try adjusting your search.
                      </p>
                    ) : (
                      getFilteredL7Units().map(unit => (
                        <label
                          key={unit.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedUnits.includes(unit.id)}
                            onChange={() => toggleUnitAssignment(unit.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-roobert-medium text-gray-900 dark:text-white">
                              {unit.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {unit.fullPath}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {formData.assignedUnits.length} unit(s) selected. Person will appear in all parent units.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingPerson(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditModal ? handleUpdate : handleCreate}
                  disabled={!formData.email || !formData.firstName || !formData.lastName}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {showEditModal ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
