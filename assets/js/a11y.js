/**
 * 無障礙輔助模組
 * 功能：Live Region、Range+Number 同步、鍵盤管理器
 * 符合 WCAG 2.2 AA 標準
 * 版本：1.0.0
 * @module a11y
 */

/**
 * 建立 Live Region 用於即時通知螢幕閱讀器
 * @param {Object} options - 設定選項
 * @param {string} options.id - Live Region 的 ID，預設為 'liveRegion'
 * @param {string} options.politeness - 'polite' 或 'assertive'，預設為 'polite'
 * @param {number} options.throttle - 節流間隔（毫秒），預設為 200
 * @returns {Object} 包含 announce 和 clear 方法的物件
 * 
 * @example
 * const liveRegion = createLiveRegion({ id: 'myLiveRegion', throttle: 300 });
 * liveRegion.announce('溫度已變更為 25 度');
 * liveRegion.clear();
 */
export function createLiveRegion(options = {}) {
  const {
    id = 'liveRegion',
    politeness = 'polite',
    throttle = 200
  } = options;

  // 建立或取得 Live Region 元素
  let liveRegion = document.getElementById(id);
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', politeness);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'visually-hidden';
    document.body.appendChild(liveRegion);
  }

  let lastAnnounceTime = 0;
  let pendingMessage = null;
  let timeoutId = null;

  /**
   * 宣告訊息（帶節流）
   * @param {string} message - 要宣告的訊息
   */
  function announce(message) {
    const now = Date.now();
    
    if (now - lastAnnounceTime >= throttle) {
      // 直接宣告
      liveRegion.textContent = message;
      lastAnnounceTime = now;
      pendingMessage = null;
      
      // 清除之前的待處理訊息
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } else {
      // 節流：延遲宣告
      pendingMessage = message;
      
      if (!timeoutId) {
        const delay = throttle - (now - lastAnnounceTime);
        timeoutId = setTimeout(() => {
          if (pendingMessage) {
            liveRegion.textContent = pendingMessage;
            lastAnnounceTime = Date.now();
            pendingMessage = null;
          }
          timeoutId = null;
        }, delay);
      }
    }
  }

  /**
   * 清除 Live Region 內容
   */
  function clear() {
    liveRegion.textContent = '';
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingMessage = null;
  }

  /**
   * 銷毀 Live Region
   */
  function destroy() {
    clear();
    if (liveRegion && liveRegion.parentNode) {
      liveRegion.parentNode.removeChild(liveRegion);
    }
  }

  return { announce, clear, destroy };
}

/**
 * 綁定 Range Slider 和 Number Input 同步
 * @param {Object} options - 設定選項
 * @param {string} options.rangeId - Range input 的 ID
 * @param {string} options.numberId - Number input 的 ID
 * @param {Function} options.onChange - 值變更時的回調函數，接收新值作為參數
 * @param {string} options.unit - 單位，例如 '度'、'公分'，用於 Live Region 宣告
 * @param {string} options.label - 參數名稱，例如 '溫度'、'焦距'
 * @param {Object} options.liveRegion - Live Region 物件（createLiveRegion 的返回值）
 * @returns {Function} cleanup - 清理函數
 * 
 * @example
 * const cleanup = bindRangeNumber({
 *   rangeId: 'tempRange',
 *   numberId: 'tempNumber',
 *   onChange: (value) => updateSimulation(value),
 *   unit: '度',
 *   label: '溫度',
 *   liveRegion: myLiveRegion
 * });
 */
export function bindRangeNumber(options = {}) {
  const {
    rangeId,
    numberId,
    onChange,
    unit = '',
    label = '',
    liveRegion = null
  } = options;

  const rangeInput = document.getElementById(rangeId);
  const numberInput = document.getElementById(numberId);

  if (!rangeInput || !numberInput) {
    console.warn('Range or Number input not found');
    return () => {};
  }

  let rafId = null;
  let lastValue = rangeInput.value;

  /**
   * 同步值並觸發回調
   * @param {string} newValue - 新的值
   * @param {string} source - 來源（'range' 或 'number'）
   */
  function syncValue(newValue, source) {
    // 取消之前的 RAF
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      rangeInput.value = newValue;
      numberInput.value = newValue;

      if (onChange && typeof onChange === 'function') {
        onChange(parseFloat(newValue));
      }

      // Live Region 宣告（僅當值真正改變時）
      if (liveRegion && newValue !== lastValue) {
        const announcement = label 
          ? `${label}已變更為 ${newValue} ${unit}`.trim()
          : `${newValue} ${unit}`.trim();
        liveRegion.announce(announcement);
        lastValue = newValue;
      }

      rafId = null;
    });
  }

  // Range input 事件監聽
  function handleRangeInput(e) {
    syncValue(e.target.value, 'range');
  }

  // Number input 事件監聽
  function handleNumberChange(e) {
    let value = parseFloat(e.target.value);
    const min = parseFloat(rangeInput.min);
    const max = parseFloat(rangeInput.max);

    // 驗證範圍
    if (isNaN(value)) {
      value = min;
    } else if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }

    e.target.value = value;
    syncValue(value.toString(), 'number');
  }

  rangeInput.addEventListener('input', handleRangeInput);
  numberInput.addEventListener('change', handleNumberChange);

  // 返回清理函數
  return () => {
    rangeInput.removeEventListener('input', handleRangeInput);
    numberInput.removeEventListener('change', handleNumberChange);
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
}

/**
 * 鍵盤快捷鍵管理器
 * 支援集中管理所有快捷鍵，避免衝突
 */
export class KeyboardManager {
  constructor() {
    this.shortcuts = new Map();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 註冊快捷鍵
   * @param {string} key - 鍵值，例如 'p', 'Escape', 'ArrowRight'
   * @param {Function} handler - 處理函數
   * @param {Object} options - 選項
   * @param {boolean} options.ctrl - 是否需要 Ctrl 鍵
   * @param {boolean} options.alt - 是否需要 Alt 鍵
   * @param {boolean} options.shift - 是否需要 Shift 鍵
   * @param {string} options.description - 快捷鍵說明
   * 
   * @example
   * keyboardManager.register('p', startSimulation, { 
   *   ctrl: false, 
   *   description: '播放/暫停' 
   * });
   */
  register(key, handler, options = {}) {
    const {
      ctrl = false,
      alt = false,
      shift = false,
      description = ''
    } = options;

    const keyCombo = this.createKeyCombo(key, ctrl, alt, shift);
    
    this.shortcuts.set(keyCombo, {
      handler,
      description,
      ctrl,
      alt,
      shift,
      key
    });
  }

  /**
   * 取消註冊快捷鍵
   * @param {string} key - 鍵值
   * @param {Object} options - 選項（同 register）
   */
  unregister(key, options = {}) {
    const {
      ctrl = false,
      alt = false,
      shift = false
    } = options;

    const keyCombo = this.createKeyCombo(key, ctrl, alt, shift);
    this.shortcuts.delete(keyCombo);
  }

  /**
   * 建立鍵組合字串
   * @private
   */
  createKeyCombo(key, ctrl, alt, shift) {
    const modifiers = [];
    if (ctrl) modifiers.push('ctrl');
    if (alt) modifiers.push('alt');
    if (shift) modifiers.push('shift');
    return modifiers.length > 0 
      ? `${modifiers.join('+')}+${key.toLowerCase()}`
      : key.toLowerCase();
  }

  /**
   * 處理鍵盤事件
   * @private
   */
  handleKeyDown(e) {
    const keyCombo = this.createKeyCombo(
      e.key,
      e.ctrlKey,
      e.altKey,
      e.shiftKey
    );

    const shortcut = this.shortcuts.get(keyCombo);
    if (shortcut) {
      // 避免與表單輸入衝突
      const target = e.target;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' ||
                     target.isContentEditable;

      if (!isInput || e.ctrlKey || e.altKey) {
        e.preventDefault();
        shortcut.handler(e);
      }
    }
  }

  /**
   * 取得所有已註冊的快捷鍵
   * @returns {Array} 快捷鍵列表
   */
  getShortcuts() {
    return Array.from(this.shortcuts.entries()).map(([combo, data]) => ({
      combo,
      description: data.description
    }));
  }

  /**
   * 銷毀管理器
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.shortcuts.clear();
  }
}

/**
 * 管理焦點陷阱（用於 Modal/Dialog）
 * @param {HTMLElement} container - 容器元素
 * @returns {Object} 包含 activate 和 deactivate 方法
 * 
 * @example
 * const focusTrap = createFocusTrap(modalElement);
 * focusTrap.activate();
 * // 稍後...
 * focusTrap.deactivate();
 */
export function createFocusTrap(container) {
  let previousFocus = null;

  const focusableSelector = 
    'a[href], button:not([disabled]), textarea:not([disabled]), ' +
    'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function activate() {
    previousFocus = document.activeElement;
    
    const focusableElements = container.querySelectorAll(focusableSelector);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    container.addEventListener('keydown', handleTab);
  }

  function deactivate() {
    container.removeEventListener('keydown', handleTab);
    if (previousFocus && previousFocus.focus) {
      previousFocus.focus();
    }
  }

  function handleTab(e) {
    if (e.key !== 'Tab') return;

    const focusableElements = Array.from(container.querySelectorAll(focusableSelector));
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  return { activate, deactivate };
}
