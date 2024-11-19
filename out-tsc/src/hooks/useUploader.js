// ** React Importsi
import { useRef, useState, useEffect, useCallback, useContext, useMemo } from 'react';
// ** Modules Imports
import { Upload } from 'tus-js-client';
import { v4 as uuidv4 } from 'uuid';
// ** Source code Imports
import ApplicationContext from '../components/ApplicationProvider/context';
const useUploader = ({ options, integration, headers, retryDelays = [0, 3000, 5000, 10000, 20000], onBeforeUpload = () => true, onUpdate, }) => {
    const isFirstRun = useRef(true);
    const [isProccess, setProccess] = useState(false);
    const [observedfiles, setObservedFiles] = useState([]);
    const appData = useContext(ApplicationContext);
    const integrationId = useMemo(() => integration || 'default', [integration]);
    const getEndpointUrl = useCallback(() => {
        const apiUrl = (options === null || options === void 0 ? void 0 : options.apiUrl) || (appData === null || appData === void 0 ? void 0 : appData.apiUrl);
        const app = (options === null || options === void 0 ? void 0 : options.app) || (appData === null || appData === void 0 ? void 0 : appData.app);
        return `https://${apiUrl}/api/${app}/uploader/chunk/${integrationId}/s3/`;
    }, [options, integrationId, appData]);
    const getFileUrl = useCallback(() => {
        const apiUrl = (options === null || options === void 0 ? void 0 : options.apiUrl) || (appData === null || appData === void 0 ? void 0 : appData.apiUrl);
        const app = (options === null || options === void 0 ? void 0 : options.app) || (appData === null || appData === void 0 ? void 0 : appData.app);
        return `https://${apiUrl}/api/${app}/uploader/chunk/${integrationId}/file/`;
    }, [options, integrationId, appData]);
    useEffect(() => {
        const filesInProgress = !!observedfiles.find(({ status }) => status === 'progress');
        setProccess(filesInProgress);
        if (isFirstRun.current)
            isFirstRun.current = false;
        else
            onUpdate(observedfiles);
    }, [observedfiles]);
    const uploadFiles = useCallback((files) => {
        const uploadFile = (file, fileId) => {
            var _a;
            const upload = new Upload(file, {
                endpoint: getEndpointUrl(),
                retryDelays,
                headers: {
                    ...(((_a = appData.user) === null || _a === void 0 ? void 0 : _a.token) && { Authorization: `token ${appData.user.token}` }),
                    ...headers,
                },
                metadata: {
                    filename: file.name,
                    filetype: file.type,
                },
                onError: (error) => {
                    setObservedFiles((state) => {
                        return state.map((item) => {
                            if (item.id === fileId)
                                return {
                                    ...item,
                                    status: 'failed',
                                    error,
                                };
                            return item;
                        });
                    });
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    const progress = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                    setObservedFiles((state) => {
                        return state.map((item) => {
                            if (item.id === fileId)
                                return {
                                    ...item,
                                    status: 'progress',
                                    progress,
                                    bytesUploaded,
                                    bytesTotal,
                                };
                            return item;
                        });
                    });
                },
                onSuccess: () => {
                    setObservedFiles((state) => {
                        return state.map((item) => {
                            var _a;
                            const fileUrl = `${getFileUrl()}/${(_a = upload.url) === null || _a === void 0 ? void 0 : _a.split('/').pop()}`;
                            if (item.id === fileId) {
                                return {
                                    ...item,
                                    name: item.name,
                                    status: 'success',
                                    fileName: file.name,
                                    fileUrl,
                                };
                            }
                            return item;
                        });
                    });
                },
            });
            return upload;
        };
        const isContinue = onBeforeUpload(files);
        if (!isContinue)
            return;
        const data = files.map((file) => {
            const id = uuidv4();
            const upload = uploadFile(file, id);
            upload.start();
            const stop = () => {
                upload.abort();
                setObservedFiles((state) => {
                    return state.filter((item) => item.id !== id);
                });
            };
            return {
                id,
                methods: { stop },
                fileName: file.name,
                status: 'started',
                progress: 0,
            };
        });
        setObservedFiles(data);
    }, [onBeforeUpload]);
    return { uploadFiles, isProccess };
};
export default useUploader;
