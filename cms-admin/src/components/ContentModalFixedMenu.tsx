import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { RenderFactory } from '../../../src/renderers/RenderFactory';

interface ContentSection {
  id: string;
  title: string;
  content: string; // Markdown content
  order: number;
  groupId?: string; // Optional: which group this section belongs to
}

interface ContentGroup {
  id: string;
  title: string;
  order: number;
}

interface ContentModalFixedMenuProps {
  title: string;
  subtitle?: string;
  sections: ContentSection[];
  groups?: ContentGroup[]; // Optional: define groups for collapsible menu
  collapsible?: boolean; // Enable/disable collapsible groups
  onClose: () => void;
}

export const ContentModalFixedMenu: React.FC<ContentModalFixedMenuProps> = ({ 
  title, 
  subtitle,
  sections, 
  groups = [],
  collapsible = false,
  onClose 
}) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  
  // Sort groups by order
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Get sections for a specific group
  const getSectionsForGroup = (groupId: string) => {
    return sortedSections.filter(section => section.groupId === groupId);
  };

  // Get ungrouped sections (no groupId)
  const getUngroupedSections = () => {
    return sortedSections.filter(section => !section.groupId);
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Auto-set first section on mount and expand its group if collapsible
  useEffect(() => {
    if (sortedSections.length > 0 && !activeSection) {
      const firstSection = sortedSections[0];
      setActiveSection(firstSection.id);
      
      // If collapsible and section has a groupId, auto-expand that group
      if (collapsible && firstSection.groupId) {
        setExpandedGroups(new Set([firstSection.groupId]));
      }
    }
  }, [sortedSections, collapsible]);

  // Auto-expand group when active section changes
  useEffect(() => {
    if (collapsible && activeSection) {
      const activeSectionData = sortedSections.find(s => s.id === activeSection);
      if (activeSectionData?.groupId) {
        setExpandedGroups(prev => {
          const newSet = new Set(prev);
          newSet.add(activeSectionData.groupId!);
          return newSet;
        });
      }
    }
  }, [activeSection, collapsible, sortedSections]);

  const activeSectionData = sortedSections.find(s => s.id === activeSection);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl max-w-6xl w-full h-[90vh] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-fis-eggplant to-fis-raspberry shadow-lg p-6 flex items-center justify-between z-10 rounded-t-3xl flex-shrink-0">
            <div>
              <h2 className="text-3xl font-roobert-heavy text-white mb-1">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-white/80">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Main Content Area: Fixed Menu + Scrollable Content */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Fixed Left Menu */}
            <div className="w-64 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-r border-gray-200/20 dark:border-gray-700/20 overflow-y-auto flex-shrink-0">
              <nav className="p-4 space-y-1">
                {collapsible && sortedGroups.length > 0 ? (
                  // Collapsible grouped menu
                  <>
                    {sortedGroups.map((group) => {
                      const isExpanded = expandedGroups.has(group.id);
                      const groupSections = getSectionsForGroup(group.id);
                      
                      return (
                        <div key={group.id} className="space-y-1">
                          {/* Group Header */}
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-roobert-semibold transition-all ${
                              isExpanded
                                ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white shadow-md'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span className="flex-1 text-left">{group.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isExpanded 
                                ? 'bg-white/20 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {groupSections.length}
                            </span>
                          </button>

                          {/* Group Sections (Expandable) */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden pl-4"
                              >
                                <div className="space-y-1 py-1">
                                  {groupSections.map((section) => {
                                    const isActive = section.id === activeSection;
                                    return (
                                      <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`
                                          w-full text-left px-3 py-2 rounded-lg transition-all
                                          flex items-center justify-between group text-sm
                                          ${isActive 
                                            ? 'bg-fis-eggplant text-white shadow-md' 
                                            : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                                          }
                                        `}
                                      >
                                        <span className={`font-roobert-medium ${isActive ? 'text-white' : ''}`}>
                                          {section.title}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                    
                    {/* Ungrouped sections (if any) */}
                    {getUngroupedSections().map((section) => {
                      const isActive = section.id === activeSection;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`
                            w-full text-left px-4 py-3 rounded-xl transition-all
                            flex items-center justify-between group
                            ${isActive 
                              ? 'bg-fis-eggplant text-white shadow-lg' 
                              : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                            }
                          `}
                        >
                          <span className={`font-roobert-medium text-sm ${isActive ? 'text-white' : ''}`}>
                            {section.title}
                          </span>
                          <ChevronRight 
                            className={`
                              w-4 h-4 transition-transform
                              ${isActive 
                                ? 'text-white translate-x-0' 
                                : 'text-gray-400 -translate-x-1 group-hover:translate-x-0'
                              }
                            `}
                          />
                        </button>
                      );
                    })}
                  </>
                ) : (
                  // Flat non-collapsible menu
                  sortedSections.map((section) => {
                    const isActive = section.id === activeSection;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`
                          w-full text-left px-4 py-3 rounded-xl transition-all
                          flex items-center justify-between group
                          ${isActive 
                            ? 'bg-fis-eggplant text-white shadow-lg' 
                            : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        <span className={`font-roobert-medium text-sm ${isActive ? 'text-white' : ''}`}>
                          {section.title}
                        </span>
                        <ChevronRight 
                          className={`
                            w-4 h-4 transition-transform
                            ${isActive 
                              ? 'text-white translate-x-0' 
                              : 'text-gray-400 -translate-x-1 group-hover:translate-x-0'
                            }
                          `}
                        />
                      </button>
                    );
                  })
                )}
              </nav>
            </div>

            {/* Right Content Area - Scrollable */}
            <div 
              ref={contentRef}
              className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-fis-navy/20 dark:to-fis-eggplant/20"
            >
              <div className="p-8 max-w-4xl mx-auto">
                {activeSectionData ? (
                  <motion.div
                    key={activeSectionData.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="glass-strong rounded-2xl p-8 border border-white/20 dark:border-white/10"
                  >
                    <h3 className="text-3xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                      {activeSectionData.title}
                    </h3>
                    
                    {/* Markdown Content via RenderFactory */}
                    <RenderFactory
                      fieldKey={activeSectionData.id}
                      value={activeSectionData.content}
                      onChange={() => {}}
                      mode="display"
                      schema={{
                        renderAs: 'richText',
                        label: '', // No label needed, title shown above
                        type: 'string'
                      }}
                    />
                  </motion.div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No section selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
