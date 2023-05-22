try {
	// ON page change
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if(changeInfo.status == 'complete') {
			let url = tab.url;
			const expression = /https?:\/\/(?:www\.|(?!www))netflix.com\/watch\//gi;
			let regex = new RegExp(expression);
			if (typeof url !== 'undefined') {
				if (url.match(regex)) {
					chrome.scripting.executeScript({
						files: ['injectScript.js'],
						target: {tabId: tab.id}
					});
				}
			}
		}
	});
}
catch(e) {
	console.log(e);
}

function fetchFilter(path){
	fetch(path)
	.then((response) => response.json())
	.then((jdata) => {
	  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		  	chrome.tabs.sendMessage(tabs[0].id, {type:"FROM_BACKGROUND_CONTENT", data:jdata});
	  });
  });
}

chrome.runtime.onMessage.addListener(
	function(request, sender,  sendResponse) {
		if (request.type === "LOADMSG_FROM_CONTENT") {
			fetchFilter(request.PATH);
			sendResponse({result: "success"});
		}
	}
);
