export var ACTION;
(function (ACTION) {
    ACTION[ACTION["SET_USER"] = 1] = "SET_USER";
    ACTION[ACTION["SET_APP"] = 2] = "SET_APP";
})(ACTION || (ACTION = {}));
const reducer = (state, { type, payload }) => {
    if (type === ACTION.SET_USER) {
        return { ...state, user: payload };
    }
    throw Error('Unknown action.');
};
export default reducer;
