/**
 * 無障礙輔助模組 (複製原版)
 */
export function createLiveRegion(options = {}) {
	const { id = 'liveRegion', politeness = 'polite', throttle = 200 } = options;
	let liveRegion = document.getElementById(id);
	if (!liveRegion) {
		liveRegion = document.createElement('div');
		liveRegion.id = id; liveRegion.setAttribute('aria-live', politeness); liveRegion.setAttribute('aria-atomic','true'); liveRegion.className='visually-hidden';
		document.body.appendChild(liveRegion);
	}
	let last = 0; let pending=null; let timeoutId=null;
	function announce(message){
		const now=Date.now();
		if(now - last >= throttle){ liveRegion.textContent=message; last=now; pending=null; if(timeoutId){clearTimeout(timeoutId); timeoutId=null;} }
		else { pending=message; if(!timeoutId){ const delay= throttle - (now - last); timeoutId=setTimeout(()=>{ if(pending){ liveRegion.textContent=pending; last=Date.now(); pending=null;} timeoutId=null;}, delay);} }
	}
	function clear(){ liveRegion.textContent=''; if(timeoutId){ clearTimeout(timeoutId); timeoutId=null;} pending=null; }
	function destroy(){ clear(); if(liveRegion.parentNode){ liveRegion.parentNode.removeChild(liveRegion);} }
	return { announce, clear, destroy };
}

export function bindRangeNumber(options = {}) {
	const { rangeId, numberId, onChange, unit='', label='', liveRegion=null } = options;
	const rangeInput=document.getElementById(rangeId); const numberInput=document.getElementById(numberId);
	if(!rangeInput || !numberInput){ console.warn('Range or Number input not found'); return ()=>{}; }
	let rafId=null; let lastValue=rangeInput.value;
	function syncValue(newValue){ if(rafId) cancelAnimationFrame(rafId); rafId=requestAnimationFrame(()=>{ rangeInput.value=newValue; numberInput.value=newValue; if(onChange) onChange(parseFloat(newValue)); if(liveRegion && newValue!==lastValue){ const announcement = label? `${label}已變更為 ${newValue} ${unit}`.trim(): `${newValue} ${unit}`.trim(); liveRegion.announce(announcement); lastValue=newValue; } rafId=null; }); }
	function handleRange(e){ syncValue(e.target.value); }
	function handleNumber(e){ let value=parseFloat(e.target.value); const min=parseFloat(rangeInput.min); const max=parseFloat(rangeInput.max); if(isNaN(value)) value=min; else if(value<min) value=min; else if(value>max) value=max; e.target.value=value; syncValue(value.toString()); }
	rangeInput.addEventListener('input', handleRange); numberInput.addEventListener('change', handleNumber);
	return ()=>{ rangeInput.removeEventListener('input', handleRange); numberInput.removeEventListener('change', handleNumber); if(rafId) cancelAnimationFrame(rafId); };
}

export class KeyboardManager {
	constructor(){ this.shortcuts=new Map(); this.handleKeyDown=this.handleKeyDown.bind(this); document.addEventListener('keydown', this.handleKeyDown); }
	register(key, handler, options={}){ const { ctrl=false, alt=false, shift=false, description='' }=options; const combo=this._combo(key, ctrl, alt, shift); this.shortcuts.set(combo,{ handler, description, ctrl, alt, shift, key }); }
	unregister(key, options={}){ const { ctrl=false, alt=false, shift=false }=options; const combo=this._combo(key, ctrl, alt, shift); this.shortcuts.delete(combo); }
	_combo(key, ctrl, alt, shift){ const mods=[]; if(ctrl) mods.push('ctrl'); if(alt) mods.push('alt'); if(shift) mods.push('shift'); return mods.length? `${mods.join('+')}+${key.toLowerCase()}`: key.toLowerCase(); }
	handleKeyDown(e){ const combo=this._combo(e.key, e.ctrlKey, e.altKey, e.shiftKey); const shortcut=this.shortcuts.get(combo); if(shortcut){ const target=e.target; const isInput= target.tagName==='INPUT' || target.tagName==='TEXTAREA' || target.isContentEditable; if(!isInput || e.ctrlKey || e.altKey){ e.preventDefault(); shortcut.handler(e); } } }
	getShortcuts(){ return Array.from(this.shortcuts.entries()).map(([combo,data])=>({ combo, description:data.description })); }
	destroy(){ document.removeEventListener('keydown', this.handleKeyDown); this.shortcuts.clear(); }
}

export function createFocusTrap(container){ let previousFocus=null; const selector='a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
	function activate(){ previousFocus=document.activeElement; const focusables=container.querySelectorAll(selector); if(focusables.length) focusables[0].focus(); container.addEventListener('keydown', handleTab); }
	function deactivate(){ container.removeEventListener('keydown', handleTab); if(previousFocus && previousFocus.focus) previousFocus.focus(); }
	function handleTab(e){ if(e.key!=='Tab') return; const focusables=Array.from(container.querySelectorAll(selector)); const first=focusables[0]; const last=focusables[focusables.length-1]; if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); } }
	return { activate, deactivate };
}
