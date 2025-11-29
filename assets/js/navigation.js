/**
 * 導覽模組
 * 功能：載入 HTML 模板（navbar, footer）並替換變數
 * 版本：1.0.0
 * @module navigation
 */

/**
 * 載入 HTML 模板並替換變數
 * @param {string} templatePath - 模板檔案路徑
 * @param {Object} variables - 要替換的變數物件，例如 { BASE_URL: '/SchScie' }
 * @returns {Promise<string>} 處理後的 HTML 字串
 * 
 * @example
 * const html = await loadTemplate('./assets/templates/navbar.html', { BASE_URL: '' });
 */
export async function loadTemplate(templatePath, variables = {}) {
  try {
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${templatePath}`);
    }
    
    let html = await response.text();
    
    // 替換所有 {{variable}} 格式的變數
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, variables[key]);
    });
    
    return html;
  } catch (error) {
    console.error('Template loading error:', error);
    return '';
  }
}

/**
 * 載入導覽列和頁尾
 * @param {Object} options - 設定選項
 * @param {string} options.baseUrl - 基礎 URL，預設為 ''
 * @param {string} options.navbarContainerId - Navbar 容器 ID，預設為 'navbarContainer'
 * @param {string} options.footerContainerId - Footer 容器 ID，預設為 'footerContainer'
 * @param {string} options.navbarPath - Navbar 模板路徑
 * @param {string} options.footerPath - Footer 模板路徑
 * @returns {Promise<void>}
 * 
 * @example
 * await loadNavigation({
 *   baseUrl: '',
 *   navbarPath: './assets/templates/navbar.html',
 *   footerPath: './assets/templates/footer.html'
 * });
 */
export async function loadNavigation(options = {}) {
  const {
    baseUrl = '',
    navbarContainerId = 'navbarContainer',
    footerContainerId = 'footerContainer',
    navbarPath = './assets/templates/navbar.html',
    footerPath = './assets/templates/footer.html'
  } = options;

  const variables = { BASE_URL: baseUrl };

  try {
    // 並行載入 navbar 和 footer
    const [navbarHtml, footerHtml] = await Promise.all([
      loadTemplate(navbarPath, variables),
      loadTemplate(footerPath, variables)
    ]);

    // 插入到對應容器
    const navbarContainer = document.getElementById(navbarContainerId);
    const footerContainer = document.getElementById(footerContainerId);

    if (navbarContainer && navbarHtml) {
      navbarContainer.innerHTML = navbarHtml;
    }

    if (footerContainer && footerHtml) {
      footerContainer.innerHTML = footerHtml;
    }

    // 重新初始化 Bootstrap 的下拉選單（如果需要）
    if (typeof bootstrap !== 'undefined' && navbarHtml) {
      const dropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]');
      dropdowns.forEach(dropdown => {
        new bootstrap.Dropdown(dropdown);
      });
    }
  } catch (error) {
    console.error('Navigation loading error:', error);
  }
}

/**
 * 設定當前頁面的導覽項目為 active
 * @param {string} currentPath - 當前頁面路徑，例如 '/physics/free-fall.html'
 * 
 * @example
 * setActiveNavItem(window.location.pathname);
 */
export function setActiveNavItem(currentPath) {
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .dropdown-item');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href)) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
      
      // 如果是下拉選單項目，也標記父層
      const dropdown = link.closest('.dropdown');
      if (dropdown) {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
          dropdownToggle.classList.add('active');
        }
      }
    }
  });
}

/**
 * 平滑捲動到指定元素
 * @param {string} targetId - 目標元素的 ID
 * @param {number} offset - 偏移量（例如固定 navbar 的高度）
 * 
 * @example
 * smoothScrollTo('main-content', 70);
 */
export function smoothScrollTo(targetId, offset = 0) {
  const target = document.getElementById(targetId);
  if (target) {
    const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}
