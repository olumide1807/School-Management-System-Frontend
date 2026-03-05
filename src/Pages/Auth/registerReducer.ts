export const INITIAL_STATE = {
    error: false,
    success: false,
    loading: false
}

const registerReducer = (state, action) => {
    switch(action.type){
        case 'REGISTER_START':
            return{
                ...state,
                loading: true
            }
        case 'REGISTER_SUCCESS':
            return{
                ...state,
                loading: false,
                success: true
            }
        case 'REGISTER_FAIL':
            return{
                ...state,
                success: false,
                error: true
            }
        default: {
            return state;
        }
    }
}


export default registerReducer;
