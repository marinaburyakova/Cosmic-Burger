import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  modals: {
    ingredientModal: false,
    orderModal: false,
    successModal: false,
  },
  selectedIngredient: null,
  pendingOrder: null,
  notification: null,
  isLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action) => {
      const { modal } = action.payload;
      state.modals[modal] = true;
      if (action.payload.ingredient) {
        state.selectedIngredient = action.payload.ingredient;
      }
    },
    closeModal: (state, action) => {
      const { modal } = action.payload;
      state.modals[modal] = false;
      if (modal === 'ingredientModal') {
        state.selectedIngredient = null;
      }
      if (modal === 'successModal') {
        state.pendingOrder = null;
      }
    },
    setPendingOrder: (state, action) => {
      state.pendingOrder = action.payload;
    },
    showNotification: (state, action) => {
      state.notification = action.payload;
    },
    hideNotification: (state) => {
      state.notification = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { openModal, closeModal, setPendingOrder, showNotification, hideNotification, setLoading } = uiSlice.actions;
export default uiSlice.reducer;