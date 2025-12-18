import {memo} from 'react'

import {View} from 'react-native'

import {LottieWrapperType} from './LottieView/LottieView.interface'

import {
  DEFAULT_LOTTIE_VIEW_ID,
  DEFAULT_STRING_VALUE,
  DEFAULT_NUMBER_VALUE,
} from '../../../common/constants'
import {LottieType} from '../ViewTypes.interface'
import {resolveProp} from '../utils/StringUtils'

import {TouchableNudgeComponent} from './TouchableNudgeComponent'
import {testProperties} from '../utils/test-properties'
import {RavenLottieView} from './LottieView/LottieView'

type BaseLottieViewProps = {
  data: LottieType
  context: Record<string, unknown>
}

export const BaseLottieView = memo(({data, context}: BaseLottieViewProps) => {
  const viewId =
    resolveProp<string>(data.props.testId, context, 'string') ??
    DEFAULT_LOTTIE_VIEW_ID

  const uri =
    resolveProp<string>(data.props.uri, context, 'string') ??
    DEFAULT_STRING_VALUE

  const autoPlay =
    resolveProp<boolean>(data.props.autoPlay, context, 'boolean') ?? true

  const loop = resolveProp<boolean>(data.props.loop, context, 'boolean') ?? true

  const speed = resolveProp<number>(data.props.speed, context, 'number') ?? 1

  const progress =
    resolveProp<number>(data.props.progress, context, 'number') ??
    DEFAULT_NUMBER_VALUE

  const resizeMode =
    resolveProp<'cover' | 'contain' | 'center'>(
      data.props.resizeMode,
      context,
      'string',
    ) ?? 'contain'

  const content = (
    <View {...testProperties(viewId)}>
      <RavenLottieView
        source={{uri: uri}}
        style={data.styles}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        progress={progress !== DEFAULT_NUMBER_VALUE ? progress : undefined}
        lottieWrapperType={LottieWrapperType.NONE}
        resizeMode={resizeMode}
      />
    </View>
  )

  return data.actions ? (
    <TouchableNudgeComponent viewData={data} context={context}>
      {content}
    </TouchableNudgeComponent>
  ) : (
    content
  )
})
