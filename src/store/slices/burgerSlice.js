import {createSlice, nanoid} from "@reduxjs/toolkit";
import ingredientsData from "../../data/IngredientsData";

// Выносим генерацию стартового состояния в чистую функцию,
// либо оставляем элементы без ID до момента попадания в конструктор.
const createInitialState = () => ({
  bun: ingredientsData.buns[0],
  selectedFillings: [
    ingredientsData.mains[0],
    ingredientsData.sauces[0],
    ingredientsData.mains[1],
    ingredientsData.mains[3],
    ingredientsData.mains[4],
    ingredientsData.mains[5],
  ].map((item) => ({...item, uniqueId: nanoid()})),
});

const burgerSlice = createSlice({
  name: "burger",
  initialState: createInitialState(), // Безопасная инициализация
  reducers: {
    setBun: (state, action) => {
      state.bun = action.payload;
    },
    addFilling: {
      reducer: (state, action) => {
        state.selectedFillings.push(action.payload);
      },
      prepare: (ingredient) => {
        return {payload: {...ingredient, uniqueId: nanoid()}};
      },
    },
removeFilling: (state, action) => {
  state.selectedFillings = state.selectedFillings.filter(
    (item) => item.uniqueId !== action.payload
  );
},
    moveFilling: (state, action) => {
      const {fromIndex, toIndex} = action.payload;
      const [movedItem] = state.selectedFillings.splice(fromIndex, 1);
      state.selectedFillings.splice(toIndex, 0, movedItem);
    },
   clearBurger: (state) => {
  state.bun = null;
  state.selectedFillings = [];
},
  },
});

export const {setBun, addFilling, removeFilling, moveFilling, clearBurger} = burgerSlice.actions;
export default burgerSlice.reducer;
