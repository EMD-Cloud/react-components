const isDefined = (value) => {
    return value !== undefined && value !== null;
};
export const isMIMEType = (v) => {
    return v === 'audio/*' || v === 'video/*' || v === 'image/*' || v === 'text/*' || /\w+\/[-+.\w]+/g.test(v);
};
export const isExt = (v) => {
    return /^.*\.[\w]+$/.test(v);
};
export const acceptPropAsAcceptAttr = (accept) => {
    if (isDefined(accept)) {
        return Object.entries(accept)
            .reduce((a, [mimeType, ext]) => [...a, mimeType, ...ext], [])
            .filter(v => isMIMEType(v) || isExt(v))
            .join(',');
    }
    return undefined;
};
