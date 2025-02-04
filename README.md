
# EMD Cloud / React Components

-   [Overview](#overview)
-   [Getting Started](#getting-started)
-   [Hooks](#hooks)
    -   [Authorization Hooks](#authorization-hooks)
        -   [Hook: useAuth](#hook--useauth)
    -   [Uploader Hooks](#uploader-hooks)
        -   [Hook: useUploader](#hook--useuploader)
        -   [Method: useDropzone](#method--usedropzone)
-   [Conclusion](#conclusion)

## Overview

The EMD Cloud React components provide a set of React components for interacting with the  [EMD Cloud](https://cloud.emd.one/)  platform. These components are designed to simplify working with EMD Cloud services in your React applications.

## Getting Started

1.  Register on the EMD Cloud platform and create an application at  [https://console.cloud.emd.one](https://console.cloud.emd.one/).
    
2.  Obtain your application’s API token.
    
3.  Install the npm or yarn package:

	  **NPM**
    ```
    npm install @emd-cloud/react-components
    ```
    **Yarn**
    ```sh
    yarn add @emd-cloud/react-components
    ```
That's it! The EMD Cloud React components are now ready to use.

<br>

## Hooks

### Authorization Hooks:

#### Hook:  `useAuth`

**Description:**

This hook manages user authentication processes through the EMD Cloud platform, including login, registration, and logout, using application context and state management. It allows you to retrieve information about the current user and update the user's state in the application.

**Parameters:**

-   `logInUser` (function): log in a user.
    -   `params` (object): object containing login and password.
-   `signUpUser`: function to register a new user.
    -   `params` (object): object containing login and password.
-   `authorization` (function): check authentication status using a token.
-   `token` (string): access token to authorize the user.
-   `logOutUser` (function): called to log out a user.

**Return Value:**  Returns an object with two properties:

-   `userInfo` (object): with current user information.
-   `authorization` (function): for authentication.
-   `logInUser` (function): for log in.
-   `logOutUser` (function): for log out.
-   `signUpUser` (function): for sign up.

**Example:**
```javascript
import { useAuth } from '../hooks/useAuth';

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
      const newUser = await signUpUser({ login, password });
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

In this example, the `useAuth` hook is used to manage the user authentication processes and get information about the current user.

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


## Conclusion

This library will simplify the integration and use of EMD Cloud services in your React application.
