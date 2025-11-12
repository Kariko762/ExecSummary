/**
 * Asset Type Registry
 * 
 * DEPRECATED: This file now delegates to assetDataStore.ts (Single Source of Truth)
 * 
 * Architecture:
 * - All asset definitions live in assetDataStore.ts
 * - This file provides backward compatibility
 * - New code should import from assetDataStore.ts directly
 */

import { ASSET_LIBRARY, AssetDefinition, getAssetByType, buildFieldSchema as buildFieldSchemaFromLibrary } from './assetDataStore';

export interface AssetTypeDefinition {
  type: string;
  label: string;
  description: string;
  category: 'basic' | 'lists' | 'complex' | 'rich' | 'charts';
  multiColumnSupported: boolean;
  defaultSchema: any;
}

/**
 * Convert AssetLibrary format to legacy AssetTypeDefinition format
 */
function convertToLegacyFormat(asset: AssetDefinition): AssetTypeDefinition {
  return {
    type: asset.type,
    label: asset.name,
    description: asset.description,
    category: asset.category as 'basic' | 'lists' | 'complex' | 'rich' | 'charts',
    multiColumnSupported: asset.supportsMultiColumn,
    defaultSchema: asset.schema
  };
}

/**
 * Registry of all available asset types
 * Generated from ASSET_LIBRARY (Single Source of Truth)
 */
export const assetTypeRegistry: AssetTypeDefinition[] = ASSET_LIBRARY.map(convertToLegacyFormat);

/**
 * Get asset type definition by type name
 */
export function getAssetType(type: string): AssetTypeDefinition | undefined {
  const asset = getAssetByType(type);
  return asset ? convertToLegacyFormat(asset) : undefined;
}

/**
 * Get all asset types in a category
 */
export function getAssetTypesByCategory(category: string): AssetTypeDefinition[] {
  return assetTypeRegistry.filter(asset => asset.category === category);
}

/**
 * Build a complete field schema for a section based on its type
 */
export function buildFieldSchema(type: string, customFields?: any): any {
  return buildFieldSchemaFromLibrary(type, customFields);
}
