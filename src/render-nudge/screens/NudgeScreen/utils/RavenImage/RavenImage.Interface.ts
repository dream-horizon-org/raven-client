import {AccessibilityProps, ImageProps, ImageSourcePropType} from 'react-native'

export interface ImageWrapperProps
  extends
    AccessibilityProps,
    Pick<
      ImageProps,
      | 'source'
      | 'style'
      | 'resizeMode'
      | 'onError'
      | 'onLoad'
      | 'blurRadius'
      | 'testID'
      | 'onLoadEnd'
      | 'onLoadStart'
      | 'fadeDuration'
      | 'width'
      | 'height'
      | 'resizeMethod'
      | 'defaultSource'
      | 'onLayout'
      | 'tintColor'
    > {
  alt?: string
  nativeID?: string
}

export type RavenImageProps = {
  children?: React.ReactNode
  config?: ImageOptimisationConfig
} & ImageWrapperProps

export type ImageOptimisationConfig = {
  width: number
  height: number
  fit?: ResizeMode
}

type ResizeMode = 'cover' | 'contain' | 'fit' | 'inside' | 'out'

export type Pattern = {
  baseUrls: Array<string>
  bucketName: string
  directories: Record<string, string>
}

export type ServerlessConfig = {
  intelligentImageDomain: string
  patterns: Record<string, string>
  excludedImageFormats: Array<string>
}

export type ImageSource = ImageSourcePropType
