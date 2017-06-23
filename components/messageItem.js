var vMessageItem = Vue.extend({
	props: {
		host: {
			type: String,
			required: !0
		},
		message: {
			type: Object,
			required: !0
		},
		time: {
			type: String,
			required: !0
		},
		"delete": {
			required: !0
		}
	},
	methods: {
		transfer: function() {}
	},
	template: '<li id="{{message.MD5CODE}}" class="swipeout message-list-item" @click.stop="transfer"><div class="swipeout-content message-item-container"><img v-if="message.PICTURE_ID==undefined" class="message-item-img" src="assets/img/systemheader.png"/><img v-else class="message-item-img" :src="host+message.PICTURE_ID"/><div class="message-item-content"><p class="message-item-name">{{message.MES_TITLE}}</p><p class="message-item-simple-message">{{message.MES_CONTENT}}</p></div><span class="message-item-time">{{time}}</span></div><div class="swipeout-actions-right"><a class="swipeout-close bg-danger" @click.stop="delete(message)">删除</a></div></li>'
});