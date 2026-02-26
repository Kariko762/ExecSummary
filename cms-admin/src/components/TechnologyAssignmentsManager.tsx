import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Plus, Edit, Trash2, Search, X, Save, Building2,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

interface Person {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  function: string;
  assignedUnits: string[];
}

interface TechnologyAssignment {
  id: string;
  technology: string;
  userId: string;
  businessUnit: string;
  status: 'Active' | 'Inactive' | 'Disabled';
  createdDate: string;
  modifiedDate: string;
  userDetails?: {
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    function: string;
  };
}

interface TechnologyAssignmentsManagerProps {
  onNotification?: (type: 'success' | 'error', message: string) => void;
  onClose?: () => void;
}

// List of available technologies/platforms
const TECHNOLOGIES = [
  'Salesforce',
  'SharePoint',
  'Microsoft 365',
  'Adobe Creative Cloud',
  'Slack',
  'Zoom',
  'Jira',
  'Confluence',
  'GitHub',
  'AWS Console',
  'Azure Portal',
  'Google Workspace',
  'Tableau',
  'Power BI'
];

const STATUSES: Array<'Active' | 'Inactive' | 'Disabled'> = ['Active', 'Inactive', 'Disabled'];

export default function TechnologyAssignmentsManager({ onNotification, onClose }: TechnologyAssignmentsManagerProps) {
  const [assignments, setAssignments] = useState<TechnologyAssignment[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TechnologyAssignment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTechnology, setFilterTechnology] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<TechnologyAssignment | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    technology: '',
    userId: '',
    businessUnit: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Disabled'
  });

  useEffect(() => {
    fetchAssignments();
    fetchPeople();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/technology-assignments');
      const data = await response.json();
      
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      onNotification?.('error', 'Failed to load technology assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeople = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/people');
      const data = await response.json();
      
      if (data.success) {
        setPeople(data.people);
      }
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.technology || !formData.userId || !formData.businessUnit) {
        onNotification?.('error', 'Please fill in all required fields');
        return;
      }

      const response = await fetch('http://localhost:3001/api/technology-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onNotification?.('success', 'Technology assignment created');
        fetchAssignments();
        setShowAddModal(false);
        resetForm();
      } else {
        onNotification?.('error', data.error || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      onNotification?.('error', 'Failed to create assignment');
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editingAssignment) return;

      const response = await fetch(`http://localhost:3001/api/technology-assignments/${editingAssignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onNotification?.('success', 'Assignment updated');
        fetchAssignments();
        setShowEditModal(false);
        setEditingAssignment(null);
        resetForm();
      } else {
        onNotification?.('error', data.error || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      onNotification?.('error', 'Failed to update assignment');
    }
  };

  const handleDelete = (assignment: TechnologyAssignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      const response = await fetch(`http://localhost:3001/api/technology-assignments/${assignmentToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        onNotification?.('success', 'Assignment deleted');
        fetchAssignments();
        setShowDeleteConfirm(false);
        setAssignmentToDelete(null);
      } else {
        onNotification?.('error', data.error || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      onNotification?.('error', 'Failed to delete assignment');
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (assignment: TechnologyAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      technology: assignment.technology,
      userId: assignment.userId,
      businessUnit: assignment.businessUnit,
      status: assignment.status
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      technology: '',
      userId: '',
      businessUnit: '',
      status: 'Active'
    });
  };

  // When user is selected, auto-populate business unit
  const handleUserSelect = (userId: string) => {
    const person = people.find(p => p.id === userId);
    if (person && person.assignedUnits.length > 0) {
      setFormData({
        ...formData,
        userId,
        businessUnit: person.assignedUnits[0] // Use first assigned unit
      });
    } else {
      setFormData({
        ...formData,
        userId,
        businessUnit: ''
      });
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      searchTerm === '' ||
      assignment.technology.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.userDetails?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.userDetails?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.businessUnit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTechnology = 
      filterTechnology === '' || 
      assignment.technology === filterTechnology;
    
    const matchesStatus = 
      filterStatus === '' || 
      assignment.status === filterStatus;
    
    return matchesSearch && matchesTechnology && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Inactive':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'Disabled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 w-[95vw] h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/40 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-roobert-semibold text-white">Technology Assignments</h2>
              <p className="text-sm text-slate-400 font-roobert-light">Manage user access to technologies and platforms</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="Add Assignment"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by technology, user, email, or business unit..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/40">
                <div className="text-sm text-slate-400 mb-1">Total Assignments</div>
                <div className="text-2xl font-roobert-semibold text-white">{assignments.length}</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/40">
                <div className="text-sm text-slate-400 mb-1">Active</div>
                <div className="text-2xl font-roobert-semibold text-green-400">
                  {assignments.filter(a => a.status === 'Active').length}
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/40">
                <div className="text-sm text-slate-400 mb-1">Search Results</div>
                <div className="text-2xl font-roobert-semibold text-purple-400">{filteredAssignments.length}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Technology Filter */}
                <div>
                  <select
                    value={filterTechnology}
                    onChange={(e) => setFilterTechnology(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Technologies</option>
                    {TECHNOLOGIES.map(tech => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Statuses</option>
                    {STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Total Assignments</div>
            <div className="text-2xl font-bold text-white">{assignments.length}</div>
          </div>
          <div className="bg-emerald-900/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-700/50">
            <div className="text-emerald-400 text-sm mb-1">Active</div>
            <div className="text-2xl font-bold text-white">
              {assignments.filter(a => a.status === 'Active').length}
            </div>
          </div>
          <div className="bg-yellow-900/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-700/50">
            <div className="text-yellow-400 text-sm mb-1">Inactive</div>
            <div className="text-2xl font-bold text-white">
              {assignments.filter(a => a.status === 'Inactive').length}
            </div>
          </div>
          <div className="bg-red-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-700/50">
            <div className="text-red-400 text-sm mb-1">Disabled</div>
            <div className="text-2xl font-bold text-white">
              {assignments.filter(a => a.status === 'Disabled').length}
            </div>
          </div>
        </div>

            {/* Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Technology</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Business Unit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Created Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Modified Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Loading assignments...
                    </td>
                  </tr>
                ) : filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No assignments found
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-medium">{assignment.technology}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{assignment.userDetails?.fullName || 'Unknown'}</div>
                        <div className="text-xs text-slate-400">{assignment.userDetails?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-cyan-400" />
                          <span className="text-slate-300">{assignment.businessUnit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{formatDate(assignment.createdDate)}</td>
                      <td className="px-6 py-4 text-slate-300">{formatDate(assignment.modifiedDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(assignment.status)}
                          <span className={`text-sm font-medium ${
                            assignment.status === 'Active' ? 'text-green-400' :
                            assignment.status === 'Inactive' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {assignment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(assignment)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(assignment)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setEditingAssignment(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {showAddModal ? 'Add Assignment' : 'Edit Assignment'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingAssignment(null);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Technology Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Technology *
                  </label>
                  <select
                    value={formData.technology}
                    onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Technology</option>
                    {TECHNOLOGIES.map(tech => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>

                {/* User Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    User *
                  </label>
                  <select
                    value={formData.userId}
                    onChange={(e) => handleUserSelect(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select User</option>
                    {people.map(person => (
                      <option key={person.id} value={person.id}>
                        {person.firstName} {person.lastName} ({person.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Business Unit (auto-populated) */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Unit *
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-white">
                      {formData.businessUnit || 'Select a user first'}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={showAddModal ? handleCreate : handleUpdate}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {showAddModal ? 'Create' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingAssignment(null);
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && assignmentToDelete && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 w-full max-w-md"
            >
              <div className="p-6 border-b border-slate-700/40 bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-roobert-semibold text-white">
                    Confirm Deletion
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-slate-300 mb-2">
                  Are you sure you want to delete the <span className="font-roobert-semibold text-white">{assignmentToDelete.technology}</span> assignment for <span className="font-roobert-semibold text-white">{assignmentToDelete.userDetails?.fullName}</span>?
                </p>
                <p className="text-red-400 text-sm mb-6 font-roobert-medium">
                  This action is permanent and cannot be undone.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={confirmDelete}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-roobert-semibold flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setAssignmentToDelete(null);
                    }}
                    className="w-full px-4 py-3 border border-slate-600 hover:bg-slate-800/50 text-slate-300 rounded-lg transition-colors font-roobert-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}
