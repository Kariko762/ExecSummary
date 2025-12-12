import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, Building2, Target } from 'lucide-react';

export function StickyNav() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('timeline');

  useEffect(() => {
    const handleScroll = () => {
      // Show nav after scrolling past hero section (approximately 200px)
      setIsVisible(window.scrollY > 200);
    };

    // Set up intersection observer for active section tracking
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -35% 0px', // Top 20%, keep middle 45% as detection zone, bottom 35%
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        // When a section enters the viewport detection zone, make it active
        if (entry.isIntersecting) {
          const targetId = entry.target.id;
          if (targetId) {
            setActiveSection(targetId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections that exist in the DOM
    const sections = ['timeline', 'performance', 'organizations', 'initiatives'];
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -160; // Offset for sticky header + spacing so title appears below menu
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'timeline', label: 'Summary Timeline', icon: Clock },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'organizations', label: 'Organizations', icon: Building2 },
    { id: 'initiatives', label: 'Initiatives', icon: Target }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-16 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50"
          style={{ borderBottom: '2px solid', borderBottomColor: 'rgb(209 213 219)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-center gap-2 py-3">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-roobert-medium text-sm
                    transition-all duration-200
                    ${activeSection === id
                      ? 'bg-gradient-to-r from-fis-eggplant to-fis-navy text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
