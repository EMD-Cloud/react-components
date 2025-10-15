// ** React Imports
import { useContext, useMemo, useCallback } from 'react'

// ** Source code Imports
import {
  ApplicationContext,
} from 'src/components/ApplicationProvider/context'

// ** Types
import type { EmdCloud, CallOptions, WebhookResponse, ServerError } from '@emd-cloud/sdk'

type SDKWebhook = EmdCloud['webhook']

export interface UseWebhookReturn {
  /**
   * Webhook instance for making webhook calls
   */
  webhook: SDKWebhook | null
  
  /**
   * Calls a webhook endpoint with the specified request options.
   *
   * @param id - The unique identifier for the webhook
   * @param requestOptions - The options for the fetch request (method, body, headers, etc.)
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the webhook response data
   * @example
   * ```tsx
   * const { callWebhook } = useWebhook();
   *
   * // Send a POST request with JSON data
   * const response = await callWebhook(
   *   'user-created-webhook',
   *   {
   *     method: 'POST',
   *     body: JSON.stringify({
   *       userId: '123',
   *       email: 'user@example.com',
   *       timestamp: new Date().toISOString()
   *     }),
   *     headers: {
   *       'Content-Type': 'application/json'
   *     }
   *   },
   *   { authType: 'api-token' }
   * );
   *
   * // Send a GET request
   * const data = await callWebhook('health-check', { method: 'GET' });
   *
   * // Send a PUT request
   * const result = await callWebhook(
   *   'update-webhook',
   *   {
   *     method: 'PUT',
   *     body: JSON.stringify({ status: 'active' }),
   *     headers: { 'Content-Type': 'application/json' }
   *   }
   * );
   * ```
   */
  callWebhook(
    id: string,
    requestOptions: RequestInit,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<WebhookResponse | ServerError>
  callWebhook(
    id: string,
    requestOptions: RequestInit,
    callOptions?: CallOptions,
  ): Promise<WebhookResponse['data'] | ServerError>
}

/**
 * Hook for interacting with EMD Cloud webhooks.
 * Provides a unified method for calling webhook endpoints with full control over request options.
 * 
 * @example
 * ```tsx
 * const { callWebhook } = useWebhook();
 * 
 * // Send a webhook notification with JSON data
 * await callWebhook('user-registered', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     userId: user.id,
 *     email: user.email,
 *     timestamp: new Date().toISOString()
 *   })
 * });
 * 
 * // Call a webhook with custom options
 * const result = await callWebhook('process-data', {
 *   method: 'PUT',
 *   body: JSON.stringify(processedData),
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * 
 * // Get webhook status or data
 * const status = await callWebhook('health-check', { method: 'GET' });
 * ```
 */
const useWebhook = (): UseWebhookReturn => {
  const appData = useContext(ApplicationContext)

  const webhook = useMemo(() => {
    if (!appData.sdkInstance) {
      return null
    }
    return appData.sdkInstance.webhook
  }, [appData.sdkInstance])

  const callWebhook = useCallback(async (
    id: string,
    requestOptions: RequestInit,
    callOptions: CallOptions = {},
  ): Promise<WebhookResponse | WebhookResponse['data'] | ServerError> => {
    if (!webhook) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    return await webhook.call(id, requestOptions, callOptions)
  }, [webhook])

  return {
    webhook,
    callWebhook: callWebhook as UseWebhookReturn['callWebhook'],
  }
}

export default useWebhook
