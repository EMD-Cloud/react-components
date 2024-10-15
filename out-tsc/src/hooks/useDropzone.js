// ** React Imports
import { useState, useMemo, useCallback, useRef, } from 'react';
// ** Source code Imports
import { acceptPropAsAcceptAttr } from '../tools/uploader';
const useDropzone = ({ accept, onDragOver = () => {
    /* Empty... */
}, onDragLeave = () => {
    /* Empty... */
}, onDrop = () => {
    /* Empty... */
}, onDroped = () => {
    /* Empty... */
}, multiple = true, disabled = false, }) => {
    const timeout = useRef();
    const inputRef = useRef(null);
    const [dragStatus, setDragStatus] = useState({ isDraggingOver: false });
    const acceptAttr = useMemo(() => acceptPropAsAcceptAttr(accept), [accept]);
    const onInputChange = useCallback((event) => {
        if (!event.target.files || disabled)
            return;
        const files = Array.from(event.target.files);
        if (files.length)
            onDroped(files);
        event.target.value = '';
    }, [onDroped, disabled]);
    const handleDragOver = useCallback((event) => {
        if (disabled)
            return;
        event.preventDefault();
        event.stopPropagation();
        const { types } = event.dataTransfer;
        const hasFiles = types.some((type) => type === 'Files');
        if (!hasFiles) {
            event.dataTransfer.dropEffect = 'none';
            clearTimeout(timeout.current);
            return;
        }
        event.dataTransfer.dropEffect = 'copy';
        clearTimeout(timeout.current);
        setDragStatus({ isDraggingOver: true });
        onDragOver(event);
    }, [onDragOver, disabled]);
    const handleDragLeave = useCallback((event) => {
        if (disabled)
            return;
        event.preventDefault();
        event.stopPropagation();
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            setDragStatus({ isDraggingOver: false });
        }, 50);
        onDragLeave(event);
    }, [onDragLeave, disabled]);
    const handleDrop = useCallback(async (event) => {
        if (disabled)
            return;
        event.preventDefault();
        clearTimeout(timeout.current);
        setDragStatus({ isDraggingOver: false });
        onDrop(event);
        // Add all dropped files
        const files = Array.from(event.dataTransfer.files).filter(({ type }) => {
            const acceptedTypes = acceptAttr === null || acceptAttr === void 0 ? void 0 : acceptAttr.replace(/\*/g, '').split(',');
            let isExist = false;
            acceptedTypes === null || acceptedTypes === void 0 ? void 0 : acceptedTypes.forEach((item) => {
                if (type.includes(item))
                    isExist = true;
            });
            return isExist;
        });
        if (files.length)
            onDroped(files);
    }, [onDrop, onDroped, disabled, acceptAttr]);
    return {
        rootProps: {
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
            onClick: () => { var _a; return !disabled && ((_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.click()); },
        },
        inputProps: {
            ref: inputRef,
            multiple,
            accept: acceptAttr,
            type: 'file',
            onChange: onInputChange,
        },
        open: () => { var _a; return !disabled && ((_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.click()); },
        dragStatus,
    };
};
export default useDropzone;
