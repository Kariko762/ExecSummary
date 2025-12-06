import React from 'react';
import type { RendererProps } from '../types/schema';
import { getClasses, DesignSystem } from '../design-system';
import ReactMarkdown from 'react-markdown';

export const RichTextRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  const classes = getClasses;

  if (mode === 'display') {
    return (
      <div className="space-y-2">
        {schema.label && (
          <label className={`block ${classes.label()}`}>
            {schema.label}
          </label>
        )}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              // Headings with Design System classes
              h1: ({ node, ...props }) => (
                <h1 className={`${classes.h1()} mt-8 mb-4`} {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className={`${classes.h2()} mt-6 mb-3`} {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className={`text-lg ${DesignSystem.heading.secondary.combined} mt-5 mb-2`} {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className={`text-base ${DesignSystem.heading.secondary.combined} mt-4 mb-2`} {...props} />
              ),
              
              // Paragraphs
              p: ({ node, ...props }) => (
                <p className={`${classes.text()} leading-relaxed mb-4`} {...props} />
              ),
              
              // Lists
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside space-y-2 mb-4" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside space-y-2 mb-4" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className={`${classes.text()} ml-4`} {...props} />
              ),
              
              // Links
              a: ({ node, ...props }) => (
                <a 
                  className="text-fis-eggplant dark:text-fis-raspberry hover:underline font-roobert-medium"
                  {...props} 
                />
              ),
              
              // Code blocks
              code: ({ node, inline, ...props }: any) => 
                inline ? (
                  <code 
                    className="bg-gray-100 dark:bg-gray-800 text-fis-eggplant dark:text-fis-raspberry px-2 py-1 rounded text-sm font-mono"
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
                  className="border-l-4 border-fis-eggplant dark:border-fis-raspberry pl-4 italic my-4 text-gray-700 dark:text-gray-300"
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
                <td className={`px-4 py-3 text-sm ${classes.text()}`} {...props} />
              ),

              // Strong/Bold
              strong: ({ node, ...props }) => (
                <strong className="font-roobert-bold" {...props} />
              ),

              // Emphasis/Italic
              em: ({ node, ...props }) => (
                <em className="font-roobert-regular italic" {...props} />
              ),
            }}
          >
            {value || '*No content*'}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {schema.label && (
        <label className={`block ${classes.label()}`}>
          {schema.label}:
          {schema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled || !schema.enabled}
        placeholder={schema.placeholder || '## Heading\n\nExample **markdown** content...'}
        rows={12}
        className={`${classes.input()} resize-y font-mono text-sm ${
          error 
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
            : ''
        }`}
      />
      
      {schema.helpText && !error && (
        <p className={classes.hint()}>
          {schema.helpText}
        </p>
      )}

      {!schema.helpText && !error && (
        <p className={classes.hint()}>
          Supports markdown syntax: **bold**, *italic*, ## headings, - lists, etc.
        </p>
      )}
      
      {error && (
        <p className={`${classes.hint()} ${DesignSystem.status.error.text}`}>
          {error}
        </p>
      )}
    </div>
  );
};
