import React from 'react';
import ReactMarkdown from 'react-markdown';
import { RendererProps } from '../types/schema';
import { getClasses } from '../design-system/getClasses';

/**
 * MarkdownRenderer - Renders markdown content with Design System styling
 * Uses ReactMarkdown with custom component overrides
 */
export const MarkdownRenderer: React.FC<RendererProps> = ({ value, mode }) => {
  const classes = getClasses();
  
  // Handle empty or invalid content
  if (!value || typeof value !== 'string') {
    if (mode === 'edit') {
      return (
        <div className={classes.inputContainer}>
          <p className="text-gray-400 dark:text-gray-500 text-sm italic">
            No markdown content
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          // Headings with Design System classes
          h1: ({ node, ...props }) => (
            <h1 className={`${classes.h1} mt-8 mb-4`} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className={`${classes.h2} mt-6 mb-3`} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className={`${classes.h3} mt-5 mb-2`} {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className={`${classes.h4} mt-4 mb-2`} {...props} />
          ),
          
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className={`${classes.body} leading-relaxed mb-4`} {...props} />
          ),
          
          // Lists
          ul: ({ node, ...props }) => (
            <ul className={`${classes.list} list-disc list-inside space-y-2 mb-4`} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className={`${classes.list} list-decimal list-inside space-y-2 mb-4`} {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4" {...props} />
          ),
          
          // Links
          a: ({ node, ...props }) => (
            <a 
              className={`${classes.link} hover:underline font-roobert-medium`}
              {...props} 
            />
          ),
          
          // Code blocks
          code: ({ node, inline, ...props }: any) => 
            inline ? (
              <code 
                className={`${classes.code} px-2 py-1 rounded text-sm`}
                {...props} 
              />
            ) : (
              <code 
                className="block bg-gray-900 dark:bg-black text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4"
                {...props} 
              />
            ),
          pre: ({ node, ...props }) => (
            <pre className="bg-gray-900 dark:bg-black rounded-lg overflow-x-auto my-4" {...props} />
          ),
          
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className={`${classes.quote} border-l-4 pl-4 italic my-4`}
              {...props} 
            />
          ),
          
          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="border-gray-300 dark:border-gray-700 my-8" {...props} />
          ),
          
          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left text-sm font-roobert-semibold text-gray-900 dark:text-white" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" {...props} />
          ),
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
};
