/**
 *组件：标题栏
 *说明：app头部标题栏
 *创建/修改：左武洲
 *时间：2016/5/31 9:05
 */

var vBar = Vue.extend({
	props:{
		//标题栏标题
		title:{
			type:String,
			required:true
		},
		//是否包含选项卡
		istab:{
			type:Boolean,
			default:false
		},
		//选项卡1标题
		tab1title:{
			type:String,
			default:"tab1"
		},
		//选项卡2标题
		tab2title:{
			type:String,
			default:"tab2"
		}
	},
    template: '<header class="bar bar-nav vBar-header page-top-bar">' +
    	'<div class="clearfix">'+
    	'<slot name="left"></slot>'+
        '<h1 id="call-h1" class="title">{{title}}</h1>' +
        '<slot name="right"></slot>'+
        '</div>'+
        '<template v-if="istab">'+
			'<div class="com-tab clearfix">'+
				'<a href="#tab1" id="tab1Btn" class="tab-link active">{{tab1title}}</a>'+
				'<a href="#tab2" id="tab2Btn" class="tab-link">{{tab2title}}</a>'+
	 		'</div>'+
		'</template>'+
        '</header>'
});

var vBar1=Vue.extend({
		props:{
		//标题栏标题
		title:{
			type:String,
			required:true
		},
		//是否包含选项卡
		istab:{
			type:Boolean,
			default:false
		},
		tab1title:{
		type:String,
		default:"time"
		}
		
	},
    template: '<header class="bar bar-nav vBar-header page-top-bar">' +
    	'<div class="clearfix">'+
    	'<slot name="left"></slot>'+
        '<h1 id="call-h1" class="title">{{title}}</h1>' +
        '<slot name="right"></slot>'+
        '</div>'+
        '<template v-if="istab">'+
			'<div class="com-tab clearfix">'+
				'<h5  id="menotitle" class="">{{tab1title}}</h5>'+
	 		'</div>'+
		'</template>'+		
        '</header>'
})
