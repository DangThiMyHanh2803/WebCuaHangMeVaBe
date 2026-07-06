import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './search';
//dùng để tạo store chung cho ứng dụng.
const store = configureStore({
    reducer: {
        search: searchReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;