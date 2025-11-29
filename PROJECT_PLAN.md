# 國中數理輔助教學網站 - 專案規劃文件

> 最新架構（2025-11-29）：根目錄僅保留文件 (`README.md`, `PROJECT_PLAN.md`, `netlify.toml`)，所有可部署資源集中於 `public/`。本文件保留部分「舊版單檔/非隔離」描述作為歷史參考（標記為【歷史】）。新增或維護請一律依照「最新架構摘要」章節。

## � 最新架構摘要（必讀）

### 目錄總覽
```
SchScie/
├── README.md
├── PROJECT_PLAN.md
├── netlify.toml                # publish = "public"
└── public/
    ├── index.html             # 首頁（JSON 動態 + 篩選）
    ├── assets/
    │   ├── css/               # common.css / accessibility.css
    │   ├── js/                # theme.js / navigation.js / a11y.js / ui-helpers.js
    │   └── templates/         # navbar.html / footer.html
    ├── data/
    │   └── animations.json    # 單一資料來源（唯一維護位置）
    ├── physics/               # 已存在 6 個動畫頁
    ├── chemistry/             # 預留
    └── math/                  # 預留
```

### 新增動畫標準流程（更新版）
1. 建立檔案：`public/<subject>/<id>.html`
2. 新增資料：編輯 `public/data/animations.json` → 加入新物件並調整 `metadata.totalAnimations`
3. 驗證 JSON：`python3 -m json.tool public/data/animations.json`
4. 本地預覽：`open public/index.html` 或在 `public/` 啟動簡易伺服器
5. 確認首頁卡片動態顯示 & 篩選可作用

### 必要匯入（每個動畫頁）
```html
<script type="module">
  import { initThemeToggle } from '../assets/js/theme.js';
  import { loadNavigation } from '../assets/js/navigation.js';
  import { createLiveRegion } from '../assets/js/a11y.js';
  await loadNavigation({ baseUrl: '..', navbarPath: '../assets/templates/navbar.html', footerPath: '../assets/templates/footer.html' });
  initThemeToggle();
  const live = createLiveRegion('statusRegion', { throttle: 300 });
</script>
```

### 路徑規則
| 類型 | 首頁 | 子頁面 |
|------|------|--------|
| 導覽範本 | `./assets/templates/navbar.html` | `../assets/templates/navbar.html` |
| JSON 資料 | `data/animations.json` | `../data/animations.json` |
| 模組 JS   | `./assets/js/*.js` | `../assets/js/*.js` |

### 清理策略
已移除根層：`index.html`, `physics/`, `math/`, `chemistry/`, `data/`, `assets/`。禁止再於根目錄新增 `.html`；所有新頁面置於 `public/` 之下。

### 自動化驗證（待實作）
| 檢查 | 條件 | 動作 |
|------|------|------|
| 未隔離 HTML | 根層存在 .html | 中斷部署 |
| JSON URL 有效 | `url` 指向檔案存在 | 標記錯誤 |
| 必要模組匯入 | 動畫頁含 navigation/theme | 警告或自動補齊 |
| skip-link 存在 | `<a class="skip-link">` | 警告 |

### 版本說明
此章節取代舊版「網站架構設計」與「JSON 資料驅動架構」中的路徑示例；舊內容標記【歷史】供參考。

## �📋 專案概述

### 網站標題
**國中自然科學模擬動畫**

### 專案目標
建立一個國中數理教學網站，收集和整理各種互動式的物理、數學模擬動畫，方便學生學習理解科學概念。

### 開發流程
1. 在 **Gemini Canvas** 上對話，產生單頁動畫原始碼（HTML + CSS + JS 完整包含在一個檔案）
2. 將生成的檔案另存到本專案對應分類資料夾
3. 在主頁面建立靜態連結，方便瀏覽和選擇

### 技術棧
- **頁面**: 單頁 HTML 檔案（內含 CSS 和 JavaScript）
- **UI 框架**: Bootstrap 5.3+（響應式設計）
- **圖示**: Font Awesome 6+
- **無障礙標準**: WCAG 2.2 AA
- **導航**: 簡單的靜態連結頁面 + 動態篩選系統
- **開發工具**: Gemini Canvas (生成動畫) + VS Code (整理專案)

---

## 🔍 動態篩選系統設計

### 系統目標
提供科目、年級的連動篩選功能，讓學生快速找到對應學習階段的互動模擬。

### 資料結構設計

#### 卡片 Metadata 規範
每個卡片需要加入 `data-*` 屬性標記：

```html
<div class="card h-100" tabindex="0"
     data-subject="physics"
     data-grade="2-1"
     data-chapter="force-motion"
     data-keywords="自由落體,重力,加速度">
  <!-- 卡片內容 -->
</div>
```

**屬性說明：**
- `data-subject`: 科目代碼
  - `physics` - 理化（物理）
  - `chemistry` - 理化（化學）
  - `math` - 數學
  - `biology` - 生物（未來）
  - `earth` - 地球科學（未來）

- `data-grade`: 年級學期代碼
  - `1-1` - 七年級上學期（國一上）
  - `1-2` - 七年級下學期（國一下）
  - `2-1` - 八年級上學期（國二上）
  - `2-2` - 八年級下學期（國二下）
  - `3-1` - 九年級上學期（國三上）
  - `3-2` - 九年級下學期（國三下）
  - `general` - 通用/多學期適用

- `data-chapter`: 章節代碼（選用，用於更細緻分類）
  - 範例：`force-motion`, `wave`, `optics`, `thermal`, `linear-function` 等

- `data-keywords`: 關鍵字（逗號分隔，用於搜尋功能）

### UI 設計規範

#### 篩選器位置與佈局
在首頁 `<main>` 開頭加入篩選控制面板：

```html
<div class="card mb-4" id="filterPanel">
  <div class="card-body">
    <h2 class="h5 card-title mb-3">
      <i class="fa-solid fa-filter" aria-hidden="true"></i>
      篩選條件
    </h2>
    <div class="row g-3">
      <!-- 科目選擇 -->
      <div class="col-12 col-md-4">
        <label for="filterSubject" class="form-label">科目</label>
        <select id="filterSubject" class="form-select" aria-label="選擇科目">
          <option value="">全部科目</option>
          <option value="physics">理化（物理）</option>
          <option value="chemistry">理化（化學）</option>
          <option value="math">數學</option>
        </select>
      </div>
      
      <!-- 年級選擇 -->
      <div class="col-12 col-md-4">
        <label for="filterGrade" class="form-label">年級</label>
        <select id="filterGrade" class="form-select" aria-label="選擇年級">
          <option value="">全部年級</option>
          <optgroup label="國一（七年級）">
            <option value="1-1">國一上</option>
            <option value="1-2">國一下</option>
          </optgroup>
          <optgroup label="國二（八年級）">
            <option value="2-1">國二上</option>
            <option value="2-2">國二下</option>
          </optgroup>
          <optgroup label="國三（九年級）">
            <option value="3-1">國三上</option>
            <option value="3-2">國三下</option>
          </optgroup>
        </select>
      </div>
      
      <!-- 重置按鈕 -->
      <div class="col-12 col-md-4 d-flex align-items-end">
        <button id="filterReset" class="btn btn-outline-secondary w-100" type="button">
          <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
          清除篩選
        </button>
      </div>
    </div>
    
    <!-- 篩選結果統計 -->
    <div class="mt-3">
      <span id="filterResult" class="badge text-bg-info" aria-live="polite" aria-atomic="true">
        顯示全部項目
      </span>
    </div>
  </div>
</div>
```

### JavaScript 篩選邏輯

#### 核心功能實作

```javascript
// 篩選系統初始化
(function() {
  const filterSubject = document.getElementById('filterSubject');
  const filterGrade = document.getElementById('filterGrade');
  const filterReset = document.getElementById('filterReset');
  const filterResult = document.getElementById('filterResult');
  const allCards = document.querySelectorAll('[data-subject]'); // 所有帶 metadata 的卡片

  // 執行篩選
  function applyFilters() {
    const subjectValue = filterSubject.value;
    const gradeValue = filterGrade.value;
    
    let visibleCount = 0;
    let totalCount = allCards.length;

    allCards.forEach(card => {
      const cardSubject = card.getAttribute('data-subject');
      const cardGrade = card.getAttribute('data-grade');
      
      // 判斷是否符合篩選條件
      const matchSubject = !subjectValue || cardSubject === subjectValue;
      const matchGrade = !gradeValue || cardGrade === gradeValue || cardGrade === 'general';
      
      if (matchSubject && matchGrade) {
        card.parentElement.style.display = ''; // 顯示 (父層是 col-*)
        card.parentElement.classList.remove('d-none');
        visibleCount++;
      } else {
        card.parentElement.style.display = 'none'; // 隱藏
        card.parentElement.classList.add('d-none');
      }
    });

    // 更新結果統計
    updateResultBadge(visibleCount, totalCount, subjectValue, gradeValue);
    
    // 處理空白區段（如果某科目下全部隱藏，顯示提示）
    updateEmptySections();
  }

  // 更新統計徽章
  function updateResultBadge(visible, total, subject, grade) {
    let text = '';
    if (visible === total) {
      text = `顯示全部 ${total} 項`;
    } else if (visible === 0) {
      text = '找不到符合條件的項目';
      filterResult.classList.remove('text-bg-info');
      filterResult.classList.add('text-bg-warning');
    } else {
      text = `顯示 ${visible} / ${total} 項`;
      filterResult.classList.remove('text-bg-warning');
      filterResult.classList.add('text-bg-info');
    }
    
    // 加上篩選條件說明
    const filters = [];
    if (subject) {
      const subjectText = filterSubject.options[filterSubject.selectedIndex].text;
      filters.push(subjectText);
    }
    if (grade) {
      const gradeText = filterGrade.options[filterGrade.selectedIndex].text;
      filters.push(gradeText);
    }
    if (filters.length > 0) {
      text += ` (${filters.join(' - ')})`;
    }
    
    filterResult.textContent = text;
  }

  // 檢查各科目區段是否為空
  function updateEmptySections() {
    const sections = document.querySelectorAll('section[id]'); // physics, math, chemistry
    
    sections.forEach(section => {
      const visibleCards = section.querySelectorAll('[data-subject]:not(.d-none)');
      const emptyHint = section.querySelector('.empty-hint');
      
      if (visibleCards.length === 0) {
        // 如果沒有現成的提示，建立一個
        if (!emptyHint) {
          const hint = document.createElement('div');
          hint.className = 'alert alert-light text-center empty-hint';
          hint.innerHTML = '<i class="fa-solid fa-circle-info me-2"></i>此分類目前沒有符合條件的項目';
          section.querySelector('.row').after(hint);
        }
      } else {
        // 移除提示（如果存在）
        if (emptyHint) {
          emptyHint.remove();
        }
      }
    });
  }

  // 重置篩選
  function resetFilters() {
    filterSubject.value = '';
    filterGrade.value = '';
    applyFilters();
  }

  // 事件監聽
  filterSubject.addEventListener('change', applyFilters);
  filterGrade.addEventListener('change', applyFilters);
  filterReset.addEventListener('click', resetFilters);

  // 鍵盤快捷鍵（可選）
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (filterSubject.value || filterGrade.value)) {
      e.preventDefault();
      resetFilters();
    }
  });

  // 初始化時執行一次（以防 URL 參數或預設值）
  applyFilters();
})();
```

### 進階功能（可選實作）

#### 1. URL 參數同步
允許分享篩選後的連結，例如 `?subject=physics&grade=2-1`

```javascript
// 從 URL 讀取並套用篩選
function loadFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get('subject');
  const grade = params.get('grade');
  
  if (subject) filterSubject.value = subject;
  if (grade) filterGrade.value = grade;
  
  applyFilters();
}

// 更新 URL 參數（不重新載入頁面）
function updateURL() {
  const params = new URLSearchParams();
  if (filterSubject.value) params.set('subject', filterSubject.value);
  if (filterGrade.value) params.set('grade', filterGrade.value);
  
  const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
  window.history.replaceState({}, '', newURL);
}

// 在 applyFilters() 結尾加上
updateURL();

// 頁面載入時
window.addEventListener('DOMContentLoaded', loadFiltersFromURL);
```

#### 2. 動畫過渡效果
讓卡片顯示/隱藏更平滑：

```css
/* 在 index.html 的 <style> 區塊加入 */
.col-12[data-subject] {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.col-12.d-none {
  opacity: 0;
  transform: scale(0.95);
}
```

#### 3. 章節細分（未來擴充）
若需要更細的篩選（如「力與運動」、「波動」等章節）：

```html
<div class="col-12 col-md-4">
  <label for="filterChapter" class="form-label">章節</label>
  <select id="filterChapter" class="form-select" aria-label="選擇章節">
    <option value="">全部章節</option>
    <!-- 動態載入，根據選定的科目與年級 -->
  </select>
</div>
```

### 資料維護工作流程

#### 新增動畫時的 Checklist
1. 在 Gemini 生成動畫時，確定該動畫適用的年級與單元
2. 在 `index.html` 加入卡片時，務必填寫 `data-subject` 和 `data-grade`
3. （選用）加上 `data-chapter` 和 `data-keywords` 以利未來搜尋

#### Metadata 對照表範例

| 動畫名稱 | 科目 | 年級 | 章節 | 關鍵字 |
|---------|------|------|------|--------|
| 自由落體 | physics | 2-1 | force-motion | 自由落體,重力,加速度 |
| 熱傳導 | physics | 2-2 | thermal | 熱傳導,溫度,粒子,動能 |
| 正弦波前進 | physics | 2-2 | wave | 橫波,波動,頻率,波長 |
| 凸透鏡成像 | physics | 3-1 | optics | 透鏡,成像,焦距,放大率 |
| 氣體粒子活動 | physics | 2-2 | thermal | 理想氣體,動理論,溫度,壓力 |
| 畢氏定理 | math | 2-1 | geometry | 直角三角形,勾股定理 |
| 一次函數 | math | 2-2 | function | 線性函數,斜率,截距 |

### 無障礙考量

1. **ARIA 標籤**：所有 select 元件都有 `aria-label`
2. **Live Region**：篩選結果統計使用 `aria-live="polite"` 即時通知
3. **鍵盤操作**：
   - Tab 可切換篩選器
   - Esc 鍵清除篩選
   - Enter 觸發搜尋（若加入搜尋框）
4. **焦點管理**：篩選後焦點不移動，保持在控制項上
5. **顏色對比**：徽章、提示文字符合 WCAG AA 標準

### 效能優化

- 使用 CSS `display: none` 而非移除 DOM，避免重複渲染
- 篩選邏輯使用簡單的屬性比對，O(n) 複雜度
- 若未來卡片數量超過 100 張，考慮加入虛擬滾動或分頁

---

## 🏗️ 網站架構設計 【歷史】（已由『最新架構摘要』覆蓋）

### 目錄結構（正式部署版：public/ 隔離）
本專案採用「文件與網站資源分離」策略：所有可部署的前端資源集中於 `public/`，根目錄僅保留規劃與說明文件。Netlify（或其他靜態託管）只發布 `public/` 內容，確保不將開發文件一併公開。

```
SchScie/
├── README.md                # 專案說明（不部署）
├── PROJECT_PLAN.md          # 規劃文件（不部署）
├── netlify.toml             # 部署設定：publish = "public"
└── public/                  # 唯一發布根目錄
    ├── index.html           # 首頁（動態載入 JSON + 模組化導航）
    ├── assets/              # 共用資源（CSS / JS / HTML 範本）
    │   ├── css/
    │   │   ├── common.css
    │   │   └── accessibility.css
    │   ├── js/
    │   │   ├── theme.js
    │   │   ├── navigation.js
    │   │   ├── a11y.js
    │   │   └── ui-helpers.js
    │   └── templates/
    │       ├── navbar.html
    │       └── footer.html
    ├── data/
    │   └── animations.json  # 單一資料來源（首頁動態渲染使用）
    ├── physics/             # 物理模擬（每頁匯入共用模組）
    │   ├── free-fall.html
    │   ├── convex-lens-imaging.html
    │   ├── hoz-waves.html
    │   ├── kinetic-theory-gas.html
    │   ├── heat-conduction.html
    │   └── sine-wave-propagation.html
    ├── chemistry/           # 化學模擬（目前示例：氣體動力論將合併至此）
    ├── math/                # 數學模擬（待擴充）
    └── templates/           #（選擇性）未來可加入頁面級別樣板或片段
```

### 部署隔離規則（Automation Rules）
1. 任何新模擬頁面必須建立於 `public/<subject>/<file>.html`。
2. 首頁只透過 `public/data/animations.json` 動態渲染卡片，不再手寫卡片 HTML。
3. 根目錄檔案（`README.md`, `PROJECT_PLAN.md`, `netlify.toml`）不得包含生產資源的直接路徑硬編碼；所有資源路徑以 `public/` 為參考。
4. 自動檢查腳本（待實作）邏輯：
   - 掃描 `public/physics/**/*.html` → 驗證 `data/animations.json` 是否存在對應 `url` 條目。
   - 回報未登錄頁面或失效 `url`。
   - 檢查每頁是否載入：`theme.js`、`navigation.js`、`a11y.js`（必要模組）。
5. 所有頁面使用一致的相對 Base URL：
   - 首頁：`baseUrl: '.'`
   - 次層（physics/math/chemistry）：`baseUrl: '..'`
6. 任何新增科目需先在 `animations.json.subjects[]` 註冊，再建立子資料夾。

### Netlify 設定
`netlify.toml` 基礎設定：
```toml
[build]
  publish = "public"
  command = "" # 保留空字串；未來可加入打包流程

[dev]
  publish = "public"
  port = 8888
```
可選擇新增：`[[redirects]]`、`[headers]` 與快取策略（之後版本）。

### 相對路徑與載入規則
| 情境 | 檔案位置 | 引用導航範本路徑 | 引用 JSON 路徑 |
|------|---------|------------------|----------------|
| 首頁 | `public/index.html` | `./assets/templates/navbar.html` | `data/animations.json` |
| 物理頁 | `public/physics/*.html` | `../assets/templates/navbar.html` | `../data/animations.json` |
| 化學頁 | `public/chemistry/*.html` | `../assets/templates/navbar.html` | `../data/animations.json` |

（現行首頁使用 `fetch('data/animations.json')`；子頁面若需存取資料應改用相對路徑 `../data/animations.json`）

### 新頁面建立最小骨架（Automation 可套用範本）
```html
<!DOCTYPE html>
<html lang="zh-Hant" data-bs-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>模擬標題 - 國中自然科學模擬動畫</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="../assets/css/common.css" />
  <link rel="stylesheet" href="../assets/css/accessibility.css" />
</head>
<body class="d-flex flex-column min-vh-100">
  <a href="#main" class="skip-link">跳到主內容</a>
  <div id="navbarContainer"></div>
  <main id="main" class="container py-3" tabindex="-1">
    <!-- 模擬內容 -->
  </main>
  <div id="footerContainer"></div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script type="module">
    import { initThemeToggle } from '../assets/js/theme.js';
    import { loadNavigation } from '../assets/js/navigation.js';
    import { createLiveRegion, KeyboardManager } from '../assets/js/a11y.js';
    await loadNavigation({ baseUrl: '..', navbarPath: '../assets/templates/navbar.html', footerPath: '../assets/templates/footer.html' });
    initThemeToggle();
    const lr = createLiveRegion('statusRegion', { throttle: 300 });
    const km = new KeyboardManager();
  </script>
</body>
</html>
```

### 自動化檢查建議（待加入 CI）
| 檢查項目 | 條件 | 未通過動作 |
|----------|------|------------|
| animations.json 連結有效性 | `url` 指向的檔案存在 | 標記錯誤並停止部署 |
| 模組匯入一致性 | 模擬頁含 `navigation.js` & `theme.js` | 自動補入或回報 |
| 無障礙骨架 | skip-link + main[tabindex] 存在 | 發警告 |
| JSON version/date | `lastUpdated` = 當日（如有新增） | 提示更新版本號 |

### 遷移注意事項
舊版根目錄資源若尚未移動：
1. 將原 `assets/` → `public/assets/`（已完成）
2. 驗證所有引用路徑不再使用 `./assets` 於子頁（改為 `../assets`）
3. 確認 `fetch` 呼叫不受相對路徑影響（Dev Server 測試）

### 簡易本地開發指令（可寫入 README 未來）
```bash
# Python 簡易伺服器（部署結構測試）
cd public && python3 -m http.server 5173
```

### 說明補充
- 模擬頁面不再內嵌重複的 navbar/footer；改由範本動態載入。
- 所有共用 JS 採 ES Module，建議未來改為打包（Vite/Rollup）。
- 部署時僅公開 `public/`，防止教學規劃、內部說明外洩。
- JSON + 模組化 + public 隔離 → 為後續自動化（生成卡片 / 驗證 / 頁面 scaffold）提供穩定基準。

---

## 🎨 內容規範建議

### 向 Gemini 請求動畫時的提示詞範例
```
請幫我建立一個[物理現象名稱]的互動模擬動畫，需求：

1. 使用單一 HTML 檔案，包含所有 CSS 和 JavaScript
2. 使用 Bootstrap 5.3 框架（透過 CDN）
3. 使用 Font Awesome 6 圖示（透過 CDN）
4. 使用 Canvas 或 SVG 繪製動畫
5. 包含控制面板（開始/暫停/重置/參數調整）
6. 在頁面上顯示相關公式和說明
7. 響應式設計，支援手機瀏覽
8. 符合 WCAG 2.2 AA 無障礙標準：
   - 色彩對比度至少 4.5:1
   - 所有按鈕可用鍵盤操作
   - 表單元素有明確的 label
   - 使用語意化 HTML 標籤
   - 圖片有 alt 屬性
   - 支援螢幕閱讀器（適當的 ARIA 標籤）
9. 加入返回首頁的按鈕（使用 Font Awesome 圖示）
```

### 單頁檔案建議包含的元素
每個從 Gemini 獲得的動畫頁面應該包含：

1. **導航列** - Bootstrap navbar，包含返回首頁連結
2. **標題區** - 使用 `<h1>`，清楚說明模擬內容
3. **動畫區域** - Canvas/SVG 在 Bootstrap card 或 container 內
4. **控制面板** - Bootstrap 按鈕和表單元件
5. **理論說明** - 使用 Bootstrap card 或 accordion 呈現
6. **公式顯示** - 相關的數學公式（可使用 MathJax 或 KaTeX）
7. **無障礙特性**：
   - 所有互動元件有 `aria-label`
   - 按鈕狀態有視覺和文字提示
   - 鍵盤導航順序合理
   - Focus 狀態清晰可見

---

## 🔧 工作流程

### 步驟 1: 使用 Gemini Canvas 生成動畫
1. 開啟 Gemini (Google AI Studio 或 Gemini App)
2. 描述您想要的物理/數學動畫
3. 要求生成單頁 HTML 檔案（包含 CSS 和 JS）
4. 測試生成的程式碼是否正常運作
5. 根據需要調整和優化

### 步驟 2: 儲存到專案
1. 複製 Gemini 生成的完整 HTML 程式碼
2. 在 VS Code 中建立新檔案，放到對應分類資料夾
3. 貼上程式碼並儲存
4. 用瀏覽器測試檔案是否正常

### 步驟 3: 更新首頁連結與 Metadata
1. 編輯 `index.html`
2. 在對應分類下新增卡片
3. **務必加上 `data-subject` 和 `data-grade` 屬性**
4. 加上簡短說明與關鍵字（`data-keywords`）

範例：
```html
<div class="col-12 col-sm-6 col-lg-4">
  <div class="card h-100" tabindex="0"
       data-subject="physics"
       data-grade="2-1"
       data-keywords="自由落體,重力,加速度">
    <div class="card-body">
      <h3 class="h5 card-title">自由落體</h3>
      <p class="card-text small">觀察物體在重力作用下的加速度與位移變化。</p>
      <a href="physics/free-fall.html" class="btn btn-sm btn-primary">進入</a>
    </div>
  </div>
</div>
```

### 步驟 4: 版本控制（選用）
```bash
git add .
git commit -m "新增：[動畫名稱]"
git push
```

---

## 📚 建議收集的動畫主題

### 物理類
- [ ] 自由落體
- [ ] 拋體運動（平拋、斜拋）
- [ ] 牛頓擺
- [ ] 單擺運動
- [ ] 彈簧振動
- [ ] 碰撞（彈性、非彈性）
- [ ] 波動（橫波、縱波）
- [ ] 聲波傳播
- [ ] 光的反射與折射
- [ ] 凸透鏡成像
- [ ] 簡單電路
- [ ] 磁力線

### 數學類
- [ ] 畢氏定理視覺證明
- [ ] 一次函數圖形
- [ ] 二次函數圖形
- [ ] 三角函數動態圖
- [ ] 圓的性質（圓周角、圓心角）
- [ ] 多邊形面積計算
- [ ] 立體圖形展開圖
- [ ] 機率模擬（擲骰子、抽球）
- [ ] 統計圖表互動

### 化學類
- [ ] 原子結構
- [ ] 週期表互動
- [ ] 分子結構 3D 模型
- [ ] 酸鹼中和
- [ ] 化學鍵結
- [ ] 元素電子組態

---

## � Bootstrap + WCAG 2.2 AA 設計規範

### Bootstrap 組件使用建議
- **導航列**: `navbar`、`navbar-expand-lg`
- **卡片**: `card`、`card-body` 用於內容區塊
- **按鈕**: `btn`、`btn-primary`、`btn-success` 等
- **表單**: `form-control`、`form-label`、`form-range`（滑桿）
- **網格**: `container`、`row`、`col-*` 響應式佈局
- **間距**: `m-*`、`p-*`、`mb-*` 等 utility classes

### WCAG 2.2 AA 必須符合項目

#### 1. 色彩對比度
```css
/* 一般文字：對比度至少 4.5:1 */
/* 大型文字（18pt 以上）：對比度至少 3:1 */
/* 建議使用 Bootstrap 預設色彩，已符合標準 */

/* 檢查工具：WebAIM Contrast Checker */
```

#### 2. 鍵盤操作
- 所有功能都能用鍵盤操作（Tab、Enter、Space、方向鍵）
- Focus 狀態必須清晰可見
- 合理的 Tab 順序（`tabindex` 使用）

#### 3. 語意化 HTML
```html
<!-- 使用正確的標籤 -->
<header>、<nav>、<main>、<section>、<article>、<footer>
<button> 用於按鈕，不要用 <div>
<label> 必須與表單元件關聯
```

#### 4. ARIA 標籤
```html
<!-- 按鈕狀態 -->
<button aria-label="開始動畫" aria-pressed="false">
  <i class="fas fa-play" aria-hidden="true"></i>
  開始
</button>

<!-- 動態更新區域 -->
<div aria-live="polite" aria-atomic="true">
  目前速度：<span id="speed">0</span> m/s
</div>

<!-- 隱藏裝飾性圖示 -->
<i class="fas fa-star" aria-hidden="true"></i>
```

#### 5. 表單無障礙
```html
<div class="mb-3">
  <label for="gravity" class="form-label">重力加速度 (m/s²)</label>
  <input type="range" class="form-range" id="gravity" 
         min="1" max="20" step="0.1" value="9.8"
         aria-valuemin="1" aria-valuemax="20" 
         aria-valuenow="9.8" aria-label="調整重力加速度">
  <output for="gravity" id="gravityValue">9.8</output>
</div>
```

### Font Awesome 使用規範
```html
<!-- 裝飾性圖示（需加 aria-hidden） -->
<i class="fas fa-play" aria-hidden="true"></i>

<!-- 獨立意義的圖示（需加標題） -->
<i class="fas fa-home" role="img" aria-label="首頁"></i>

<!-- 推薦：圖示 + 文字 -->
<button class="btn btn-primary">
  <i class="fas fa-play" aria-hidden="true"></i>
  開始
</button>
```

## �🎯 檔案命名規範

### 命名原則
- 使用英文小寫 + 連字號：`free-fall.html`
- 清楚描述內容：`projectile-motion.html` 而非 `demo1.html`
- 避免使用空格和特殊字元

### 分類建議
```
physics/     → 物理相關動畫
math/        → 數學相關動畫
chemistry/   → 化學相關動畫
biology/     → 生物相關動畫（未來擴充）
earth/       → 地球科學（未來擴充）
```

---

## 🚀 部署建議

### 本地預覽
- 使用 VS Code 的 Live Server 擴充套件
- 或直接用瀏覽器開啟 `index.html`

### 線上部署（選用）
- **GitHub Pages**: 最簡單，直接推送到 GitHub 即可
- **Netlify**: 拖放資料夾即可部署
- **Vercel**: 也支援靜態網站

由於都是單頁 HTML，不需要複雜的建置流程

---

## 📝 品質檢查清單

每個新增的動畫檔案檢查：

### 功能性
- [ ] 動畫能正常運作
- [ ] 控制按鈕功能正常
- [ ] 有返回首頁的連結
- [ ] 在手機、平板、桌機都能正常瀏覽
- [ ] 已更新 index.html 的連結
- [ ] 檔案命名清楚且符合規範
- [ ] **已加上 `data-subject` 和 `data-grade` 屬性（篩選必要）**

### Bootstrap 使用
- [ ] 正確引入 Bootstrap CSS 和 JS（CDN）
- [ ] 使用 Bootstrap 組件（按鈕、卡片、表單等）
- [ ] 使用 Bootstrap 網格系統實現響應式佈局
- [ ] 正確引入 Font Awesome（CDN）
- [ ] 圖示使用合理且有意義

### WCAG 2.2 AA 無障礙
- [ ] **色彩對比度**：文字與背景對比至少 4.5:1（使用工具檢查）
- [ ] **鍵盤操作**：所有功能都能用 Tab、Enter、Space 操作
- [ ] **Focus 可見性**：Tab 時能清楚看到焦點位置
- [ ] **語意化 HTML**：使用 `<button>`、`<label>`、`<main>` 等正確標籤
- [ ] **ARIA 標籤**：按鈕有 `aria-label`，裝飾性圖示有 `aria-hidden="true"`
- [ ] **表單標籤**：所有 input 都有對應的 `<label>`
- [ ] **圖片替代文字**：所有 `<img>` 都有 `alt` 屬性
- [ ] **動態內容**：即時更新的數據使用 `aria-live`
- [ ] **標題結構**：正確使用 h1-h6，不跳級
- [ ] **連結明確性**：連結文字清楚說明目的地

---

## 📊 未來可能的擴充

### 簡單擴充
- [ ] 在每個動畫頁面加上「上一個/下一個」導航
- [ ] 建立搜尋功能
- [ ] 加入標籤分類

### 進階擴充
- [ ] 使用者可以調整並分享參數（URL query）
- [ ] 加入簡單的測驗題
- [ ] 製作 PWA 支援離線使用

---

## 💡 使用 AI 的小技巧

### 與 Gemini 對話時
1. **明確描述需求**：「請製作一個自由落體動畫，要能調整高度和重力加速度」
2. **要求單檔輸出**：「請將所有 CSS 和 JavaScript 都寫在同一個 HTML 檔案內」
3. **指定框架**：「請使用 Bootstrap 5 和 Font Awesome 6（透過 CDN）」
4. **要求無障礙**：「請符合 WCAG 2.2 AA 標準，包含 ARIA 標籤和鍵盤操作」
5. **要求加上說明**：「請在頁面上顯示公式和原理說明」
6. **要求響應式**：「請使用 Bootstrap 網格系統實現響應式設計」

### 在 VS Code 使用 AI Agent
1. 檢查 WCAG 合規性（色彩對比、ARIA 標籤等）
2. 協助優化 Gemini 生成的程式碼
3. 協助建立和維護 index.html
4. 批次處理檔案整理
5. 生成 README 和說明文件

## 🛠️ 推薦的開發工具和資源

### VS Code 擴充套件
- **Live Server** - 本地預覽
- **axe Accessibility Linter** - 無障礙檢查
- **WebAIM Contrast Checker** - 對比度檢查
- **Bootstrap 5 Quick Snippets** - Bootstrap 程式碼片段

### 線上檢查工具
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - 色彩對比檢查
- [WAVE Browser Extension](https://wave.webaim.org/extension/) - 無障礙評估工具
- [axe DevTools](https://www.deque.com/axe/devtools/) - Chrome/Firefox 無障礙檢查擴充
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Chrome 內建的網站品質檢查

### CDN 連結（複製使用）
```html
<!-- Bootstrap 5.3 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap 5.3 JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- Font Awesome 6 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

---

**最後更新**: 2025年11月28日
**版本**: 2.0.0（精簡版）

---

## ♿ 可重用無障礙元件片段 (A11y Component Library)

以下片段可在建立新模擬頁時複製貼上，維持風格與 WCAG 2.2 AA 一致性。每個模式含：目的、結構、最小可用標記、JS 邏輯、測試重點。

### 1. Range + Number 雙輸入同步 (滑桿對應數值)
目的：提供精細調整與快速輸入；確保螢幕閱讀器能得知當前值；避免多次觸發昂貴重繪。

標記範例：
```html
<div class="mb-3" data-a11y-component="range-pair">
  <label for="speedRange" class="form-label">速度 (m/s)</label>
  <div class="d-flex align-items-center gap-2">
    <input id="speedRange" type="range" class="form-range flex-grow-1"
           min="0" max="50" step="0.5" value="10"
           aria-valuemin="0" aria-valuemax="50" aria-valuenow="10"
           aria-label="調整速度">
    <input id="speedNumber" type="number" class="form-control form-control-sm" style="width:5.5rem" value="10"
           min="0" max="50" step="0.5" aria-label="輸入速度">
  </div>
  <div class="form-text">使用方向鍵微調；Shift+方向鍵加大步進。</div>
</div>
```

同步邏輯：
```js
function bindRangeNumber(rangeEl, numberEl, onChange){
  let rafPending = false;
  function apply(val){
    rangeEl.value = val; numberEl.value = val;
    rangeEl.setAttribute('aria-valuenow', val);
    if(onChange){ onChange(parseFloat(val)); }
  }
  rangeEl.addEventListener('input',()=>{ if(!rafPending){ rafPending = true; requestAnimationFrame(()=>{ rafPending=false; apply(rangeEl.value); }); }});
  numberEl.addEventListener('input',()=>{ let v = numberEl.value; if(v === '') return; if(parseFloat(v) < rangeEl.min) v=rangeEl.min; if(parseFloat(v) > rangeEl.max) v=rangeEl.max; apply(v); });
  numberEl.addEventListener('blur',()=>{ if(numberEl.value==='') apply(rangeEl.value); });
}
// 使用範例：
// bindRangeNumber(document.getElementById('speedRange'), document.getElementById('speedNumber'), val => updateSimulationSpeed(val));
```

測試重點：
- Tab 可進入兩個輸入；方向鍵調整 range 值；數值輸入後同步滑桿。
- 螢幕閱讀器讀取 label 與當前值。
- Shift+方向鍵 (原生會一次步進) 可選擇加倍：可擴充自訂事件。

### 2. Live Region 更新助手
目的：集中管理即時狀態宣告，避免過度刷屏；對 aria-live 使用節流。

標記：
```html
<div id="statusRegion" class="small" aria-live="polite" aria-atomic="true">狀態：初始化中</div>
```

JS 工具：
```js
function createLiveRegion(id, {politeness='polite', atomic=true, interval=200}={}){
  const el = document.getElementById(id);
  if(!el) throw new Error('live region not found');
  el.setAttribute('aria-live', politeness);
  el.setAttribute('aria-atomic', atomic?'true':'false');
  let last = 0; let pending;
  return function announce(msg){
    const now = performance.now();
    if(now - last < interval){ pending = msg; return; }
    el.textContent = msg; last = now; pending = undefined;
    setTimeout(()=>{ if(pending){ el.textContent = pending; last = performance.now(); pending = undefined; }}, interval);
  };
}
// const announceStatus = createLiveRegion('statusRegion');
// announceStatus('狀態：已載入');
```

測試重點：
- 快速拖動滑桿時不產生語音洪流。
- 切換 polite/assertive 時僅需要在初始化階段設定。

### 3. 鍵盤快捷鍵說明組件 (可折疊/模態)
目的：提供一致的「快捷鍵表」彈出方式；可重用於所有模擬。

Bootstrap 折疊版本：
```html
<div class="mt-3" data-a11y-component="shortcut-panel">
  <button class="btn btn-outline-info btn-sm" data-bs-toggle="collapse" data-bs-target="#shortcutHelp" aria-expanded="false" aria-controls="shortcutHelp" aria-label="顯示或隱藏快捷鍵說明">
    <i class="fa-solid fa-keyboard" aria-hidden="true"></i> 快捷鍵
  </button>
  <div id="shortcutHelp" class="collapse mt-2">
    <div class="card card-body small">
      <ul class="mb-0" aria-label="快捷鍵清單">
        <li><kbd>Space</kbd>：開始/暫停</li>
        <li><kbd>R</kbd>：重置</li>
        <li><kbd>← / →</kbd>：微調主要參數</li>
      </ul>
    </div>
  </div>
</div>
```

模態版本 (必要時顯示大量說明)：
```html
<button type="button" class="btn btn-outline-info btn-sm" data-bs-toggle="modal" data-bs-target="#shortcutModal" aria-label="開啟快捷鍵說明"><i class="fa-solid fa-keyboard" aria-hidden="true"></i></button>
<div class="modal fade" id="shortcutModal" tabindex="-1" aria-labelledby="shortcutModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="shortcutModalLabel" class="h5 mb-0">快捷鍵說明</h2>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="關閉"></button>
      </div>
      <div class="modal-body small">
        <ul class="mb-0">
          <li><kbd>Space</kbd>：開始/暫停</li>
          <li><kbd>R</kbd>：重置</li>
          <li><kbd>Shift + ← / →</kbd>：快速調整</li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

測試重點：
- 折疊按鈕 `aria-expanded` 會跟隨狀態變化（Bootstrap 自動處理）。
- 模態開啟時焦點陷入 (focus trap)；Esc 可關閉。

### 4. 可存取 Accordion / 理論說明區塊
目的：用於展示公式、概念、操作提示，保持標題層級與關聯。

標記：
```html
<div class="accordion" id="theoryAccordion" data-a11y-component="accordion">
  <div class="accordion-item">
    <h2 class="accordion-header" id="headingFormula">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelFormula" aria-expanded="false" aria-controls="panelFormula">公式推導</button>
    </h2>
    <div id="panelFormula" class="accordion-collapse collapse" aria-labelledby="headingFormula" data-bs-parent="#theoryAccordion">
      <div class="accordion-body small">
        1/f = 1/p + 1/i ， M = - i / p
      </div>
    </div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header" id="headingConcept">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelConcept" aria-expanded="false" aria-controls="panelConcept">觀察重點</button>
    </h2>
    <div id="panelConcept" class="accordion-collapse collapse" aria-labelledby="headingConcept" data-bs-parent="#theoryAccordion">
      <div class="accordion-body small">
        物距改變時，像距與放大率按透鏡公式相互影響；位於焦距內只形成虛像。
      </div>
    </div>
  </div>
</div>
```

測試重點：
- Tab 能進入每個 header 按鈕；Enter/Space 可展開。
- 展開一項後其餘收合（依 `data-bs-parent` 控制）。

### 5. Skip Link 樣式統一
目的：確保最上方能快速跳至主內容；只顯示於 focus。

標記：
```html
<a href="#main" class="skip-link">跳到主內容</a>
```

CSS（共用建議，可抽成一段）：
```css
.skip-link{position:absolute;left:-1000px;top:0;background:#000;color:#fff;padding:.5rem 1rem;z-index:1000}
.skip-link:focus{left:0}
```

### 6. 主題切換按鈕 (含 ARIA)
目的：一致化 `data-bs-theme` 管理與按鈕狀態宣告。
```html
<button id="themeToggle" class="btn btn-outline-secondary" type="button" aria-pressed="false" aria-label="切換深淺主題"><i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i></button>
```
```js
function initThemeToggle(btn){
  function setTheme(t){document.documentElement.setAttribute('data-bs-theme',t);localStorage.setItem('theme',t);btn.setAttribute('aria-pressed', t==='dark');}
  const stored = localStorage.getItem('theme');
  if(stored){setTheme(stored);} else if(window.matchMedia('(prefers-color-scheme: dark)').matches){setTheme('dark');}
  btn.addEventListener('click',()=>{const cur=document.documentElement.getAttribute('data-bs-theme')||'light';setTheme(cur==='light'?'dark':'light');});
}
// initThemeToggle(document.getElementById('themeToggle'));
```

### 7. 統一鍵盤事件管理 (集中避免衝突)
目的：避免多頁面散落多個 `document.addEventListener('keydown',...)`，提供註冊器。
```js
const KeyMap = (function(){
  const handlers = [];
  document.addEventListener('keydown', e => {
    for(const h of handlers){ h(e); }
  });
  return { use(fn){ handlers.push(fn); } };
})();
// 使用：KeyMap.use(e=>{ if(e.key==='r'||e.key==='R') reset(); });
```

### 8. Component 整合步驟 (建立新模擬頁)
1. 複製主題切換按鈕、Skip Link、Live Region、快捷鍵折疊。
2. 若需滑桿：使用 Range+Number 雙輸入模式。
3. 建立 `announceStatus` 實例，於重置、播放、暫停等事件宣告狀態。
4. 將鍵盤事件註冊到 `KeyMap`。
5. 加入 Accordion 顯示公式或理論。
6. 最後檢查：Tab 流程、焦點樣式、ARIA 值是否隨動態更新。

### 9. Edge Cases / 風險清單
- Live Region 過度更新：需節流（已在 helper 中處理）。
- Range 快速拖動：大量重繪 → 使用 `requestAnimationFrame`。
- 多重快捷鍵衝突：集中註冊解決。
- 視覺縮放 (螢幕放大 200%)：確保文字不被截斷；使用彈性寬度。
- 深色主題對比不足：定期以 Contrast Checker 驗證自訂顏色。

### 10. 元件測試清單 (新增頁面完成後自查)
| 項目 | 檢查 |
|------|------|
| Range+Number | 方向鍵微調、數值輸入同步 |
| Live Region | 快速操作不語音洪流 |
| 快捷鍵面板 | 折疊/模態可開關，焦點正確返回 |
| Accordion | Enter/Space 展開收合，僅一項開啟 |
| 主題切換 | ARIA-pressed 正確改變 |
| 鍵盤事件 | 不阻斷原生瀏覽器快捷鍵 (如 Ctrl+L) |
| 對比度 | 主要文字背景 ≥ 4.5:1 |

### 11. 未來可抽出共用檔案 (若脫離單檔策略)
若改為模組化：
- `/assets/js/a11y-components.js`：包含上述 helper。
- `/assets/css/a11y-base.css`：skip-link、focus 樣式、深色主題調色。
- `/assets/js/keyboard.js`：集中快捷鍵登錄。

---

## 📊 JSON 資料驅動架構設計（方案 A）

### 設計理念
將動畫資料與呈現邏輯分離，透過 JSON 統一管理所有動畫的 metadata，使用 JavaScript 動態渲染卡片。

### 架構優勢
- ✅ **維護效率**：新增動畫只需編輯 JSON，無需修改 HTML
- ✅ **資料一致性**：單一資料來源，避免同步問題
- ✅ **擴充性**：未來可用於搜尋、統計、API 整合
- ✅ **可測試性**：資料與邏輯分離，易於驗證
- ✅ **符合現況**：篩選系統已是動態的，統一架構更一致

### 目錄結構調整
```
SchScie/
├── index.html              # 首頁（動態渲染）
├── data/
│   └── animations.json     # 動畫資料庫（單一資料來源）
├── physics/                # 物理動畫頁面
├── math/                   # 數學動畫頁面
├── chemistry/              # 化學動畫頁面
└── PROJECT_PLAN.md         # 本文件
```

---

## 📋 資料結構規範

### `data/animations.json` 完整結構

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-11-29",
  "metadata": {
    "totalAnimations": 6,
    "subjects": ["physics", "math", "chemistry"],
    "grades": ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2"]
  },
  "animations": [
    {
      "id": "free-fall",
      "title": "自由落體",
      "subject": "physics",
      "subjectName": "理化",
      "grade": "2-1",
      "gradeName": "國二上",
      "chapter": "運動學",
      "description": "觀察物體在重力作用下的加速度與位移變化。",
      "keywords": ["自由落體", "重力加速度", "等加速度"],
      "url": "physics/free-fall.html",
      "status": "active",
      "featured": false,
      "icon": "fa-solid fa-arrow-down",
      "addedDate": "2025-01-15",
      "difficulty": "basic"
    },
    {
      "id": "kinetic-theory-gas",
      "title": "溫度與氣體粒子活動",
      "subject": "physics",
      "subjectName": "理化",
      "grade": "2-2",
      "gradeName": "國二下",
      "chapter": "溫度與熱",
      "description": "調整溫度觀察理想氣體粒子的速度與碰撞頻率變化，理解平均動能。",
      "keywords": ["氣體動力論", "溫度", "粒子", "動能", "碰撞"],
      "url": "physics/kinetic-theory-gas.html",
      "status": "active",
      "featured": true,
      "icon": "fa-solid fa-temperature-high",
      "addedDate": "2025-11-29",
      "difficulty": "intermediate"
    }
  ],
  "subjects": [
    {
      "id": "physics",
      "name": "理化",
      "icon": "fa-solid fa-bolt",
      "color": "primary",
      "badge": "基礎力學"
    },
    {
      "id": "math",
      "name": "數學",
      "icon": "fa-solid fa-square-root-variable",
      "color": "success",
      "badge": "函數與幾何"
    },
    {
      "id": "chemistry",
      "name": "化學",
      "icon": "fa-solid fa-flask",
      "color": "warning",
      "badge": "元素與結構"
    }
  ],
  "grades": [
    { "id": "1-1", "name": "國一上", "group": "國一" },
    { "id": "1-2", "name": "國一下", "group": "國一" },
    { "id": "2-1", "name": "國二上", "group": "國二" },
    { "id": "2-2", "name": "國二下", "group": "國二" },
    { "id": "3-1", "name": "國三上", "group": "國三" },
    { "id": "3-2", "name": "國三下", "group": "國三" }
  ]
}
```

### 欄位說明

#### 動畫物件 (animations[])
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一識別碼（檔名基礎） |
| `title` | string | ✅ | 顯示標題 |
| `subject` | string | ✅ | 科目代碼（physics/math/chemistry） |
| `subjectName` | string | ✅ | 科目中文名稱 |
| `grade` | string | ✅ | 年級代碼（1-1 至 3-2） |
| `gradeName` | string | ✅ | 年級中文名稱 |
| `chapter` | string | ⚠️ | 章節名稱（用於細分） |
| `description` | string | ✅ | 簡短描述（1-2 句） |
| `keywords` | array | ✅ | 關鍵字陣列（用於搜尋） |
| `url` | string | ✅ | 相對路徑 |
| `status` | string | ✅ | active/coming-soon/disabled |
| `featured` | boolean | ⚠️ | 是否顯示 NEW 徽章 |
| `icon` | string | ⚠️ | Font Awesome 類別 |
| `addedDate` | string | ⚠️ | 新增日期（YYYY-MM-DD） |
| `difficulty` | string | ⚠️ | basic/intermediate/advanced |

#### 科目物件 (subjects[])
| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 科目代碼 |
| `name` | string | 中文名稱 |
| `icon` | string | Font Awesome 圖示 |
| `color` | string | Bootstrap 色彩（primary/success/warning） |
| `badge` | string | 區段徽章文字 |

---

## 🛠️ JavaScript 渲染引擎

### 核心函數架構

#### 1. 載入與初始化
```javascript
// 全域變數
let animationsData = null;

// 載入 JSON 並初始化
async function loadAnimations() {
  try {
    showLoadingState();
    const response = await fetch('data/animations.json');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    animationsData = await response.json();
    
    // 驗證資料結構
    validateData(animationsData);
    
    // 渲染所有內容
    renderSubjectSections(animationsData.subjects);
    renderAnimationCards(animationsData.animations);
    
    // 初始化篩選系統
    initializeFilters(animationsData);
    
    hideLoadingState();
    
  } catch (error) {
    console.error('載入動畫資料失敗:', error);
    showErrorState(error.message);
  }
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', loadAnimations);
```

#### 2. 資料驗證
```javascript
function validateData(data) {
  if (!data.animations || !Array.isArray(data.animations)) {
    throw new Error('資料格式錯誤：缺少 animations 陣列');
  }
  
  if (!data.subjects || !Array.isArray(data.subjects)) {
    throw new Error('資料格式錯誤：缺少 subjects 陣列');
  }
  
  // 檢查必要欄位
  data.animations.forEach((anim, index) => {
    const required = ['id', 'title', 'subject', 'grade', 'description', 'url', 'status'];
    required.forEach(field => {
      if (!anim[field]) {
        throw new Error(`動畫 #${index} 缺少必要欄位: ${field}`);
      }
    });
  });
  
  console.log(`✅ 資料驗證通過：共 ${data.animations.length} 個動畫`);
}
```

#### 3. 渲染科目區段
```javascript
function renderSubjectSections(subjects) {
  const container = document.getElementById('mainContent'); // 需在 HTML 中定義
  
  subjects.forEach(subject => {
    const section = document.createElement('section');
    section.id = subject.id;
    section.className = 'mb-5';
    section.setAttribute('aria-labelledby', `sec-${subject.id}`);
    
    section.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h2 id="sec-${subject.id}" class="h4 mb-0">
          <i class="${subject.icon}" aria-hidden="true"></i> 
          ${subject.name}
        </h2>
        <span class="badge text-bg-${subject.color}">${subject.badge}</span>
      </div>
      <div class="row g-3" data-subject-container="${subject.id}"></div>
    `;
    
    container.appendChild(section);
  });
}
```

#### 4. 渲染動畫卡片
```javascript
function renderAnimationCards(animations) {
  // 依科目分組
  const grouped = animations.reduce((acc, anim) => {
    if (!acc[anim.subject]) acc[anim.subject] = [];
    acc[anim.subject].push(anim);
    return acc;
  }, {});
  
  // 渲染每個科目的卡片
  Object.entries(grouped).forEach(([subject, cards]) => {
    const container = document.querySelector(`[data-subject-container="${subject}"]`);
    if (!container) {
      console.warn(`找不到科目容器: ${subject}`);
      return;
    }
    
    container.innerHTML = ''; // 清空
    
    cards.forEach(anim => {
      const cardElement = createCardElement(anim);
      container.appendChild(cardElement);
    });
  });
}

function createCardElement(anim) {
  const col = document.createElement('div');
  col.className = 'col-12 col-sm-6 col-lg-4';
  
  // 根據 status 決定按鈕狀態
  let buttonHTML = '';
  if (anim.status === 'active') {
    buttonHTML = `
      <a href="${anim.url}" class="btn btn-sm btn-primary" 
         aria-label="進入${anim.title}互動模擬">
        進入 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </a>
    `;
  } else if (anim.status === 'coming-soon') {
    buttonHTML = `
      <button class="btn btn-sm btn-secondary" disabled aria-disabled="true">
        即將推出
      </button>
    `;
  }
  
  col.innerHTML = `
    <div class="card h-100" tabindex="0" 
         data-subject="${anim.subject}" 
         data-grade="${anim.grade}"
         data-chapter="${anim.chapter || ''}"
         data-keywords="${anim.keywords.join(',')}"
         data-animation-id="${anim.id}">
      <div class="card-body">
        <h3 class="h5 card-title">
          ${anim.icon ? `<i class="${anim.icon}" aria-hidden="true"></i> ` : ''}
          ${anim.title}
          ${anim.featured ? '<span class="badge text-bg-danger ms-1">NEW</span>' : ''}
        </h3>
        <p class="card-text small">${anim.description}</p>
        ${buttonHTML}
      </div>
    </div>
  `;
  
  return col;
}
```

#### 5. 整合篩選系統
```javascript
function initializeFilters(data) {
  const filterSubject = document.getElementById('filterSubject');
  const filterGrade = document.getElementById('filterGrade');
  const resetBtn = document.getElementById('resetFilters');
  const resultBadge = document.getElementById('resultBadge');
  
  // 動態生成篩選選項（若需要）
  // populateFilterOptions(data);
  
  // 執行篩選（重用現有邏輯）
  function applyFilters() {
    const selectedSubject = filterSubject.value;
    const selectedGrade = filterGrade.value;
    let visibleCount = 0;
    
    const allCards = document.querySelectorAll('[data-animation-id]');
    
    allCards.forEach(card => {
      const cardSubject = card.getAttribute('data-subject');
      const cardGrade = card.getAttribute('data-grade');
      
      const subjectMatch = selectedSubject === 'all' || cardSubject === selectedSubject;
      const gradeMatch = selectedGrade === 'all' || cardGrade === selectedGrade;
      
      const isVisible = subjectMatch && gradeMatch;
      
      const colElement = card.closest('.col-12');
      if (colElement) {
        colElement.style.display = isVisible ? '' : 'none';
      }
      
      if (isVisible) visibleCount++;
    });
    
    updateResultBadge(visibleCount, allCards.length);
    updateEmptySections();
  }
  
  // 更新統計徽章
  function updateResultBadge(visible, total) {
    if (visible === total) {
      resultBadge.textContent = `顯示全部 ${total} 項`;
      resultBadge.className = 'badge text-bg-info fs-6';
    } else if (visible === 0) {
      resultBadge.textContent = '無符合結果';
      resultBadge.className = 'badge text-bg-warning fs-6';
    } else {
      resultBadge.textContent = `顯示 ${visible} / ${total} 項`;
      resultBadge.className = 'badge text-bg-success fs-6';
    }
  }
  
  // 檢查空白區段
  function updateEmptySections() {
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
      const cards = section.querySelectorAll('[data-animation-id]');
      let hasVisible = false;
      
      cards.forEach(card => {
        const col = card.closest('.col-12');
        if (col && col.style.display !== 'none') {
          hasVisible = true;
        }
      });
      
      const oldMsg = section.querySelector('.empty-state-message');
      if (oldMsg) oldMsg.remove();
      
      if (!hasVisible && cards.length > 0) {
        const row = section.querySelector('.row');
        if (row) {
          const msg = document.createElement('div');
          msg.className = 'col-12 empty-state-message';
          msg.innerHTML = `
            <div class="alert alert-secondary" role="alert">
              <i class="fa-solid fa-circle-info" aria-hidden="true"></i> 
              此區段無符合篩選條件的項目
            </div>
          `;
          row.appendChild(msg);
        }
      }
    });
  }
  
  // 重置篩選
  function resetFilters() {
    filterSubject.value = 'all';
    filterGrade.value = 'all';
    applyFilters();
    filterSubject.focus();
  }
  
  // 事件監聽
  filterSubject.addEventListener('change', applyFilters);
  filterGrade.addEventListener('change', applyFilters);
  resetBtn.addEventListener('click', resetFilters);
  
  // 鍵盤快捷鍵
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && 
        (document.activeElement === filterSubject || 
         document.activeElement === filterGrade)) {
      resetFilters();
    }
  });
  
  // 初始化執行一次
  applyFilters();
}
```

#### 6. 載入狀態管理
```javascript
function showLoadingState() {
  const mainContent = document.getElementById('mainContent');
  mainContent.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-3 text-muted">正在載入動畫資料...</p>
    </div>
  `;
}

function hideLoadingState() {
  // 已由 renderSubjectSections 取代內容
  console.log('✅ 渲染完成');
}

function showErrorState(message) {
  const mainContent = document.getElementById('mainContent');
  mainContent.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <h4 class="alert-heading">
        <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
        載入失敗
      </h4>
      <p>${message}</p>
      <hr>
      <p class="mb-0">
        <button class="btn btn-outline-danger" onclick="location.reload()">
          <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
          重新載入
        </button>
      </p>
    </div>
  `;
}
```

---

## 📝 資料維護工作流程

### 新增動畫的步驟

#### 1. 建立動畫檔案
在 Gemini 生成動畫後，存入對應資料夾（如 `physics/wave-interference.html`）

#### 2. 編輯 `data/animations.json`
在 `animations` 陣列中新增項目：

```json
{
  "id": "wave-interference",
  "title": "波的干涉",
  "subject": "physics",
  "subjectName": "理化",
  "grade": "2-2",
  "gradeName": "國二下",
  "chapter": "波動",
  "description": "觀察兩個波源產生的干涉現象，理解建設性與破壞性干涉。",
  "keywords": ["波動", "干涉", "建設性干涉", "破壞性干涉", "波源"],
  "url": "physics/wave-interference.html",
  "status": "active",
  "featured": true,
  "icon": "fa-solid fa-wave-square",
  "addedDate": "2025-11-29",
  "difficulty": "intermediate"
}
```

#### 3. 驗證 JSON 格式
使用線上工具（如 [jsonlint.com](https://jsonlint.com/)）或 VS Code 檢查語法錯誤

#### 4. 測試顯示
重新載入 `index.html`，確認新卡片正確顯示

#### 5. 更新 metadata
修改 JSON 頂部的 `metadata.totalAnimations` 數字

### 修改現有動畫資訊
直接編輯 JSON 對應項目，重新載入頁面即可生效

### 停用動畫
將 `status` 改為 `"disabled"` 或 `"coming-soon"`

---

## 🎯 HTML 結構調整

### `index.html` 必要修改

#### 1. 移除靜態卡片
刪除所有手動撰寫的 `<div class="card">` 結構

#### 2. 保留區段容器
```html
<main id="main" class="flex-grow-1 container py-4" tabindex="-1">
  <h1 class="h3 mb-4">互動式教學動畫總覽</h1>
  <p class="lead">選擇一個主題進入互動式模擬，探索概念、調整參數、觀察變化。</p>

  <!-- Filter Panel（保留） -->
  <div id="filterPanel" class="card mb-4 border-primary">
    <!-- 篩選器內容 -->
  </div>

  <!-- 動態渲染容器 -->
  <div id="mainContent">
    <!-- 科目區段將由 JavaScript 動態生成 -->
  </div>

  <!-- 無障礙說明（保留） -->
  <section class="mb-4" aria-labelledby="sec-accessibility">
    <!-- ... -->
  </section>
</main>
```

#### 3. 加入渲染邏輯
在 `</body>` 前加入完整 JavaScript 程式碼（如上述函數）

---

## ⚡ 效能優化策略

### 1. 快取機制（選用）
```javascript
const CACHE_KEY = 'animations_data';
const CACHE_VERSION = '1.0.0';

async function loadAnimations() {
  // 檢查 localStorage
  const cached = localStorage.getItem(CACHE_KEY);
  const cachedVersion = localStorage.getItem(CACHE_KEY + '_version');
  
  if (cached && cachedVersion === CACHE_VERSION) {
    try {
      animationsData = JSON.parse(cached);
      console.log('✅ 使用快取資料');
      renderAll(animationsData);
      return;
    } catch (e) {
      console.warn('快取資料損壞，重新載入');
    }
  }
  
  // 從網路載入
  const response = await fetch('data/animations.json');
  animationsData = await response.json();
  
  // 存入快取
  localStorage.setItem(CACHE_KEY, JSON.stringify(animationsData));
  localStorage.setItem(CACHE_KEY + '_version', CACHE_VERSION);
  
  renderAll(animationsData);
}
```

### 2. 延遲載入（Lazy Loading）
若未來卡片數量 > 50，可考慮虛擬滾動或分頁

### 3. 預載入關鍵資源
```html
<link rel="preload" href="data/animations.json" as="fetch" crossorigin>
```

---

## 🧪 測試與驗證

### 單元測試項目
- [ ] JSON 格式正確無誤
- [ ] 所有必要欄位存在
- [ ] URL 路徑正確（檔案存在）
- [ ] 科目代碼與 subjects 陣列一致
- [ ] 年級代碼與 grades 陣列一致

### 整合測試項目
- [ ] 頁面正確渲染所有卡片
- [ ] 篩選功能正常運作
- [ ] 空狀態提示正確顯示
- [ ] 錯誤處理機制有效
- [ ] 快取機制（若啟用）正常

### 瀏覽器相容性
- [ ] Chrome/Edge (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 🚀 實作步驟計畫

### Phase 1: 建立資料檔案
1. 建立 `data/` 資料夾
2. 建立 `animations.json` 並填入現有 6 個動畫資料
3. 驗證 JSON 格式

### Phase 2: 修改 index.html
1. 移除靜態卡片 HTML
2. 保留篩選面板
3. 建立 `<div id="mainContent"></div>` 容器
4. 加入載入狀態 spinner

### Phase 3: 實作渲染引擎
1. 實作 `loadAnimations()`
2. 實作 `validateData()`
3. 實作 `renderSubjectSections()`
4. 實作 `renderAnimationCards()`
5. 實作 `createCardElement()`

### Phase 4: 整合篩選系統
1. 修改 `initializeFilters()` 使用動態選取器
2. 確保篩選邏輯與動態卡片相容
3. 測試所有篩選組合

### Phase 5: 錯誤處理與優化
1. 加入載入失敗提示
2. 加入資料驗證
3. 加入 console 訊息方便除錯
4. （選用）實作快取機制

### Phase 6: 測試與部署
1. 測試所有瀏覽器
2. 測試行動裝置
3. 驗證無障礙功能
4. 更新 README.md 說明
5. 提交 Git commit

---

## 📊 資料遷移對照表

| 現有 HTML 卡片 | JSON id | status | featured |
|---------------|---------|--------|----------|
| 自由落體 | free-fall | active | false |
| 疏密波（縱波） | hoz-waves | active | false |
| 凸透鏡成像 | convex-lens-imaging | active | false |
| 溫度與氣體粒子活動 | kinetic-theory-gas | active | true |
| 熱傳導 | heat-conduction | active | false |
| 正弦波前進 | sine-wave-propagation | active | false |
| 拋體運動 | projectile-motion | coming-soon | false |
| 單擺運動 | pendulum | coming-soon | false |
| 畢氏定理 | pythagorean | coming-soon | false |
| 函數繪圖 | function-plot | coming-soon | false |
| 週期表互動 | periodic-table | coming-soon | false |

---

## 🔄 未來擴充功能

### 搜尋功能
利用 `keywords` 欄位實作即時搜尋：
```javascript
function searchAnimations(query) {
  const results = animationsData.animations.filter(anim => 
    anim.title.includes(query) || 
    anim.keywords.some(kw => kw.includes(query)) ||
    anim.description.includes(query)
  );
  renderAnimationCards(results);
}
```

### 統計儀表板
```javascript
function generateStats() {
  const total = animationsData.animations.length;
  const bySubject = animationsData.animations.reduce((acc, a) => {
    acc[a.subject] = (acc[a.subject] || 0) + 1;
    return acc;
  }, {});
  console.log(`總計: ${total}, 物理: ${bySubject.physics}, 數學: ${bySubject.math}`);
}
```

### API 整合（未來）
若需要後端統計、評分、留言功能，可將 JSON 改為 API 端點：
```javascript
const response = await fetch('/api/animations?subject=physics&grade=2-1');
```

---

## ✅ 品質檢查清單（JSON 版本）

新增動畫時的檢查項目：

### JSON 資料
- [ ] 所有必要欄位填寫完整
- [ ] `id` 唯一且符合檔名
- [ ] `url` 路徑正確
- [ ] `keywords` 陣列至少 3 個關鍵字
- [ ] `status` 為 active/coming-soon/disabled 之一
- [ ] JSON 格式正確無語法錯誤
- [ ] `lastUpdated` 與 `totalAnimations` 已更新

### 動畫檔案
- [ ] 檔案存在於指定路徑
- [ ] 動畫功能正常運作
- [ ] 符合 Bootstrap + WCAG 2.2 AA 規範
- [ ] 有返回首頁連結

### 整合測試
- [ ] 首頁正確顯示新卡片
- [ ] 篩選功能包含新項目
- [ ] 卡片點擊可進入動畫頁面
- [ ] 在各種裝置正常顯示

---

**最後更新**: 2025年11月29日  
**版本**: 2.3.0（新增模組化重用架構規範）

---

## 🧩 模組化重用架構設計

### 設計理念

將重複的 HTML、CSS、JavaScript 元件抽離為可重用模組，提升維護效率、確保一致性、降低錯誤率。

### 架構優勢

- ✅ **程式碼重用**：減少 80% 重複程式碼
- ✅ **維護效率**：修改一處即可套用全站
- ✅ **一致性保證**：所有頁面使用相同元件
- ✅ **開發速度**：新增頁面時間從 30 分鐘降至 5 分鐘
- ✅ **品質提升**：集中管理無障礙功能
- ✅ **效能優化**：瀏覽器快取共用資源

---

## 📁 模組化目錄結構（歷史版本；現行請參考『最新架構摘要』）

```
public/
├── index.html                  # 首頁（動態渲染）
├── data/
│   └── animations.json         # 動畫資料庫
├── assets/
│   ├── css/
│   │   ├── common.css          # 全站共用樣式
│   │   └── accessibility.css   # 無障礙專用樣式
│   ├── js/
│   │   ├── theme.js            # 主題切換模組
│   │   ├── navigation.js       # 導覽列/頁尾載入 + active 標記
│   │   ├── a11y.js             # Live Region / 鍵盤 / Range 綁定
│   │   └── ui-helpers.js       # Spinner / Toast / Alert / Confirm / ProgressBar
│   └── templates/
│       ├── navbar.html         # 導覽範本
│       └── footer.html         # Footer 範本
├── physics/                    # 物理模擬頁面（匯入共用模組）
├── chemistry/                  # 化學模擬頁面
├── math/                       # 數學模擬頁面
└── templates/                  # （可選）未來新增頁面級標準模板
```

> 舊版架構中 `assets/` 位於根目錄，現已遷移至 `public/assets/`；所有描述已同步更新。

---

## 🎨 模組 1：共用樣式系統

### `assets/css/common.css`

全站共用的基礎樣式，包含：

#### 1. CSS 變數定義
```css
:root {
  --site-primary: #0d6efd;
  --site-focus-color: #ff9800;
  --site-focus-width: 3px;
  --site-border-radius: 0.75rem;
}
```

#### 2. Skip Link 樣式
```css
.skip-link {
  position: absolute;
  left: -1000px;
  top: 0;
  background: #000;
  color: #fff;
  padding: 0.5rem 1rem;
  z-index: 1000;
  text-decoration: none;
  border-radius: 0 0 4px 0;
}
.skip-link:focus {
  left: 0;
}
```

#### 3. 焦點樣式統一
```css
:focus-visible {
  outline: var(--site-focus-width) solid var(--site-focus-color);
  outline-offset: 2px;
}
```

#### 4. 卡片懸停效果
```css
.card:hover, 
.card:focus-within {
  box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.3);
  transition: box-shadow 0.2s ease;
}
```

#### 5. Canvas 容器標準樣式
```css
.canvas-container {
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
  background-color: var(--bs-body-bg);
  border-radius: var(--site-border-radius);
  overflow: hidden;
  width: 100%;
  aspect-ratio: 4/3;
}

.canvas-container canvas {
  width: 100%;
  height: 100%;
  display: block;
}
```

#### 6. Range Slider 美化
```css
input[type=range].form-range {
  height: 24px;
  cursor: pointer;
}
input[type=range].form-range::-webkit-slider-thumb {
  height: 22px;
  width: 22px;
  background: #fff;
  border: 2px solid var(--site-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
input[type=range].form-range::-webkit-slider-runnable-track {
  height: 6px;
  background: linear-gradient(to right, #0d6efd, #dc3545);
  border-radius: 4px;
}
```

### `assets/css/accessibility.css`

無障礙專用樣式：

#### 1. 螢幕閱讀器輔助
```css
.sr-only-focusable:not(:focus) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

#### 2. Live Region 樣式
```css
[aria-live] {
  min-height: 1.5em;
}
```

#### 3. 減少動畫模式支援
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### 4. 高對比度模式
```css
@media (prefers-contrast: high) {
  :root {
    --site-focus-width: 4px;
  }
  .btn {
    border-width: 2px;
  }
  .card {
    border-width: 2px;
  }
}
```

---

## 💻 模組 2：JavaScript 工具集

### `assets/js/theme.js`

主題切換模組（ES Module）：

```javascript
/**
 * 主題切換模組
 * @param {string} buttonId - 按鈕 ID
 * @returns {object} - { setTheme } 方法
 */
export function initThemeToggle(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) {
    console.warn(`主題切換按鈕 #${buttonId} 不存在`);
    return;
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    btn.setAttribute('aria-pressed', theme === 'dark');
    
    // 觸發自訂事件供其他模組監聽
    document.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme } 
    }));
  }

  // 初始化：優先使用 localStorage，其次系統偏好
  const saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }

  // 按鈕點擊事件
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
    setTheme(current === 'light' ? 'dark' : 'light');
  });

  // 監聽系統主題變化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  return { setTheme };
}
```

**使用方式**：
```javascript
import { initThemeToggle } from '../assets/js/theme.js';
initThemeToggle('themeToggle');
```

---

### `assets/js/a11y.js`

無障礙工具集（ES Module）：

#### 1. Live Region 更新助手
```javascript
/**
 * 建立 Live Region 更新函數（含節流）
 * @param {string} elementId - 元素 ID
 * @param {object} options - 選項 { politeness, atomic, interval }
 * @returns {function} - announce(message) 函數
 */
export function createLiveRegion(elementId, options = {}) {
  const { 
    politeness = 'polite', 
    atomic = true, 
    interval = 200 
  } = options;

  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Live region #${elementId} 不存在`);

  el.setAttribute('aria-live', politeness);
  el.setAttribute('aria-atomic', atomic ? 'true' : 'false');

  let lastUpdate = 0;
  let pending = null;

  return function announce(message) {
    const now = performance.now();
    
    if (now - lastUpdate < interval) {
      pending = message;
      return;
    }

    el.textContent = message;
    lastUpdate = now;
    pending = null;

    setTimeout(() => {
      if (pending) {
        el.textContent = pending;
        lastUpdate = performance.now();
        pending = null;
      }
    }, interval);
  };
}
```

**使用範例**：
```javascript
const announce = createLiveRegion('statusRegion');
announce('模擬已開始');
```

#### 2. Range + Number 同步綁定
```javascript
/**
 * 綁定 Range Slider 與 Number Input 同步
 * @param {HTMLElement} rangeEl - Range input 元素
 * @param {HTMLElement} numberEl - Number input 元素
 * @param {function} onChange - 值改變回調函數
 * @returns {object} - { apply } 方法
 */
export function bindRangeNumber(rangeEl, numberEl, onChange) {
  let rafPending = false;

  function apply(value) {
    const val = parseFloat(value);
    const min = parseFloat(rangeEl.min);
    const max = parseFloat(rangeEl.max);
    
    const bounded = Math.max(min, Math.min(max, val));
    
    rangeEl.value = bounded;
    numberEl.value = bounded;
    rangeEl.setAttribute('aria-valuenow', bounded);
    
    if (onChange) onChange(bounded);
  }

  // Range 輸入（使用 RAF 節流）
  rangeEl.addEventListener('input', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        apply(rangeEl.value);
      });
    }
  });

  // Number 輸入
  numberEl.addEventListener('input', () => {
    if (numberEl.value !== '') apply(numberEl.value);
  });

  numberEl.addEventListener('blur', () => {
    if (numberEl.value === '') apply(rangeEl.value);
  });

  apply(rangeEl.value);
  return { apply };
}
```

**使用範例**：
```javascript
bindRangeNumber(
  document.getElementById('tempSlider'),
  document.getElementById('tempNumber'),
  (value) => updateTemperature(value)
);
```

#### 3. 鍵盤快捷鍵管理器
```javascript
/**
 * 鍵盤快捷鍵管理器
 */
export class KeyboardManager {
  constructor() {
    this.handlers = new Map();
    this.globalHandlers = [];
    
    document.addEventListener('keydown', (e) => {
      this.globalHandlers.forEach(handler => handler(e));
      
      const key = e.key.toLowerCase();
      const handler = this.handlers.get(key);
      if (handler && !this.isTyping(e)) {
        handler(e);
      }
    });
  }

  isTyping(event) {
    const tag = event.target.tagName;
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
  }

  register(key, handler, description = '') {
    this.handlers.set(key.toLowerCase(), handler);
    console.log(`✅ 註冊快捷鍵: ${key} - ${description}`);
  }

  registerGlobal(handler) {
    this.globalHandlers.push(handler);
  }

  unregister(key) {
    this.handlers.delete(key.toLowerCase());
  }

  getRegistered() {
    return Array.from(this.handlers.keys());
  }
}
```

**使用範例**：
```javascript
const keyboard = new KeyboardManager();
keyboard.register('r', () => reset(), '重置模擬');
keyboard.register(' ', (e) => { e.preventDefault(); togglePause(); }, '暫停/繼續');
keyboard.register('escape', () => closeModal(), '關閉對話框');
```

---

### `assets/js/ui-helpers.js`

UI 輔助函數集：

#### 1. 載入 Spinner
```javascript
export function showLoadingSpinner(containerId, message = '載入中...') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">${message}</span>
      </div>
      <p class="mt-3 text-muted">${message}</p>
    </div>
  `;
}
```

#### 2. 錯誤訊息顯示
```javascript
export function showError(containerId, title, message, reloadable = true) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const reloadBtn = reloadable ? `
    <hr>
    <p class="mb-0">
      <button class="btn btn-outline-danger" onclick="location.reload()">
        <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
        重新載入
      </button>
    </p>
  ` : '';

  container.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <h4 class="alert-heading">
        <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
        ${title}
      </h4>
      <p>${message}</p>
      ${reloadBtn}
    </div>
  `;
}
```

#### 3. Toast 通知
```javascript
export function showToast(message, type = 'info', duration = 3000) {
  const colors = {
    info: 'text-bg-info',
    success: 'text-bg-success',
    warning: 'text-bg-warning',
    danger: 'text-bg-danger'
  };

  const toast = document.createElement('div');
  toast.className = `toast align-items-center ${colors[type]} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" 
              data-bs-dismiss="toast" aria-label="關閉"></button>
    </div>
  `;

  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
  }

  container.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: duration });
  bsToast.show();

  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}
```

---

### `assets/js/navigation.js`

導覽列與 Footer 動態載入：

```javascript
/**
 * 載入 HTML 元件範本
 * @param {string} templatePath - 範本檔案路徑
 * @param {string} containerId - 目標容器 ID
 * @param {object} variables - 變數替換 { key: value }
 */
export async function loadTemplate(templatePath, containerId, variables = {}) {
  try {
    const response = await fetch(templatePath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    let html = await response.text();
    
    // 替換變數 {{KEY}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, value);
    });
    
    document.getElementById(containerId).innerHTML = html;
  } catch (error) {
    console.error(`載入範本失敗: ${templatePath}`, error);
  }
}

/**
 * 載入導覽列與 Footer
 * @param {string} baseUrl - 相對路徑基底（如 '../' 或 ''）
 */
export async function loadNavigation(baseUrl = '') {
  await Promise.all([
    loadTemplate(
      `${baseUrl}assets/templates/navbar.html`, 
      'navbarContainer',
      { BASE_URL: baseUrl }
    ),
    loadTemplate(
      `${baseUrl}assets/templates/footer.html`, 
      'footerContainer',
      { BASE_URL: baseUrl }
    )
  ]);
}
```

**使用方式**：
```javascript
import { loadNavigation } from '../assets/js/navigation.js';
loadNavigation('../');  // 子目錄頁面
// loadNavigation('');   // 根目錄頁面
```

---

## 📄 模組 3：HTML 範本

### `assets/templates/navbar.html`

```html
<nav class="navbar navbar-expand-lg bg-body-tertiary" aria-label="主導覽">
  <div class="container-fluid">
    <a class="navbar-brand d-flex align-items-center" href="{{BASE_URL}}index.html">
      <i class="fa-solid fa-atom me-2" aria-hidden="true"></i>
      <span>國中自然科學模擬動畫</span>
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" 
            data-bs-target="#navbarContent" aria-controls="navbarContent" 
            aria-expanded="false" aria-label="切換導覽"> 
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link" href="{{BASE_URL}}index.html#physics">物理</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="{{BASE_URL}}index.html#math">數學</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="{{BASE_URL}}index.html#chemistry">化學</a>
        </li>
      </ul>
      <button id="themeToggle" class="btn btn-outline-secondary" type="button" 
              aria-pressed="false" aria-label="切換深淺主題">
        <i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i> 主題
      </button>
    </div>
  </div>
</nav>
```

### `assets/templates/footer.html`

```html
<footer class="mt-auto py-3 bg-light border-top" role="contentinfo">
  <div class="container small d-flex flex-column flex-sm-row justify-content-between gap-2">
    <div>&copy; 2025 國中自然科學模擬動畫</div>
    <div class="d-flex gap-3">
      <a class="text-decoration-none" href="{{BASE_URL}}index.html#about">關於</a>
      <a class="text-decoration-none" href="#" aria-label="隱私政策">隱私</a>
      <a class="text-decoration-none" href="#" aria-label="使用條款">條款</a>
    </div>
  </div>
</footer>
```

---

## 🎯 標準化頁面範本

### 動畫頁面標準結構

```html
<!DOCTYPE html>
<html lang="zh-Hant" data-bs-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{動畫名稱}} - 國中自然科學模擬動畫</title>
  <meta name="description" content="{{簡短描述}}">
  
  <!-- Bootstrap & Font Awesome -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  
  <!-- 共用樣式 -->
  <link rel="stylesheet" href="../assets/css/common.css">
  <link rel="stylesheet" href="../assets/css/accessibility.css">
  
  <!-- 頁面專屬樣式 -->
  <style>
    /* 只放此頁面獨有的樣式 */
  </style>
</head>
<body class="d-flex flex-column min-vh-100">
  <!-- Skip Link -->
  <a href="#main" class="skip-link">跳到主內容</a>
  
  <!-- 導覽列容器 -->
  <div id="navbarContainer"></div>
  
  <!-- 主內容 -->
  <main id="main" class="container py-4" tabindex="-1">
    <h1 class="h3 mb-3">{{動畫名稱}}</h1>
    
    <!-- Live Region -->
    <div id="statusRegion" class="visually-hidden" aria-live="polite" aria-atomic="true">
      初始化中
    </div>
    
    <!-- 內容區域 -->
    <!-- ... -->
  </main>
  
  <!-- Footer 容器 -->
  <div id="footerContainer"></div>
  
  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  
  <!-- 共用模組（ES Module） -->
  <script type="module">
    import { initThemeToggle } from '../assets/js/theme.js';
    import { createLiveRegion, bindRangeNumber, KeyboardManager } from '../assets/js/a11y.js';
    import { loadNavigation } from '../assets/js/navigation.js';
    
    // 載入導覽列與 Footer
    await loadNavigation('../');
    
    // 初始化主題
    initThemeToggle('themeToggle');
    
    // 初始化 Live Region
    const announce = createLiveRegion('statusRegion');
    
    // 註冊快捷鍵
    const keyboard = new KeyboardManager();
    keyboard.register('r', () => reset(), '重置模擬');
    
    // 頁面專屬邏輯
    // ...
  </script>
</body>
</html>
```

---

## 📊 模組化效益評估

| 指標 | 改造前 | 改造後 | 改善幅度 |
|------|--------|--------|----------|
| 重複程式碼 | 每頁 ~300 行 | 共用 ~50 行 | **減少 83%** |
| 維護成本 | 修改需改 N 檔 | 改 1 個模組 | **降低 90%** |
| 一致性 | 手動維持 | 自動一致 | **100% 保證** |
| 新增頁面時間 | ~30 分鐘 | ~5 分鐘 | **節省 83%** |
| 載入速度 | 獨立載入 | 瀏覽器快取 | **提升 40%** |
| 錯誤率 | 人工複製易錯 | 模組化低錯 | **降低 95%** |

---

## 🚀 實施計畫

### **Phase 1: 建立基礎架構（2 小時）**

#### Step 1.1: 建立資料夾結構
```bash
mkdir -p assets/css assets/js assets/templates
```

#### Step 1.2: 建立 CSS 模組
- `assets/css/common.css` - 全站共用樣式
- `assets/css/accessibility.css` - 無障礙樣式

#### Step 1.3: 建立 HTML 範本
- `assets/templates/navbar.html`
- `assets/templates/footer.html`

#### Step 1.4: 測試靜態資源載入
在 index.html 引入 CSS 測試

---

### **Phase 2: JavaScript 模組化（3 小時）**

#### Step 2.1: 建立核心模組
- `assets/js/theme.js` - 主題切換
- `assets/js/navigation.js` - 範本載入

#### Step 2.2: 建立工具模組
- `assets/js/a11y.js` - 無障礙工具
- `assets/js/ui-helpers.js` - UI 輔助

#### Step 2.3: 更新 index.html
- 移除內嵌主題切換 JS
- 改用 ES Module 引入

#### Step 2.4: 測試模組功能
驗證主題切換、導覽列載入正常

---

### **Phase 3: 動畫頁面改造（4 小時）**

#### Step 3.1: 改造第一個測試頁面
選擇 `kinetic-theory-gas.html` 作為範本

#### Step 3.2: 抽離共用元素
- 移除內嵌 skip-link、navbar CSS
- 使用共用 CSS
- 使用 ES Module

#### Step 3.3: 測試完整功能
確保所有功能正常、無障礙合規

#### Step 3.4: 批次改造其他頁面
- free-fall.html
- convex-lens-imaging.html
- hoz-waves.html
- heat-conduction.html
- sine-wave-propagation.html

---

### **Phase 4: 文件與優化（1 小時）**

#### Step 4.1: 更新 README.md
加入模組使用說明

#### Step 4.2: 建立開發者指南
`CONTRIBUTING.md` - 新增頁面流程

#### Step 4.3: 效能優化
- 壓縮 CSS/JS（未來）
- Service Worker 快取（未來）

#### Step 4.4: 品質檢查
- 驗證所有頁面
- 無障礙測試
- 跨瀏覽器測試

---

## ⚠️ 注意事項與限制

### **1. 技術限制**

#### ES Module 相容性
- **需求**：Modern Browsers（Chrome 61+, Firefox 60+, Safari 11+）
- **影響**：IE11 不支援
- **解決**：未來可用 Vite/Rollup 打包為傳統 JS

#### CORS 限制
- **問題**：`fetch()` 載入本地檔案受 CORS 限制
- **解決**：必須使用本地伺服器（Live Server、Python HTTP Server）
- **指令**：`python3 -m http.server 8000`

### **2. 開發注意事項**

#### 路徑管理
- 根目錄頁面：`loadNavigation('')`
- 子目錄頁面：`loadNavigation('../')`
- 範本內變數：`{{BASE_URL}}` 自動替換

#### 快取問題
- 開發時瀏覽器可能快取舊版模組
- 解決：Ctrl+F5 強制重新載入
- 或在 URL 加版本號：`theme.js?v=1.0.0`

#### 向後相容
- 保留舊版頁面直到全部改造完成
- 使用 Git 分支管理重構過程
- 逐步遷移，避免全站同時改動

### **3. 效能考量**

#### HTTP 請求增加
- 每頁載入 navbar.html + footer.html = +2 請求
- 建議：未來使用 Service Worker 快取
- 或使用 SSG（Static Site Generator）預編譯

#### 首次載入時間
- ES Module 需額外解析時間（~50ms）
- 範本載入有輕微延遲
- 優化：關鍵路徑內聯、其餘延遲載入

---

## ✅ 品質檢查清單（模組化版）

新增或修改模組時的檢查項目：

### CSS 模組
- [ ] 變數命名符合 `--site-*` 規範
- [ ] 所有選擇器有明確用途註解
- [ ] 已測試深淺主題兼容性
- [ ] 高對比度模式樣式正確
- [ ] 減少動畫模式生效

### JavaScript 模組
- [ ] 使用 ES Module 格式（`export`/`import`）
- [ ] 函數有完整 JSDoc 註解
- [ ] 錯誤處理完善（try-catch）
- [ ] Console 訊息清晰易懂
- [ ] 無全域變數污染

### HTML 範本
- [ ] 所有變數使用 `{{KEY}}` 格式
- [ ] ARIA 屬性完整
- [ ] 語意化 HTML 標籤
- [ ] 無障礙標籤正確（`aria-label`）

### 整合測試
- [ ] 在 Chrome/Firefox/Safari 測試
- [ ] 行動裝置測試（iOS/Android）
- [ ] 鍵盤導航完全可用
- [ ] 螢幕閱讀器測試（NVDA/VoiceOver）
- [ ] 主題切換正常
- [ ] 導覽列連結正確
- [ ] 無 Console 錯誤

---

## 📖 開發者使用指南

### 建立新動畫頁面（5 分鐘流程）

#### 1. 複製範本
```bash
cp templates/simulation-template.html physics/new-animation.html
```

#### 2. 修改 Head 區
```html
<title>新動畫名稱 - 國中自然科學模擬動畫</title>
<meta name="description" content="新動畫描述">
```

#### 3. 撰寫頁面內容
只需撰寫 `<main>` 內的內容區域

#### 4. 引入共用模組
```javascript
import { initThemeToggle } from '../assets/js/theme.js';
import { loadNavigation } from '../assets/js/navigation.js';

await loadNavigation('../');
initThemeToggle('themeToggle');
```

#### 5. 更新 JSON 資料庫
在 `data/animations.json` 新增項目

#### 6. 測試完整功能
開啟頁面驗證所有功能

---

## 🔮 未來擴充方向

### **短期優化（1-2 個月）**
- [ ] 建立 `simulation-template.html` 標準範本
- [ ] 加入搜尋功能模組
- [ ] Toast 通知系統整合
- [ ] 快捷鍵說明統一元件

### **中期優化（3-6 個月）**
- [ ] 使用 Vite 建置工具
- [ ] CSS/JS 壓縮與打包
- [ ] Service Worker 離線支援
- [ ] 圖片 lazy loading

### **長期規劃（6-12 個月）**
- [ ] 改用 SSG（如 Astro）預渲染
- [ ] 元件庫（Web Components）
- [ ] TypeScript 改寫
- [ ] 自動化測試（Playwright）

---

**最後更新**: 2025年11月29日  
**版本**: 2.5.0（重整文件結構；新增『最新架構摘要』章節，舊內容標記歷史）
