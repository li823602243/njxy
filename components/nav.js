var vNav = Vue.extend({
	props:{
		isActive:{//是否选中
			type:Boolean,
			default:false
		}
	},
	template: '<div id="foot-bar">'+
	'<a href="yy-circle.html" class="no-transition">'+
	'<div id="foot-bar-content">'+
	'<img id="changecircle" src="assets/img/mainimg/logo.png"/></div>'+
	'</a>'+
	'<nav class="bar bar-tab">'+
	'<a class="tab-item  no-transition" href="#page-main">'+
	'<span class="icon icon-app"></span>'+
	'<span class="tab-label">应用</span>'+
	'</a>'+
	'<a class="tab-item no-transition" :class="{\'active\':isActive}" href="message-list.html" >'+
	'<span class="icon icon-message"></span>'+
	'<span class="tab-label">信息</span>'+
	'</a>'+
	'<a class="tab-item  no-transition" href="yy-circle.html">'+
	'<span></span>'+
	'<span class="tab-label"></span>'+
	'</a>'+
	'<a class="tab-item  no-transition" href="#page-roster">'+
	'<span class="icon icon-phone"></span>'+
	'<span class="tab-label">通讯录</span>'+
	'</a>'+
	'<a class="tab-item  no-transition" href="#mine-index" >'+
	'<span class="icon icon-me"></span>'+
	'<span class="tab-label">我的</span>'+
	'</a>'+
	'</nav>'+
	'</div>'
});
	vNavPublic = Vue.extend({
		template: '<div id="foot-bar"><a href="yy-public.html" class="no-transition"><div id="foot-bar-content"><img src="assets/img/bar/icon_yiyouquan.png"/></div></a><nav class="bar bar-tab"><a class="tab-item active no-transition" href="expertAnswer.html"><span><img class="nav-img" src="assets/img/main/message.png"/></span><span class="tab-label">咨询</span></a><a class="tab-item active no-transition" href="yy-public.html" ><span></span><span class="tab-label"></span></a><a class="tab-item active no-transition" href="#mine-index"><span><img class="nav-img"  src="assets/img/main/mine.png"/></span><span class="tab-label">我的</span></a></nav></div>'
	});