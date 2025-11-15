import { ExecutiveSummary, ExecutiveIQ, TimelineItem } from '../types';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// State to hold loaded data
let timelineData: TimelineItem[] = [];
let isLoaded = false;
let loadingPromise: Promise<void> | null = null;

// Function to load data from backend API
async function loadTimelineData(): Promise<void> {
  if (isLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content`);
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }
      
      const allContent = await response.json();
      
      // Map content based on tag type - filter by published status
      timelineData = allContent
        .filter((item: any) => {
          const tag = item._contentTag;
          const isRelevantTag = tag === 'executive-summary' || tag === 'executive-iq' || tag === 'weekly-summary';
          const isPublished = item.status === 'published';
          return isRelevantTag && isPublished;
        })
        .map((item: any) => {
          // Map weekly-summary to executive-summary format for display
          if (item._contentTag === 'weekly-summary') {
            return { ...item, type: 'summary' as const, isNew: isNewContent(item.date) };
          } else if (item._contentTag === 'executive-iq') {
            return { ...item, type: 'executive-iq' as const, isNew: isNewContent(item.date) };
          } else if (item._contentTag === 'executive-summary') {
            return { ...item, type: 'summary' as const, isNew: isNewContent(item.date) };
          }
          return item;
        });
      
      // Update the exported array reference
      timelineItems.length = 0;
      timelineItems.push(...timelineData);
      
      isLoaded = true;
    } catch (error) {
      console.error('Failed to load timeline data from API:', error);
      // Fallback to empty array if API fails
      timelineData = [];
      timelineItems.length = 0;
      isLoaded = true;
    }
  })();

  return loadingPromise;
}

// Initialize data loading
loadTimelineData();

// Export reactive timeline items array
export let timelineItems: TimelineItem[] = [];

// Helper function to check item type
export function isExecutiveSummary(item: TimelineItem): item is ExecutiveSummary {
  // Check for _contentTag or legacy departments field
  return (item as any)._contentTag === 'executive-summary' || 
         (item as any)._contentTag === 'weekly-summary' || 
         'departments' in item;
}

export function isExecutiveIQ(item: TimelineItem): item is ExecutiveIQ {
  // Check for _contentTag or legacy category field
  return (item as any)._contentTag === 'executive-iq' || 'category' in item;
}

// Helper function to check if content is new (within 7 days)
function isNewContent(dateString: string): boolean {
  if (!dateString) return false;
  const contentDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - contentDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

// Export data loading function for components to await
export { loadTimelineData };

// Keep original exports for backwards compatibility
export const executiveSummaries = timelineData.filter(isExecutiveSummary);
