/**
 * UI 輔助工具模組
 * 功能：載入指示器、錯誤提示、Toast 通知
 * 版本：1.0.0
 * @module ui-helpers
 */

/**
 * 顯示載入指示器
 * @param {Object} options - 設定選項
 * @param {string} options.message - 載入訊息，預設為 '載入中...'
 * @param {HTMLElement} options.container - 容器元素，預設為 document.body
 * @param {string} options.id - 指示器的 ID，預設為 'loadingSpinner'
 * @returns {Function} hide - 返回隱藏函數
 * 
 * @example
 * const hideLoading = showLoadingSpinner({ message: '正在載入資料...' });
 * // 載入完成後
 * hideLoading();
 */
export function showLoadingSpinner(options = {}) {
  const {
    message = '載入中...',
    container = document.body,
    id = 'loadingSpinner'
  } = options;

  // 避免重複建立
  let spinner = document.getElementById(id);
  if (spinner) {
    return () => spinner.remove();
  }

  spinner = document.createElement('div');
  spinner.id = id;
  spinner.className = 'position-fixed top-50 start-50 translate-middle text-center';
  spinner.style.zIndex = '9999';
  spinner.innerHTML = `
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">${message}</span>
    </div>
    <p class="mt-2 fw-bold">${message}</p>
  `;

  container.appendChild(spinner);

  return () => {
    if (spinner && spinner.parentNode) {
      spinner.remove();
    }
  };
}

/**
 * 顯示錯誤訊息
 * @param {Object} options - 設定選項
 * @param {string} options.message - 錯誤訊息
 * @param {string} options.title - 錯誤標題，預設為 '錯誤'
 * @param {HTMLElement} options.container - 容器元素，預設為 document.body
 * @param {number} options.duration - 顯示時間（毫秒），0 表示不自動關閉，預設為 5000
 * @param {string} options.id - 錯誤訊息的 ID，預設為 'errorAlert'
 * @returns {Function} close - 返回關閉函數
 * 
 * @example
 * const closeError = showError({ 
 *   message: '無法載入資料，請稍後再試',
 *   title: '載入失敗'
 * });
 */
export function showError(options = {}) {
  const {
    message = '發生錯誤',
    title = '錯誤',
    container = document.body,
    duration = 5000,
    id = 'errorAlert'
  } = options;

  // 移除舊的錯誤訊息
  const oldAlert = document.getElementById(id);
  if (oldAlert) {
    oldAlert.remove();
  }

  const alert = document.createElement('div');
  alert.id = id;
  alert.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x m-3';
  alert.style.zIndex = '9999';
  alert.style.maxWidth = '500px';
  alert.setAttribute('role', 'alert');
  alert.innerHTML = `
    <strong>${title}</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="關閉"></button>
  `;

  container.appendChild(alert);

  // 自動關閉
  let timeoutId = null;
  if (duration > 0) {
    timeoutId = setTimeout(() => {
      if (alert && alert.parentNode) {
        alert.remove();
      }
    }, duration);
  }

  // 返回關閉函數
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (alert && alert.parentNode) {
      alert.remove();
    }
  };
}

/**
 * 顯示 Toast 通知
 * @param {Object} options - 設定選項
 * @param {string} options.message - 通知訊息
 * @param {string} options.type - 類型：'success', 'info', 'warning', 'danger'，預設為 'info'
 * @param {number} options.duration - 顯示時間（毫秒），預設為 3000
 * @param {string} options.position - 位置：'top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end'，預設為 'top-end'
 * @returns {Function} close - 返回關閉函數
 * 
 * @example
 * showToast({ 
 *   message: '儲存成功！', 
 *   type: 'success' 
 * });
 */
export function showToast(options = {}) {
  const {
    message = '',
    type = 'info',
    duration = 3000,
    position = 'top-end'
  } = options;

  // 建立或取得 Toast 容器
  const containerId = `toast-container-${position}`;
  let toastContainer = document.getElementById(containerId);
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = containerId;
    toastContainer.className = `toast-container position-fixed p-3 ${position}`;
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }

  // Toast 樣式對應
  const typeClasses = {
    success: 'bg-success text-white',
    info: 'bg-info text-white',
    warning: 'bg-warning text-dark',
    danger: 'bg-danger text-white'
  };

  const typeIcons = {
    success: 'fa-check-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle',
    danger: 'fa-times-circle'
  };

  const toastClass = typeClasses[type] || typeClasses.info;
  const toastIcon = typeIcons[type] || typeIcons.info;

  // 建立 Toast
  const toast = document.createElement('div');
  toast.className = `toast ${toastClass}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="d-flex align-items-center p-2">
      <i class="fas ${toastIcon} me-2"></i>
      <div class="toast-body flex-grow-1">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="toast" aria-label="關閉"></button>
    </div>
  `;

  toastContainer.appendChild(toast);

  // 使用 Bootstrap Toast API
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: duration
  });
  
  bsToast.show();

  // 監聽隱藏事件，移除 DOM
  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });

  // 返回關閉函數
  return () => {
    bsToast.hide();
  };
}

/**
 * 建立確認對話框
 * @param {Object} options - 設定選項
 * @param {string} options.title - 標題
 * @param {string} options.message - 訊息內容
 * @param {string} options.confirmText - 確認按鈕文字，預設為 '確認'
 * @param {string} options.cancelText - 取消按鈕文字，預設為 '取消'
 * @param {string} options.confirmClass - 確認按鈕樣式類別，預設為 'btn-primary'
 * @returns {Promise<boolean>} 使用者選擇（true=確認, false=取消）
 * 
 * @example
 * const confirmed = await showConfirm({
 *   title: '確認重設',
 *   message: '確定要重設所有參數嗎？',
 *   confirmText: '重設',
 *   confirmClass: 'btn-danger'
 * });
 * if (confirmed) {
 *   // 執行重設
 * }
 */
export function showConfirm(options = {}) {
  const {
    title = '確認',
    message = '',
    confirmText = '確認',
    cancelText = '取消',
    confirmClass = 'btn-primary'
  } = options;

  return new Promise((resolve) => {
    // 建立 Modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    modal.setAttribute('aria-labelledby', 'confirmModalLabel');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('role', 'dialog');
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmModalLabel">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="關閉"></button>
          </div>
          <div class="modal-body">
            ${message}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
            <button type="button" class="btn ${confirmClass}" id="confirmBtn">${confirmText}</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const bsModal = new bootstrap.Modal(modal);
    const confirmBtn = modal.querySelector('#confirmBtn');

    // 確認按鈕
    confirmBtn.addEventListener('click', () => {
      bsModal.hide();
      resolve(true);
    });

    // 關閉後移除 DOM
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
      resolve(false);
    });

    bsModal.show();
  });
}

/**
 * 顯示進度條
 * @param {Object} options - 設定選項
 * @param {number} options.progress - 進度百分比（0-100）
 * @param {string} options.label - 標籤文字
 * @param {HTMLElement} options.container - 容器元素
 * @param {string} options.id - 進度條的 ID，預設為 'progressBar'
 * @returns {Function} update - 返回更新進度的函數
 * 
 * @example
 * const updateProgress = showProgressBar({ label: '載入中' });
 * updateProgress(50); // 更新到 50%
 * updateProgress(100); // 完成
 */
export function showProgressBar(options = {}) {
  const {
    progress = 0,
    label = '',
    container = document.body,
    id = 'progressBar'
  } = options;

  let progressBar = document.getElementById(id);
  
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = id;
    progressBar.className = 'position-fixed top-0 start-0 w-100';
    progressBar.style.zIndex = '9999';
    progressBar.innerHTML = `
      <div class="progress" style="height: 4px; border-radius: 0;">
        <div class="progress-bar progress-bar-striped progress-bar-animated" 
             role="progressbar" 
             aria-valuenow="${progress}" 
             aria-valuemin="0" 
             aria-valuemax="100" 
             style="width: ${progress}%">
        </div>
      </div>
      ${label ? `<p class="text-center mt-2 fw-bold">${label}</p>` : ''}
    `;
    container.appendChild(progressBar);
  }

  const bar = progressBar.querySelector('.progress-bar');

  function update(newProgress, newLabel) {
    if (bar) {
      bar.style.width = `${newProgress}%`;
      bar.setAttribute('aria-valuenow', newProgress);
      
      if (newProgress >= 100) {
        setTimeout(() => {
          if (progressBar && progressBar.parentNode) {
            progressBar.remove();
          }
        }, 500);
      }
    }

    if (newLabel !== undefined) {
      const labelElement = progressBar.querySelector('p');
      if (labelElement) {
        labelElement.textContent = newLabel;
      }
    }
  }

  // 初始化進度
  update(progress, label);

  return update;
}
