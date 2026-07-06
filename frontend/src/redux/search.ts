import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
    keyword: string;
}

const initialState: SearchState = {
    keyword: "",
};
//dùng để tạo reducer và action cho trạng thái tìm kiếm.
const search = createSlice({
    name: "search",
    initialState,
    reducers: {
        setKeyword: (state, action: PayloadAction<string>) => {
            state.keyword = action.payload;
        },
        clearKeyword: (state) => {
            state.keyword = "";
        },
    },
});

export const { setKeyword, clearKeyword } = search.actions;
export default search.reducer;
