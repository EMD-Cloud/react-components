# EMD Cloud / React Components

> Ready-to-use React UI components for working with the EMD Cloud platform.

# How to use

1. Install npm or yarn package:

```
npm install @emd-cloud/react-components
yarn install @emd-cloud/react-components
```

2. Register on the EMD Cloud platform and create an application via the link - https://console.cloud.emd.one

3. Get the API token of your application.


## Hooks

### Hook  `useUploader`

#### Description

`useUploader`  is a custom hook that provides functionality for uploading files through the EMD Cloud API. It manages the state of file uploads, tracks progress, and returns methods to start and stop the upload process.

#### Import

javascript

```
import { useUploader } from '@emd-cloud/react-components';

```

#### Types

##### `UploaderOptions`

typescript

```
export type UploaderOptions = {
  apiUrl: string; // URL of the API for file uploads
  app: string;    // Name of the application
};

```

##### `FileType`

typescript

```
export type FileType = {
  id: string;                      // Unique identifier for the file
  name?: string;                   // Name of the file
  fileName?: string;               // Name of the file received after upload
  fileUrl?: string;                // URL of the uploaded file
  status: 'started' | 'progress' | 'success' | 'failed'; // Status of the file upload
  progress?: number | string;      // Upload progress in percentage
  bytesUploaded?: number;          // Number of bytes uploaded
  bytesTotal?: number;             // Total number of bytes of the file
  methods?: {
    stop: () => void;              // Method to stop the upload
  };
};

```

##### `UploaderType`

typescript

```
interface UploaderType {
  options?: UploaderOptions; // Options for the uploader
  integration?: string;      // Identifier of the integration
  headers?: Record<string, string | number | boolean>; // Request headers
  retryDelays?: number[];    // Retry delays
  onBeforeUpload?: (files: File[]) => boolean; // Function called before uploading files
  onUpdate: (files: FileType[]) => void; // Handler for file state updates
}

```

#### Hook Parameters

-   `options`  (required): An object of type  `UploaderOptions`  containing API parameters.
-   `integration`: A string identifying the integration.
-   `headers`: Headers for the request that will be applied to all uploads.
-   `retryDelays`: An array of delays for retrying uploads (default:  `[0, 3000, 5000, 10000, 20000]`).
-   `onBeforeUpload`: A function that is called before starting the upload. It should return  `true`  to continue the upload, or  `false`  to cancel.
-   `onUpdate`  (required): A callback function that is invoked when the state of uploaded files is updated.

#### Returned Values

typescript

```
return { uploadFiles, isProccess };

```

-   `uploadFiles`: A method to start uploading files.
-   `isProccess`: A boolean value indicating whether there are active uploads.

#### Usage Example

javascript

```
const { uploadFiles, isProccess } = useUploader({
  options: {
    apiUrl: 'example.com',
    app: 'myApp'
  },
  onBeforeUpload: (files) => {
    // Logic to check if the upload can proceed
    return true;
  },
  onUpdate: (files) => {
    // Logic to handle file updates
    console.log(files);
  },
});

// Upload files
uploadFiles(selectedFiles);

```

#### Notes

-   Note that  `applicationContext`  is used to obtain the application configuration, so make sure it is available in the component tree.

#### Conclusion

`useUploader`, in conjunction with  `useDropzone`, is a tool that simplifies the creation of a file upload component in React applications and allows you to manage upload statuses, progress, and handle upload errors.



### Hook  `useDropzone`

#### Description

`useDropzone`  is a custom hook that provides functionality for handling file uploads via drag-and-drop in React applications. It manages the drag interaction, tracks the drag status, and allows developers to specify the accepted file types as well as callbacks for various drag events.

#### Import

javascript

```
import { useDropzone } from '@emd-cloud/react-components';

```

#### Types

##### `DropzoneType`

typescript

```
interface DropzoneType {
  accept: Record<string, string[]>; // Accepted file types
  onDragOver?: (event: DragEvent<HTMLInputElement>) => void; // Callback for the dragover event
  onDragLeave?: (event: DragEvent<HTMLInputElement>) => void; // Callback for the dragleave event
  onDrop?: (event: DragEvent<HTMLInputElement>) => void; // Callback for the drop event
  onDroped?: (files: File[]) => void; // Callback invoked when files are dropped
  multiple?: boolean; // Indicates if multiple files can be uploaded
  disabled?: boolean; // Indicates if the dropzone is disabled
}

```

#### Hook Parameters

-   `accept`  (required): An object defining the accepted file types, where keys are MIME types and values are arrays of file extensions.
-   `onDragOver`: (optional) A callback function invoked during the dragover event.
-   `onDragLeave`: (optional) A callback function invoked during the dragleave event.
-   `onDrop`: (optional) A callback function invoked when a file is dropped.
-   `onDroped`: (required) A callback function invoked when files are dropped. It takes an array of  `File`  objects.
-   `multiple`  (optional, default:  `true`): A boolean value indicating whether multiple files can be uploaded.
-   `disabled`  (optional, default:  `false`): A boolean value indicating whether the dropzone is disabled.

#### Returned Values

typescript

```
return {
  rootProps, // Properties to spread on the root dropzone element
  inputProps, // Properties to spread on the hidden input element
  open, // Function to programmatically open the file selection dialog
  dragStatus, // Status of the drag operation
};

```

-   `rootProps`: An object containing handlers (`onDragOver`,  `onDragLeave`, and  `onDrop`) and a click handler for the root dropzone element.
-   `inputProps`: An object containing properties for the hidden input element.
-   `open`: A function that opens the file selection dialog when called.
-   `dragStatus`: An object containing the status of the drag operation (e.g., if dragging is occurring over the dropzone).

#### Usage Example

javascript

```
const { rootProps, inputProps, dragStatus } = useDropzone({
  accept: {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
  },
  onDroped: (files) => {
    console.log('Dropped files:', files);
  },
});

// Render the dropzone
return (
  <div {...rootProps}>
    <input {...inputProps} />
    {dragStatus.isDraggingOver && <p>Drop files here...</p>}
    <p>Click to select files</p>
  </div>
);

```

#### Notes

-   Ensure that you correctly handle the accepted file types in the  `accept`  parameter to avoid unintended file uploads.
-   The  `inputRef`  is managed internally within the hook, allowing you to programmatically trigger the file selection dialog.

#### Conclusion

`useDropzone` simplifies the implementation of file upload functionality via drag-and-drop in React applications, providing an easy way to manage file types, drag events, and overall user interaction with the dropzone. It enables developers to efficiently create intuitive and responsive interfaces.
> todo
