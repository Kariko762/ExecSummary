import React from 'react';
import { RendererProps } from '../types/schema';
import { TextRenderer } from './TextRenderer';
import { TextareaRenderer } from './TextareaRenderer';
import { NumberRenderer } from './NumberRenderer';
import { ListRenderer } from './ListRenderer';
import { MetricCardsRenderer } from './MetricCardsRenderer';
import { NestedCardsRenderer } from './NestedCardsRenderer';
import { ObjectFormRenderer } from './ObjectFormRenderer';
import { RichTextRenderer } from './RichTextRenderer';
import { PieChartRenderer } from './PieChartRenderer';
import { BarChartRenderer } from './BarChartRenderer';
import { LineChartRenderer } from './LineChartRenderer';
import { RadialChartRenderer } from './RadialChartRenderer';
import { HorizontalRuleRenderer } from './HorizontalRuleRenderer';
import { CodeBlockRenderer } from './CodeBlockRenderer';
import { QuoteRenderer } from './QuoteRenderer';
import { ExpressionRenderer } from './ExpressionRenderer';
import { ImageRenderer } from './ImageRenderer';
import { VideoRenderer } from './VideoRenderer';
import { EmbeddedVideoRenderer } from './EmbeddedVideoRenderer';
import { TableLayoutRenderer } from './TableLayoutRenderer';
import { KeyValueListRenderer } from './KeyValueListRenderer';

/**
 * Factory component that routes to the appropriate renderer based on schema type
 */
export const RenderFactory: React.FC<RendererProps> = (props) => {
  const { schema } = props;
  
  // Determine alignment class
  const alignment = (schema as any).alignment || 'left';
  const alignmentClass = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';

  let renderer: React.ReactElement;

  switch (schema.renderAs) {
    case 'text':
      renderer = <TextRenderer {...props} />;
      break;
    
    case 'textarea':
      renderer = <TextareaRenderer {...props} />;
      break;
    
    case 'number':
      renderer = <NumberRenderer {...props} />;
      break;
    
    case 'list':
    case 'listNoTitle':
      renderer = <ListRenderer {...props} />;
      break;
    
    case 'keyValueList':
      renderer = <KeyValueListRenderer {...props} />;
      break;
    
    case 'metricCards':
      renderer = <MetricCardsRenderer {...props} />;
      break;
    
    case 'nestedCards':
      renderer = <NestedCardsRenderer {...props} />;
      break;
    
    case 'object':
    case 'objectForm':
      renderer = <ObjectFormRenderer {...props} />;
      break;
    
    case 'richText':
      renderer = <RichTextRenderer {...props} />;
      break;
    
    case 'progressBar':
      // TODO: Implement ProgressBarRenderer
      renderer = <NumberRenderer {...props} />; // Fallback to number for now
      break;
    
    case 'pieChart':
      renderer = <PieChartRenderer {...props} />;
      break;
    
    case 'barChart':
      renderer = <BarChartRenderer {...props} />;
      break;
    
    case 'lineChart':
      renderer = <LineChartRenderer {...props} />;
      break;
    
    case 'radialChart':
      renderer = <RadialChartRenderer {...props} />;
      break;
    
    case 'hr':
      renderer = <HorizontalRuleRenderer {...props} />;
      break;
    
    case 'spacer':
      // Spacer is just empty space - render nothing
      renderer = <div className="spacer" style={{ minHeight: '20px' }}></div>;
      break;
    
    case 'codeBlock':
      renderer = <CodeBlockRenderer {...props} />;
      break;
    
    case 'quote':
      renderer = <QuoteRenderer {...props} />;
      break;
    
    case 'expression':
      renderer = <ExpressionRenderer {...props} />;
      break;
    
    case 'image':
      renderer = <ImageRenderer {...props} />;
      break;
    
    case 'video':
      renderer = <VideoRenderer {...props} />;
      break;
    
    case 'embeddedVideo':
      renderer = <EmbeddedVideoRenderer {...props} />;
      break;
    
    case 'statusBoard':
      renderer = <TableLayoutRenderer {...props} />;
      break;
    
    default:
      renderer = (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">
            Unknown renderer type: {schema.renderAs}
          </p>
        </div>
      );
  }
  
  // Wrap renderer with alignment class
  return <div className={alignmentClass}>{renderer}</div>;
};
