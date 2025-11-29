/** 主題切換模組 (複製原版) */
export function initThemeToggle(toggleButtonId='themeToggle', iconId='themeIcon') {
	const themeToggleBtn=document.getElementById(toggleButtonId);
	const themeIcon=document.getElementById(iconId);
	if(!themeToggleBtn || !themeIcon){ console.warn('Theme toggle elements not found'); return ()=>{}; }
	function setTheme(theme){ document.documentElement.setAttribute('data-bs-theme', theme); localStorage.setItem('theme', theme); updateIcon(theme); }
	function updateIcon(theme){ if(theme==='dark'){ themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); themeToggleBtn.setAttribute('aria-label','切換到淺色模式'); } else { themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon'); themeToggleBtn.setAttribute('aria-label','切換到深色模式'); } }
	function toggleTheme(){ const current=document.documentElement.getAttribute('data-bs-theme'); setTheme(current==='dark'?'light':'dark'); }
	const saved=localStorage.getItem('theme'); const prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches; setTheme(saved || (prefersDark?'dark':'light'));
	themeToggleBtn.addEventListener('click', toggleTheme);
	const mq=window.matchMedia('(prefers-color-scheme: dark)'); function handleChange(e){ if(!localStorage.getItem('theme')) setTheme(e.matches?'dark':'light'); }
	mq.addEventListener('change', handleChange);
	return ()=>{ themeToggleBtn.removeEventListener('click', toggleTheme); mq.removeEventListener('change', handleChange); };
}
export function getCurrentTheme(){ return document.documentElement.getAttribute('data-bs-theme') || 'light'; }
export function onThemeChange(callback){ const observer=new MutationObserver(muts=>{ muts.forEach(m=>{ if(m.attributeName==='data-bs-theme'){ callback(getCurrentTheme()); } }); }); observer.observe(document.documentElement,{ attributes:true, attributeFilter:['data-bs-theme']}); return ()=> observer.disconnect(); }
