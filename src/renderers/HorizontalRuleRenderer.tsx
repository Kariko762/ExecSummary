import React from 'react';
import { RendererProps } from '../types/schema';

/**
 * Horizontal Rule Renderer - Displays a divider line
 */
export const HorizontalRuleRenderer: React.FC<RendererProps> = ({ 
  schema, 
  mode 
}) => {
  const config = schema.hrConfig || {};
  const thickness = config.thickness || 1;
  const color = config.color || '#E5E7EB'; // Default gray-200
  const marginTop = config.marginTop || 24;
  const marginBottom = config.marginBottom || 24;
  const style = config.style || 'solid'; // solid, dashed, dotted

  if (mode === 'edit') {
    return (
      <div className="space-y-4">
        <div 
          className="relative"
          style={{
            marginTop: `${marginTop}px`,
            marginBottom: `${marginBottom}px`,
          }}
        >
          <hr 
            style={{
              height: `${thickness}px`,
              backgroundColor: color,
              border: 'none',
              borderStyle: style,
              borderWidth: style !== 'solid' ? `${thickness}px` : 0,
              borderColor: style !== 'solid' ? color : 'transparent',
            }}
          />
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Horizontal Rule
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {thickness}px {style} line • {marginTop}px top / {marginBottom}px bottom margin
        </div>
      </div>
    );
  }

  // Display mode
  return (
    <hr 
      style={{
        height: `${thickness}px`,
        backgroundColor: color,
        border: 'none',
        borderStyle: style,
        borderWidth: style !== 'solid' ? `${thickness}px` : 0,
        borderColor: style !== 'solid' ? color : 'transparent',
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
      }}
    />
  );
};
