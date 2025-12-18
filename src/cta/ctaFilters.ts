import type {
  ComparisonType,
  CTAEvent,
  Filter,
  FilterFunctions,
  FilterGroup,
  OperatorType,
} from './cta.interface'

const evaluateStrings = (
  comparisonType: ComparisonType,
  eventDataPropValue: string | boolean,
  comparisonValue: string | boolean,
) => {
  switch (comparisonType) {
    case '=':
      return eventDataPropValue === comparisonValue
    case '!=':
      return eventDataPropValue !== comparisonValue
    default:
      return false
  }
}

const evaluateBoolean = (
  eventDataPropValue: boolean,
  comparisonValue: boolean,
) => {
  return eventDataPropValue === comparisonValue
}

const evaluateNumber = (
  comparisonType: ComparisonType,
  eventDataPropValue: number,
  comparisonValue: number,
) => {
  switch (comparisonType) {
    case '>':
      return eventDataPropValue > comparisonValue
    case '<':
      return eventDataPropValue < comparisonValue
    case '>=':
      return eventDataPropValue >= comparisonValue
    case '<=':
      return eventDataPropValue <= comparisonValue
    case '=':
      return eventDataPropValue === comparisonValue

    default:
      return false
  }
}

const getOperandValue = (
  operand: string | number,
  eventData: CTAEvent,
): number => {
  if (typeof operand === 'string' && operand.startsWith('$.')) {
    const key = operand.substring(2)
    if (key === 'currentTime') return Date.now()
    return Number(eventData[operand.substring(2)])
  }
  return Number(operand)
}

const evaluateFunction = (
  func: FilterFunctions,
  eventData: CTAEvent,
): number => {
  const {operator, operand1, operand2} = func

  // Recursive case: if operand1 is an object, evaluate it recursively
  const evaluatedOperand1: number =
    typeof operand1 === 'object'
      ? evaluateFunction(operand1, eventData)
      : getOperandValue(operand1, eventData)

  // Recursive case: if operand2 is an object, evaluate it recursively
  const evaluatedOperand2: number | null =
    typeof operand2 === 'object'
      ? evaluateFunction(operand2, eventData)
      : getOperandValue(operand2, eventData)

  // Perform the operation based on the operator
  switch (operator) {
    case '+':
      return evaluatedOperand1 + evaluatedOperand2
    case '-':
      return evaluatedOperand1 - evaluatedOperand2
    default:
      return Number.MIN_SAFE_INTEGER
  }
}

function evaluateFilter(filter: Filter | FilterGroup, eventData: CTAEvent) {
  if ('operator' in filter) {
    return processFilters(filter as FilterGroup, eventData)
  }

  const {
    propertyType,
    propertyName,
    comparisonValue,
    comparisonType,
    functions,
  } = filter as Filter

  if (!(propertyName in eventData)) {
    return false
  }
  const eventDataPropValue = functions
    ? evaluateFunction(functions, eventData)
    : eventData[propertyName]

  if (eventDataPropValue === Number.MIN_SAFE_INTEGER) return false

  switch (propertyType) {
    case 'string':
      return evaluateStrings(
        comparisonType,
        String(eventDataPropValue),
        String(comparisonValue),
      )
    case 'number':
      return evaluateNumber(
        comparisonType,
        Number(eventDataPropValue),
        Number(comparisonValue),
      )
    case 'boolean':
      return evaluateBoolean(
        Boolean(eventDataPropValue),
        Boolean(comparisonValue),
      )
    default:
      return false
  }
}

// Function to evaluate conditions and rules recursively
function evaluateCondition(
  operator: OperatorType,
  filters: FilterGroup['filter'],
  eventData: CTAEvent,
): boolean {
  if (operator === 'AND') {
    return filters.every((filter: Filter | FilterGroup) =>
      evaluateFilter(filter, eventData),
    )
  } else if (operator === 'OR') {
    return filters.some((filter: Filter | FilterGroup) =>
      evaluateFilter(filter, eventData),
    )
  }
  return false
}

// Function to process nested conditions
export function processFilters(
  transitionFilters: FilterGroup | null | undefined,
  eventData: CTAEvent,
) {
  if (
    transitionFilters === null ||
    transitionFilters === undefined ||
    Object.keys(transitionFilters).length === 0
  ) {
    return true
  }
  const {filter, operator} = transitionFilters
  if (filter && operator) {
    return evaluateCondition(operator, filter, eventData)
  } else {
    return false // Invalid data
  }
}
