/** UI 輔助工具模組 (複製原版精簡) */
export function showLoadingSpinner({ message='載入中...', container=document.body, id='loadingSpinner'}={}){
	let spinner=document.getElementById(id); if(spinner) return ()=> spinner.remove();
	spinner=document.createElement('div'); spinner.id=id; spinner.className='position-fixed top-50 start-50 translate-middle text-center'; spinner.style.zIndex='9999';
	spinner.innerHTML=`<div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;"><span class="visually-hidden">${message}</span></div><p class="mt-2 fw-bold">${message}</p>`; container.appendChild(spinner);
	return ()=>{ if(spinner.parentNode) spinner.remove(); };
}
export function showError({ message='發生錯誤', title='錯誤', container=document.body, duration=5000, id='errorAlert'}={}){
	const old=document.getElementById(id); if(old) old.remove();
	const alert=document.createElement('div'); alert.id=id; alert.className='alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x m-3'; alert.style.zIndex='9999'; alert.style.maxWidth='500px'; alert.setAttribute('role','alert');
	alert.innerHTML=`<strong>${title}</strong> ${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="關閉"></button>`; container.appendChild(alert);
	let timeoutId=null; if(duration>0){ timeoutId=setTimeout(()=>{ if(alert.parentNode) alert.remove(); }, duration); }
	return ()=>{ if(timeoutId) clearTimeout(timeoutId); if(alert.parentNode) alert.remove(); };
}
export function showToast({ message='', type='info', duration=3000, position='top-end'}={}){
	const containerId=`toast-container-${position}`; let toastContainer=document.getElementById(containerId);
	if(!toastContainer){ toastContainer=document.createElement('div'); toastContainer.id=containerId; toastContainer.className=`toast-container position-fixed p-3 ${position}`; toastContainer.style.zIndex='9999'; document.body.appendChild(toastContainer); }
	const typeClasses={ success:'bg-success text-white', info:'bg-info text-white', warning:'bg-warning text-dark', danger:'bg-danger text-white' };
	const typeIcons={ success:'fa-check-circle', info:'fa-info-circle', warning:'fa-exclamation-triangle', danger:'fa-times-circle' };
	const toast=document.createElement('div'); toast.className=`toast ${typeClasses[type]||typeClasses.info}`; toast.setAttribute('role','alert'); toast.setAttribute('aria-live','assertive'); toast.setAttribute('aria-atomic','true');
	toast.innerHTML=`<div class="d-flex align-items-center p-2"><i class="fas ${typeIcons[type]||typeIcons.info} me-2"></i><div class="toast-body flex-grow-1">${message}</div><button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="toast" aria-label="關閉"></button></div>`; toastContainer.appendChild(toast);
	const bsToast=new bootstrap.Toast(toast,{ autohide:true, delay:duration }); bsToast.show(); toast.addEventListener('hidden.bs.toast', ()=> toast.remove()); return ()=> bsToast.hide();
}
export function showConfirm({ title='確認', message='', confirmText='確認', cancelText='取消', confirmClass='btn-primary'}={}){
	return new Promise(resolve=>{ const modal=document.createElement('div'); modal.className='modal fade'; modal.tabIndex=-1; modal.setAttribute('aria-modal','true'); modal.setAttribute('role','dialog');
		modal.innerHTML=`<div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">${title}</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="關閉"></button></div><div class="modal-body">${message}</div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button><button type="button" class="btn ${confirmClass}" id="confirmBtn">${confirmText}</button></div></div></div>`;
		document.body.appendChild(modal); const bsModal=new bootstrap.Modal(modal); const confirmBtn=modal.querySelector('#confirmBtn'); confirmBtn.addEventListener('click',()=>{ bsModal.hide(); resolve(true); }); modal.addEventListener('hidden.bs.modal',()=>{ modal.remove(); resolve(false); }); bsModal.show(); });
}
export function showProgressBar({ progress=0, label='', container=document.body, id='progressBar'}={}){
	let barWrap=document.getElementById(id); if(!barWrap){ barWrap=document.createElement('div'); barWrap.id=id; barWrap.className='position-fixed top-0 start-0 w-100'; barWrap.style.zIndex='9999'; barWrap.innerHTML=`<div class="progress" style="height:4px;border-radius:0;"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" style="width:${progress}%"></div></div>${label?`<p class="text-center mt-2 fw-bold">${label}</p>`:''}`; container.appendChild(barWrap);} const bar=barWrap.querySelector('.progress-bar');
	function update(p, newLabel){ if(bar){ bar.style.width=`${p}%`; bar.setAttribute('aria-valuenow', p); if(p>=100){ setTimeout(()=>{ if(barWrap.parentNode) barWrap.remove(); },500);} } if(newLabel!==undefined){ const lbl=barWrap.querySelector('p'); if(lbl) lbl.textContent=newLabel; } }
	update(progress, label); return update;
}
