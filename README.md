
# EMD Cloud / React Components

-   [Overview](#overview)
-   [Getting Started](#getting-started)
-   [Components](#components)
    -   [ApplicationProvider](#applicationprovider)
-   [Hooks](#hooks)
    -   [Authorization Hooks](#authorization-hooks)
        -   [Hook: useAuth](#hook--useauth)
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
    
    # Install the required peer dependencies
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

```typescript
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

- `UserData` - Complete user information interface
- `AccountStatus` - User account status enum (`Pending`, `Approved`, `Rejected`)
- `PingStatus` - User online status enum (`Online`, `Offline`)
- `SocialProvider` - OAuth provider enum (`VK`, `YANDEX`)
- `AppEnvironment` - Application environment enum (`Client`, `Server`)
- `ForgotPassData` - Password recovery request data
- `ForgotPassCheckCodeData` - Password recovery code verification data
- `OAuthUrlResponse` - OAuth URL response interface

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

### Uploader Hooks:

#### Hook:  `useUploader`

**Description:**

This hook manages file uploads to the server using the  `tus-js-client`  library. It provides the ability to track the upload status and progress of files.

**Parameters:**

-   `options`: Uploader options containing:
    -   `apiUrl`  (string): API URL for file uploads.
    -   `app`  (string): application name.
-   `integration`  (string, optional): integration identifier for uploads.
-   `headers`  (object, optional): headers to be sent with the request.
-   `readPermission` (enum): option for setting read permission to file link (can be `public` for all users, `onlyAuthUser` for all authenticated users, `onlyAppStaff` for user who uploaded file and administrators, `onlyPermittedUsers` for specific users specified in the `permittedUsers` parameter, default `onlyAppStaff`)
-   `permittedUsers` (string array): the list of users who will have access to the files is specified for `readPermission` equal to `onlyPermittedUsers`
-   `presignedUrlTTL` (number): option for setting lifetime of generated file link after redirect from general link (default `60`)
-   `retryDelays`  (array, optional): an array of delays for retry attempts in milliseconds. Default is  `[0, 3000, 5000, 10000, 20000]`.
-   `onBeforeUpload`  (function): callback function called before the upload starts. It should return  `true`  if the upload should continue, or  `false`  if the upload should be canceled. Defaults to  `true`.
-   `onUpdate`  (function): callback function called when the status of file uploads is updated. Takes an array of files with updated upload status information.

**Return Value:**  Returns an object with two properties:

-   `uploadFiles`  (function): function to upload files. Takes an array of files to upload.
-   `isProccess`  (boolean): flag indicating if there are active uploads in progress.

**Example:**
```javascript
import { useUploader } from '@emd-cloud/react-components';

const MyUploaderComponent = () => {
  const { uploadFiles, isProccess } = useUploader({
    options: {
      apiUrl: 'https://example.com',
      app: 'myApp',
    },
    onUpdate: (files) => {
      console.log('Updated file status:', files);
    },
  });

  const handleUpload = (files) => {
    uploadFiles(files);
  };

  return (
    <div>
      <input type="file" multiple onChange={(e) => handleUpload(e.target.files)} />
      {isProccess && <p>Uploading files...</p>}
    </div>
  );
};

```

In this example, the  `useUploader`  hook is used for uploading files. The upload status can be tracked via  `onUpdate`  upon completion of the uploads.

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

```typescript
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

### Working with SDK Types

Use the exported types for better type safety:

```typescript
import { UserData, SocialProvider, useAuth } from '@emd-cloud/react-components';

const TypeSafeAuthComponent = () => {
  const { socialLogin, userInfo } = useAuth();
  
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
    </div>
  );
};
```

### Custom SDK Configuration

For advanced SDK configuration, you can access the SDK instance after initialization:

```typescript
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
