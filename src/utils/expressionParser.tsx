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
 * Parse a string with {{expression:value}} syntax into structured elements
 */
export function parseExpression(text: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the expression
    if (match.index > lastIndex) {
      elements.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }

    // Parse the expression
    const expression = match[1];
    const [expressionType, ...params] = expression.split(':');
    
    elements.push({
      type: 'expression',
      content: match[0],
      expressionType: expressionType.toLowerCase(),
      value: params.join(':'), // Rejoin in case value contains colons
      params
    });

    lastIndex = regex.lastIndex;
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
    <span className="inline-flex items-center gap-1 font-roobert-semibold text-fis-green">
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
    }`}>
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
    <span className={`inline-flex items-center ${trend.color} mx-1`}>
      <Icon className="w-4 h-4" />
    </span>
  );
}

/**
 * Render a highlight expression
 */
function renderHighlight(text: string): React.ReactNode {
  return (
    <span className="bg-yellow-200/50 dark:bg-yellow-500/20 px-1 rounded font-roobert-medium">
      {text}
    </span>
  );
}

/**
 * Render a bold expression
 */
function renderBold(text: string): React.ReactNode {
  return (
    <span className="font-roobert-bold text-gray-900 dark:text-white">
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
  const iconName = parts[2] || 'activity';
  
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
export function renderWithExpressions(text: string): React.ReactNode {
  const elements = parseExpression(text);
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
