import type {TemplateTextType} from '../ViewTypes.interface'

export const convertTemplateToString = (
  propValue: TemplateTextType[],
  context: Record<string, unknown>,
) => {
  try {
    return propValue
      .map((templateValue) => {
        if (templateValue.isTemplateString) {
          const contextValue = context[templateValue.variableName]
          if (contextValue !== undefined && contextValue !== null) {
            return contextValue.toString()
          } else {
            return templateValue.default.toString()
          }
        } else {
          return templateValue.value?.toString() ?? ''
        }
      })
      .join('')
  } catch {}
  return null
}

const convertTemplateToNumberOrBoolean = (
  propValue: TemplateTextType[],
  context: Record<string, unknown>,
  expectedType: 'number' | 'boolean',
): boolean | number | null => {
  if (propValue.length !== 1) {
    return null
  }

  const templateValue = propValue[0]
  if (templateValue.isTemplateString) {
    const contextValue = context[templateValue.variableName]
    if (typeof contextValue === expectedType) {
      return contextValue as number | boolean
    }
    if (typeof templateValue.default === expectedType) {
      return templateValue.default as number | boolean
    }
  } else {
    if (
      'value' in templateValue &&
      typeof templateValue.value === expectedType
    ) {
      return templateValue.value as number | boolean
    }
  }

  return null
}

export function resolveProp<T>(
  propValue: undefined | null | string | boolean | number | TemplateTextType[],
  context: Record<string, unknown>,
  expectedType: 'string' | 'number' | 'boolean',
): T | null {
  if (propValue === undefined || propValue === null) {
    return null
  }
  if (typeof propValue === expectedType) {
    return propValue as T
  }
  if (!Array.isArray(propValue)) {
    return null
  }
  switch (expectedType) {
    case 'string':
      return convertTemplateToString(propValue, context) as T
    case 'number':
    case 'boolean':
      return convertTemplateToNumberOrBoolean(
        propValue,
        context,
        expectedType,
      ) as T
    default:
      return null
  }
}
