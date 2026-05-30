// hooks/useTheme.js
import { useState, useEffect } from 'react';

const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  SPACE: 'space'
};

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      return savedTheme;
    }
    // ✅ МЕНЯЕМ: теперь космическая тема по умолчанию
    return THEMES.SPACE; // 'space' вместо 'dark'
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Удаляем все предыдущие классы темы
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-space');
    
    // Добавляем новый класс
    document.body.classList.add(`theme-${theme}`);
    
    // Добавляем data-атрибут для CSS
    document.body.setAttribute('data-theme', theme);
    
    console.log('Theme applied:', theme);
  }, [theme]);

  return { theme, setTheme };
};