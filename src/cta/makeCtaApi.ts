import axios, {Method} from 'axios'

import {nudgeClient} from './nudgeclient'
import {getCtaApiHeaders} from './ctaApiHeaders'

export async function makeCtaApiPostRequest<TVariables, TData>(
  path: string,
  body?: TVariables,
): Promise<TData> {
  const baseUrl = nudgeClient.getBaseUrl()
  const fullUrl = `${baseUrl}/${path}`
  const headers = getCtaApiHeaders()

  const config = {
    url: fullUrl,
    method: 'POST' as Method,
    headers,
    data: body,
  }
  try {
    const response = await axios.request<TData>(config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          `API request failed: ${error.response.status} ${error.response.statusText}`,
        )
      } else if (error.request) {
        throw new Error(
          'API request failed: No response received from server. Please check your network connection.',
        )
      }
    }
    throw error
  }
}
