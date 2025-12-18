export enum FontWeight {
  Bold = 'bold',
  Medium = 'medium',
  Regular = 'regular',
}

export enum FontFamily {
  Inter24pt = 'Inter24pt',
  Roboto = 'Roboto',
  Trim = 'Trim',
}

export type FontFamilyVariants = Record<FontWeight, string>

// Font families organized by name for easy default selection
export const FontFamilies: Record<string, FontFamilyVariants> = {
  roboto: {
    [FontWeight.Bold]: 'Roboto-Bold',
    [FontWeight.Medium]: 'Roboto-Medium',
    [FontWeight.Regular]: 'Roboto-Regular',
  },
  inter: {
    [FontWeight.Bold]: 'Inter24pt-Bold',
    [FontWeight.Medium]: 'Inter24pt-Medium',
    [FontWeight.Regular]: 'Inter24pt-Regular',
  },
  inter24pt: {
    [FontWeight.Bold]: 'Inter24pt-Bold',
    [FontWeight.Medium]: 'Inter24pt-Medium',
    [FontWeight.Regular]: 'Inter24pt-Regular',
  },
  trim: {
    [FontWeight.Bold]: 'Trim-Bold',
    [FontWeight.Medium]: 'Trim-Medium',
    [FontWeight.Regular]: 'Trim-Regular',
  },
}

// Default font family name - change this to switch default font
const DEFAULT_FONT_FAMILY_NAME = 'roboto'

// Get default font family variants
const DefaultFontFamily: FontFamilyVariants =
  FontFamilies[DEFAULT_FONT_FAMILY_NAME]

export function getFontFamily(
  weight: FontWeight,
  family?: FontFamily | string,
): string {
  // If no family specified, use default
  if (!family) {
    return DefaultFontFamily[weight]
  }

  // Normalize family name (handle case variations and aliases)
  const normalizedFamily = String(family).trim().toLowerCase()

  // Check if family exists in FontFamilies object
  if (FontFamilies[normalizedFamily]) {
    return FontFamilies[normalizedFamily][weight]
  }

  // Handle enum values (Inter24pt, Roboto, Trim)
  const enumFamilyMap: Record<string, string> = {
    inter24pt: 'inter24pt',
    inter: 'inter24pt',
    roboto: 'roboto',
    trim: 'trim',
  }

  const mappedFamily = enumFamilyMap[normalizedFamily]
  if (mappedFamily && FontFamilies[mappedFamily]) {
    return FontFamilies[mappedFamily][weight]
  }

  // Fallback: try to construct font name from family and weight
  // e.g., "CustomFont-Bold"
  return `${String(family).trim()}-${weight}`
}
