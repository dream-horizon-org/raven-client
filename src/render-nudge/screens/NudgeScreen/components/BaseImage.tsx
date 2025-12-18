import React from 'react'
import type {ImageResizeMode} from 'react-native'

import RavenImage from '../utils/RavenImage/RavenImage'
import {testProperties} from '../utils/test-properties'

import {
  DEFAULT_IMAGE_VIEW_ID,
  DEFAULT_STRING_VALUE,
} from '../../../common/constants'
import type {ImageType} from '../ViewTypes.interface'
import {resolveProp} from '../utils/StringUtils'

import {TouchableNudgeComponent} from './TouchableNudgeComponent'

type BaseImageProps = {
  data: ImageType
  context: Record<string, unknown>
}

export const BaseImage = ({data, context}: BaseImageProps) => {
  const viewId =
    resolveProp<string>(data.props.testId, context, 'string') ??
    DEFAULT_IMAGE_VIEW_ID

  const resizeMode =
    resolveProp<ImageResizeMode>(data.props.resizeMode, context, 'string') ??
    undefined

  return (
    <TouchableNudgeComponent viewData={data} context={context}>
      <RavenImage
        {...testProperties(viewId)}
        source={{
          uri:
            resolveProp(data.props.uri, context, 'string') ??
            DEFAULT_STRING_VALUE,
        }}
        style={data.styles}
        resizeMode={resizeMode}
      />
    </TouchableNudgeComponent>
  )
}
