import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Zap,
  Target,
  Award,
  Rocket,
  Star,
  Heart,
  ThumbsUp,
  Bell,
  Flag,
  Activity,
  BarChart3,
  LucideIcon
} from 'lucide-react';

// Map of icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  check: CheckCircle,
  alert: AlertCircle,
  error: XCircle,
  info: Info,
  zap: Zap,
  target: Target,
  award: Award,
  rocket: Rocket,
  star: Star,
  heart: Heart,
  thumbsup: ThumbsUp,
  bell: Bell,
  flag: Flag,
  activity: Activity,
  chart: BarChart3,
  trending: TrendingUp,
};

interface ParsedElement {
  type: 'text' | 'expression';
  content: string;
  expressionType?: string;
  value?: string;
  params?: string[];
}

/**
 * Parse a string with {{expression:value}} or [[expression]]value[[/expression]] syntax into structured elements
 */
export function parseExpression(text: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  
  // Handle both {{}} and [[]] syntax
  const bracketRegex = /\[\[(\w+)\]\](.*?)\[\[\/\1\]\]/gi;
  const curlyRegex = /\{\{([^}]+)\}\}/g;
  
  let lastIndex = 0;
  let match;
  
  // First, handle bracket syntax [[type]]content[[/type]]
  const matches: Array<{ index: number; length: number; type: string; value: string }> = [];
  
  while ((match = bracketRegex.exec(text)) !== null) {
    console.log('🔍 Bracket match found:', match);
    matches.push({
      index: match.index,
      length: match[0].length,
      type: match[1].toLowerCase(),
      value: match[2]
    });
  }
  
  // Then handle curly syntax {{type:value}}
  while ((match = curlyRegex.exec(text)) !== null) {
    const expression = match[1];
    const [expressionType, ...params] = expression.split(':');
    
    matches.push({
      index: match.index,
      length: match[0].length,
      type: expressionType.toLowerCase(),
      value: params.join(':')
    });
  }
  
  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);
  
  // Build elements array
  lastIndex = 0;
  for (const match of matches) {
    // Add text before the expression
    if (match.index > lastIndex) {
      elements.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }
    
    console.log('🔍 Creating expression element:', { type: match.type, value: match.value });
    elements.push({
      type: 'expression',
      content: text.substring(match.index, match.index + match.length),
      expressionType: match.type,
      value: match.value,
      params: [match.value]
    });
    
    lastIndex = match.index + match.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    elements.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  return elements;
}

/**
 * Render a currency expression
 */
function renderCurrency(value: string): React.ReactNode {
  const amount = parseFloat(value);
  const formatted = amount >= 1000000 
    ? `$${(amount / 1000000).toFixed(1)}M`
    : amount >= 1000
    ? `$${(amount / 1000).toFixed(0)}K`
    : `$${amount.toFixed(0)}`;

  return (
    <span className="inline-flex items-center gap-1 font-roobert-semibold text-fis-green" style={{ transform: 'translateY(4px)' }}>
      <DollarSign className="w-4 h-4" />
      {formatted}
    </span>
  );
}

/**
 * Render a percentage expression
 */
function renderPercent(value: string): React.ReactNode {
  const percent = parseFloat(value);
  const isPositive = percent >= 0;
  
  return (
    <span className={`inline-flex items-center gap-1 font-roobert-semibold ${
      isPositive ? 'text-fis-green' : 'text-red-500'
    }`} style={{ transform: 'translateY(4px)' }}>
      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      {Math.abs(percent)}%
    </span>
  );
}

/**
 * Render an icon expression
 */
function renderIcon(iconName: string): React.ReactNode {
  const Icon = iconMap[iconName.toLowerCase()];
  
  if (!Icon) {
    return <span className="text-gray-400 text-xs">[{iconName}]</span>;
  }

  return <Icon className="w-4 h-4 inline-block mx-1 text-fis-raspberry" />;
}

/**
 * Render a badge expression
 */
function renderBadge(badgeType: string): React.ReactNode {
  const badges: Record<string, { color: string; text: string; icon?: LucideIcon }> = {
    success: { color: 'bg-fis-green/20 text-fis-green', text: 'Success', icon: CheckCircle },
    completed: { color: 'bg-fis-green/20 text-fis-green', text: 'Completed', icon: CheckCircle },
    warning: { color: 'bg-yellow-500/20 text-yellow-600', text: 'Warning', icon: AlertCircle },
    critical: { color: 'bg-red-500/20 text-red-500', text: 'Critical', icon: AlertCircle },
    info: { color: 'bg-blue-500/20 text-blue-500', text: 'Info', icon: Info },
    new: { color: 'bg-fis-raspberry/20 text-fis-raspberry', text: 'New', icon: Zap },
    priority: { color: 'bg-fis-eggplant/20 text-fis-eggplant', text: 'Priority', icon: Flag },
  };

  const badge = badges[badgeType.toLowerCase()] || badges.info;
  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-roobert-semibold ${badge.color} mx-1`}>
      {Icon && <Icon className="w-3 h-3" />}
      {badge.text}
    </span>
  );
}

/**
 * Render a trend expression
 */
function renderTrend(direction: string): React.ReactNode {
  const trends: Record<string, { icon: LucideIcon; color: string }> = {
    up: { icon: TrendingUp, color: 'text-fis-green' },
    down: { icon: TrendingDown, color: 'text-red-500' },
    flat: { icon: Minus, color: 'text-gray-500' },
  };

  const trend = trends[direction.toLowerCase()] || trends.flat;
  const Icon = trend.icon;

  return (
    <span className={`inline-flex items-center ${trend.color} mx-1`} style={{ transform: 'translateY(4px)' }}>
      <Icon className="w-4 h-4" />
    </span>
  );
}

/**
 * Render a highlight expression
 */
function renderHighlight(text: string): React.ReactNode {
  return (
    <span className="text-sm font-roobert-light" style={{ color: 'var(--brand-primary)' }}>
      {text}
    </span>
  );
}

/**
 * Render a bold expression
 */
function renderBold(text: string): React.ReactNode {
  return (
    <span className="font-roobert-heavy text-gray-900 dark:text-white font-bold">
      {text}
    </span>
  );
}

/**
 * Render a positive expression (green highlight)
 */
function renderPositive(text: string): React.ReactNode {
  return (
    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1 rounded font-roobert-medium">
      {text}
    </span>
  );
}

/**
 * Render a negative expression (red highlight)
 */
function renderNegative(text: string): React.ReactNode {
  return (
    <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-1 rounded font-roobert-medium">
      {text}
    </span>
  );
}

/**
 * Render a link expression
 */
function renderLink(value: string): React.ReactNode {
  const parts = value.split('|');
  const url = parts[0];
  const text = parts[1] || url;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-fis-raspberry hover:text-fis-eggplant underline font-roobert-medium"
    >
      {text}
    </a>
  );
}

/**
 * Render a delta expression (change indicator with +/- and color)
 */
function renderDelta(value: string): React.ReactNode {
  const delta = parseFloat(value);
  const isPositive = delta >= 0;
  const isZero = delta === 0;
  
  if (isZero) {
    return (
      <span className="inline-flex items-center gap-1 font-roobert-semibold text-gray-500">
        <Minus className="w-4 h-4" />
        0
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-roobert-semibold ${
      isPositive ? 'text-fis-green' : 'text-red-500'
    }`}>
      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      {isPositive ? '+' : ''}{delta}
    </span>
  );
}

/**
 * Render a short number expression (smart abbreviation)
 */
function renderShort(value: string): React.ReactNode {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return <span>{value}</span>;
  }

  let formatted: string;
  if (Math.abs(num) >= 1000000000) {
    formatted = `${(num / 1000000000).toFixed(1)}B`;
  } else if (Math.abs(num) >= 1000000) {
    formatted = `${(num / 1000000).toFixed(1)}M`;
  } else if (Math.abs(num) >= 1000) {
    formatted = `${(num / 1000).toFixed(1)}K`;
  } else {
    formatted = num.toString();
  }

  return (
    <span className="font-roobert-semibold text-gray-900 dark:text-white">
      {formatted}
    </span>
  );
}

/**
 * Render a date expression
 */
function renderDate(value: string): React.ReactNode {
  try {
    const date = new Date(value);
    const formatted = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });

    return (
      <span className="font-roobert-medium text-gray-700 dark:text-gray-300">
        {formatted}
      </span>
    );
  } catch (e) {
    return <span>{value}</span>;
  }
}

/**
 * Render a metric expression (inline stat block)
 */
function renderMetric(value: string): React.ReactNode {
  const parts = value.split('|');
  const metricValue = parts[0];
  const label = parts[1] || '';
  const iconName = parts[2] || '';
  
  // If no icon specified, just render as bold text without the box
  if (!iconName) {
    return (
      <span className="font-roobert-bold text-fis-raspberry">
        {metricValue}
      </span>
    );
  }
  
  const Icon = iconMap[iconName.toLowerCase()] || Activity;

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fis-raspberry/10 border border-fis-raspberry/20 mx-1">
      <Icon className="w-4 h-4 text-fis-raspberry" />
      <span className="font-roobert-bold text-gray-900 dark:text-white">
        {metricValue}
      </span>
      {label && (
        <span className="text-xs font-roobert-regular text-gray-600 dark:text-gray-400">
          {label}
        </span>
      )}
    </span>
  );
}

/**
 * Render a single expression element
 */
function renderExpressionElement(element: ParsedElement, key: number): React.ReactNode {
  if (element.type === 'text') {
    return <React.Fragment key={key}>{element.content}</React.Fragment>;
  }

  if (!element.expressionType || !element.value) {
    return <React.Fragment key={key}>{element.content}</React.Fragment>;
  }

  switch (element.expressionType) {
    case 'currency':
      return <React.Fragment key={key}>{renderCurrency(element.value)}</React.Fragment>;
    
    case 'percent':
      return <React.Fragment key={key}>{renderPercent(element.value)}</React.Fragment>;
    
    case 'icon':
      return <React.Fragment key={key}>{renderIcon(element.value)}</React.Fragment>;
    
    case 'badge':
      return <React.Fragment key={key}>{renderBadge(element.value)}</React.Fragment>;
    
    case 'trend':
      return <React.Fragment key={key}>{renderTrend(element.value)}</React.Fragment>;
    
    case 'highlight':
      return <React.Fragment key={key}>{renderHighlight(element.value)}</React.Fragment>;
    
    case 'bold':
      return <React.Fragment key={key}>{renderBold(element.value)}</React.Fragment>;
    
    case 'positive':
      return <React.Fragment key={key}>{renderPositive(element.value)}</React.Fragment>;
    
    case 'negative':
      return <React.Fragment key={key}>{renderNegative(element.value)}</React.Fragment>;
    
    case 'link':
      return <React.Fragment key={key}>{renderLink(element.value)}</React.Fragment>;
    
    case 'delta':
      return <React.Fragment key={key}>{renderDelta(element.value)}</React.Fragment>;
    
    case 'short':
      return <React.Fragment key={key}>{renderShort(element.value)}</React.Fragment>;
    
    case 'date':
      return <React.Fragment key={key}>{renderDate(element.value)}</React.Fragment>;
    
    case 'metric':
      return <React.Fragment key={key}>{renderMetric(element.value)}</React.Fragment>;
    
    default:
      return <React.Fragment key={key}>{element.content}</React.Fragment>;
  }
}

/**
 * Main function to render text with expressions
 */
export function renderWithExpressions(text: string | undefined | null): React.ReactNode {
  console.log('🔍 renderWithExpressions called with:', text, 'type:', typeof text);
  if (!text || typeof text !== 'string') return text || '';
  const elements = parseExpression(text);
  console.log('🔍 Parsed elements:', elements);
  return (
    <>
      {elements.map((element, index) => renderExpressionElement(element, index))}
    </>
  );
}

/**
 * Component wrapper for rendering text with expressions
 */
interface RichTextProps {
  children: string;
  className?: string;
}

export function RichText({ children, className = '' }: RichTextProps): React.ReactElement {
  return (
    <span className={className}>
      {renderWithExpressions(children)}
    </span>
  );
}

/**
 * Evaluate data-driven expressions with {[ ]} syntax
 * Example: "{[ (revenue.current )} / {[ (revenue.target ]}" with data { revenue: { current: 100, target: 200 } }
 * Returns: "100 / 200"
 */
export function evaluateDataExpression(template: string, data: any = {}): string {
  // Match {[ ... ]} patterns
  const expressionRegex = /\{\[\s*([^}]+?)\s*\]\}/g;
  
  return template.replace(expressionRegex, (match, expression) => {
    try {
      // Clean up the expression
      const cleanExpr = expression.trim();
      
      // Create a function that evaluates the expression with the data context
      // We'll use Function constructor to safely evaluate with the data object
      const func = new Function(...Object.keys(data), `return ${cleanExpr}`);
      const result = func(...Object.values(data));
      
      // Format the result
      if (typeof result === 'number') {
        // If it's a whole number, don't show decimals
        return Number.isInteger(result) ? result.toString() : result.toFixed(2);
      }
      
      return String(result);
    } catch (error) {
      // If evaluation fails, return the original expression
      console.error('Expression evaluation error:', error);
      return match;
    }
  });
}

/**
 * Component wrapper for data-driven expressions
 */
interface DataExpressionProps {
  template: string;
  data?: any;
  className?: string;
}

export function DataExpression({ template, data = {}, className = '' }: DataExpressionProps): React.ReactElement {
  const evaluated = evaluateDataExpression(template, data);
  
  return (
    <span className={className}>
      {evaluated}
    </span>
  );
}
