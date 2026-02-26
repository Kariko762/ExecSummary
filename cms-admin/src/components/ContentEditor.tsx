import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Edit, Download, X } from 'lucide-react';
import LeadershipSummaryEditor from './LeadershipSummaryEditor';
import VendorSummaryEditor from './VendorSummaryEditor';

interface ContentEditorProps {
  contentId: string;
  category: string;
  contentTitle?: string;
  onClose?: () => void;
  showNotification?: (type: 'success' | 'error', message: string) => void;
}

export default function ContentEditor({ contentId, category, contentTitle, onClose, showNotification }: ContentEditorProps) {
  const [ContentComponent, setContentComponent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentData, setContentData] = useState<any>(null);
  const [contentMeta, setContentMeta] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [exportHandler, setExportHandler] = useState<(() => void) | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadContent();
  }, [contentId, category]);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      
      // Special handling for JSON-only content (vendor and leadership)
      if (category === 'vendor' || category === 'leadership') {
        try {
          // Fetch JSON data from backend
          const response = await fetch(`http://localhost:3001/api/content/${contentId}`);
          if (response.ok) {
            const jsonData = await response.json();
            const contentData = jsonData?.content || jsonData;
            setContentData(contentData);
            
            // Import the appropriate shared component
            if (category === 'vendor') {
              const module = await import('../content-tsx/vendor/vendor-overview.tsx');
              setContentComponent(() => module.default);
              setContentMeta(module.CONTENT_META);
            } else if (category === 'leadership') {
              // Use LeadershipTemplate for leadership content
              const module = await import('../templates/LeadershipTemplate.tsx');
              setContentComponent(() => module.default);
              setContentMeta({
                id: contentId,
                category: 'leadership',
                title: contentData.meta?.title || 'Leadership Summary',
                status: contentData.meta?.status || 'published'
              });
            }
          } else {
            console.error(`Failed to load content from backend: ${contentId}`);
          }
        } catch (error) {
          console.error('Error loading content:', error);
        }
      } else {
        // Standard content loading (existing logic)
        // Load JSON data from backend
        const jsonResponse = await fetch(`http://localhost:3001/api/content/${contentId}`);
        if (jsonResponse.ok) {
          const jsonData = await jsonResponse.json();
          setContentData(jsonData?.content || jsonData);
        }
        
        // Dynamic import of TSX component based on category and ID
        const filePath = contentId 
          ? `../content-tsx/${category}/${contentId}.tsx`
          : `../content-tsx/${category}/weekly-summary-jan-20-2026.tsx`;

        const module = await import(/* @vite-ignore */ filePath);
        
        setContentComponent(() => module.default);
        setContentMeta(module.CONTENT_META);
      }
      
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    console.log('Saving content:', data);
    
    // Save JSON data to backend
    try {
      const response = await fetch('http://localhost:3001/api/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contentId,
          category,
          data
        })
      });

      if (response.ok) {
        console.log('Content saved successfully');
        setContentData(data); // Update local state
        setShowEditor(false); // Close editor
        
        // Reload the component to show updated data
        await loadContent();
      }
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl font-roobert-medium">Loading content...</div>
      </div>
    );
  }

  if (!ContentComponent) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl font-roobert-medium mb-4">Content not found</div>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Editor Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-roobert-bold text-white">
          {contentMeta?.title || contentTitle || contentId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportHandler && exportHandler()}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Export"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowEditor(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Edit Content"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <ContentComponent 
          onSave={handleSave}
          data={contentData}
          onExportReady={setExportHandler}
          contentRef={contentRef}
        />
      </div>

      {/* Editor Modal */}
      {showEditor && contentData && category === 'leadership' && (
        <LeadershipSummaryEditor
          data={contentData}
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
          showNotification={showNotification}
        />
      )}
      
      {showEditor && contentData && category === 'vendor' && (
        <VendorSummaryEditor
          data={contentData}
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}
