import {useMemo, useState} from 'react'
import React from 'react'
import {Platform} from 'react-native'
import {
  ImageErrorEventData,
  NativeSyntheticEvent,
  Image,
  StyleSheet,
} from 'react-native'
import type {RavenImageProps, ImageWrapperProps} from './RavenImage.Interface'
import {
  getImageDimensions,
  getOptmisedSource,
  isValidSource,
} from './RavenImage.utils'

const RavenImage = ({children, config, ...props}: RavenImageProps) => {
  const [error, setError] = useState<boolean>(false)
  const isValidUrl = useMemo(() => isValidSource(props.source), [props.source])

  const flattenedStyles = useMemo(
    () => StyleSheet.flatten(props.style || {}),
    [props.style],
  )

  const updatedSource = useMemo(() => {
    if (!isValidUrl) {
      return {
        uri: '',
      }
    }

    return getOptmisedSource(
      props.source,
      config ||
        getImageDimensions(flattenedStyles.width, flattenedStyles.height),
    )
  }, [
    props.source,
    flattenedStyles.height,
    flattenedStyles.width,
    config,
    isValidUrl,
  ])

  const onImageLoadError = (
    loadError?: NativeSyntheticEvent<ImageErrorEventData>,
  ) => {
    if (!error) {
      // We only want to fallback to original image source if it's a vaild one in case of image load errors.
      if (isValidUrl) {
        setError(true)
      }

      props.onError?.(loadError as NativeSyntheticEvent<ImageErrorEventData>)
    }
  }

  const updatedProps: ImageWrapperProps = {
    ...props,
    source: error ? props.source : updatedSource,
    onError: onImageLoadError,
  }

  const accessibleProps =
    Platform.OS === 'android'
      ? {
          accessible: true,
        }
      : {}

  return (
    <Image {...updatedProps} {...accessibleProps}>
      {children}
    </Image>
  )
}

export default RavenImage
