var interval;
var videoID;
var player;
initInterval = setInterval(() => {
	const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;
	const sessionID = videoPlayer.getAllPlayerSessionIds([0]);
	player = videoPlayer.getVideoPlayerBySessionId(sessionID);
	console.log('session ID: '+sessionID);
	if(sessionID.length){
		videoID = player.getMovieId()
	}
	if(videoID != undefined)
	{
		clearInterval(initInterval);
		vidinterval = setInterval(() => {
			var video = document.evaluate(`//*[@id="${videoID}"]/video`,document).iterateNext();
			console.log('Video ID: '+videoID); 
			if(video != null){
				clearInterval(vidinterval);
				var data = { type: "MSG_PAGE_LOAD", PATH:`http://www.movietrim.com/filters/tr/tr_${videoID}.json`};
				window.postMessage(data, "*");	
			}
	
		}, 1000);
	}
}, 1000);


document.body.addEventListener("mousedown", (e)=>{
	if(e.button == 1){
		var t = player.getCurrentTime();
		console.log(`current time  : ${t} (${(t/1000/60).toFixed(0)}:${((t/1000) % 60).toFixed(3)})`);
		e.preventDefault();
	}
})

function findNext(current , file, index){
	while(index < file.length){
		if(current > file[index][1]){
			index++;
		}else{
			return index;
		}
	}
	return 0;
}
function findPrior(current, file, index){
	while(index > 0){
		if((current < file[index -1][0])){
			index--;
		}else{
			return index;
		}
	}
	return 0;
}

window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	if (event.source != window)
		return;

	if (event.data.type && (event.data.type == "MSG_INJECT") && event.data.data.length) {
		console.log(event.data);
		let sFile = event.data.data;
		let start = Number(sFile[0][0]);
		let end =  Number(sFile[0][1]);
		let type =  sFile[0][2];
		let cur = 0;
		let ndx = 0;
		let oldndx = -1;
		let priorndx = 0;
		let mutestate;
		let filter = true;
		let fstate = false;
		let pt = 5000;
		var video = document.evaluate(`//*[@id="${videoID}"]/video`,document).iterateNext();

		document.addEventListener("keypress", function(e){
				switch(e.key){
					case 'a': ndx  = ndx - 1;
							  player.seek(sFile[priorndx][0] - pt);
							  break;
					case 'd': 	ndx  = ndx + 1;
								player.seek(sFile[ndx][0] - pt);				  				
								break;
					case 'w': filter = !filter; console.log('Filter :' + filter);break;
				}
				e.preventDefault;	
		});

		document.addEventListener("wheel", (evt) => {
			if(evt.shiftKey == true){
				sFile[ndx][0] = sFile[ndx][0] - (evt.deltaY / 10);
				start =  sFile[ndx][0];
				console.log('start = ' + start);	
			}else if(evt.altKey == true){
				sFile[ndx][1] = sFile[ndx][1] - (evt.deltaY / 10);
				end =  sFile[ndx][1];
				console.log('end = ' + end);	
			}else{
				var t = player.getCurrentTime() - evt.deltaY;
				player.seek(t);
				console.log(`current time  : ${t} (${(t/1000/60).toFixed(0)}:${((t/1000) % 60).toFixed(3)})`);	
			} 
		
		}, {passive : false});
		
		
		video.addEventListener('timeupdate', function(){
			cur = Math.ceil(video.currentTime * 1000);
			if(ndx != oldndx){
				if(ndx > 0){
					priorndx = ndx -1;
				}
				oldndx = ndx;
				fstate = false;
				video.muted =  mutestate;
				start = Number(sFile[ndx][0]);
				end =	Number(sFile[ndx][1]);
				type = sFile[ndx][2]; 
				console.log(`Next filter: index: ${ndx}, Start: ${start} (${(start/1000/60).toFixed(0)}:${((start/1000) % 60).toFixed(3)}), End: ${end}, Duration: ${end-start} ms, Type: ${type}`);
			};
			if(cur > end){
					ndx = findNext(cur, sFile, ndx);
			}else if(cur < sFile[priorndx][0]){
				ndx = findPrior(cur, sFile, ndx);
			}else if(cur >= start && cur < end && fstate == false){
				fstate = true;
				switch(type){
					case 'Seek':
						if(filter == true){
							player.seek(end);
							console.log(`seek => start: ${cur}, Duration:${(end-cur)} ms` );	
						}
						break;
					case 'Mute':
						if(filter == true){
							mutestate = video.muted;
							video.muted =  true;
							console.log(`mute => start: ${cur}, Duration:${(end-cur)} ms` );
							setTimeout(function(){
								video.muted =  mutestate;							
							},(end-cur))
						}
						break;

				}
				
			}

		});
		
		
	}
	event.preventDefault

});
