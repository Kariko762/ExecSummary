import React from 'react';
import { RendererProps } from '../types/schema';
import { getClasses } from '../design-system';

export const VideoRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  // value can be either a string (legacy) or object with src, controls, etc.
  const isObject = typeof value === 'object' && value !== null;
  const videoData = isObject ? value : { src: value, autoScale: true, controls: true };

  if (mode === 'display') {
    if (!videoData.src) {
      return (
        <div className="text-sm text-gray-400 italic">
          No video
        </div>
      );
    }

    const containerClass = videoData.autoScale !== false ? 'w-full' : '';
    const videoStyle: React.CSSProperties = {};
    
    if (videoData.autoScale === false) {
      if (videoData.width) videoStyle.width = `${videoData.width}px`;
      if (videoData.height) videoStyle.height = `${videoData.height}px`;
    } else {
      videoStyle.width = '100%';
      videoStyle.height = 'auto';
    }

    return (
      <div className={containerClass}>
        <video
          src={videoData.src}
          poster={videoData.poster}
          controls={videoData.controls !== false}
          autoPlay={videoData.autoplay === true}
          loop={videoData.loop === true}
          muted={videoData.muted === true}
          style={videoStyle}
          className="rounded-lg shadow-md"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  const handleFieldChange = (field: string, newValue: any) => {
    onChange?.({
      ...videoData,
      [field]: newValue
    });
  };

  const fields = schema.fields || {
    src: { type: 'string', renderAs: 'text', label: 'Video URL', required: true },
    poster: { type: 'string', renderAs: 'text', label: 'Poster Image' },
    autoScale: { type: 'boolean', renderAs: 'checkbox', label: 'Auto Scale' },
    width: { type: 'number', renderAs: 'number', label: 'Width (px)' },
    height: { type: 'number', renderAs: 'number', label: 'Height (px)' },
    controls: { type: 'boolean', renderAs: 'checkbox', label: 'Show Controls' },
    autoplay: { type: 'boolean', renderAs: 'checkbox', label: 'Autoplay' },
    loop: { type: 'boolean', renderAs: 'checkbox', label: 'Loop' },
    muted: { type: 'boolean', renderAs: 'checkbox', label: 'Muted' }
  };

  return (
    <div className="space-y-4">
      {schema.label && (
        <label className={`block ${getClasses.h2()}`}>
          {schema.label}
          {schema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(fields).map(([key, fieldSchema]) => {
          const fieldValue = videoData[key];
          
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

          return (
            <div key={key} className={key === 'src' || key === 'poster' ? 'md:col-span-2' : ''}>
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

      {/* Preview */}
      {videoData.src && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
          <video
            src={videoData.src}
            poster={videoData.poster}
            controls={videoData.controls !== false}
            autoPlay={false} // Never autoplay in preview
            loop={videoData.loop === true}
            muted={videoData.muted === true}
            style={{
              width: videoData.autoScale !== false ? '100%' : videoData.width ? `${videoData.width}px` : 'auto',
              height: videoData.autoScale !== false ? 'auto' : videoData.height ? `${videoData.height}px` : 'auto',
              maxWidth: '100%'
            }}
            className="rounded-lg shadow-md"
          >
            Your browser does not support the video tag.
          </video>
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
