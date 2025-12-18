import type {ServerlessConfig} from './RavenImage.Interface'

let IMAGE_OPTIMISATION_MAPPING: ServerlessConfig = {
  intelligentImageDomain: '',
  patterns: {},
  excludedImageFormats: [],
}

export const imageOptimisationMappingHelper = {
  getImageOptimisationMapping: () => IMAGE_OPTIMISATION_MAPPING,
  setImageOptimisationMapping: (mapping: ServerlessConfig) => {
    IMAGE_OPTIMISATION_MAPPING = mapping
  },
} as const
