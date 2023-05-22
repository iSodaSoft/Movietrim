

window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	if (event.source != window)
		return;

	if (event.data.type){
		if(event.data.type === "MSG_PAGE_LOAD") {
			console.log("Content script received message from page: " + event.data.PATH);
			chrome.runtime.sendMessage({type:"LOADMSG_FROM_CONTENT", PATH:event.data.PATH}, function(response) {
				if (response.result === 'success') {
					console.log("Load Message forwarded to background script");
				}
			});
		}
	}
	event.preventDefault()

});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type === "FROM_BACKGROUND_CONTENT") {
			if(request.data.length){
				console.log('trim data loaded. Data send to inject api');
				var data = { type: "MSG_INJECT", data: request.data};
				window.postMessage(data, "*");
				Toastify({
					text: "Güvenli seyir",
					duration: 5000,
					selector: document.querySelector("div.VideoContainer"),
				
				}).showToast();	
			}else{
				console.log('no trim data');
			}
		}
	}
);
