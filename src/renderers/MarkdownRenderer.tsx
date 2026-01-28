import React from 'react';
import ReactMarkdown from 'react-markdown';
import { RendererProps } from '../types/schema';

/**
 * MarkdownRenderer - Renders markdown content with Design System styling
 * Uses ReactMarkdown with custom component overrides
 */
export const MarkdownRenderer: React.FC<RendererProps> = ({ value, mode }) => {
  
  // Handle empty or invalid content
  if (!value || typeof value !== 'string') {
    if (mode === 'edit') {
      return (
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded">
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
            <h1 className="text-3xl font-roobert-bold text-gray-900 dark:text-white mt-8 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-roobert-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-roobert-medium text-gray-800 dark:text-gray-100 mt-5 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-roobert-medium text-gray-700 dark:text-gray-200 mt-4 mb-2" {...props} />
          ),
          
          // Paragraphs
          p: ({ node, ...props}) => (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4" {...props} />
          ),
          
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 mb-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4" {...props} />
          ),
          
          // Links
          a: ({ node, ...props }) => (
            <a 
              className="text-blue-600 dark:text-blue-400 hover:underline font-roobert-medium"
              {...props} 
            />
          ),
          
          // Code blocks
          code: ({ node, inline, ...props }: any) => 
            inline ? (
              <code 
                className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono"
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
              className="border-l-4 border-fis-eggplant dark:border-fis-raspberry pl-4 italic my-4"
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
