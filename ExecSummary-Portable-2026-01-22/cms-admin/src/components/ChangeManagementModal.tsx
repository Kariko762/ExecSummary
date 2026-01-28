import { ContentModalFixedMenu } from './ContentModalFixedMenu';
import { useState, useEffect } from 'react';

interface ChangeManagementModalProps {
  onClose: () => void;
}

interface ContentSection {
  id: string;
  title: string;
  groupId?: string;
  order: number;
  content: string;
}

interface ContentGroup {
  id: string;
  title: string;
  order: number;
}

interface ChangeManagementData {
  id: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  collapsible: boolean;
  groups: ContentGroup[];
  sections: ContentSection[];
}

export const ChangeManagementModal: React.FC<ChangeManagementModalProps> = ({ onClose }) => {
  const [data, setData] = useState<ChangeManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load change management data from JSON
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/change-management.json');
        if (!response.ok) throw new Error('Failed to load change management data');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error loading change management data:', err);
        setError('Failed to load change management data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-strong rounded-2xl p-8 border border-white/20">
          <p className="text-gray-900 dark:text-white">Loading change management data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
        <div className="glass-strong rounded-2xl p-8 border border-white/20">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'No data available'}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-fis-eggplant text-white rounded-lg hover:bg-fis-eggplant/90"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <ContentModalFixedMenu
      title={data.title}
      subtitle={data.subtitle}
      sections={data.sections}
      groups={data.groups}
      collapsible={data.collapsible}
      onClose={onClose}
    />
  );
};
