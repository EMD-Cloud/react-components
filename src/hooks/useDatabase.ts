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
   * @returns A promise that resolves to the rows data or error
   */
  getRows: <T = Record<string, any>>(
    collectionId: string,
    options?: DatabaseListOptions,
    callOptions?: CallOptions,
  ) => Promise<DatabaseRowsResponse<T>>
  
  /**
   * Gets the total count of rows matching the specified query.
   *
   * @param collectionId - The ID of the collection to count
   * @param options - Options for counting rows including query and search
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the count or error
   */
  countRows: (
    collectionId: string,
    options?: DatabaseCountOptions,
    callOptions?: CallOptions,
  ) => Promise<DatabaseCountResponse>
  
  /**
   * Retrieves a single row by its ID.
   *
   * @param collectionId - The ID of the collection
   * @param rowId - The ID of the row to retrieve
   * @param options - Options for retrieving the row
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the row data or error
   */
  getRow: <T = Record<string, any>>(
    collectionId: string,
    rowId: string,
    options?: DatabaseGetRowOptions,
    callOptions?: CallOptions,
  ) => Promise<DatabaseRowResponse<T>>
  
  /**
   * Creates a new row in the database collection.
   *
   * @param collectionId - The ID of the collection to create the row in
   * @param rowData - The data for the new row
   * @param options - Additional options for creating the row
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the created row or error
   */
  createRow: <T = Record<string, any>>(
    collectionId: string,
    rowData: Record<string, any>,
    options?: DatabaseCreateOptions,
    callOptions?: CallOptions,
  ) => Promise<DatabaseRowResponse<T>>
  
  /**
   * Updates an existing row in the database collection.
   *
   * @param collectionId - The ID of the collection
   * @param rowId - The ID of the row to update
   * @param rowData - The data to update
   * @param options - Additional options for updating the row
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the updated row or error
   */
  updateRow: <T = Record<string, any>>(
    collectionId: string,
    rowId: string,
    rowData: Record<string, any>,
    options?: DatabaseUpdateOptions,
    callOptions?: CallOptions,
  ) => Promise<DatabaseRowResponse<T>>
  
  /**
   * Updates multiple rows matching the specified query.
   *
   * @param collectionId - The ID of the collection
   * @param payload - The bulk update payload containing query, data, and notice
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the bulk update result or error
   */
  bulkUpdate: (
    collectionId: string,
    payload: DatabaseBulkUpdatePayload,
    callOptions?: CallOptions,
  ) => Promise<DatabaseBulkResponse>
  
  /**
   * Deletes a single row by its ID.
   *
   * @param collectionId - The ID of the collection
   * @param rowId - The ID of the row to delete
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the delete result or error
   */
  deleteRow: (
    collectionId: string,
    rowId: string,
    callOptions?: CallOptions,
  ) => Promise<DatabaseDeleteResponse>
  
  /**
   * Deletes multiple rows by their IDs.
   *
   * @param collectionId - The ID of the collection
   * @param rowIds - Array of row IDs to delete
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the delete result or error
   */
  deleteRows: (
    collectionId: string,
    rowIds: string[],
    callOptions?: CallOptions,
  ) => Promise<DatabaseDeleteResponse>
  
  /**
   * Triggers a button action on a specific row.
   *
   * @param collectionId - The ID of the collection
   * @param rowId - The ID of the row containing the button
   * @param columnId - The ID of the column containing the button
   * @param callOptions - Additional options for the API call including authentication type
   * @returns A promise that resolves to the trigger result or error
   */
  triggerButton: (
    collectionId: string,
    rowId: string,
    columnId: string,
    callOptions?: CallOptions,
  ) => Promise<DatabaseTriggerResponse>
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
    callOptions: CallOptions = { authType: undefined },
  ): Promise<DatabaseRowsResponse<T>> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const dbInstance = sdkDatabase(collectionId)
      const result = await dbInstance.getRows<T>(options, callOptions)
      
      // Check if result is an error (ServerError has success: false)
      if ('success' in result && !result.success) {
        throw result
      }
      
      return result as DatabaseRowsResponse<T>
    } catch (error) {
      throw error
    }
  }, [sdkDatabase])

  const countRows = useCallback(async (
    collectionId: string,
    options: DatabaseCountOptions = {},
    callOptions: CallOptions = { authType: undefined },
  ): Promise<DatabaseCountResponse> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const dbInstance = sdkDatabase(collectionId) as Database
      const result = await dbInstance.countRows(options, callOptions)
      
      if ('success' in result && !result.success) {
        throw result
      }
      
      return result as DatabaseCountResponse
    } catch (error) {
      throw error
    }
  }, [sdkDatabase])

  const getRow = useCallback(async <T = Record<string, any>>(
    collectionId: string,
    rowId: string,
    options: DatabaseGetRowOptions = {},
    callOptions: CallOptions = { authType: undefined },
  ): Promise<DatabaseRowResponse<T>> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const dbInstance = sdkDatabase(collectionId) as Database
      const result = await dbInstance.getRow<T>(rowId, options, callOptions)
      
      if ('success' in result && !result.success) {
        throw result
      }
      
      return result as DatabaseRowResponse<T>
    } catch (error) {
      throw error
    }
  }, [sdkDatabase])

  const createRow = useCallback(async <T = Record<string, any>>(
    collectionId: string,
    rowData: Record<string, any>,
    options: DatabaseCreateOptions = {},
    callOptions: CallOptions = { authType: undefined },
  ): Promise<DatabaseRowResponse<T>> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const dbInstance = sdkDatabase(collectionId) as Database
      const result = await dbInstance.createRow<T>(rowData, options, callOptions)
      
      if ('success' in result && !result.success) {
        throw result
      }
      
      return result as DatabaseRowResponse<T>
    } catch (error) {
      throw error
    }
  }, [sdkDatabase])

  const updateRow = useCallback(async <T = Record<string, any>>(
    collectionId: string,
    rowId: string,
    rowData: Record<string, any>,
    options: DatabaseUpdateOptions = {},
    callOptions: CallOptions = { authType: undefined },
  ): Promise<DatabaseRowResponse<T>> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const dbInstance = sdkDatabase(collectionId) as Database
      const result = await dbInstance.updateRow<T>(rowId, rowData, options, callOptions)
      
      if ('success' in result && !result.success) {
        throw result
      }
      
      return result as DatabaseRowResponse<T>
    } catch (error) {
      throw error
    }
  }, [sdkDatabase])

  const bulkUpdate = useCallback(async (
    collectionId: string,
    payload: DatabaseBulkUpdatePayload,
    callOptions: CallOptions = { authType: undefined },
  ): Promise<DatabaseBulkResponse> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const dbInstance = sdkDatabase(collectionId) as Database
      const result = await dbInstance.bulkUpdate(payload, callOptions)
      
      if ('success' in result && !result.success) {
        throw result
      }
      
      return result as DatabaseBulkResponse
    } catch (error) {
      throw error
    }
  }, [sdkDatabase])

  const deleteRow = useCallback(async (
    collectionId: string,
    rowId: string,
    callOptions: CallOptions = { authType: undefined },
  ): Promise<DatabaseDeleteResponse> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const dbInstance = sdkDatabase(collectionId) as Database
      const result = await dbInstance.deleteRow(rowId, callOptions)
      
      if ('success' in result && !result.success) {
        throw result
      }
      
      return result as DatabaseDeleteResponse
    } catch (error) {
      throw error
    }
  }, [sdkDatabase])

  const deleteRows = useCallback(async (
    collectionId: string,
    rowIds: string[],
    callOptions: CallOptions = { authType: undefined },
  ): Promise<DatabaseDeleteResponse> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const dbInstance = sdkDatabase(collectionId) as Database
      const result = await dbInstance.deleteRows(rowIds, callOptions)
      
      if ('success' in result && !result.success) {
        throw result
      }
      
      return result as DatabaseDeleteResponse
    } catch (error) {
      throw error
    }
  }, [sdkDatabase])

  const triggerButton = useCallback(async (
    collectionId: string,
    rowId: string,
    columnId: string,
    callOptions: CallOptions = { authType: undefined },
  ): Promise<DatabaseTriggerResponse> => {
    if (!sdkDatabase) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const dbInstance = sdkDatabase(collectionId)
      const result = await dbInstance.triggerButton(rowId, columnId, callOptions)
      
      if ('success' in result && !result.success) {
        throw result
      }
      
      return result as DatabaseTriggerResponse
    } catch (error) {
      throw error
    }
  }, [sdkDatabase])

  return {
    database,
    getRows,
    countRows,
    getRow,
    createRow,
    updateRow,
    bulkUpdate,
    deleteRow,
    deleteRows,
    triggerButton,
  }
}

export default useDatabase
