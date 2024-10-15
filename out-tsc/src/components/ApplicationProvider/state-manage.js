const reducer = (state, { type, payload }) => {
    if (type === 'login') {
        return { ...state, ...payload };
    }
    throw Error('Unknown action.');
};
export default reducer;
