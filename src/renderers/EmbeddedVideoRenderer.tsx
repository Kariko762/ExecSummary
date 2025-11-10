import React from 'react';
import { RendererProps } from '../types/schema';
import { getClasses } from '../design-system';

export const EmbeddedVideoRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  // value can be either a string (legacy) or object with embedUrl, platform, etc.
  const isObject = typeof value === 'object' && value !== null;
  const embedData = isObject ? value : { embedUrl: value, autoScale: true, platform: 'youtube', allowFullscreen: true };

  if (mode === 'display') {
    if (!embedData.embedUrl) {
      return (
        <div className="text-sm text-gray-400 italic">
          No embedded video
        </div>
      );
    }

    // For autoScale (16:9 aspect ratio)
    if (embedData.autoScale !== false) {
      return (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
          <iframe
            src={embedData.embedUrl}
            title={embedData.title || 'Embedded video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={embedData.allowFullscreen !== false}
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
            style={{ border: 0 }}
          />
        </div>
      );
    }

    // Custom dimensions
    const iframeStyle: React.CSSProperties = {
      width: embedData.width ? `${embedData.width}px` : '100%',
      height: embedData.height ? `${embedData.height}px` : '400px',
      border: 0
    };

    return (
      <iframe
        src={embedData.embedUrl}
        title={embedData.title || 'Embedded video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={embedData.allowFullscreen !== false}
        style={iframeStyle}
        className="rounded-lg shadow-md"
      />
    );
  }

  const handleFieldChange = (field: string, newValue: any) => {
    onChange?.({
      ...embedData,
      [field]: newValue
    });
  };

  const fields = schema.fields || {
    embedUrl: { type: 'string', renderAs: 'text', label: 'Embed URL', required: true },
    platform: { type: 'string', renderAs: 'select', label: 'Platform', options: ['youtube', 'vimeo', 'custom'] },
    autoScale: { type: 'boolean', renderAs: 'checkbox', label: 'Auto Scale (16:9)' },
    width: { type: 'number', renderAs: 'number', label: 'Width (px)' },
    height: { type: 'number', renderAs: 'number', label: 'Height (px)' },
    allowFullscreen: { type: 'boolean', renderAs: 'checkbox', label: 'Allow Fullscreen' },
    title: { type: 'string', renderAs: 'text', label: 'Title' }
  };

  return (
    <div className="space-y-4">
      {schema.label && (
        <label className={`block ${getClasses.h2()}`}>
          {schema.label}
          {schema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {Object.entries(fields).map(([key, fieldSchema]) => {
          const fieldValue = embedData[key];
          
          if (fieldSchema.renderAs === 'checkbox') {
            return (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fieldValue ?? fieldSchema.defaultValue ?? false}
                  onChange={(e) => handleFieldChange(key, e.target.checked)}
                  disabled={disabled}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-fis-eggplant focus:ring-fis-eggplant dark:focus:ring-fis-raspberry"
                />
                <label className={getClasses.label()}>
                  {fieldSchema.label}
                </label>
              </div>
            );
          }

          if (fieldSchema.renderAs === 'select') {
            return (
              <div key={key}>
                <label className={`block ${getClasses.label()} mb-2`}>
                  {fieldSchema.label}
                  {fieldSchema.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                  value={fieldValue ?? fieldSchema.defaultValue ?? ''}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  disabled={disabled}
                  className={getClasses.input()}
                >
                  {fieldSchema.options?.map((option: string) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div key={key}>
              <label className={`block ${getClasses.label()} mb-2`}>
                {fieldSchema.label}
                {fieldSchema.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={fieldSchema.type === 'number' ? 'number' : 'text'}
                value={fieldValue ?? ''}
                onChange={(e) => handleFieldChange(key, fieldSchema.type === 'number' ? Number(e.target.value) : e.target.value)}
                disabled={disabled}
                placeholder={fieldSchema.placeholder}
                className={getClasses.input()}
              />
            </div>
          );
        })}
      </div>

      {/* Helper text for YouTube/Vimeo URLs */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300 font-roobert-medium mb-1">URL Format Examples:</p>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-0.5 font-mono">
          <li>• YouTube: https://www.youtube.com/embed/VIDEO_ID</li>
          <li>• Vimeo: https://player.vimeo.com/video/VIDEO_ID</li>
        </ul>
      </div>

      {/* Preview */}
      {embedData.embedUrl && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
          {embedData.autoScale !== false ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={embedData.embedUrl}
                title={embedData.title || 'Embedded video preview'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={embedData.allowFullscreen !== false}
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
                style={{ border: 0 }}
              />
            </div>
          ) : (
            <iframe
              src={embedData.embedUrl}
              title={embedData.title || 'Embedded video preview'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={embedData.allowFullscreen !== false}
              style={{
                width: embedData.width ? `${embedData.width}px` : '100%',
                height: embedData.height ? `${embedData.height}px` : '400px',
                border: 0,
                maxWidth: '100%'
              }}
              className="rounded-lg shadow-md"
            />
          )}
        </div>
      )}

      {schema.helpText && !error && (
        <p className={getClasses.hint()}>
          {schema.helpText}
        </p>
      )}

      {error && (
        <p className={`${getClasses.hint()} text-red-600 dark:text-red-400`}>
          {error}
        </p>
      )}
    </div>
  );
};
