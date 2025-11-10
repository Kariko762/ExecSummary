import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, ArrowLeft, Save, RotateCcw, Eye, EyeOff, Upload, Image as ImageIcon, X, FileText } from 'lucide-react';
import { ChangeManagementModal } from './ChangeManagementModal';

/**
 * System Settings Manager
 * 
 * Manages system-wide configuration:
 * - Authentication settings (Parent App / CMS Admin)
 * - User management
 * - Security settings
 * - System preferences
 */

interface AuthenticationSettings {
  parentApp: {
    requireLogin: boolean;
  };
  cmsAdmin: {
    requireLogin: boolean;
  };
}

interface SystemSettings {
  authentication: AuthenticationSettings;
  customLogo?: string; // Path to custom logo image
  version: string;
  lastUpdated: string;
}

interface SystemSettingsManagerProps {
  onClose?: () => void;
  onNotification?: (type: 'success' | 'error', message: string) => void;
}

const DEFAULT_SETTINGS: SystemSettings = {
  authentication: {
    parentApp: {
      requireLogin: false,
    },
    cmsAdmin: {
      requireLogin: false,
    },
  },
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
};

const STORAGE_KEY = 'system-settings';

export default function SystemSettingsManager({ onClose, onNotification }: SystemSettingsManagerProps) {
  const loadSettings = (): SystemSettings => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load system settings:', error);
    }
    return DEFAULT_SETTINGS;
  };

  const [settings, setSettings] = useState<SystemSettings>(loadSettings());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'authentication' | 'users' | 'security' | 'documentation'>('authentication');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showChangeManagement, setShowChangeManagement] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...settings,
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      
      // Brief delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setSettings(dataToSave);
      setHasChanges(false);
      onNotification?.('success', 'System settings saved successfully!');
    } catch (error) {
      console.error('Failed to save system settings:', error);
      onNotification?.('error', 'Failed to save system settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all system settings to defaults? This will disable all authentication.')) {
      setSettings(DEFAULT_SETTINGS);
      setHasChanges(true);
      onNotification?.('success', 'Settings reset to defaults (not saved yet)');
    }
  };

  const updateAuthSetting = (app: 'parentApp' | 'cmsAdmin', value: boolean) => {
    setSettings(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        [app]: {
          requireLogin: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onNotification?.('error', 'Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      onNotification?.('error', 'Image must be smaller than 2MB');
      return;
    }

    setUploadingLogo(true);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('http://localhost:3001/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      setSettings(prev => ({
        ...prev,
        customLogo: data.url,
      }));
      setHasChanges(true);
      onNotification?.('success', 'Logo uploaded successfully!');
    } catch (error) {
      console.error('Logo upload failed:', error);
      onNotification?.('error', 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({
      ...prev,
      customLogo: undefined,
    }));
    setHasChanges(true);
    onNotification?.('success', 'Logo removed (not saved yet)');
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Settings className="w-6 h-6 text-fis-eggplant dark:text-fis-raspberry" />
                  <h1 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    System Settings
                  </h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configure system-wide settings and authentication
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-roobert-medium">Reset</span>
              </button>

              <button
                onClick={handleSave}
                disabled={!hasChanges && !isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-fis-eggplant dark:bg-fis-raspberry text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-roobert-semibold">
                  {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
                </span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <TabButton
              active={activeTab === 'authentication'}
              onClick={() => setActiveTab('authentication')}
              icon={<Shield className="w-4 h-4" />}
              label="Authentication"
            />
            <TabButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              icon={<Shield className="w-4 h-4" />}
              label="Users"
              disabled
            />
            <TabButton
              active={activeTab === 'security'}
              onClick={() => setActiveTab('security')}
              icon={<Shield className="w-4 h-4" />}
              label="Security"
              disabled
            />
            <TabButton
              active={activeTab === 'documentation'}
              onClick={() => setActiveTab('documentation')}
              icon={<FileText className="w-4 h-4" />}
              label="Documentation"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'authentication' && (
          <AuthenticationPanel
            settings={settings.authentication}
            customLogo={settings.customLogo}
            onUpdate={updateAuthSetting}
            onLogoUpload={handleLogoUpload}
            onLogoRemove={handleRemoveLogo}
            uploadingLogo={uploadingLogo}
          />
        )}
        
        {activeTab === 'users' && (
          <div className="text-center py-12 text-gray-500">
            User management coming soon...
          </div>
        )}
        
        {activeTab === 'security' && (
          <div className="text-center py-12 text-gray-500">
            Security settings coming soon...
          </div>
        )}

        {activeTab === 'documentation' && (
          <div className="space-y-6">
            <button
              onClick={() => setShowChangeManagement(true)}
              className="glass-strong p-6 rounded-xl hover:scale-105 transition-all text-left border-2 border-fis-eggplant/30 w-full"
            >
              <FileText className="w-8 h-8 text-fis-eggplant mb-3" />
              <h3 className="font-roobert-semibold text-lg mb-2">Change Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Release notes, changelog, development tasks
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Change Management Modal */}
      {showChangeManagement && (
        <ChangeManagementModal onClose={() => setShowChangeManagement(false)} />
      )}
    </div>
  );
}

// Tab Button Component
function TabButton({ 
  active, 
  onClick, 
  icon, 
  label, 
  disabled 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-roobert-medium text-sm transition-colors ${
        active
          ? 'bg-fis-eggplant dark:bg-fis-raspberry text-white'
          : disabled
          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Authentication Panel
function AuthenticationPanel({ 
  settings,
  customLogo,
  onUpdate,
  onLogoUpload,
  onLogoRemove,
  uploadingLogo
}: { 
  settings: AuthenticationSettings;
  customLogo?: string;
  onUpdate: (app: 'parentApp' | 'cmsAdmin', value: boolean) => void;
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove: () => void;
  uploadingLogo: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-roobert-semibold mb-1">Authentication Controls</p>
            <p>Enable login requirements to force user authentication before accessing the application. When disabled, users can access the app directly without logging in.</p>
          </div>
        </div>
      </div>

      {/* Custom Logo Upload */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-1">
            Custom Logo
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload a custom logo to replace the FIS logo across both applications
          </p>
        </div>

        <div className="space-y-4">
          {/* Logo Preview */}
          {customLogo && (
            <div className="relative inline-block">
              <img 
                src={customLogo} 
                alt="Custom Logo" 
                className="h-16 w-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-900"
              />
              <button
                onClick={onLogoRemove}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove logo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Upload Button */}
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={onLogoUpload}
                className="hidden"
                disabled={uploadingLogo}
              />
              {uploadingLogo ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                    {customLogo ? 'Replace Logo' : 'Upload Logo'}
                  </span>
                </>
              )}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Recommended: PNG or SVG, max 2MB. For best results, use a transparent background.
            </p>
          </div>
        </div>
      </div>

      {/* Parent App Authentication */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-1">
              Executive Summary App
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control authentication for the main executive summary dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            {settings.parentApp.requireLogin ? (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                <Eye className="w-3 h-3" />
                <span className="text-xs font-roobert-semibold">Login Required</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <EyeOff className="w-3 h-3" />
                <span className="text-xs font-roobert-semibold">Open Access</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div>
            <div className="font-roobert-medium text-sm text-gray-900 dark:text-white mb-1">
              Require Login
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {settings.parentApp.requireLogin ? 'Users must authenticate to access' : 'Open access, no login required'}
            </div>
          </div>
          <button
            onClick={() => onUpdate('parentApp', !settings.parentApp.requireLogin)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.parentApp.requireLogin ? 'bg-fis-eggplant dark:bg-fis-raspberry' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.parentApp.requireLogin ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* CMS Admin Authentication */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-1">
              CMS Admin Panel
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control authentication for the content management system
            </p>
          </div>
          <div className="flex items-center gap-2">
            {settings.cmsAdmin.requireLogin ? (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                <Eye className="w-3 h-3" />
                <span className="text-xs font-roobert-semibold">Login Required</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <EyeOff className="w-3 h-3" />
                <span className="text-xs font-roobert-semibold">Open Access</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div>
            <div className="font-roobert-medium text-sm text-gray-900 dark:text-white mb-1">
              Require Login
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {settings.cmsAdmin.requireLogin ? 'Users must authenticate to access CMS' : 'Open access, no login required'}
            </div>
          </div>
          <button
            onClick={() => onUpdate('cmsAdmin', !settings.cmsAdmin.requireLogin)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.cmsAdmin.requireLogin ? 'bg-fis-eggplant dark:bg-fis-raspberry' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.cmsAdmin.requireLogin ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-300">
            <p className="font-roobert-semibold mb-1">Note on User Management</p>
            <p>User credentials and permissions will be managed via JSON files. The Users tab (coming soon) will allow you to create, edit, and manage user accounts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
