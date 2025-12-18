import {Platform} from 'react-native'

function testProperties(
  id: string,
  enableAccessible = true,
  index = 0,
): {
  accessible?: boolean
  accessibilityLabel?: string
  testID?: string
  eventId?: string
  plotlineTestId?: string
} {
  const enableAccessibility = enableAccessible ? {accessible: true} : {}
  const testId = index > 0 ? id + '-' + index : id

  if (Platform.OS === 'ios') {
    return {
      ...enableAccessibility,
      testID: id,
      eventId: id,
      plotlineTestId: testId,
    }
  }

  return {
    ...enableAccessibility,
    accessibilityLabel: id,
    testID: id,
    eventId: id,
    plotlineTestId: testId,
  }
}

const formatTestId = (str: string) => str.replace(/\s+/g, '-')
const convertStringToSmallCase = (str: string) => str.toLowerCase()

const getFormattedIdInLowerCase = (str: string) => {
  return convertStringToSmallCase(formatTestId(str))
}
export {testProperties, formatTestId, getFormattedIdInLowerCase}
