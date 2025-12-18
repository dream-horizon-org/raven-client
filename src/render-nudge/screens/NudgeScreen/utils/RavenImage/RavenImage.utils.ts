import {DimensionValue, PixelRatio} from 'react-native'

import type {
  ImageOptimisationConfig,
  ImageSource,
  ServerlessConfig,
} from './RavenImage.Interface'
import {imageOptimisationMappingHelper} from './RavenImage.mapping'

export function isValidSource(source: ImageSource | undefined): boolean {
  if (source === null) return false

  switch (typeof source) {
    case 'number': {
      return true
    }
    case 'object': {
      return (
        (Array.isArray(source) && source.every(isValidSource)) ||
        ('uri' in source && isSourceUriValid(source.uri))
      )
    }
    default: {
      return false
    }
  }
}

export function getImageDimensions(
  width: DimensionValue | undefined,
  height: DimensionValue | undefined,
) {
  const transformedWidth = Number(width)
  const transformedHeight = Number(height)

  if (isNaN(transformedWidth) || isNaN(transformedHeight)) return

  return {
    width: transformedWidth,
    height: transformedHeight,
  }
}

export function getOptmisedSource(
  originalSource: ImageSource | undefined,
  config?: ImageOptimisationConfig,
) {
  try {
    const {intelligentImageDomain, patterns, excludedImageFormats} =
      imageOptimisationMappingHelper.getImageOptimisationMapping()

    if (
      !intelligentImageDomain ||
      !Object.entries(patterns).length ||
      typeof originalSource === 'number' ||
      Array.isArray(originalSource) ||
      !config
    ) {
      return originalSource
    }

    const {origin, pathname, search} = getProtocolAndHostName(
      originalSource?.uri || '',
    )

    if (!origin || !pathname) {
      return originalSource
    }

    /**
     * Cloudfront and S3 adds '+' if there are any spaces in file / folder name while forming URL.
     * Replace '+' with empty space so that we can exact path to asset.
     * Example: https://cloudfront.net/image/Test+Folder/Jammu+%2B+Kashmir.png
     * In above URL the exact path to asset is "image/Test Folder/Jammu + Kashmir"
     * Reference: https://stackoverflow.com/questions/33759479/how-to-handle-files-having-spaces-in-amazon-cloudfront
     */
    const decodedPathName = decodeURIComponent(pathname.split('+').join(' '))

    if (isImageFormatBlackListed(pathname, excludedImageFormats)) {
      return originalSource
    }

    const width = PixelRatio.getPixelSizeForLayoutSize(config.width)
    const height = PixelRatio.getPixelSizeForLayoutSize(config.height)

    const pathnameArray = pathname.split('/')

    pathnameArray.pop()

    let mostSpecificMatch = ''
    let bucketName = ''

    pathnameArray.forEach((path) => {
      mostSpecificMatch = `${mostSpecificMatch}${path}/`
      if (patterns[`${origin}${mostSpecificMatch}`]) {
        bucketName = patterns[`${origin}${mostSpecificMatch}`]
      }
    })

    if (!bucketName) {
      return originalSource
    }

    const imageTransformationConfig = {
      bucket: bucketName,
      key: decodedPathName.replace('/', ''),
      edits: {
        toFormat: 'webp',
        resize: {
          width: width,
          height: height,
          fit: config.fit || 'cover',
        },
      },
      ...(search && {
        search,
      }),
    }
    const encodedUri = btoa(JSON.stringify(imageTransformationConfig))

    return {
      uri: `${intelligentImageDomain}/${encodedUri}`,
    }
  } catch (_error) {
    return originalSource
  }
}

function getProtocolAndHostName(url: string) {
  try {
    const result = new URL(url)
    return result
  } catch (_error) {
    return {
      origin: undefined,
      pathname: undefined,
      search: undefined,
    }
  }
}

export function isSourceUriValid(uri: string | undefined) {
  if (!uri) return false

  try {
    new URL(uri)
    return true
  } catch (_e) {
    return false
  }
}

function isImageFormatBlackListed(
  pathName: string,
  excludedImageFormats: ServerlessConfig['excludedImageFormats'],
) {
  const imageFormat = pathName.split('.').pop()
  const imageFormatIndex = excludedImageFormats.findIndex(
    (format) => format === imageFormat,
  )

  if (imageFormatIndex === -1) {
    return false
  }

  return true
}
