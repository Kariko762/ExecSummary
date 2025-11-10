import React from 'react';
import { RendererProps } from '../types/schema';
import { getClasses } from '../design-system';

export const ImageRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  // value can be either a string (legacy) or object with src, alt, etc.
  const isObject = typeof value === 'object' && value !== null;
  const imageData = isObject ? value : { src: value, autoScale: true };

  if (mode === 'display') {
    if (!imageData.src) {
      return (
        <div className="text-sm text-gray-400 italic">
          No image
        </div>
      );
    }

    const containerClass = imageData.autoScale !== false ? 'w-full' : '';
    const imgStyle: React.CSSProperties = {};
    
    if (imageData.autoScale === false) {
      if (imageData.width) imgStyle.width = `${imageData.width}px`;
      if (imageData.height) imgStyle.height = `${imageData.height}px`;
    } else {
      imgStyle.width = '100%';
      imgStyle.height = 'auto';
    }

    return (
      <div className={`space-y-2 ${containerClass}`}>
        <img
          src={imageData.src}
          alt={imageData.alt || 'Image'}
          style={imgStyle}
          className="rounded-lg shadow-md"
        />
        {imageData.caption && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
            {imageData.caption}
          </p>
        )}
      </div>
    );
  }

  const handleFieldChange = (field: string, newValue: any) => {
    onChange?.({
      ...imageData,
      [field]: newValue
    });
  };

  const fields = schema.fields || {
    src: { type: 'string', renderAs: 'text', label: 'Image URL', required: true },
    alt: { type: 'string', renderAs: 'text', label: 'Alt Text' },
    autoScale: { type: 'boolean', renderAs: 'checkbox', label: 'Auto Scale' },
    width: { type: 'number', renderAs: 'number', label: 'Width (px)' },
    height: { type: 'number', renderAs: 'number', label: 'Height (px)' },
    caption: { type: 'string', renderAs: 'text', label: 'Caption' }
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
          const fieldValue = imageData[key];
          
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

      {/* Preview */}
      {imageData.src && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
          <img
            src={imageData.src}
            alt={imageData.alt || 'Preview'}
            style={{
              width: imageData.autoScale !== false ? '100%' : imageData.width ? `${imageData.width}px` : 'auto',
              height: imageData.autoScale !== false ? 'auto' : imageData.height ? `${imageData.height}px` : 'auto',
              maxWidth: '100%'
            }}
            className="rounded-lg shadow-md"
          />
          {imageData.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic mt-2">
              {imageData.caption}
            </p>
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
