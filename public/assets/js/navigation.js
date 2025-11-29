/**
 * 導覽模組
 * 功能：載入 HTML 模板（navbar, footer）並替換變數
 * 版本：1.0.0
 * @module navigation
 */

export async function loadTemplate(templatePath, variables = {}) {
	try {
		const response = await fetch(templatePath);
		if (!response.ok) {
			throw new Error(`Failed to load template: ${templatePath}`);
		}
		let html = await response.text();
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
		const [navbarHtml, footerHtml] = await Promise.all([
			loadTemplate(navbarPath, variables),
			loadTemplate(footerPath, variables)
		]);

		const navbarContainer = document.getElementById(navbarContainerId);
		const footerContainer = document.getElementById(footerContainerId);

		if (navbarContainer && navbarHtml) {
			navbarContainer.innerHTML = navbarHtml;
		}
		if (footerContainer && footerHtml) {
			footerContainer.innerHTML = footerHtml;
		}

		if (typeof bootstrap !== 'undefined' && navbarHtml) {
			const dropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]');
			dropdowns.forEach(dropdown => { new bootstrap.Dropdown(dropdown); });
		}
	} catch (error) {
		console.error('Navigation loading error:', error);
	}
}

export function setActiveNavItem(currentPath) {
	const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .dropdown-item');
	navLinks.forEach(link => {
		const href = link.getAttribute('href');
		if (href && currentPath.includes(href)) {
			link.classList.add('active');
			link.setAttribute('aria-current', 'page');
			const dropdown = link.closest('.dropdown');
			if (dropdown) {
				const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
				if (dropdownToggle) dropdownToggle.classList.add('active');
			}
		}
	});
}

export function smoothScrollTo(targetId, offset = 0) {
	const target = document.getElementById(targetId);
	if (target) {
		const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
		const offsetPosition = elementPosition - offset;
		window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
	}
}
