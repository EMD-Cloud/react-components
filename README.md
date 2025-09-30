
# EMD Cloud / React Components

-   [Overview](#overview)
-   [Getting Started](#getting-started)
-   [Components](#components)
    -   [ApplicationProvider](#applicationprovider)
-   [Hooks](#hooks)
    -   [Authorization Hooks](#authorization-hooks)
        -   [Hook: useAuth](#hook--useauth)
    -   [Database Hooks](#database-hooks)
        -   [Hook: useDatabase](#hook--usedatabase)
    -   [Webhook Hooks](#webhook-hooks)
        -   [Hook: useWebhook](#hook--usewebhook)
    -   [Uploader Hooks](#uploader-hooks)
        -   [Hook: useUploader](#hook--useuploader)
        -   [Hook: useDropzone](#hook--usedropzone)
-   [Conclusion](#conclusion)

## Overview

The EMD Cloud React components provide a set of React components for interacting with the  [EMD Cloud](https://cloud.emd.one/)  platform. These components are designed to simplify working with EMD Cloud services in your React applications.

## Getting Started

1.  Register on the EMD Cloud platform and create an application at  [https://console.cloud.emd.one](https://console.cloud.emd.one/).
    
2.  Obtain your application's API token.
    
3.  Install the required packages:

    **NPM**
    ```bash
    # Install the React components
    npm install @emd-cloud/react-components
    
    # Install the required peer dependencies (v1.7.1+ required for database and webhook features)
    npm install @emd-cloud/sdk
    ```

    **For TypeScript projects, types are included automatically. No additional @types packages needed.**

4.  Wrap your application with the ApplicationProvider:

    ```javascript
    import { ApplicationProvider } from '@emd-cloud/react-components';
    
    function App() {
      return (
        <ApplicationProvider 
          app="your-app-id" 
          apiUrl="https://api.emd.one" // optional, defaults to this value
          authToken="your-auth-token" // optional, can be set later
        >
          {/* Your app components */}
        </ApplicationProvider>
      );
    }
    ```

That's it! The EMD Cloud React components are now ready to use.

## TypeScript Support

This library provides full TypeScript support with exported types from the EMD Cloud SDK. You can import and use these types in your TypeScript applications:

```tsx
import { 
  UserData,
  AccountStatus,
  PingStatus, 
  SocialProvider,
  AppEnvironment,
  ForgotPassData,
  ForgotPassCheckCodeData,
  OAuthUrlResponse
} from '@emd-cloud/react-components';

// Use the types in your components
interface UserProfileProps {
  user: UserData;
  onStatusChange: (status: AccountStatus) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onStatusChange }) => {
  return (
    <div>
      <h3>{user.firstName} {user.lastName}</h3>
      <p>Status: {user.accountStatus}</p>
      <p>Online: {user.pingStatus === PingStatus.Online ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

**Available Types:**

**Authentication Types:**
- `UserData` - Complete user information interface
- `AccountStatus` - User account status enum (`Pending`, `Approved`, `Rejected`)
- `PingStatus` - User online status enum (`Online`, `Offline`)
- `SocialProvider` - OAuth provider enum (`VK`, `YANDEX`)
- `AppEnvironment` - Application environment enum (`Client`, `Server`)
- `ForgotPassData` - Password recovery request data
- `ForgotPassCheckCodeData` - Password recovery code verification data
- `OAuthUrlResponse` - OAuth URL response interface

**Database Types:**
- `Database` - Database instance interface
- `DatabaseRowData` - Generic database row data structure
- `DatabaseQuery` - MongoDB-style query object for filtering
- `DatabaseSort` - Sorting configuration for database queries
- `DatabaseListOptions` - Options for listing/querying database rows
- `DatabaseGetRowOptions` - Options for retrieving a single row
- `DatabaseCountOptions` - Options for counting rows
- `DatabaseCreateOptions` - Options for creating new rows
- `DatabaseUpdateOptions` - Options for updating existing rows
- `DatabaseBulkUpdatePayload` - Bulk update operation payload
- `DatabaseRowResponse` - Single row response format
- `DatabaseRowsResponse` - Multiple rows response format
- `DatabaseCountResponse` - Row count response format
- `DatabaseBulkResponse` - Bulk operation response format
- `DatabaseDeleteResponse` - Delete operation response format
- `DatabaseTriggerResponse` - Button trigger response format
- `DatabaseSaveMode` - Save mode enum for database operations

**Common Types:**
- `CallOptions` - API call configuration options
- `AuthType` - Authentication type enum (`auth-token`, `api-token`)

<br>

## Components

### ApplicationProvider

**Description:**

The ApplicationProvider is the foundational component that wraps your React application to enable EMD Cloud functionality. It automatically initializes and manages the EMD Cloud SDK instance, providing context to all child components and hooks. This provider handles SDK initialization, token management, and maintains the connection to EMD Cloud services.

**Props:**

-   `app` (string, **required**): Your EMD Cloud application ID obtained from the console
-   `apiUrl` (string, optional): EMD Cloud API endpoint URL. Defaults to `"https://api.emd.one"`
-   `authToken` (string, optional): Initial authentication token. Can be set later via hooks
-   `tokenType` (string, optional): Authentication token type for API requests. Defaults to `"token"`
-   `children` (ReactNode, **required**): Your application components

**Key Features:**

- **Automatic SDK Management**: Initializes EMD Cloud SDK on mount and manages its lifecycle
- **Dynamic Loading**: Gracefully handles cases where SDK is not installed
- **Token Management**: Maintains authentication state across the application
- **Context Provision**: Provides SDK instance and user data to all child components
- **Error Handling**: Fails gracefully with helpful warnings when SDK is unavailable

**Example:**

```javascript
import { ApplicationProvider } from '@emd-cloud/react-components';

function App() {
  return (
    <ApplicationProvider 
      app="your-app-id" 
      apiUrl="https://api.emd.one" // optional, defaults to this value
      authToken="your-auth-token" // optional, can be set later via useAuth
      tokenType="token" // optional, defaults to "token"
    >
      <YourAppComponents />
    </ApplicationProvider>
  );
}

// With environment variables
function App() {
  return (
    <ApplicationProvider 
      app={process.env.REACT_APP_EMD_CLOUD_APP_ID}
      authToken={localStorage.getItem('emd_auth_token')}
    >
      <YourAppComponents />
    </ApplicationProvider>
  );
}
```

**Important Notes:**

- The ApplicationProvider **must** wrap any components that use EMD Cloud hooks
- The SDK instance is available after the component mounts (handles async initialization)  
- All authentication and user management flows depend on this provider being properly configured
- If the SDK peer dependency is not installed, the provider will log a warning and continue without SDK functionality

<br>

## Hooks

### Authorization Hooks:

#### Hook:  `useAuth`

**Description:**

This hook manages user authentication processes through the EMD Cloud platform using the EMD Cloud SDK. It provides methods for login, registration, logout, social authentication, and password recovery. The hook automatically manages user state and integrates with the SDK for secure authentication.

**Available Methods:**

-   `logInUser` (function): Log in a user with email/password.
-   `signUpUser` (function): Register a new user.
-   `authorization` (function): Check authentication status using a token.
-   `socialLogin` (function): Initiate OAuth login with VK or Yandex.
-   `exchangeOAuthToken` (function): Complete OAuth flow by exchanging secret for token.
-   `forgotPassword` (function): Initiate password recovery process.
-   `forgotPasswordCheckCode` (function): Verify password reset code.
-   `forgotPasswordChange` (function): Complete password reset.
-   `updateUser` (function): Update current or specified user’s profile information. 
-   `logOutUser` (function): Log out the current user.

**Return Value:** Returns an object with:

-   `userInfo` (object): Current user information.
-   `authorization` (function): For authentication verification.
-   `logInUser` (function): For email/password login.
-   `signUpUser` (function): For user registration.
-   `socialLogin` (function): For OAuth authentication.
-   `exchangeOAuthToken` (function): For completing OAuth flow.
-   `forgotPassword` (function): For initiating password recovery.
-   `forgotPasswordCheckCode` (function): For verifying reset codes.
-   `forgotPasswordChange` (function): For completing password reset.
-   `updateUser` (function): Update current or specified user’s profile information. 
-   `logOutUser` (function): For logout.

**Basic Authentication Example:**
```javascript
import { useAuth } from '@emd-cloud/react-components';

const MyAuthComponent = () => {
  const { logInUser, signUpUser, logOutUser, userInfo } = useAuth();

  const handleLogin = async (login, password) => {
    try {
      const user = await logInUser({ login, password });
      console.log('Logged in user:', user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignUp = async (login, password) => {
    try {
      const newUser = await signUpUser({ 
        login, 
        password,
        firstName: 'John',
        lastName: 'Doe',
        captchaToken: 'your-captcha-token' // optional
      });
      console.log('Registered user:', newUser);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleLogout = () => {
    logOutUser();
    console.log('User logged out.');
  };

  return (
    <div>
      <h3>Current User: {userInfo ? userInfo.login : 'Not logged in'}</h3>
      {/* Implement your login and signup forms here */}
      <button onClick={() => handleLogin('user@example.com', 'password123')}>Login</button>
      <button onClick={() => handleSignUp('newuser@example.com', 'password123')}>Sign Up</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};
```

**Social Login Example:**
```javascript
import { useAuth } from '@emd-cloud/react-components';

const SocialLoginComponent = () => {
  const { socialLogin, exchangeOAuthToken } = useAuth();

  const handleVKLogin = async () => {
    try {
      const response = await socialLogin({
        provider: 'vk',
        redirectUrl: 'https://myapp.com/auth/callback'
      });
      
      // Redirect user to VK for authentication
      window.location.href = response.url;
    } catch (error) {
      console.error('Social login failed:', error);
    }
  };

  const handleYandexLogin = async () => {
    try {
      const response = await socialLogin({
        provider: 'yandex',
        redirectUrl: 'https://myapp.com/auth/callback'
      });
      
      // Redirect user to Yandex for authentication
      window.location.href = response.url;
    } catch (error) {
      console.error('Social login failed:', error);
    }
  };

  // Handle OAuth callback (call this on your callback page)
  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('secret');
    
    if (secret) {
      try {
        const userData = await exchangeOAuthToken(secret);
        console.log('User authenticated:', userData);
        // Redirect to dashboard or main page
      } catch (error) {
        console.error('OAuth token exchange failed:', error);
      }
    }
  };

  return (
    <div>
      <button onClick={handleVKLogin}>Login with VK</button>
      <button onClick={handleYandexLogin}>Login with Yandex</button>
    </div>
  );
};
```

**Password Recovery Example:**
```javascript
import { useAuth } from '@emd-cloud/react-components';

const PasswordRecoveryComponent = () => {
  const { forgotPassword, forgotPasswordCheckCode, forgotPasswordChange } = useAuth();

  const handleForgotPassword = async (email) => {
    try {
      const response = await forgotPassword({ email });
      console.log('Password reset requested:', response.requestId);
      // Save requestId for next steps
    } catch (error) {
      console.error('Password reset request failed:', error);
    }
  };

  const handleCheckCode = async (requestId, code) => {
    try {
      const response = await forgotPasswordCheckCode({ requestId, code });
      console.log('Code verified:', response);
    } catch (error) {
      console.error('Code verification failed:', error);
    }
  };

  const handleChangePassword = async (requestId, newPassword, newPasswordRepeat) => {
    try {
      const userData = await forgotPasswordChange({ 
        requestId, 
        newPassword, 
        newPasswordRepeat 
      });
      console.log('Password changed successfully:', userData);
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  // Implementation details for your forms...
};
```

<br>

### Database Hooks:

#### Hook: `useDatabase`

**Description:**

The `useDatabase` hook provides comprehensive database operations for EMD Cloud collections using the EMD Cloud SDK. It offers type-safe CRUD operations, advanced querying with MongoDB-style syntax, sorting, pagination, and bulk operations. This hook automatically manages authentication and provides error handling for all database interactions.

**Available Methods:**

- `getRows<T>` (function): Retrieve multiple rows with filtering, sorting, and pagination
- `countRows` (function): Count rows matching specific criteria  
- `getRow<T>` (function): Retrieve a single row by ID
- `createRow<T>` (function): Create a new row in the collection
- `updateRow<T>` (function): Update an existing row by ID
- `bulkUpdate` (function): Perform bulk updates on multiple rows
- `deleteRow` (function): Delete a single row by ID
- `deleteRows` (function): Delete multiple rows matching criteria
- `triggerButton` (function): Execute button actions on database rows

**Key Features:**

- **Type Safety**: Full TypeScript support with generics for data types
- **Advanced Querying**: MongoDB-style query syntax with `$and`, `$or`, `$eq`, `$ne`, etc.
- **Sorting & Pagination**: Flexible sorting and pagination options
- **Bulk Operations**: Efficient bulk updates and deletions
- **Authentication**: Support for both user (`auth-token`) and server (`api-token`) authentication modes
- **Error Handling**: Comprehensive error handling with meaningful error messages

**Basic CRUD Example:**

```tsx
import { useDatabase } from '@emd-cloud/react-components';

// Define your data type for type safety
interface User {
  _id?: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

const UserManagement = () => {
  const { getRows, createRow, updateRow, deleteRow } = useDatabase();

  // Get all active users
  const loadActiveUsers = async () => {
    try {
      const response = await getRows<User>('users', {
        query: {
          "$and": [
            { "data.status": { "$eq": "active" } }
          ]
        },
        limit: 50,
        sort: [{ column: "createdAt", sort: "desc" }]
      });
      
      console.log('Active users:', response.data);
      console.log('Total count:', response.count);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  // Create a new user
  const createUser = async (userData: Omit<User, '_id' | 'createdAt'>) => {
    try {
      const response = await createRow<User>('users', userData);
      console.log('Created user:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  };

  // Update user status
  const updateUserStatus = async (userId: string, status: User['status']) => {
    try {
      const response = await updateRow<User>('users', userId, { status });
      console.log('Updated user:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  // Delete a user
  const removeUser = async (userId: string) => {
    try {
      await deleteRow('users', userId);
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  };

  return (
    <div>
      <button onClick={loadActiveUsers}>Load Active Users</button>
      <button onClick={() => createUser({ 
        name: 'John Doe', 
        email: 'john@example.com', 
        status: 'active' 
      })}>
        Create User
      </button>
    </div>
  );
};
```

**Advanced Querying Example:**

```tsx
import { useDatabase, DatabaseQuery } from '@emd-cloud/react-components';

const AdvancedUserSearch = () => {
  const { getRows, countRows } = useDatabase();

  // Complex query with multiple conditions
  const searchUsers = async () => {
    const query: DatabaseQuery = {
      "$and": [
        {
          "$or": [
            { "data.name": { "$regex": "John", "$options": "i" } },
            { "data.email": { "$regex": "@gmail.com" } }
          ]
        },
        { "data.status": { "$eq": "active" } },
        { "data.createdAt": { "$gte": "2024-01-01" } }
      ]
    };

    try {
      // Get matching users with pagination
      const usersResponse = await getRows('users', {
        query,
        limit: 20,
        offset: 0,
        sort: [
          { column: "name", sort: "asc" },
          { column: "createdAt", sort: "desc" }
        ]
      });

      // Count total matching users
      const countResponse = await countRows('users', { query });

      console.log('Found users:', usersResponse.data);
      console.log('Total matching users:', countResponse.count);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Search by date range
  const getUsersByDateRange = async (startDate: string, endDate: string) => {
    try {
      const response = await getRows('users', {
        query: {
          "data.createdAt": {
            "$gte": startDate,
            "$lte": endDate
          }
        },
        sort: [{ column: "createdAt", sort: "desc" }]
      });

      return response.data;
    } catch (error) {
      console.error('Date range search failed:', error);
      return [];
    }
  };

  return (
    <div>
      <button onClick={searchUsers}>Advanced Search</button>
      <button onClick={() => getUsersByDateRange('2024-01-01', '2024-12-31')}>
        Users This Year
      </button>
    </div>
  );
};
```

**Bulk Operations Example:**

```tsx
import { useDatabase } from '@emd-cloud/react-components';

const BulkUserOperations = () => {
  const { bulkUpdate, deleteRows, getRows } = useDatabase();

  // Bulk update user statuses
  const activateAllPendingUsers = async () => {
    try {
      const response = await bulkUpdate('users', {
        query: {
          "data.status": { "$eq": "pending" }
        },
        update: {
          "$set": { "data.status": "active" }
        }
      });

      console.log('Bulk update result:', response);
      console.log(`Updated ${response.modifiedCount} users`);
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  // Delete inactive users older than 6 months
  const cleanupInactiveUsers = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    try {
      const response = await deleteRows('users', {
        query: {
          "$and": [
            { "data.status": { "$eq": "inactive" } },
            { "data.lastLoginAt": { "$lt": sixMonthsAgo.toISOString() } }
          ]
        }
      });

      console.log(`Deleted ${response.deletedCount} inactive users`);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  // Get users with specific IDs
  const getUsersByIds = async (userIds: string[]) => {
    try {
      const response = await getRows('users', {
        query: {
          "_id": { "$in": userIds }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get users by IDs:', error);
      return [];
    }
  };

  return (
    <div>
      <button onClick={activateAllPendingUsers}>Activate Pending Users</button>
      <button onClick={cleanupInactiveUsers}>Cleanup Inactive Users</button>
    </div>
  );
};
```

**Authentication Modes Example:**

```tsx
import { useDatabase } from '@emd-cloud/react-components';

const ServerOperations = () => {
  const { getRows, createRow } = useDatabase();

  // Use server authentication for admin operations
  const getAdminData = async () => {
    try {
      const response = await getRows('admin_logs', {
        query: { "data.level": { "$eq": "error" } },
        limit: 100
      }, {
        authType: 'api-token' // Use server authentication
      });

      console.log('Admin logs:', response.data);
    } catch (error) {
      console.error('Admin operation failed:', error);
    }
  };

  // User-level operation (default auth-token)
  const getUserProfile = async (userId: string) => {
    try {
      const response = await getRows('user_profiles', {
        query: { "_id": { "$eq": userId } }
      }); // Uses default auth-token authentication

      return response.data[0];
    } catch (error) {
      console.error('Profile fetch failed:', error);
      return null;
    }
  };

  return (
    <div>
      <button onClick={getAdminData}>Get Admin Data</button>
      <button onClick={() => getUserProfile('user-123')}>Get User Profile</button>
    </div>
  );
};
```

**Button Trigger Example:**

```tsx
import { useDatabase } from '@emd-cloud/react-components';

const WorkflowActions = () => {
  const { triggerButton } = useDatabase();

  // Trigger a workflow button on a specific row
  const approveApplication = async (applicationId: string) => {
    try {
      const response = await triggerButton(
        'applications',     // Collection name
        applicationId,      // Row ID
        'approve_button'    // Button identifier
      );

      console.log('Application approved:', response);
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  // Trigger with custom authentication
  const triggerAdminAction = async (recordId: string) => {
    try {
      const response = await triggerButton(
        'admin_records',
        recordId,
        'admin_action_button',
        { authType: 'api-token' }
      );

      console.log('Admin action completed:', response);
    } catch (error) {
      console.error('Admin action failed:', error);
    }
  };

  return (
    <div>
      <button onClick={() => approveApplication('app-123')}>
        Approve Application
      </button>
      <button onClick={() => triggerAdminAction('record-456')}>
        Trigger Admin Action
      </button>
    </div>
  );
};
```

<br>

### Webhook Hooks:

#### Hook: `useWebhook`

**Description:**

The `useWebhook` hook provides easy integration with EMD Cloud webhook endpoints using the EMD Cloud SDK. It offers convenient methods for calling webhooks with different HTTP methods and payload formats, supporting both user and server authentication modes. This hook simplifies webhook integration for notifications, external process triggers, data fetching, and third-party service integrations.

**Available Methods:**

- `callWebhook` (function): Make webhook calls with full control over HTTP method, headers, and body

**Key Features:**

- **Custom Requests**: Full control over HTTP method, headers, and request body
- **Simple JSON Sending**: Easy POST requests with JSON payloads
- **GET Requests**: Fetch data from webhook endpoints
- **Authentication**: Support for both `auth-token` (user) and `api-token` (server) authentication modes
- **Error Handling**: Comprehensive error handling and response validation
- **Type Safety**: Full TypeScript support for webhook responses

**Basic Usage Example:**

```tsx
import { useWebhook } from '@emd-cloud/react-components';

const NotificationComponent = () => {
  const { callWebhook } = useWebhook();

  // Send a simple notification
  const sendUserLoginNotification = async (userId: string) => {
    try {
      const result = await callWebhook('user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          timestamp: new Date().toISOString(),
          source: 'web-app',
          userAgent: navigator.userAgent
        })
      });

      console.log('Notification sent:', result);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  // Get webhook status or configuration
  const checkWebhookStatus = async () => {
    try {
      const status = await callWebhook('health-check', { method: 'GET' });
      console.log('Webhook status:', status);
      return status;
    } catch (error) {
      console.error('Failed to check webhook status:', error);
      return null;
    }
  };

  // Custom webhook call with specific requirements
  const triggerProcessing = async (data: any) => {
    try {
      const result = await callWebhook('data-processor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Processing-Priority': 'high',
          'X-Request-ID': crypto.randomUUID()
        },
        body: JSON.stringify({
          action: 'process',
          data,
          timestamp: Date.now()
        })
      });

      console.log('Processing triggered:', result);
      return result;
    } catch (error) {
      console.error('Failed to trigger processing:', error);
      throw error;
    }
  };

  return (
    <div>
      <button onClick={() => sendUserLoginNotification('user-123')}>
        Send Login Notification
      </button>
      <button onClick={checkWebhookStatus}>
        Check Webhook Status
      </button>
      <button onClick={() => triggerProcessing({ type: 'user-data', id: 'user-123' })}>
        Trigger Data Processing
      </button>
    </div>
  );
};
```

**Event Notifications Example:**

```tsx
import { useWebhook } from '@emd-cloud/react-components';

const EventSystem = () => {
  const { callWebhook } = useWebhook();

  // User activity tracking
  const trackUserActivity = async (activity: {
    userId: string;
    action: string;
    page: string;
    data?: any;
  }) => {
    try {
      await callWebhook('user-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...activity,
          timestamp: new Date().toISOString(),
          sessionId: sessionStorage.getItem('sessionId'),
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  };

  // Order processing notifications
  const notifyOrderEvent = async (
    event: 'created' | 'updated' | 'completed' | 'cancelled',
    orderData: any
  ) => {
    try {
      await callWebhook(`order-${event}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          order: orderData,
          timestamp: new Date().toISOString(),
          source: 'ecommerce-app'
        })
      });

      console.log(`Order ${event} notification sent`);
    } catch (error) {
      console.error(`Failed to send order ${event} notification:`, error);
    }
  };

  // Error reporting
  const reportError = async (error: Error, context: any) => {
    try {
      await callWebhook('error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          context,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      });
    } catch (webhookError) {
      console.error('Failed to report error via webhook:', webhookError);
    }
  };

  return (
    <div>
      <button onClick={() => trackUserActivity({
        userId: 'user-123',
        action: 'page_view',
        page: '/dashboard'
      })}>
        Track Page View
      </button>
      <button onClick={() => notifyOrderEvent('created', { 
        id: 'order-456', 
        total: 99.99,
        items: ['item1', 'item2']
      })}>
        Notify Order Created
      </button>
    </div>
  );
};
```

**Third-Party Integration Example:**

```tsx
import { useWebhook } from '@emd-cloud/react-components';

const ThirdPartyIntegrations = () => {
  const { callWebhook } = useWebhook();

  // Slack notification integration
  const sendSlackNotification = async (message: string, channel: string) => {
    try {
      const result = await callWebhook('slack-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel,
          text: message,
          username: 'EMD Cloud Bot',
          timestamp: new Date().toISOString()
        })
      });

      console.log('Slack notification sent:', result);
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  };

  // Email service integration
  const sendEmail = async (to: string, subject: string, body: string) => {
    try {
      const result = await callWebhook('email-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Email-Priority': 'normal'
        },
        body: JSON.stringify({
          to,
          subject,
          body,
          from: 'noreply@myapp.com',
          timestamp: new Date().toISOString()
        })
      });

      console.log('Email sent:', result);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  };

  // External API data sync
  const syncWithCRM = async (customerData: any) => {
    try {
      const result = await callWebhook('crm-sync', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Source': 'web-app'
        },
        body: JSON.stringify({
          action: 'update_customer',
          data: customerData,
          syncTimestamp: new Date().toISOString()
        })
      });

      console.log('CRM sync completed:', result);
      return result;
    } catch (error) {
      console.error('CRM sync failed:', error);
      throw error;
    }
  };

  // Get integration status
  const checkIntegrationHealth = async () => {
    try {
      const [slackStatus, emailStatus, crmStatus] = await Promise.all([
        call('slack-health', { method: 'GET' }),
        call('email-health', { method: 'GET' }),
        call('crm-health', { method: 'GET' })
      ]);

      return {
        slack: slackStatus,
        email: emailStatus,
        crm: crmStatus
      };
    } catch (error) {
      console.error('Failed to check integration health:', error);
      return null;
    }
  };

  return (
    <div>
      <button onClick={() => sendSlackNotification('Hello from EMD Cloud!', '#general')}>
        Send Slack Message
      </button>
      <button onClick={() => sendEmail(
        'user@example.com',
        'Welcome to Our Service',
        'Thank you for signing up!'
      )}>
        Send Welcome Email
      </button>
      <button onClick={() => syncWithCRM({
        id: 'customer-123',
        name: 'John Doe',
        email: 'john@example.com'
      })}>
        Sync with CRM
      </button>
      <button onClick={checkIntegrationHealth}>
        Check Integration Health
      </button>
    </div>
  );
};
```

**Server Authentication Example:**

```tsx
import { useWebhook } from '@emd-cloud/react-components';

const AdminWebhookOperations = () => {
  const { callWebhook } = useWebhook();

  // Server-level operations requiring API token
  const triggerSystemMaintenance = async () => {
    try {
      const result = await callWebhook('system-maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Maintenance-Type': 'scheduled'
        },
        body: JSON.stringify({
          action: 'start_maintenance',
          duration: '30m',
          timestamp: new Date().toISOString()
        })
      }, {
        authType: 'api-token' // Use server authentication
      });

      console.log('Maintenance triggered:', result);
    } catch (error) {
      console.error('Failed to trigger maintenance:', error);
    }
  };

  // Send admin notifications
  const sendAdminAlert = async (alertType: string, message: string) => {
    try {
      await callWebhook('admin-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: alertType,
          message,
          severity: 'high',
          timestamp: new Date().toISOString(),
          source: 'admin-panel'
        })
      }, {
        authType: 'api-token'
      });

      console.log('Admin alert sent');
    } catch (error) {
      console.error('Failed to send admin alert:', error);
    }
  };

  // User-level webhook (default auth-token)
  const sendUserFeedback = async (feedback: string) => {
    try {
      await callWebhook('user-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        })
      }); // Uses default auth-token

      console.log('Feedback submitted');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <div>
      <button onClick={triggerSystemMaintenance}>
        Trigger System Maintenance
      </button>
      <button onClick={() => sendAdminAlert('system_overload', 'CPU usage is above 90%')}>
        Send Admin Alert
      </button>
      <button onClick={() => sendUserFeedback('Great app!')}>
        Send User Feedback
      </button>
    </div>
  );
};
```

**Error Handling and Response Validation:**

```tsx
import { useWebhook } from '@emd-cloud/react-components';

const RobustWebhookComponent = () => {
  const { callWebhook } = useWebhook();

  // Webhook with retry logic
  const sendWithRetry = async (webhookId: string, data: any, maxRetries = 3) => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await callWebhook(webhookId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            attempt,
            timestamp: new Date().toISOString()
          })
        });

        console.log(`Webhook succeeded on attempt ${attempt}:`, result);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Webhook attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw new Error(`Webhook failed after ${maxRetries} attempts: ${lastError.message}`);
  };

  // Validate webhook response
  const callWebhookWithValidation = async (webhookId: string, options: RequestInit) => {
    try {
      const result = await callWebhook(webhookId, options);

      // Custom validation logic
      if (result && typeof result === 'object' && 'status' in result) {
        if (result.status === 'error') {
          throw new Error(`Webhook returned error: ${result.message || 'Unknown error'}`);
        }
      }

      return result;
    } catch (error) {
      console.error('Webhook validation failed:', error);
      
      // Log error details for debugging
      console.error('Webhook details:', {
        webhookId,
        method: options.method || 'GET',
        headers: options.headers,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  };

  // Bulk webhook operations with error collection
  const sendBulkNotifications = async (notifications: Array<{id: string, data: any}>) => {
    const results = [];
    const errors = [];

    for (const notification of notifications) {
      try {
        const result = await callWebhook(notification.id, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification.data)
        });
        results.push({ id: notification.id, success: true, result });
      } catch (error) {
        errors.push({ id: notification.id, error: error.message });
      }
    }

    console.log(`Bulk notifications: ${results.length} succeeded, ${errors.length} failed`);
    
    if (errors.length > 0) {
      console.warn('Failed notifications:', errors);
    }

    return { results, errors };
  };

  return (
    <div>
      <button onClick={() => sendWithRetry('unreliable-webhook', { test: 'data' })}>
        Send with Retry Logic
      </button>
      <button onClick={() => callWebhookWithValidation('validation-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validate: true })
      })}>
        Call with Validation
      </button>
      <button onClick={() => sendBulkNotifications([
        { id: 'notification-1', data: { message: 'Hello 1' } },
        { id: 'notification-2', data: { message: 'Hello 2' } },
        { id: 'notification-3', data: { message: 'Hello 3' } }
      ])}>
        Send Bulk Notifications
      </button>
    </div>
  );
};
```

<br>

### Uploader Hooks:

#### Hook: `useUploader`

**Description:**

This hook provides file upload functionality to EMD Cloud storage using the SDK's TUS (resumable upload) protocol implementation. It manages multiple concurrent file uploads with progress tracking, automatic retries, and flexible permission settings. The hook integrates seamlessly with the ApplicationProvider and handles all aspects of the upload lifecycle including progress updates, error handling, and upload cancellation.

**Key Features:**

- **Resumable Uploads**: Uses TUS protocol for reliable uploads that can survive connection interruptions
- **Multiple File Support**: Upload multiple files simultaneously with independent progress tracking
- **Progress Tracking**: Real-time progress updates with bytes uploaded, total bytes, and percentage
- **Flexible Permissions**: Support for public, authenticated users, staff only, or specific user access
- **Chunked Upload**: Large file support with configurable chunk size (default: 5MB)
- **Automatic Retry**: Configurable retry delays for failed upload chunks
- **Upload Control**: Ability to cancel/abort individual file uploads
- **Request Interception**: onBeforeRequest callback for request customization
- **Type Safety**: Full TypeScript support with SDK types

**Parameters:**

**Note**: The hook automatically uses `apiUrl` and `app` configuration from the `ApplicationProvider` context. Make sure your application is wrapped with `ApplicationProvider` before using this hook.

-   `integration` (string, optional): S3 integration identifier. Default: `'default'`
-   `chunkSize` (number, optional): Size of each upload chunk in bytes. Default: `5242880` (5MB)
-   `headers` (object, optional): Additional HTTP headers to include in upload requests
-   `readPermission` (ReadPermission, optional): File access permission level. Options:
    -   `ReadPermission.Public` - File accessible to everyone
    -   `ReadPermission.OnlyAuthUser` - File accessible to all authenticated users
    -   `ReadPermission.OnlyAppStaff` - File accessible to uploader and app staff (default)
    -   `ReadPermission.OnlyPermittedUsers` - File accessible only to users in `permittedUsers` array
-   `permittedUsers` (string[], optional): Array of user IDs who can access the file (required when `readPermission` is `OnlyPermittedUsers`)
-   `presignedUrlTTL` (number, optional): Lifetime of generated presigned URLs in minutes. Default: `60`
-   `retryDelays` (number[], optional): Array of delay intervals in milliseconds for retry attempts. Default: `[0, 3000, 5000, 10000, 20000]`
-   `onBeforeUpload` (function, optional): Callback invoked before upload starts. Return `false` to cancel upload. Default: `() => true`
-   `onBeforeRequest` (function, optional): Callback invoked before each HTTP request during upload (for request interception/modification)
-   `onUpdate` (function, required): Callback invoked when file upload statuses change. Receives array of file objects with current status

**Return Value:** Returns an object with two properties:

-   `uploadFiles` (function): Function to initiate file uploads. Accepts an array of File objects
-   `isProccess` (boolean): Boolean flag indicating if any uploads are currently in progress

**File Object Structure:**

Each file in the `onUpdate` callback has the following structure:

```typescript
{
  id: string;              // Unique upload ID
  fileName: string;        // Name of the file
  status: 'started' | 'progress' | 'success' | 'failed';
  progress?: string;       // Upload progress percentage (e.g., "45.32")
  bytesUploaded?: number;  // Number of bytes uploaded
  bytesTotal?: number;     // Total file size in bytes
  fileUrl?: string;        // URL to access the file (available after success)
  error?: Error;           // Error object (if upload failed)
  methods?: {
    stop: () => void;      // Function to cancel/abort the upload
  };
}
```

**Basic Example:**

```tsx
import { useUploader, ReadPermission } from '@emd-cloud/react-components';
import { useState } from 'react';

const FileUploadComponent = () => {
  const [files, setFiles] = useState([]);

  const { uploadFiles, isProccess } = useUploader({
    readPermission: ReadPermission.OnlyAuthUser,
    onUpdate: (updatedFiles) => {
      setFiles(updatedFiles);
      console.log('Upload status:', updatedFiles);
    },
  });

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    uploadFiles(selectedFiles);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        disabled={isProccess}
      />
      {isProccess && <p>Uploading files...</p>}

      <div>
        {files.map((file) => (
          <div key={file.id}>
            <span>{file.fileName}</span>
            <span> - {file.status}</span>
            {file.progress && <span> ({file.progress}%)</span>}
            {file.fileUrl && (
              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                View File
              </a>
            )}
            {file.methods?.stop && file.status === 'progress' && (
              <button onClick={file.methods.stop}>Cancel</button>
            )}
            {file.error && <p>Error: {file.error.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Advanced Example with Validation:**

```tsx
import { useUploader, ReadPermission } from '@emd-cloud/react-components';
import { useState } from 'react';

const AdvancedUploadComponent = () => {
  const [files, setFiles] = useState([]);

  const { uploadFiles, isProccess } = useUploader({
    readPermission: ReadPermission.OnlyAuthUser,
    chunkSize: 10 * 1024 * 1024, // 10MB chunks for large files
    presignedUrlTTL: 120, // 2 hour URL validity
    onBeforeUpload: (files) => {
      // Validate files before upload
      const maxSize = 100 * 1024 * 1024; // 100MB max
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

      for (const file of files) {
        if (file.size > maxSize) {
          alert(`${file.name} exceeds 100MB limit`);
          return false;
        }
        if (!allowedTypes.includes(file.type)) {
          alert(`${file.name} has unsupported file type`);
          return false;
        }
      }
      return true;
    },
    onBeforeRequest: (req) => {
      // Log each upload request for debugging
      console.log('Upload request to:', req.getURL());
    },
    onUpdate: (updatedFiles) => {
      setFiles(updatedFiles);

      // Handle completion
      updatedFiles.forEach((file) => {
        if (file.status === 'success') {
          console.log(`✓ ${file.fileName} uploaded:`, file.fileUrl);
        } else if (file.status === 'failed') {
          console.error(`✗ ${file.fileName} failed:`, file.error?.message);
        }
      });
    },
  });

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    uploadFiles(selectedFiles);
  };

  // Calculate overall progress
  const overallProgress = files.length > 0
    ? files.reduce((sum, file) => sum + (parseFloat(file.progress || '0')), 0) / files.length
    : 0;

  return (
    <div>
      <h3>Upload Files</h3>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleFileSelect}
        disabled={isProccess}
      />

      {isProccess && (
        <div>
          <p>Overall Progress: {overallProgress.toFixed(1)}%</p>
          <progress value={overallProgress} max="100" />
        </div>
      )}

      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <strong>{file.fileName}</strong>
            <br />
            Status: {file.status}
            {file.progress && ` - ${file.progress}%`}
            {file.bytesUploaded && file.bytesTotal && (
              <span>
                {' '}({(file.bytesUploaded / 1024 / 1024).toFixed(2)}MB /
                {(file.bytesTotal / 1024 / 1024).toFixed(2)}MB)
              </span>
            )}
            <br />
            {file.fileUrl && (
              <a href={file.fileUrl} download>Download</a>
            )}
            {file.methods?.stop && file.status === 'progress' && (
              <button onClick={file.methods.stop}>Cancel Upload</button>
            )}
            {file.error && (
              <span style={{ color: 'red' }}>Error: {file.error.message}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

**Example with Specific User Permissions:**

```tsx
import { useUploader, ReadPermission } from '@emd-cloud/react-components';

const RestrictedUploadComponent = () => {
  const { uploadFiles, isProccess } = useUploader({
    readPermission: ReadPermission.OnlyPermittedUsers,
    permittedUsers: ['user-id-1', 'user-id-2', 'user-id-3'],
    onUpdate: (files) => {
      console.log('Files accessible only to specific users:', files);
    },
  });

  const handleUpload = (event) => {
    uploadFiles(Array.from(event.target.files));
  };

  return (
    <div>
      <h3>Upload Restricted Files</h3>
      <input type="file" multiple onChange={handleUpload} disabled={isProccess} />
      <p>These files will only be accessible to specified users.</p>
    </div>
  );
};
```

**Important Notes:**

- The `@emd-cloud/sdk` peer dependency must be installed for this hook to work
- The component **must** be wrapped with `ApplicationProvider` which provides the API URL and app configuration
- The hook uses the global configuration from `ApplicationProvider` - per-upload API URL/app overrides are not supported
- Files are uploaded using the TUS resumable upload protocol
- Upload progress is tracked in real-time via the `onUpdate` callback
- Each file gets a unique upload ID for reliable tracking
- The hook automatically handles authentication via the SDK

<br>
<br>

#### Method:  `useDropzone`

**Description:**

This hook implements dropzone functionality for uploading files. It allows handling drag-and-drop events and managing the drag state.

**Parameters:**

-   `accept`  (object, optional): An object defining the acceptable file types for upload. By default, it is  `{ '*': [] }`, which means all file types are accepted.
    
-   `onDragOver`  (function, optional): A drag event handler called when files are dragged over the upload area. Defaults to an empty function.
    
-   `onDragLeave`  (function, optional): An event handler called when files leave the upload area. Defaults to an empty function.
    
-   `onDrop`  (function, optional): An event handler called when files are dropped into the upload area. Defaults to an empty function.
    
-   `onDroped`  (function): An event handler called when files are successfully dropped. Takes an array of uploaded files.
    
-   `multiple`  (boolean, optional): A flag indicating if multiple file uploads are supported. Defaults to  `true`.
    
-   `disabled`  (boolean, optional): A flag disabling the ability to upload files. Defaults to  `false`.
    

**Return Value:**

Returns an object with several properties:

-   `rootProps`  (object): Properties to apply to the root element of the dropzone. Includes handlers for the  `onDragOver`,  `onDragLeave`,  `onDrop`, and  `onClick`  events.
    
-   `inputProps`  (object): Properties to apply to the  `<input type="file">`  element. Contains settings for file selection.
    
-   `open`  (function): A function to open the file selection dialog.
    
-   `dragStatus`  (object): An object containing the drag state, such as  `isDraggingOver`, which indicates whether the mouse pointer is over the dropzone.
    

**Example:**
```javascript
import { useUploader, useDropzone } from '@emd-cloud/react-components';

const MyUploaderComponent = () => {
  const { uploadFiles } = useUploader({
    options: {
      apiUrl: 'https://example.com',
      app: 'myApp',
    },
    onUpdate: (files) => {
      console.log('Updated file status:', files);
    },
  });

  const { rootProps, inputProps, open } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    onDroped: (files) => {
      uploadFiles(files);
    },
  });

  return (
    <div {...rootProps} style={{ border: '2px dashed #ccc', padding: '20px' }}>
      <input {...inputProps} />
      <button type="button" onClick={open}>Select Files</button>
      <p>Drag files here or click the button to upload.</p>
    </div>
  );
};
```

In this example, the  `useDropzone`  hook is used to create a dropzone, and the uploaded files are passed to  `uploadFiles`  from the  `useUploader`  hook. The user can drag files into the specified area or select files using the button.

## Advanced Usage

### Direct Context Access

For advanced use cases, you can directly access the application context and SDK instance:

```tsx
import { useContext } from 'react';
import { ApplicationContext, DispatchContext } from '@emd-cloud/react-components';

const AdvancedComponent = () => {
  const appData = useContext(ApplicationContext);
  const dispatch = useContext(DispatchContext);
  
  // Access the SDK instance directly
  const handleDirectSDKCall = async () => {
    if (appData.sdkInstance) {
      try {
        const result = await appData.sdkInstance.auth.authorization();
        console.log('Direct SDK call result:', result);
      } catch (error) {
        console.error('SDK call failed:', error);
      }
    }
  };
  
  // Access user data
  const currentUser = appData.user;
  
  return (
    <div>
      <p>App ID: {appData.app}</p>
      <p>API URL: {appData.apiUrl}</p>
      <p>User: {currentUser?.login || 'Not logged in'}</p>
      <button onClick={handleDirectSDKCall}>Direct SDK Call</button>
    </div>
  );
};
```

### Combined Database and Webhook Integration

Use both hooks together for powerful data-driven applications with real-time notifications:

```tsx
import { useDatabase, useWebhook, DatabaseRowData } from '@emd-cloud/react-components';

interface Order extends DatabaseRowData {
  customerId: string;
  items: Array<{ id: string; quantity: number; price: number }>;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
}

const OrderManagementSystem = () => {
  const { createRow, updateRow, getRows, triggerButton } = useDatabase();
  const { callWebhook } = useWebhook();

  // Create order with webhook notification
  const createOrder = async (orderData: Omit<Order, '_id' | 'createdAt'>) => {
    try {
      // Create order in database
      const newOrder = await createRow<Order>('orders', {
        ...orderData,
        createdAt: new Date().toISOString()
      });

      // Send webhook notification
      await callWebhook('order-created', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrder.data._id,
          customerId: orderData.customerId,
          total: orderData.total,
          timestamp: new Date().toISOString()
        })
      });

      console.log('Order created and notification sent:', newOrder.data);
      return newOrder.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  };

  // Update order status with notifications
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // Update order in database
      const updatedOrder = await updateRow<Order>('orders', orderId, { status });

      // Send status-specific webhook notifications
      switch (status) {
        case 'processing':
          await callWebhook('order-processing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              timestamp: new Date().toISOString()
            })
          });
          break;
        case 'shipped':
          await callWebhook('order-shipped', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              trackingInfo: updatedOrder.data.trackingNumber,
              timestamp: new Date().toISOString()
            })
          });
          break;
        case 'delivered':
          await callWebhook('order-delivered', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              timestamp: new Date().toISOString()
            })
          });
          break;
      }

      console.log(`Order ${orderId} updated to ${status}`);
      return updatedOrder.data;
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  // Get orders with filtering and send analytics webhook
  const getOrderAnalytics = async (dateRange: { start: string; end: string }) => {
    try {
      // Get orders from database
      const ordersResponse = await getRows<Order>('orders', {
        query: {
          "data.createdAt": {
            "$gte": dateRange.start,
            "$lte": dateRange.end
          }
        }
      });

      // Calculate analytics
      const analytics = {
        totalOrders: ordersResponse.count,
        totalRevenue: ordersResponse.data.reduce((sum, order) => sum + order.total, 0),
        averageOrderValue: ordersResponse.data.length > 0 
          ? ordersResponse.data.reduce((sum, order) => sum + order.total, 0) / ordersResponse.data.length 
          : 0,
        statusBreakdown: ordersResponse.data.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      // Send analytics to webhook for external processing
      await callWebhook('order-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analytics,
          dateRange,
          timestamp: new Date().toISOString()
        })
      });

      return analytics;
    } catch (error) {
      console.error('Failed to get order analytics:', error);
      throw error;
    }
  };

  // Process refund with database update and notifications
  const processRefund = async (orderId: string) => {
    try {
      // Trigger refund button in database
      const refundResult = await triggerButton('orders', orderId, 'process_refund');

      // Send refund notification
      await callWebhook('order-refunded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          refundAmount: refundResult.refundAmount,
          timestamp: new Date().toISOString()
        })
      });

      console.log('Refund processed:', refundResult);
      return refundResult;
    } catch (error) {
      console.error('Failed to process refund:', error);
      throw error;
    }
  };

  return (
    <div>
      <h3>Order Management System</h3>
      <button onClick={() => createOrder({
        customerId: 'customer-123',
        items: [{ id: 'item-1', quantity: 2, price: 29.99 }],
        status: 'pending',
        total: 59.98
      })}>
        Create Order
      </button>
      <button onClick={() => updateOrderStatus('order-456', 'shipped')}>
        Mark as Shipped
      </button>
      <button onClick={() => getOrderAnalytics({
        start: '2024-01-01',
        end: '2024-12-31'
      })}>
        Get Year Analytics
      </button>
      <button onClick={() => processRefund('order-789')}>
        Process Refund
      </button>
    </div>
  );
};
```

### Working with SDK Types

Use the exported types for better type safety across all hooks:

```tsx
import { 
  UserData, 
  SocialProvider, 
  DatabaseQuery,
  DatabaseSort,
  CallOptions,
  useAuth,
  useDatabase,
  useWebhook 
} from '@emd-cloud/react-components';

interface UserProfile extends DatabaseRowData {
  userId: string;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
  lastLoginAt: string;
}

const TypeSafeComponent = () => {
  const { userInfo, socialLogin } = useAuth();
  const { getRows, createRow, updateRow } = useDatabase();
  const { callWebhook } = useWebhook();
  
  // Type-safe social login
  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      const response = await socialLogin({
        provider,
        redirectUrl: window.location.origin + '/callback'
      });
      window.location.href = response.url;
    } catch (error) {
      console.error('Social login failed:', error);
    }
  };

  // Type-safe database operations
  const getUserProfiles = async (filters: DatabaseQuery, sorting: DatabaseSort[]) => {
    try {
      const response = await getRows<UserProfile>('user_profiles', {
        query: filters,
        sort: sorting,
        limit: 50
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user profiles:', error);
      return [];
    }
  };

  // Type-safe webhook with authentication options
  const notifyUserActivity = async (activity: any, authOptions: CallOptions) => {
    try {
      await callWebhook('user-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity)
      }, authOptions);
    } catch (error) {
      console.error('Failed to send activity notification:', error);
    }
  };
  
  const renderUserInfo = (user: UserData) => (
    <div>
      <h3>{user.firstName} {user.lastName}</h3>
      <p>Email: {user.login}</p>
      <p>Level: {user.level}</p>
      <p>Points: {user.points}</p>
      <span className={user.pingStatus === 'online' ? 'online' : 'offline'}>
        {user.pingStatus}
      </span>
    </div>
  );
  
  return (
    <div>
      {userInfo && renderUserInfo(userInfo)}
      <button onClick={() => handleSocialLogin(SocialProvider.VK)}>
        Login with VK
      </button>
      <button onClick={() => handleSocialLogin(SocialProvider.YANDEX)}>
        Login with Yandex
      </button>
      <button onClick={() => getUserProfiles(
        { "data.preferences.notifications": { "$eq": true } },
        [{ column: "lastLoginAt", sort: "desc" }]
      )}>
        Get Active Users
      </button>
      <button onClick={() => notifyUserActivity(
        { action: 'profile_view', timestamp: new Date().toISOString() },
        { authType: 'auth-token' }
      )}>
        Track Activity
      </button>
    </div>
  );
};
```

### Custom SDK Configuration

For advanced SDK configuration, you can access the SDK instance after initialization:

```tsx
import { useContext, useEffect } from 'react';
import { ApplicationContext } from '@emd-cloud/react-components';

const CustomSDKComponent = () => {
  const { sdkInstance } = useContext(ApplicationContext);
  
  useEffect(() => {
    if (sdkInstance) {
      // SDK is ready, perform custom configuration
      console.log('SDK initialized and ready');
      
      // You can access additional SDK methods here
      // Note: Always check if methods exist before calling
    }
  }, [sdkInstance]);
  
  return <div>Custom SDK integration component</div>;
};
```

## Conclusion

This library will simplify the integration and use of EMD Cloud services in your React application.
