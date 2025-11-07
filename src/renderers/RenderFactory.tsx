import React from 'react';
import { RendererProps } from '../types/schema';
import { TextRenderer } from './TextRenderer';
import { TextareaRenderer } from './TextareaRenderer';
import { NumberRenderer } from './NumberRenderer';
import { ListRenderer } from './ListRenderer';
import { MetricCardsRenderer } from './MetricCardsRenderer';
import { NestedCardsRenderer } from './NestedCardsRenderer';
import { ObjectFormRenderer } from './ObjectFormRenderer';

/**
 * Factory component that routes to the appropriate renderer based on schema type
 */
export const RenderFactory: React.FC<RendererProps> = (props) => {
  const { schema } = props;

  switch (schema.renderAs) {
    case 'text':
      return <TextRenderer {...props} />;
    
    case 'textarea':
      return <TextareaRenderer {...props} />;
    
    case 'number':
      return <NumberRenderer {...props} />;
    
    case 'list':
    case 'listNoTitle':
      return <ListRenderer {...props} />;
    
    case 'metricCards':
      return <MetricCardsRenderer {...props} />;
    
    case 'nestedCards':
      return <NestedCardsRenderer {...props} />;
    
    case 'objectForm':
      return <ObjectFormRenderer {...props} />;
    
    case 'richText':
      // TODO: Implement RichTextRenderer
      return <TextareaRenderer {...props} />; // Fallback to textarea for now
    
    case 'progressBar':
      // TODO: Implement ProgressBarRenderer
      return <NumberRenderer {...props} />; // Fallback to number for now
    
    case 'pieChart':
    case 'barChart':
    case 'lineChart':
    case 'radialChart':
      // TODO: Implement ChartRenderer
      return <div className="text-blue-600">Chart renderer coming soon</div>;
    
    default:
      return (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">
            Unknown renderer type: {schema.renderAs}
          </p>
        </div>
      );
  }
};
