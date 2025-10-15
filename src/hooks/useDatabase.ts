// ** React Imports
import { useContext, useMemo, useCallback } from 'react'

// ** Source code Imports
import {
  ApplicationContext,
} from 'src/components/ApplicationProvider/context'

// ** Types
import type {
  DatabaseListOptions,
  DatabaseCountOptions,
  DatabaseGetRowOptions,
  DatabaseCreateOptions,
  DatabaseUpdateOptions,
  DatabaseBulkUpdatePayload,
  DatabaseRowResponse,
  DatabaseRowsResponse,
  DatabaseCountResponse,
  DatabaseBulkResponse,
  DatabaseDeleteResponse,
  DatabaseTriggerResponse,
  CallOptions,
  ServerError,
} from '@emd-cloud/sdk'
import type { Database } from '@emd-cloud/sdk'

export interface UseDatabaseReturn {
  /**
   * Database instance for the specified collection
   */
  database: Database | null

  /**
   * Retrieves rows from the database collection with optional filtering, sorting, and pagination.
   *
   * @param collectionId - The ID of the collection to query
   * @param options - Options for retrieving rows including query, sort, pagination
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the rows response or ServerError
   */
  getRows<T = Record<string, any>>(
    collectionId: string,
    options: DatabaseListOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseRowsResponse<T> | ServerError>
  getRows<T = Record<string, any>>(
    collectionId: string,
    options?: DatabaseListOptions,
    callOptions?: CallOptions,
  ): Promise<DatabaseRowsResponse<T>['data'] | ServerError>

  /**
   * Gets the total count of rows matching the specified query.
   *
   * @param collectionId - The ID of the collection to count
   * @param options - Options for counting rows including query and search
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the count response or ServerError
   */
  countRows(
    collectionId: string,
    options: DatabaseCountOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseCountResponse | ServerError>
  countRows(
    collectionId: string,
    options?: DatabaseCountOptions,
    callOptions?: CallOptions,
  ): Promise<DatabaseCountResponse['data'] | ServerError>

  /**
   * Retrieves a single row by its ID.
   *
   * @param collectionId - The ID of the collection
   * @param rowId - The ID of the row to retrieve
   * @param options - Options for retrieving the row
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the row response or ServerError
   */
  getRow<T = Record<string, any>>(
    collectionId: string,
    rowId: string,
    options: DatabaseGetRowOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseRowResponse<T> | ServerError>
  getRow<T = Record<string, any>>(
    collectionId: string,
    rowId: string,
    options?: DatabaseGetRowOptions,
    callOptions?: CallOptions,
  ): Promise<DatabaseRowResponse<T>['data'] | ServerError>

  /**
   * Creates a new row in the database collection.
   *
   * @param collectionId - The ID of the collection to create the row in
   * @param rowData - The data for the new row
   * @param options - Additional options for creating the row
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the created row response or ServerError
   */
  createRow<T = Record<string, any>>(
    collectionId: string,
    rowData: Record<string, any>,
    options: DatabaseCreateOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseRowResponse<T> | ServerError>
  createRow<T = Record<string, any>>(
    collectionId: string,
    rowData: Record<string, any>,
    options?: DatabaseCreateOptions,
    callOptions?: CallOptions,
  ): Promise<DatabaseRowResponse<T>['data'] | ServerError>

  /**
   * Updates an existing row in the database collection.
   *
   * @param collectionId - The ID of the collection
   * @param rowId - The ID of the row to update
   * @param rowData - The data to update
   * @param options - Additional options for updating the row
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the updated row response or ServerError
   */
  updateRow<T = Record<string, any>>(
    collectionId: string,
    rowId: string,
    rowData: Record<string, any>,
    options: DatabaseUpdateOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseRowResponse<T> | ServerError>
  updateRow<T = Record<string, any>>(
    collectionId: string,
    rowId: string,
    rowData: Record<string, any>,
    options?: DatabaseUpdateOptions,
    callOptions?: CallOptions,
  ): Promise<DatabaseRowResponse<T>['data'] | ServerError>

  /**
   * Updates multiple rows matching the specified query.
   *
   * @param collectionId - The ID of the collection
   * @param payload - The bulk update payload containing query, data, and notice
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the bulk update response or ServerError
   */
  bulkUpdate(
    collectionId: string,
    payload: DatabaseBulkUpdatePayload,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseBulkResponse | ServerError>
  bulkUpdate(
    collectionId: string,
    payload: DatabaseBulkUpdatePayload,
    callOptions?: CallOptions,
  ): Promise<DatabaseBulkResponse['data'] | ServerError>

  /**
   * Deletes a single row by its ID.
   *
   * @param collectionId - The ID of the collection
   * @param rowId - The ID of the row to delete
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the delete response or ServerError
   */
  deleteRow(
    collectionId: string,
    rowId: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseDeleteResponse | ServerError>
  deleteRow(
    collectionId: string,
    rowId: string,
    callOptions?: CallOptions,
  ): Promise<DatabaseDeleteResponse['data'] | ServerError>

  /**
   * Deletes multiple rows by their IDs.
   *
   * @param collectionId - The ID of the collection
   * @param rowIds - Array of row IDs to delete
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the delete response or ServerError
   */
  deleteRows(
    collectionId: string,
    rowIds: string[],
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseDeleteResponse | ServerError>
  deleteRows(
    collectionId: string,
    rowIds: string[],
    callOptions?: CallOptions,
  ): Promise<DatabaseDeleteResponse['data'] | ServerError>

  /**
   * Triggers a button action on a specific row.
   *
   * @param collectionId - The ID of the collection
   * @param rowId - The ID of the row containing the button
   * @param columnId - The ID of the column containing the button
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the trigger response or ServerError
   */
  triggerButton(
    collectionId: string,
    rowId: string,
    columnId: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseTriggerResponse | ServerError>
  triggerButton(
    collectionId: string,
    rowId: string,
    columnId: string,
    callOptions?: CallOptions,
  ): Promise<DatabaseTriggerResponse['data'] | ServerError>
}

/**
 * Hook for interacting with EMD Cloud database collections.
 * Provides CRUD operations and advanced database functionality.
 * 
 * @example
 * ```tsx
 * const { getRows, createRow, updateRow, deleteRow } = useDatabase();
 * 
 * // Get rows with filtering
 * const users = await getRows('users', {
 *   query: { "$and": [{ "data.status": { "$eq": "active" } }] },
 *   limit: 20,
 *   sort: [{ column: "createdAt", sort: "desc" }]
 * });
 * 
 * // Create a new row
 * const newUser = await createRow('users', {
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   status: 'active'
 * });
 * ```
 */
const useDatabase = (): UseDatabaseReturn => {
  const appData = useContext(ApplicationContext)

  const database = useMemo(() => {
    // Return null initially - database instances are created per collection
    return null
  }, [])

  const sdkDatabase = useMemo(() => {
    if (!appData.sdkInstance) {
      return null
    }
    return appData.sdkInstance.database.bind(appData.sdkInstance)
  }, [appData.sdkInstance])

  const getRows = useCallback(async <T = Record<string, any>>(
    collectionId: string,
    options: DatabaseListOptions = {},
    callOptions: CallOptions = {},
  ): Promise<DatabaseRowsResponse<T> | DatabaseRowsResponse<T>['data'] | ServerError> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    const dbInstance = sdkDatabase(collectionId)
    return await dbInstance.getRows<T>(options, callOptions)
  }, [sdkDatabase])

  const countRows = useCallback(async (
    collectionId: string,
    options: DatabaseCountOptions = {},
    callOptions: CallOptions = {},
  ): Promise<DatabaseCountResponse | DatabaseCountResponse['data'] | ServerError> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    const dbInstance = sdkDatabase(collectionId) as Database
    return await dbInstance.countRows(options, callOptions)
  }, [sdkDatabase])

  const getRow = useCallback(async <T = Record<string, any>>(
    collectionId: string,
    rowId: string,
    options: DatabaseGetRowOptions = {},
    callOptions: CallOptions = {},
  ): Promise<DatabaseRowResponse<T> | DatabaseRowResponse<T>['data'] | ServerError> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    const dbInstance = sdkDatabase(collectionId) as Database
    return await dbInstance.getRow<T>(rowId, options, callOptions)
  }, [sdkDatabase])

  const createRow = useCallback(async <T = Record<string, any>>(
    collectionId: string,
    rowData: Record<string, any>,
    options: DatabaseCreateOptions = {},
    callOptions: CallOptions = {},
  ): Promise<DatabaseRowResponse<T> | DatabaseRowResponse<T>['data'] | ServerError> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    const dbInstance = sdkDatabase(collectionId) as Database
    return await dbInstance.createRow<T>(rowData, options, callOptions)
  }, [sdkDatabase])

  const updateRow = useCallback(async <T = Record<string, any>>(
    collectionId: string,
    rowId: string,
    rowData: Record<string, any>,
    options: DatabaseUpdateOptions = {},
    callOptions: CallOptions = {},
  ): Promise<DatabaseRowResponse<T> | DatabaseRowResponse<T>['data'] | ServerError> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    const dbInstance = sdkDatabase(collectionId) as Database
    return await dbInstance.updateRow<T>(rowId, rowData, options, callOptions)
  }, [sdkDatabase])

  const bulkUpdate = useCallback(async (
    collectionId: string,
    payload: DatabaseBulkUpdatePayload,
    callOptions: CallOptions = {},
  ): Promise<DatabaseBulkResponse | DatabaseBulkResponse['data'] | ServerError> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    const dbInstance = sdkDatabase(collectionId) as Database
    return await dbInstance.bulkUpdate(payload, callOptions)
  }, [sdkDatabase])

  const deleteRow = useCallback(async (
    collectionId: string,
    rowId: string,
    callOptions: CallOptions = {},
  ): Promise<DatabaseDeleteResponse | DatabaseDeleteResponse['data'] | ServerError> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    const dbInstance = sdkDatabase(collectionId) as Database
    return await dbInstance.deleteRow(rowId, callOptions)
  }, [sdkDatabase])

  const deleteRows = useCallback(async (
    collectionId: string,
    rowIds: string[],
    callOptions: CallOptions = {},
  ): Promise<DatabaseDeleteResponse | DatabaseDeleteResponse['data'] | ServerError> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    const dbInstance = sdkDatabase(collectionId) as Database
    return await dbInstance.deleteRows(rowIds, callOptions)
  }, [sdkDatabase])

  const triggerButton = useCallback(async (
    collectionId: string,
    rowId: string,
    columnId: string,
    callOptions: CallOptions = {},
  ): Promise<DatabaseTriggerResponse | DatabaseTriggerResponse['data'] | ServerError> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    const dbInstance = sdkDatabase(collectionId)
    return await dbInstance.triggerButton(rowId, columnId, callOptions)
  }, [sdkDatabase])

  return {
    database,
    getRows: getRows as UseDatabaseReturn['getRows'],
    countRows: countRows as UseDatabaseReturn['countRows'],
    getRow: getRow as UseDatabaseReturn['getRow'],
    createRow: createRow as UseDatabaseReturn['createRow'],
    updateRow: updateRow as UseDatabaseReturn['updateRow'],
    bulkUpdate: bulkUpdate as UseDatabaseReturn['bulkUpdate'],
    deleteRow: deleteRow as UseDatabaseReturn['deleteRow'],
    deleteRows: deleteRows as UseDatabaseReturn['deleteRows'],
    triggerButton: triggerButton as UseDatabaseReturn['triggerButton'],
  }
}

export default useDatabase
