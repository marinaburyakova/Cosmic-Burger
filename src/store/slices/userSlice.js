import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Асинхронный thunk для имитации входа
export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 3) {
          resolve({
            id: 1,
            email,
            name: email.split('@')[0],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            createdAt: new Date().toISOString(),
          });
        } else {
          reject(new Error('Неверный email или пароль (мин. 3 символа)'));
        }
      }, 1000);
    });
  }
);

// Асинхронный thunk для имитации регистрации
export const registerUser = createAsyncThunk(
  'user/register',
  async ({ name, email, password }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password.length >= 3) {
          resolve({
            id: Date.now(),
            name,
            email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            createdAt: new Date().toISOString(),
          });
        } else {
          reject(new Error('Заполните все поля корректно'));
        }
      }, 1000);
    });
  }
);

// Асинхронный thunk для обновления профиля
export const updateProfile = createAsyncThunk(
  'user/update',
  async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(userData);
      }, 500);
    });
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionChecked: false, // Добавляем флаг проверки сессии
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // Очищаем localStorage при выходе
      localStorage.removeItem('user');
      localStorage.removeItem('userSession');
    },
    clearError: (state) => {
      state.error = null;
    },
    loadUserFromStorage: (state) => {
      const savedUser = localStorage.getItem('user');
      const sessionValid = localStorage.getItem('userSession');
      
      if (savedUser && sessionValid === 'active') {
        state.user = JSON.parse(savedUser);
        state.isAuthenticated = true;
      }
      state.sessionChecked = true; // Отмечаем, что проверка завершена
    },
    // Добавляем действие для сохранения сессии
    saveUserSession: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
      localStorage.setItem('userSession', 'active');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        // Сохраняем пользователя и сессию в localStorage
        localStorage.setItem('user', JSON.stringify(action.payload));
        localStorage.setItem('userSession', 'active');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        // Сохраняем пользователя и сессию в localStorage
        localStorage.setItem('user', JSON.stringify(action.payload));
        localStorage.setItem('userSession', 'active');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        // Обновляем данные в localStorage
        localStorage.setItem('user', JSON.stringify(state.user));
      });
  },
});

export const { logout, clearError, loadUserFromStorage, saveUserSession } = userSlice.actions;
export default userSlice.reducer;