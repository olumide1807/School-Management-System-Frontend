export const sessionReducer = (state, action) => {
    switch (action.type) {
        case 'SET_FIELD':
            return {
                ...state,
                [action.payload.name]: action.payload.value,
            };
        case 'SET_TERM_FIELD':
            const { index, name, value } = action.payload;
            const updatedTerms = [...state.term];
            updatedTerms[index][name] = value instanceof Date ? value.toISOString() : value;
            return { ...state, term: updatedTerms };
        case 'RESET':
            return action.payload;
        default:
            return state;
    }
};