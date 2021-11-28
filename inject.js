/*
	vKontakte - Script
	(c) 2021 - FreeAngel 
	youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
	github : 
*/

tick_count = 0;
cur_url = "test";
following_page = 'https://vk.com/';

const _MAX_UNFOLLOW_TO_RELOAD = 40;

last_click = 0;
last_call = 0;
reload = 0;
enabled = 0;
no_buttons = false;
overlimit = false;
r_interval = 0;

first = true;
cur_unfollow = 0;

var config = {
	enable : 0,
	total : 0,
	max : 0,
	chance: 75,
	interval : 0,
	fastway : 0,
	unfollow_group : false
}

function get_random(lmin,lmax){
	var c = parseInt(lmin);
	c = c + Math.floor(Math.random() * lmax);
	if(c > lmax) { c = lmax; };
	return c;
}


var box_layout = null;

function unfollow_account(){

	// check link popup dialog following
	if(!box_layout){
		
		var div = document.querySelector("div#profile");
		if(!div){

			// let's go to profile page
			var as=document.querySelectorAll('a.left_row');
			if(!as){
				console.log("profile link not found !");
				tick_count = 0;
				r_interval = 10;
				return false;
			}
		
			tick_count = 0;
			r_interval = 5
			as[0].click();
			console.log("profile link clicked !");
			return false;
		
		}
		
		// cari popup
		box_layout = document.querySelector('div.box_layout');
		if(!box_layout){
			// popup tidak ketemu, mungkin belum di klik
			// cari tombol
			var as= document.querySelector('a[onclick^="return Profile.idolsBox("]');
			if(!as){
				console.log("following popup button not found");
				return false;
			}
			
			as.click();
			console.log("following popup button clicked !");
			tick_count = 0;
			r_interval = 5;
			return false;
		}
	}
	
	//<button class="flat_button button_small secondary" onclick="FansBox.unsubscribe(this, -196557776)">Berhenti ikuti</button>
	var btns = box_layout.querySelectorAll('button[onclick^="FansBox.unsubscribe("]');
	if((!btns) || (btns.length < 1)){
	 
	   tick_count = 0;
	   no_buttons = true;
	   console.log("No Unsubscribe found !");
	   return false;
	 }
	
	var sn = '';
	for(var i=0; i<btns.length; i++){
		sn = btns[i].getAttribute("signed");
		if (sn === "1"){ continue; }
		
		btns[i].setAttribute("signed","1");
		btns[i].scrollIntoView();
		console.log("unsubscribed !");
		
		btns[i].textContent = "Processed";
		btns[i].click();
		config.total++;
		cur_unfollow++;
		chrome.extension.sendMessage({action: 'inc'}, function(response){
				if(response.status == false)
					config.enable = 0;
		});	
		
		return true;
		
	}

	console.log("no button found !");
	no_buttons = true;
	return false;
}

var group_section = null;

function unfollow_group(){

	if(!group_section) {
		// check url
		if(cur_url.indexOf("/groups") == -1){
			// lets click left menu for group
			var as=document.querySelectorAll('a.left_row');
			var hr='';
			for(var i=0; i<as.length; i++){
				hr = as[i].getAttribute("href");
				if(hr.indexOf("/groups") != -1){
					tick_count = 0;
					as[i].click();
					return false;
				}
			}
			
			console.log("No Group Link found !")
			return false;
		}
		
		// sudah ada di halaman groups, cari group section
		group_section = document.querySelector('div#groups_list_groups');
		if(!group_section){
			tick_count = 0;
			console.log('div#groups_list_groups not found !');
			return false;
		}
		
	}
	
	var rows = group_section.querySelectorAll("div.group_list_row");
	if((!rows) || (rows.length < 1)){
		no_buttons = true;
		console.log("div.group_list_row not found !");
		return;
	}
	
	var sg = '';
	var dv = null;
	for (var i=0; i<rows.length; i++){
		sg = rows[i].getAttribute("signed");
		if (sg === "1") { continue; }
		rows[i].setAttribute("signed","1");
		
		rows[i].scrollIntoView();
		dv = rows[i].querySelector("div.ui_actions_menu_icons");
		if(!dv){
			console.log("div.ui_actions_menu_icons not found !");
			no_buttons = true;
			return false;
		}
		
		//simulateMouseOver(dv);
		var as = rows[i].querySelector('a[onclick^="return GroupsList.subscribe("]');
		if(as) {
			as.click();
			console.log("unfollowed !");
			config.total++;
			cur_unfollow++;
			chrome.extension.sendMessage({action: 'inc'}, function(response){
				if(response.status == false)
					config.enable = 0;
			});				
		} else {
			continue;
		}
		
		return false;
	}
	
	console.log("no buttons !");
	no_buttons = true;
}

function unfollow(){

	if (!config.unfollow_group) {
		return unfollow_account();
	} else {
		return unfollow_group();
	}
}
 
function show_info(){

	var info = document.getElementById("info_ex");
	if(!info) {
	
		info = document.createElement('div');
		info.style.cssText = "position: fixed; bottom: 0; width:100%; z-index: 9999999;background-color: #F5FACA; border-style: solid;  border-width: 1px; margins: 5px; paddingLeft: 10px; paddingRight: 10px;";
		info.innerHTML = "<center><h2 id='status_ex'>active</h2></center>";
		info.id = "info_ex";
		document.body.appendChild(info);
		console.log("info_ex created");
	}
}
	
function info(txt){

	var info = document.getElementById("status_ex");
	if(!info) { return; }
	info.textContent = "Unfollow : "+config.total+", "+txt;
}
	
function simulateMouseOver(myTarget) {
  var event = new MouseEvent('mouseover', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  var canceled = !myTarget.dispatchEvent(event);
  if (canceled) {
    //console.log("canceled");
  } else {
    //console.log("not canceled");
  }
}
	
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.action === "set") {
		config.enable = request.enable;
		config.total = request.total;
		config.max = request.max;
		config.chance = request.chance;
		config.interval = request.interval;
		config.fastway = request.fastway;
		config.unfollow_group = request.unfollow_group;
		tick_count = 0;
		if(!config.enable){
			var info = document.getElementById("info_ex");
			if(info) {
				console.log("removed");
				info.parentNode.removeChild(info);
			}
			config.total = 0;
			overlimit = false;
			first = true;
		}
	}
});
 
    chrome.extension.sendMessage({}, function(response) {
    
	   var readyStateCheckInterval = setInterval(function() {
	       if (document.readyState === "complete") {

			   
		   if(first){
				first = false;
				chrome.runtime.sendMessage({action: "get"}, function(response){
	
					config.enable = response.enable;
					config.total = response.total;
					config.max = response.max;
					config.chance = response.chance;
					config.interval = response.interval;
					config.fastway = response.fastway;
					config.unfollow_group = response.unfollow_group;
					
					r_interval = get_random(config.interval,config.chance); 
					console.log("got interval : "+r_interval);
				});
		   }
		   
		   cur_url = window.location.href;
           tick_count= tick_count+1; 

		   
		   if((config.enable == 1) && (cur_url.indexOf('vk.com') !== -1)){

		   		show_info();

  		   		if(cur_unfollow >= _MAX_UNFOLLOW_TO_RELOAD){ no_buttons = true; }
		   		if(config.total >= config.max){ 
			   			overlimit = true; 
//			   			info("Reached Total Limit : "+config.total); 
		   		}

				if (overlimit) {
				
					if((tick_count % 5) == 0){	info("Reached Total Limit : "+config.total); }
					return;
				}
			   
				if(no_buttons) {

					var no_button_wait = 15;
					if(config.fastway) { no_button_wait = 5; }
					if(tick_count > no_button_wait){
			
						console.log("No Button, Reload");
						tick_count = 0;
						window.location.href=cur_url;
					} else {
						var c = no_button_wait - tick_count;
						info("Waiting For "+c+" seconds to reload");
					}
				
					return;
				}
			   
			   	if(config.fastway) { 
				   r_interval = 1;
				   info("no delay");
				}
			   
				if (tick_count >= r_interval){
			    
					tick_count = 0;
					unfollow();
					r_interval = get_random(config.interval,config.chance); 
					//console.log("got interval : "+r_interval);
				
				} else {
					info("Waiting for : "+(r_interval - tick_count));
				}
				
		   } else {
			console.log('tick disable');
		   } 
		   
		   }
	}, 1000);
	
});

