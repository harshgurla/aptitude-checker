import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTest: null,
  testStartTime: null,
  answers: {},
  timeRemaining: null,
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setCurrentTest: (state, action) => {
      state.currentTest = action.payload;
      state.answers = {};
      state.testStartTime = Date.now();
    },
    setAnswer: (state, action) => {
      const { questionId, answerId } = action.payload;
      state.answers[questionId] = answerId;
    },
    clearTest: (state) => {
      state.currentTest = null;
      state.testStartTime = null;
      state.answers = {};
      state.timeRemaining = null;
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
  },
});

export const { setCurrentTest, setAnswer, clearTest, setTimeRemaining } = testSlice.actions;
export default testSlice.reducer;
