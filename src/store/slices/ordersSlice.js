import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Асинхронный thunk для добавления заказа
export const addOrder = createAsyncThunk(
  'orders/addOrder',
  async ({ orderNumber, burgerName, totalPrice, allIngredients, userId }) => {
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newOrder = {
      id: orderNumber,
      name: burgerName,
      totalPrice: totalPrice,
      ingredients: allIngredients,
      status: 'pending',
      statusText: 'Ожидает подтверждения',
      timestamp: Date.now(),
      userId: userId || null,
    };
    
    return newOrder;
  }
);

const initialState = {
  allOrders: [],
  userOrders: [],
  isLoading: false,
  wsConnected: false,
  wsError: null,
  lastUpdate: null,
  stats: {
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
  },
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    wsConnected: (state) => {
      state.wsConnected = true;
      state.wsError = null;
    },
    wsDisconnected: (state) => {
      state.wsConnected = false;
    },
    wsError: (state, action) => {
      state.wsError = action.payload;
    },
    newOrderReceived: (state, action) => {
      const newOrder = action.payload;
      state.allOrders.unshift(newOrder);
      if (newOrder.userId) {
        state.userOrders.unshift(newOrder);
      }
      state.stats.total++;
      state.stats.pending++;
      state.lastUpdate = Date.now();
    },
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const order = state.allOrders.find(o => o.id === id);
      if (order) {
        const oldStatus = order.status;
        order.status = status;
        
        // Обновляем статус текст
        switch(status) {
          case 'preparing':
            order.statusText = 'Готовится';
            state.stats.pending--;
            state.stats.preparing++;
            break;
          case 'ready':
            order.statusText = 'Готов к выдаче';
            state.stats.preparing--;
            state.stats.ready++;
            break;
          case 'completed':
            order.statusText = 'Выдан';
            state.stats.ready--;
            state.stats.completed++;
            break;
        }
        
        // Обновляем в userOrders
        const userOrder = state.userOrders.find(o => o.id === id);
        if (userOrder) {
          userOrder.status = status;
          userOrder.statusText = order.statusText;
        }
        
        state.lastUpdate = Date.now();
      }
    },
    syncOrders: (state, action) => {
      const newOrders = action.payload;
      newOrders.forEach(newOrder => {
        const existing = state.allOrders.find(o => o.id === newOrder.id);
        if (!existing) {
          state.allOrders.push(newOrder);
          if (newOrder.userId) {
            state.userOrders.push(newOrder);
          }
        }
      });
      state.allOrders.sort((a, b) => b.timestamp - a.timestamp);
      state.userOrders.sort((a, b) => b.timestamp - a.timestamp);
    },
    clearUserOrders: (state) => {
      state.userOrders = [];
    },
    recalculateStats: (state) => {
      state.stats = {
        total: state.allOrders.length,
        pending: state.allOrders.filter(o => o.status === 'pending').length,
        preparing: state.allOrders.filter(o => o.status === 'preparing').length,
        ready: state.allOrders.filter(o => o.status === 'ready').length,
        completed: state.allOrders.filter(o => o.status === 'completed').length,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const newOrder = action.payload;
        state.allOrders.unshift(newOrder);
        state.userOrders.unshift(newOrder);
        state.stats.total++;
        state.stats.pending++;
        
        // Отправляем через WebSocket
        if (state.wsConnected) {
          // Здесь можно отправить уведомление через WebSocket
        }
      })
      .addCase(addOrder.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { 
  wsConnected, 
  wsDisconnected, 
  wsError, 
  newOrderReceived,
  updateOrderStatus,
  syncOrders,
  clearUserOrders,
  recalculateStats 
} = ordersSlice.actions;

export default ordersSlice.reducer;