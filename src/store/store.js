import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import ordersReducer from './slices/ordersSlice';
import uiReducer from './slices/uiSlice';
import burgerReducer from './slices/burgerSlice';
import { websocketMiddleware } from './middleware/websocketMiddleware';

export const store = configureStore({
  reducer: {
    user: userReducer,
    orders: ordersReducer,
    ui: uiReducer,
    burger: burgerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Отключаем для WebSocket
    }).concat(websocketMiddleware),
});

// Инициализируем WebSocket
store.dispatch({ type: 'app/init' });