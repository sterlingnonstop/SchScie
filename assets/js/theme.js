/**
 * 主題切換模組
 * 功能：深色/淺色模式切換，記憶使用者偏好
 * 版本：1.0.0
 * @module theme
 */

/**
 * 初始化主題切換功能
 * @param {string} toggleButtonId - 切換按鈕的 ID，預設為 'themeToggle'
 * @param {string} iconId - 圖示元素的 ID，預設為 'themeIcon'
 * @returns {Function} cleanup - 返回清理函數，用於移除事件監聽器
 * 
 * @example
 * import { initThemeToggle } from './assets/js/theme.js';
 * const cleanup = initThemeToggle();
 */
export function initThemeToggle(toggleButtonId = 'themeToggle', iconId = 'themeIcon') {
  const themeToggleBtn = document.getElementById(toggleButtonId);
  const themeIcon = document.getElementById(iconId);

  if (!themeToggleBtn || !themeIcon) {
    console.warn('Theme toggle elements not found');
    return () => {}; // 返回空清理函數
  }

  /**
   * 設定主題
   * @param {string} theme - 'light' 或 'dark'
   */
  function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    updateIcon(theme);
  }

  /**
   * 更新圖示
   * @param {string} theme - 'light' 或 'dark'
   */
  function updateIcon(theme) {
    if (theme === 'dark') {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
      themeToggleBtn.setAttribute('aria-label', '切換到淺色模式');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
      themeToggleBtn.setAttribute('aria-label', '切換到深色模式');
    }
  }

  /**
   * 切換主題
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }

  // 初始化：讀取儲存的主題或使用系統偏好
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  setTheme(initialTheme);

  // 監聽按鈕點擊
  themeToggleBtn.addEventListener('click', toggleTheme);

  // 監聽系統主題變更（可選）
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function handleSystemThemeChange(e) {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  }
  mediaQuery.addEventListener('change', handleSystemThemeChange);

  // 返回清理函數
  return () => {
    themeToggleBtn.removeEventListener('click', toggleTheme);
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  };
}

/**
 * 直接取得當前主題
 * @returns {string} 'light' 或 'dark'
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-bs-theme') || 'light';
}

/**
 * 監聽主題變更
 * @param {Function} callback - 主題變更時的回調函數，接收新主題作為參數
 * @returns {Function} cleanup - 返回清理函數
 * 
 * @example
 * const cleanup = onThemeChange((newTheme) => {
 *   console.log('Theme changed to:', newTheme);
 * });
 */
export function onThemeChange(callback) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-bs-theme') {
        const newTheme = document.documentElement.getAttribute('data-bs-theme');
        callback(newTheme);
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-bs-theme']
  });

  return () => observer.disconnect();
}
