if (typeof init === 'undefined') {
	const init = function() {
		const injectElement = document.createElement('script');
		injectElement.src = chrome.runtime.getURL('injectableScript.js');
		document.body.appendChild(injectElement);
	}
	init();
}
