import React from 'react'
import {View} from 'react-native'

import {testProperties} from './utils/test-properties'
import type {
  ButtonType,
  ImageType,
  RenderViewType,
  TextViewType,
  LottieType,
} from './ViewTypes.interface'
import {BaseButton} from './components/BaseButton'
import {BaseImage} from './components/BaseImage'
import {BaseText} from './components/BaseText'
import {BaseLottieView} from './components/BaseLottieView'
import {NudgeBottomsheet} from './components/Bottomsheet/NudgeBottomsheet'
import {resolveProp} from './utils/StringUtils'
import {BaseViewType} from './utils/ViewTypesUtils'

type RenderViewProps = {
  item: RenderViewType | undefined
  context: Record<string, unknown>
}

export const RenderView = ({item, context}: RenderViewProps) => {
  if (!item) return <View {...testProperties('base-view')} />

  try {
    switch (item.type) {
      case BaseViewType.VIEW:
        return (
          <View
            style={item.styles}
            {...testProperties(
              resolveProp(item.props.testId, context, 'string') ?? 'view',
            )}>
            {item.children?.map((itemView, index) => (
              <RenderView
                key={`${
                  typeof itemView.props?.testId === 'string'
                    ? itemView.props.testId
                    : 'view'
                }-${index}`}
                item={itemView}
                context={context}
              />
            ))}
          </View>
        )
      case BaseViewType.IMAGE:
        return <BaseImage data={item as ImageType} context={context} />
      case BaseViewType.TEXT:
        return <BaseText data={item as TextViewType} context={context} />
      case BaseViewType.BUTTON:
        return <BaseButton data={item as ButtonType} context={context} />
      case BaseViewType.LOTTIE:
        return <BaseLottieView data={item as LottieType} context={context} />
      case BaseViewType.BOTTOMSHEET:
        return (
          <NudgeBottomsheet content={item.children?.[0]} context={context} />
        )

      default:
        return <View {...testProperties('base-view')} />
    }
  } catch {
    return <View {...testProperties('base-view')} />
  }
}
