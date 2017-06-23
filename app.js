/**
 *页面：公共方法
 *事件：监听卓手机返回按钮
 *创建/修改：李路丹
 *时间：2016/7/13 9:02
 */

document.addEventListener("plusready", onPlusReady, false);
function onPlusReady() {
	//判断应用退出
	var BACKBTN_FIRST = null;
	//网络状态
	var NET_STATUS;
	//应用前后台切换计时器
	var PASUE_TIMER = null;
	//监听返回按钮
	plus.key.addEventListener('backbutton', function() {
		var currentPageId = document.querySelector('.page-current').getAttribute('id');
		console.log(currentPageId);
		if(currentPageId != "page-barcoderesult" && currentPageId != "yy-circle" && currentPageId != "circles-index" && currentPageId != "login-index" && currentPageId != "page-main" && currentPageId != "page-message" && currentPageId != "page-roster" && currentPageId != "mine-index") {
			$.router.back();
		} else {
			if(currentPageId = "page-barcoderesult") {

			} else {
				//2秒内连按2次退出应用
				if(BACKBTN_FIRST == null) {
					BACKBTN_FIRST = 1;
					plus.nativeUI.toast('再按一次退出应用');
					setTimeout(function() {
						BACKBTN_FIRST = null;
					}, 2000);
				} else {
					//退出应用
					plus.runtime.quit();
				}
			}
		}
	}, false);
	//网络变化
	document.addEventListener('netchange', function() {
		var network = plus.networkinfo.getCurrentType();
		if(network < 2) {
			if(NET_STATUS > 1) {
				plus.nativeUI.toast('您的网络已断开');
			}
		}
		if(NET_STATUS == 3 && network > 3) {
			plus.nativeUI.toast('无线网已断开，浏览会产生流量');
		}
		NET_STATUS = network;
	});

	//应用切到后台1分钟后关闭应用
	document.addEventListener("pause", function() {
		PASUE_TIMER = setTimeout(function() {
			plus.runtime.quit();
		}, 300000);
	}, false);

	//1分钟内从后台切回前台 取消定时器
	document.addEventListener("resume", function() {
		if(PASUE_TIMER != null) {
			clearTimeout(PASUE_TIMER);
		}
	}, false);

	//点击推送消息事件
	plus.push.addEventListener('click', function(msg) {
		var data = JSON.parse(msg).payload;
		//聊天消息
		if(data.type === 'chat') {
			$.router.loadPage({
				url: 'chat-panel.html?name=' + data.name,
				noAnimation: true,
				replace: false
			});
		}
	}, false);
	//nginx服务器地址
	var url = njyy_config_host;
	//var NGINX_PATH="http://58.213.75.39/uploadFiles/uploadImgs/";
	var NGINX_PATH = njyy_config_picture;
	//文件下载路径
	var FILE_PATH = '_downloads/doc/';
	//服务器文件下载路径
	var SERVER_DOWNLOAD_PATH = njyy_config_host + "/client/file/downLoad";
	//用户头像上传路径
	var USERIMAGE_UPLOAD_PATH = njyy_config_host + "/client/pictures/save";

	//当前用户
	CURRENT_USER = {};
	//手势密码行列数
	var CHOOSE_TYPE = 3;
	//手势设置
	GESTURE_SETTING = {};
	//加载手势配置
	if(plus.storage.getItem('GESTURE_SETTING') != null) {
		GESTURE_SETTING = JSON.parse(plus.storage.getItem('GESTURE_SETTING'));
	}
	//document jQuery对象
	var $DOCUMENT = $(document);
	//轮询间隔时间
	var INTERVAL_TIME = 100000;
	//消息定时器
	var MESSAGE_TIMER = null;
	//采用严格模式
	'use strict';
	$(function() {
		/**
		 *页面：集团介绍
		 *事件：页面加载
		 *创建/修改：左武洲
		 *时间：2016/5/31 9:02
		 */
		$DOCUMENT.on('pageInit', '#circles-introduction', function(e, id, page) {
			new Vue({
				el: '#circles-introduction',
				components: {
					'v-bar': vBar
				}
			});
		});

		/**
		 *页面：首页
		 *事件：页面加载
		 *创建/修改：左武洲
		 *时间：2016/5/31 9:02
		 */
		$DOCUMENT.on('pageInit', '#page-main', function(e, id, page) {	
			var roleId = CURRENT_USER.ROLE;
			var name = CURRENT_USER.NAME;
			if(roleId == 1) {
				greeting = true;
			} else {
				greeting = false;
			}
			new Vue({
				el: '#page-main',
				data: {
					greeting: greeting,
					loginName: name
				},
				components: {
					'v-bar': vBar,
					'v-nav': vNav
				}
			});

		});
		//扫一扫
		$DOCUMENT.on('pageInit', '#page-barcode', function(e, id, page) {
			plus.key.addEventListener('backbutton', function() {
				scan.close();
			})
			var userid = CURRENT_USER.USER_ID; //用户id
			var username = CURRENT_USER.NAME; //用户名字
			var scan = null;
			new Vue({
				el: '#page-barcode',
				data: {

				},
				components: {
					'v-bar': vBar
				}
			});

			$DOCUMENT.on('click', '#barcodeback', function() {
				scan.close();
			});
			scan = new plus.barcode.Barcode('bcid');
			scan.start();
			scan.onmarked = onmarked;

			// 二维码扫描成功
			function onmarked(type, result, file) {
				switch(type) {
					case plus.barcode.QR:
						type = 'QR';
						break;
					case plus.barcode.EAN13:
						type = 'EAN13';
						break;
					case plus.barcode.EAN8:
						type = 'EAN8';
						break;
					default:
						type = '其它' + type;
						break;
				}
				result = result.replace(/\n/g, '');
				njyy_data.barCode(userid, username, result, function(data) {
					if(data.SystemCode == "1") {
						$.router.loadPage({
							url: "barcoderesult.html",
							noAnimation: true,
							replace: false
						});
					}
					if(data.SystemCode == "20009") {
						scan.close();
						plus.nativeUI.toast("已签到");
						$.router.back();
					} else if(data.SystemCode == "0") {
						scan.close();
						plus.nativeUI.toast("操作失败");
						$.router.back();
					} else if(data.SystemCode == "20008") {
						scan.close();
						plus.nativeUI.toast("该活动不在签到状态");
						$.router.back();
					}

				});
				scan.close();
			}

		});
		$DOCUMENT.on('pageInit', '#page-barcoderesult', function(e, id, page) {
			plus.key.addEventListener('backbutton', function() {
				$.router.loadPage({
					url: "#page-main",
					noAnimation: true,
					replace: false
				});
			})
			new Vue({
				el: '#page-barcoderesult',
				data: {

				},
				components: {
					'v-bar': vBar
				}
			});

		});
		/**
		 *页面：校园风光
		 *事件：页面加载
		 *创建/修改：刘有
		 *时间：2016/6/14 11:03
		 */
		$DOCUMENT.on("pageInit", "#yy-surroundings", function(e, pageId, page) {
			var vm = new Vue({
				el: '#yy-surroundings',
				components: {
					'v-bar': vBar
				}
			});
		});
		/*
		 *页面：社会版主界面
		 *事件：页面加载
		 *创建/修改：刘有
		 *时间：2016/6/14 11:04
		 */
		$DOCUMENT.on('pageInit', '#circles-index', function(e, id, page) {
			targetUrlTag = "school";
			var code;
			var currentLength = 0; //当前记录条数
			var loading = false;
			var nextUrl = 10001;
			var nextUrl1 = 10001;
			var vm = new Vue({
				el: '#circles-index',
				data: {
					items: [],
					items1: []
				},
				methods: {
					href: function(item) {
						var pp = item.ACT_ID;
						$.router.loadPage({
							url: "activity-detail.html?actId=" + pp,
							noAnimation: true,
							replace: false
						});
					}
				},
				components: {
					'v-bar': vBar,
					'v-nav': vNavPublic
				}
			});
			getSchoolCircles(); //校园
			getActivityLists(); //活动

			$('#tab1').bind('refresh', '.pull-to-refresh-content', function(e) {
				getSchoolCircles(true);
			});
			$('#tab2').bind('refresh', '.pull-to-refresh-content', function(e) {
				getActivityLists(true);
			});

			/*校园圈上拉加载*/
			$('#circles-index').on('infinite', '#tab1', function() {
				// 如果正在加载，则退出
				if(loading) {
					return;
				}
				// 设置flag
				loading = true;
				if(nextUrl == 10001) {
					loading = false;
					$('#circles-index .infinite-scroll-preloader').html("已经到底了...");
				} else {
					$('#circles-index .infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getSchool(function(data) {
						if(data.SystemCode == 1) {
							nextUrl = data.nextUrl;
							vm.items = vm.items.concat(data.messageList);
						} else if(data.SystemCode > 1) {
							plus.nativeUI.toast("请求出错");
						}
						loading = false;
					}, nextUrl);

				}
			});
			/*活动圈上拉加载*/
			$('#circles-index').on('infinite', '#tab2', function() {
				// 如果正在加载，则退出
				if(loading) {
					return;
				}
				// 设置flag
				loading = true;
				if(nextUrl1 == 10001) {
					loading = false;
					$('#circles-index .infinite-scroll-preloader').html("已经到底了...");
				} else {
					$('#circles-index .infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getActivity(function(data) {
						if(data.SystemCode == 1) {
							nextUrl1 = data.nextUrl;
							vm.items1 = vm.items1.concat(data.actList);
						} else {
							plus.nativeUI.toast("请求出错");
						}
						loading = false;
					}, nextUrl1);
				}
			});

			/*
			 *初始化校园区数据,刷新
			 * */
			//1.校园圈数据
			function getSchoolCircles(isRefresh) {
				isRefresh = isRefresh || false;
				njyy_data.getSchool(function(data) {
					vm.items="";
					if(data.SystemCode == 1) {
						nextUrl = data.nextUrl;
						vm.items = data.messageList;
						$('#circles-index .infinite-scroll-preloader').html('');
						if(isRefresh) {
							$.pullToRefreshDone('#circles-index .pull-to-refresh-content');
						}
					} else {
						plus.nativeUI.toast("请求出错");
					}
				});
			}
			//初始化活动数据,下拉刷新
			function getActivityLists(isRefresh) {
				isRefresh = isRefresh || false;
				njyy_data.getActivity(function(data) {
					if(data.SystemCode == 1) {
						nextUrl1 = data.nextUrl;
						vm.items1 = data.actList;
						$('#circles-index .infinite-scroll-preloader').html('');
						if(isRefresh) {
							$.pullToRefreshDone('#circles-index .pull-to-refresh-content');
						}
					} else {
						plus.nativeUI.toast("请求出错");
					}
				});
			}
			//点击报名跳转详情界面
			$DOCUMENT.on('click', '.activity-btn-apply', function() {
				var pp = $(this).attr("id"); //获取查询到的id值
				//alert(pp);
				$.router.loadPage({
					url: "activity-detail.html?actId=" + pp,
					noAnimation: true,
					replace: false
				});
			});
		});
		/**
		 *页面：社会版活动详情界面
		 *事件：页面加载
		 *创建/修改：刘有
		 *时间：2016/6/14 11：42
		 */
		$DOCUMENT.on("pageInit", "#active-detail", function(e, pageId, $page) {
			var url = location.search;
			var Request = new Object();
			if(url.indexOf("?") != -1) {
				var str = url.substr(1)　 //去掉?号
				var strs = str.split("&");
				for(var i = 0; i < strs.length; i++) {　
					Request[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
				}
			}
			var id = Request["actId"]; //获取活动Id
			var data = {};
			var example = new Vue({
				el: '#active-detail',
				data: {
					items: data,
				},
				methods: {
					activityApply: function() {
						var id1 = 1;
						$.ajax({
							type: "post",
							url: "http://58.213.75.39:8092/NJYY/client/activity/add",
							data: {
								'id1': id1,
								'ACT_ID': id
							},
							error: function() {
								plus.nativeUI.toast("请求出错");
							},
							success: function(data) {
								plus.nativeUI.toast("报名成功");
								$.router.loadPage({
									url: "yy-public.html",
									noAnimation: true,
									replace: false
								});

							}
						});
					}
				},
				components: {
					'v-bar': vBar,
					'v-nav': vNav
				}

			})
			njyy_data.getActivityListDetail(id, function(data) {
				example.items = data;
			});

			//点击报名
			$DOCUMENT.on('click', '#activity-detail-apply', function() {
				var id1 = 1;
				$.ajax({
					type: "GET",
					url: url + "/client/activity/add",
					data: {
						'id1': id1,
						'ACT_ID': id
					},
					error: function() {
						plus.nativeUI.toast("请求出错");
					},
					success: function(data) {
						plus.nativeUI.toast("报名成功");
						$.router.loadPage({
							url: "yy-public.html",
							noAnimation: true,
							replace: false
						});

					}
				});
			});

		});
		/**
		 *页面：校园版一幼圈
		 *事件：页面加载
		 *创建/修改：刘有
		 *时间：2016/6/14 11:03
		 */
		$DOCUMENT.on("pageInit", "#yy-circle", function(e, pageId, page) {
			//班级id
			var classId;
			if(CURRENT_USER.ROLE == 1) {
				//教师
				classId = CURRENT_USER.CLASS_ID;
			} else {
				//家长
				classId = CURRENT_USER.CHILDREN.CLASS_ID;
			}
			var records;
			var schoolLoading = false;
			var classLoading = false;
			var schoolNextUrl = 10001;
			var classNextUrl = 10001;
			var indexNum;
			var flag = 0;
			var vm = new Vue({
				el: '#yy-circle',
				data: {
					IS_CHARGE: CURRENT_USER.IS_CHARGE,
					schoolCircleList: [], //校园圈数据
					classCircleList: [], //班级圈数据
					nginx: NGINX_PATH,
					currentCircleIndex: 0,
					activeNameComment: '',
					userName: CURRENT_USER.NAME,
					activeName: '',
					activeNameClass: '',
					ROLE: CURRENT_USER.ROLE

				},
				components: {
					'v-bar': vBar,
					'v-nav': vNav
				},
				methods: {
					//点赞
					pushCircle: function(circleId, index) {
						njyy_data.pushCircle(CURRENT_USER.USER_ID, circleId, function(data) {
							if(data.NUMBERS == 1) {
								plus.nativeUI.toast("点赞成功");
								$("#like" + index).attr("src", "assets/img/circles/btn_heart_pressed.png");
							} else if(data.NUMBERS == 0) {
								$("#like" + index).attr("src", "assets/img/circles/btn_heart_normal.png");
								plus.nativeUI.toast("取消点赞");
							}
						});
					},
					//评论弹窗
					contact: function(index) {
						vm.currentCircleIndex = index;
						$(".custom-dialog").show();
						vm.nowShowComment = index
					},
					//获取评论列表
					checkContact: function(circleId, index) {
						indexNum = index
						if(this.activeNameComment == "") {
							this.activeNameComment = circleId;
						} else {
							this.activeNameComment = "";
						}
						njyy_data.getCommentList(circleId, function(data) {
							console.log(JSON.stringify(data))
							if(data.SystemCode == 1) {
								vm.classCircleList[index].commentsList = data.comList;
							} else {
								plus.nativeUI.toast('评论列表获取失败');
							}
						});
					},
					//返回图片地址数组
					getImagePath: function(path) {
						console.log(JSON.stringify(path))
						var arr = [];
						if(path.length > 0 && path.indexOf(',') > -1) {
							arr = path.split(',');
						} else {
							arr.push(path);
						}
						for(var i = 0; i < arr.length; i++) {
							if(arr[i] == "" || typeof(arr[i]) == "undefined") {
								arr.splice(i, 1);
								i = i - 1;

							}

						}
						return arr;

					},
					collect: function(circleId, content) {
						var url = "yy-circle-detail.html?id=" + circleId;
						content = content.length > 10 ? content.substring(0, 10) + "..." : content;
						njyy_data.addFavorite(CURRENT_USER.USER_ID, encodeURI(content), url, function(data) {
							if(data.SystemCode == 1) {
								plus.nativeUI.toast('收藏成功');
							} else {
								plus.nativeUI.toast('收藏失败');
							}
						});
					},
					isSelf: function(nameId) {
						return nameId !== CURRENT_USER.USER_ID ? {
							display: 'none'
						} : {};
					},
					//删除圈子
					deleteClassCircle: function(item) {
						plus.nativeUI.confirm("确定删除吗?", function(e) {
							if(e.index == 0) {
								njyy_data.DeleteClassCircle(item.CLA_ID, function() {
									vm.classCircleList.$remove(item);
								});
							}
						}, "删除", ["确定", "取消"]);
					},
					chooseMe: function(item) {
						if(this.activeName == "") {
							this.activeName = item.ANN_ID;
						} else {
							this.activeName = "";
						}

					},
					chooseClass: function(item) {
						if(this.activeNameClass == "") {
							this.activeNameClass = item.CLA_ID;
						} else {
							this.activeNameClass = "";
						}
					}
				}
			});
			vm.$nextTick(function() {
				if(utils.getQueryString('isRealse')) { //发布班级圈后显示班级圈
					$('#tab2Btn').trigger('click');
				}
			});
			getSchoolCircles(); //校园圈
			getClassCircles(); //班级圈
			//下拉刷新
			$('#yy-circle').on('refresh', '#tab1', function(e) {
				setTimeout(function() {
					getSchoolCircles(true);
				}, 2000);

			});
			$('#yy-circle').on('refresh', '#tab2', function(e) {
				setTimeout(function() {
					getClassCircles(true);
				}, 2000);
			});

			//缓存图片
			function loadImage() {
				//缓存并显示图片
				$('.yy-circle-item-image[src=""]').each(function() {
					var path = this.dataset.src;
					utils.fetchImage(path, this);
				});
			}
			/*校园圈上拉加载*/
			$('#yy-circle').on('infinite', '#tab1', function() {
				// 如果正在加载，则退出
				if(schoolLoading) {
					return;
				}
				// 设置flag
				schoolLoading = true;
				if(schoolNextUrl == 10001) {
					schoolLoading = false;
					$('#tab1 .infinite-scroll-preloader').html("已经到底了...");
				} else {
					$('tab1.infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getSchool(function(data) {
						if(data.SystemCode == 1) {
							schoolNextUrl = data.nextUrl;
							vm.schoolCircleList = vm.schoolCircleList.concat(data.messageList);
						} else if(data.SystemCode == 30001) {
							plus.nativeUI.toast("没有校园记录");
						} else {
							plus.nativeUI.toast("请求出错");
						}
						schoolLoading = false;
					}, schoolNextUrl);

				}
			});

			/*班级圈上拉加载*/
			$('#yy-circle').on('infinite', '#tab2', function() {
				// 如果正在加载，则退出
				if(classLoading) {
					return;
				}
				// 设置flag
				classLoading = true;
				if(classNextUrl == 10001) {
					classLoading = false;
					$('#tab2 .infinite-scroll-preloader').html("已经到底了...");
				} else {
					$('#tab2 .infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getClassCircleList(CURRENT_USER.USER_ID, classId, function(data) {
						if(data.SystemCode == 1) {
							classNextUrl = data.nextUrl;
							$.each(data.mesList, function(idx, obj) {
								obj.isPushed = false;
								obj.commentsList = [];
							});
							vm.classCircleList = vm.classCircleList.concat(data.mesList);
							vm.$nextTick(function() {
								loadImage();
							});
						} else if(data.SystemCode == 10001) {
							plus.nativeUI.toast("没有班级圈记录");
						} else {
							plus.nativeUI.toast("请求出错");
						}
						classLoading = false;
					}, classNextUrl);
				}
			});
			//校园圈数据下拉刷新
			function getSchoolCircles(isRefresh) {
				isRefresh = isRefresh || false;
				njyy_data.getSchool(function(data) {
					console.log(JSON.stringify(data))
					if(data.SystemCode == 1) {
						schoolNextUrl = data.nextUrl;
						vm.schoolCircleList = data.messageList;
						$('#circles-index .infinite-scroll-preloader').html('已经到底了...');
						if(isRefresh) {
							$.pullToRefreshDone('#yy-circle .pull-to-refresh-content');
						}
					} else if(data.SystemCode = 30001) {
						plus.nativeUI.toast("没有校园记录");
					} else {
						plus.nativeUI.toast("请求出错");
					}
				});
			}
			//班级圈数据下拉刷新
			function getClassCircles(isRefresh) {
				isRefresh = isRefresh || false;
				njyy_data.getClassCircleList(CURRENT_USER.USER_ID, classId, function(data) {
					if(data.SystemCode == 1) {
						classNextUrl = data.nextUrl;
						$.each(data.mesList, function(idx, obj) {
							obj.isPushed = false;
							obj.commentsList = [];
						});
						vm.classCircleList = data.mesList;
						vm.$nextTick(function() {
							loadImage();
						});
						$('#circles-index .infinite-scroll-preloader').html('已经到底了...');
						if(isRefresh) {
							$.pullToRefreshDone('#yy-circle .pull-to-refresh-content');
						}
					} else if(data.SystemCode == 10001) {
						records = 1;
					} else {
						plus.nativeUI.toast("请求出错");
					}
				});

			}
			//点击发表评论
			$(".ok").on('click', function() {
				var content = $("#comment-content").val();
				for(var i = 0; i < content.length; i++) {
					var hs = content.charCodeAt(i);
					if(0xd800 <= hs && hs <= 0xdbff) {
						if(content.length > 1) {
							var ls = content.charCodeAt(i + 1);
							var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
							if(0x1d000 <= uc && uc <= 0x1f77f) {
								plus.nativeUI.toast("不能输入emoji表情!");
								return;
							}
						}
					} else if(content.length > 1) {
						var ls = content.charCodeAt(i + 1);
						if(ls == 0x20e3) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						}
					} else {
						if(0x2100 <= hs && hs <= 0x27ff) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						} else if(0x2B05 <= hs && hs <= 0x2b07) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						} else if(0x2934 <= hs && hs <= 0x2935) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						} else if(0x3297 <= hs && hs <= 0x3299) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						} else if(hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030 ||
							hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b ||
							hs == 0x2b50) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						}
					}
				}
				if($.trim(content) == "") {
					plus.nativeUI.toast("评论内容不能为空!");
					return;
				}
				if(content == "") {
					plus.nativeUI.toast("评论内容不能为空!");
					return;
				}
				//圈子id
				var circleId = vm.classCircleList[vm.currentCircleIndex].CLA_ID;
				njyy_data.makeComment(CURRENT_USER.USER_ID, circleId, content, function(data) {
					if(data.SystemCode == 1) {
						plus.nativeUI.toast("评论成功");
						$("#comment-content").val("");
						$(".custom-dialog").hide();
						vm.classCircleList[vm.currentCircleIndex].COMNUM++; //评论数+1
						njyy_data.getCommentList(circleId, function(data) {
							if(data.SystemCode == 1) {
								vm.classCircleList[vm.nowShowComment].commentsList = data.comList;
							} else {
								plus.nativeUI.toast('评论列表获取失败');
							}
						});
					} else {
						plus.nativeUI.toast('评论失败');
					}
				});
			});
			//取消评论
			$("#dialog-button-cancel").on('click', function() {
				$("#comment-content").val("");
				$(".custom-dialog").hide();
			});
			//发布班级圈按钮显示
			var $pubCircleBtn = $('#pubCircleBtn');
			$('#yy-circle .com-tab').find('#tab1Btn').click(function() {
				$pubCircleBtn.hide();
			}).end().find('#tab2Btn').click(function() {
				if(records == 1) {
					plus.nativeUI.toast('班级圈记录');
				}
				$pubCircleBtn.show();
			});
		});

		/**
		 *页面：发布班级圈
		 *事件：页面加载
		 *创建/修改：刘有
		 *时间：2016/6/14 13:41
		 */
		$DOCUMENT.on("pageInit", "#publish-circle", function(e, pageId, $page) {
			var vm = new Vue({
				el: '#publish-circle',
				components: {
					'v-bar': vBar
				}
			});
			//添加图片
			var photosCount = 0;
			$("#addCirclePhotoBtn").click(function() {
				if(photosCount >= 9) {
					plus.nativeUI.toast('最多只能选取9张图片');
					return;
				}
				plus.nativeUI.actionSheet({
					cancel: "取消",
					buttons: [{
						title: "从相册选择"
					}, {
						title: "拍照"
					}]
				}, function(event) {
					if(event.index == 1) {
						plus.gallery.pick(function(e) {
							for(var i in e.files) {
								var path = e.files[i];
								plus.zip.compressImage({
									src: path,
									dst: "_downloads/camera/" + path.substring(path.lastIndexOf('/')),
									overwrite: true,
									quality: 20
								}, function(event) {
									if(photosCount < 9) {
										$("#addCirclePhotoBtn").before('<li><img id="public_cancel" class="icon-remove" src="assets/img/circles/cancel.png" /><img class="circle-photo-item" src="' +
											event.target +
											'" /></li>');
										photosCount++;
									}
								}, function() {
									plus.nativeUI.toast("操作失败");
								});
							}
						}, function() {
							plus.nativeUI.toast('取消选择图片');
						}, {
							filter: 'image',
							multiple: true,
							maximum: 9,
							system: false,
							onmaxed: function() {
								plus.nativeUI.toast('最多只能选取9张图片');
							}

						});
					} else if(event.index == 2) {
						if(photosCount >= 9) {
							plus.nativeUI.toast('最多只能选取9张图片');
							return;
						}
						utils.getCamera(function(path) {
							plus.zip.compressImage({
								src: path,
								dst: "_downloads/camera/" + path.substring(path.lastIndexOf('/')),
								overwrite: true,
								quality: 20
							}, function(event) {
								$("#addCirclePhotoBtn").before('<li><img id="public_cancel" class="icon-remove" src="assets/img/circles/cancel.png" /><img class="circle-photo-item" src="' +
									event.target +
									'" /></li>');
								photosCount++;
							}, function() {
								plus.nativeUI.closeWaiting();
								plus.nativeUI.toast("请求出错");
							});
						});
					}
				});
			});
			//删除图片
			$("#publishPhotoList").on('click', '.icon-remove', function() {
				$(this).parent().remove();
				photosCount--;
			});
			//发布班级圈
			$('#publishCircleBtn').on('click', function() {
				var content = $('#pubCircleContent').val();
				//上传图片地址
				var photos = [];
				//返回图片id
				var photosId = [];
				//返回图片地址
				var photosPath = [];
				$('.circle-photo-item').each(function() {
					photos.push($(this).attr('src'));
				});
				var i = 0,
					length = photos.length;
				//递归上传图片
				var loop = function(i, callBack) {
					if(i < length) {
						plus.nativeUI.showWaiting('上传中...');
						utils.uploadImage(CURRENT_USER.USER_ID, photos[i], function(data) {
							console.log(data);
							photosId.push(data.pictureId);
							photosPath.push(data.path);
							i++;
							loop(i, callBack);
						});
					} else {
						callBack();
					}
				};
				loop(i, function() {
					var classId;
					//班级id
					if(CURRENT_USER.ROLE == 1) {
						classId = CURRENT_USER.CLASS_ID;
					} else {
						classId = CURRENT_USER.CHILDREN.CLASS_ID;
					}
					//图片路径
					var paths = photosPath.length > 0 ? photosPath.toString() : "";
					//图片id
					var imgIds = photosId.length > 0 ? photosId.toString() : "";
					//上传班级圈
					//等待窗口

					if($.trim(content) == "" && paths == "") {
						plus.nativeUI.toast('发布内容不能为空');
						return;
					}
					if(content == "" && paths == "") {
						plus.nativeUI.toast('发布内容不能为空');
						return;
					}
					for(var i = 0; i < content.length; i++) {
						var hs = content.charCodeAt(i);
						if(0xd800 <= hs && hs <= 0xdbff) {
							if(content.length > 1) {
								var ls = content.charCodeAt(i + 1);
								var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
								if(0x1d000 <= uc && uc <= 0x1f77f) {
									plus.nativeUI.toast("不能输入emoji表情!");
									return;
								}
							}
						} else if(content.length > 1) {
							var ls = content.charCodeAt(i + 1);
							if(ls == 0x20e3) {
								plus.nativeUI.toast("不能输入emoji表情!");
								return;
							}
						} else {
							if(0x2100 <= hs && hs <= 0x27ff) {
								plus.nativeUI.toast("不能输入emoji表情!");
								return;
							} else if(0x2B05 <= hs && hs <= 0x2b07) {
								plus.nativeUI.toast("不能输入emoji表情!");
								return;
							} else if(0x2934 <= hs && hs <= 0x2935) {
								plus.nativeUI.toast("不能输入emoji表情!");
								return;
							} else if(0x3297 <= hs && hs <= 0x3299) {
								plus.nativeUI.toast("不能输入emoji表情!");
								return;
							} else if(hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030 ||
								hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b ||
								hs == 0x2b50) {
								plus.nativeUI.toast("不能输入emoji表情!");
								return;
							}
						}
					}
					njyy_data.addClassMessage(content, CURRENT_USER.USER_ID, classId, paths, imgIds, function(data) {
						plus.nativeUI.closeWaiting();
						if(data.SystemCode == 1) {
							plus.nativeUI.toast('发布成功');
							$.router.loadPage({
								url: "yy-circle.html?isRealse=true",
								noAnimation: true,
								replace: true
							});
						} else {
							plus.nativeUI.toast('发布失败,请稍后再试');
						}
					});
				});
			});
		});
		/**
		 *页面：公告查询界面
		 *事件：页面加载
		 *创建/修改：李路丹
		 *时间：2016/6/13 10：24
		 */
		$DOCUMENT.on("pageInit", "#notice", function(e, pageId, $page) {
			var TYPE = 1; //公告
			var nextUrl = 10001;
			var loading = false;
			var vm = new Vue({
				el: '#notice',
				data: {
					messageList: [],
					nginx: NGINX_PATH
				},
				methods: {
					getTimeTip: utils.getTimeTip,
					href: function(item) {
						var URL = item.URL;
						sessionStorage.setItem("URL", URL);
						$.router.loadPage({
							url: "notice-detail.html",
							noAnimation: true,
							replace: false
						});
					}
				},
				components: {
					'v-bar': vBar,
					'v-nav': vNav
				}
			});
			getNewsList();
			//下拉刷新
			$('#notice').on('refresh', '.pull-to-refresh-content', function(e) {
				setTimeout(function() {
					getNewsList(true);
				}, 2000);
			});

			//上拉加载
			$('#notice').on('infinite', '.infinite-scroll', function() {
				// 如果正在加载，则退出
				if(loading) return;
				loading = true;
				if(nextUrl == 10001) {
					loading = false;
					$('#notice .infinite-scroll-preloader').html('已经到底了...');
				} else {
					$('#notice .infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getNews(TYPE, function(data) {
						if(data.SystemCode == 1) {
							nextUrl = data.nextUrl;
							vm.messageList = vm.messageList.concat(data.actList);
						} else {
							plus.nativeUI.toast('请求出错');
						}
						loading = false;
					}, nextUrl);
				}
			});

			//初始化消息列表
			function getNewsList(isRefresh) {
				isRefresh = isRefresh || false;
				njyy_data.getNews(TYPE, function(data) {
					if(data.SystemCode == 1) {
						nextUrl = data.nextUrl;
						vm.messageList = data.actList;
						$('#news .infinite-scroll-preloader').html('');
						if(isRefresh) {
							$.pullToRefreshDone('#news .pull-to-refresh-content');
						}
					} else {
						plus.nativeUI.toast('请求出错');
					}
				});
			}
		});
		/**
		 *页面：新闻界面
		 *事件：页面加载
		 *创建/修改：李路丹
		 *时间：2017/4/18 10：24
		 */
		$DOCUMENT.on("pageInit", "#news", function(e, pageId, $page) {
			var TYPE = 2;
			var nextUrl = 10001;
			var loading = false;
			var vm = new Vue({
				el: '#news',
				data: {
					messageList: [],
					nginx: NGINX_PATH
				},
				methods: {
					getTimeTip: utils.getTimeTip,
					href: function(item) {
						var URL = item.URL;
						sessionStorage.setItem("URL", URL);
						$.router.loadPage({
							url: "news-detail.html",
							noAnimation: true,
							replace: false
						});
					}
				},
				components: {
					'v-bar': vBar,
					'v-nav': vNav
				}
			});
			getNewsList();
			//下拉刷新
			$('#news').on('refresh', '.pull-to-refresh-content', function(e) {
				setTimeout(function() {
					getNewsList(true);
				}, 2000);
			});

			//上拉加载
			$('#news').on('infinite', '.infinite-scroll', function() {
				// 如果正在加载，则退出
				if(loading) return;
				loading = true;
				if(nextUrl == 10001) {
					loading = false;
					$('#news .infinite-scroll-preloader').html('已经到底了...');
				} else {
					$('#news .infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getNews(TYPE, function(data) {
						if(data.SystemCode == 1) {
							nextUrl = data.nextUrl;
							vm.messageList = vm.messageList.concat(data.actList);
						} else {
							plus.nativeUI.toast('请求出错');
						}
						loading = false;
					}, nextUrl);
				}
			});

			//初始化消息列表
			function getNewsList(isRefresh) {
				isRefresh = isRefresh || false;
				njyy_data.getNews(TYPE, function(data) {
					if(data.SystemCode == 1) {
						nextUrl = data.nextUrl;
						vm.messageList = data.actList;
						$('#news .infinite-scroll-preloader').html('');
						if(isRefresh) {
							$.pullToRefreshDone('#news .pull-to-refresh-content');
						}
					} else {
						plus.nativeUI.toast('请求出错');
					}
				});
			}
		});
		/**
		 *页面：新闻详情页面
		 *事件：页面加载
		 *创建/修改：李路丹
		 *时间：2016/6/13 10：24
		 */
		$DOCUMENT.on("pageInit", "#news-detail", function(e, pageId, $page) {
			var URL = sessionStorage.getItem("URL");
			var example1 = new Vue({
				el: '#news-detail',
				data: {
					pp: []
				},
				methods: {
					getTimeTip: utils.getTimeTip
				},
				components: {
					'v-bar': vBar,
					'v-nav': vNav
				}
			})
			njyy_data.getNewsDetail(URL, function(data) {
				example1.pp = data.news;
			});

		});
		/**
		 *页面：新闻详情页面
		 *事件：页面加载
		 *创建/修改：李路丹
		 *时间：2016/6/13 10：24
		 */
		$DOCUMENT.on("pageInit", "#notice-detail", function(e, pageId, $page) {
			var URL = sessionStorage.getItem("URL");
			var example1 = new Vue({
				el: '#notice-detail',
				data: {
					pp: []
				},
				methods: {
					getTimeTip: utils.getTimeTip
				},
				components: {
					'v-bar': vBar,
					'v-nav': vNav
				}
			})
			njyy_data.getNewsDetail(URL, function(data) {
				example1.pp = data.news;
			});

		});

		/**
		 *页面：工作日历
		 *事件：页面加载
		 *创建/修改：wll
		 *时间：2017/1/19
		 */
		$DOCUMENT.on('pageInit', '#page-calendar', function(e, id, page) {
			var userId = CURRENT_USER.USER_ID;
			var calData = {
				work: [],
				personal: []
			};
			var vm = new Vue({
				el: '#page-calendar',
				data: {
					contents: calData,
					nowtime: utils.getNowFormatDate,
					selecttime: {},
					timelist: [],
					workDate: "",
					show: ''
				},
				components: {
					'v-bar': vBar1
				}
			});
			var calendar = $("#calentime").zcalendar({
				onCompleted: function() { //初始化
					njyy_data.Calendarlist(vm.selecttime, userId, function(data) {
						for(var i = 0; i < data.calList.length; i++) {
							calendar.changeTag(data.calList[i].timeStemp, data.calList[i].content);
						}
					});
				},
				onSwipeLeft: function() { //左滑滑动
					njyy_data.Calendarlist(vm.selecttime, userId, function(data) {
						for(var i = 0; i < data.calList.length; i++) {
							calendar.changeTag(data.calList[i].timeStemp, data.calList[i].content);
						}

					});
				},
				onSwipeRight: function() { //向右滑动
					njyy_data.Calendarlist(vm.selecttime, userId, function(data) {
						for(var i = 0; i < data.calList.length; i++) {
							calendar.changeTag(data.calList[i].timeStemp, data.calList[i].content);
						}

					});
				},
				onSelected: function(date) {
					vm.show = false;
					var selectedtime = date.toLocaleDateString().split("/");
					if(selectedtime[1] < 10) {
						var month = "0" + selectedtime[1];
					} else {
						var month = selectedtime[1];
					}
					if(selectedtime[2] < 10) {
						var day = "0" + selectedtime[2];
					} else {
						var day = selectedtime[2];
					}
					var selectT = selectedtime[0] + "-" + month + "-" + day;
					vm.selecttime = selectT;
					vm.workDate = getDate(selectT);
					njyy_data.Calendarlist(vm.selecttime, userId, function(data) {
						vm.contents.personal = [];
						for(var i = 0; i < data.calList.length; i++) {
							if(data.calList[i].plan_DATE == selectT) {
								vm.show = true;
								calData.personal.push(data.calList[i]);

							}
							calendar.changeTag(data.calList[i].timeStemp, data.calList[i].content);
						}
						vm.contents = calData;
					});
				}
			});
			$("#addmeno").on("click", function() {
				$.router.loadPage({
					url: "scheduleAdd.html?time=" + vm.selecttime,
					noAnimation: true,
					replace: false
				});

			});

			function getDate(date) { //截取时间控件
				var workMonth = date.substring(5, 7);
				var workData = date.substring(8, 10);
				var seperator = "月";
				var seperator1 = "日";
				var currentdate = workMonth + seperator + workData + seperator1;
				return currentdate;
			}
		});

		/**
		 *页面：新增个人事件
		 *事件：页面加载
		 *创建/修改：王为娟
		 *时间：2016/6/6 11：00
		 */
		$DOCUMENT.on('pageInit', '#add-schedule', function(e, id, page) {
			var nowtime = utils.getQueryString('time');
			new Vue({
				el: '#add-schedule',
				components: {
					'v-bar': vBar
				}
			});
			var USER_ID = CURRENT_USER.USER_ID;
			$("#USER_ID").val(USER_ID);
			$('#sched-add-complete').click(function() {
				var TITLE = $("#TITLE").val();
				var MEN_TIME = $("#MEN_TIME").val();
				var contentmeno = $("#contentmeno").val();
				if($.trim(TITLE) == "" || $.trim(contentmeno) == "") { //判断是空格
					plus.nativeUI.toast("请填全选项");
					return;
				}
				if(TITLE == "" || contentmeno == "") {
					plus.nativeUI.toast("请填全选项");
					return;
				} else {
					njyy_data.addCalendar(TITLE, MEN_TIME, contentmeno, nowtime, USER_ID, function(data) {
						if(data.SystemCode == 1) {
							$.router.replacePage({
								url: "menology.html",
								noAnimation: true,
								replace: false
							});
						} else {
							plus.nativeUI.toast("新增失败");
						}

					});
				}
			});

		});
		/**
		 *页面：请假申请页面学生请假
		 *事件：页面加载
		 *创建/修改：王乐乐
		 *时间：2016/6/13 14:37
		 */
		$DOCUMENT.on('pageInit', '#page-vacation-student', function(e, id, page) {
			$("#vacatename").val(CURRENT_USER.CHILDREN.STUDENT_NAME);
			var role = CURRENT_USER.ROLE;
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();
			var hour = date.getHours();
			var minute = date.getMinutes();
			var chooseDate = year + '-' + p(month) + '-' + p(day) + " " + p(hour) + ':' + p(minute)
			$("#startime").val(chooseDate);
			$("#endtime").val(chooseDate);

			function p(s) {
				return s < 10 ? '0' + s : s;
			}
			//开始时间选择
			$("#startime").datetimePicker({
				toolbarTemplate: '<header class="bar bar-nav">\
		      <button class="button button-link pull-right close-picker">确定</button>\
		      <h1 class="title">请选择时间</h1>\
		      </header>'
			});
			$("#endtime").datetimePicker({
				toolbarTemplate: '<header class="bar bar-nav">\
		      <button class="button button-link pull-right close-picker">确定</button>\
		      <h1 class="title">请选择时间</h1>\
		      </header>'
			});
			var data = {};
			var inputtype = $("#vacat-t").data('type');
			var flag;
			var vm = new Vue({
				el: '#page-vacation-student',
				data: {
					vacatetype: data
				},
				components: {
					'v-bar': vBar,
				}
			});
			/*选择请假类型*/
			//调请假类型枚举接口
			vacateType();
			$("#vacat-t").click(function(event) { //传递参数event时间防止时间冒泡
				$("#vacation-cho").slideDown("show");
				event.stopPropagation();
			});
			$("#page-vacation-student").bind("click", function(event) {
				$("#vacation-cho").slideUp("hide");
				$("#repair-cho").slideUp("hide");

			});
			$DOCUMENT.on('click', '.vacation-type li', function() {
				var inputvalue = $("#vacat-t").val();
				var flag = $(this).children().data("type");
				inputvalue = $(this).children().html();
				$("#vacat-t").val(inputvalue);
				$("#vacat-t").attr("data-type", flag);
				$("#vacation-cho").slideUp("hide");
			});
			//点击请假提交按钮事件
			$DOCUMENT.off('click', '.confirm-ok').on('click', '.confirm-ok', function() {
				var reason = $("#reason").val();
				var name = $("#vacatename").val();
				var type = $("#vacat-t").val();
				var str1 = $("#startime").val();
				var str2 = $("#endtime").val();
				var result = utils.getUnixTime(str1, str2);
				if(result == true) {
					if(type == "") {
						plus.nativeUI.toast("请假类型不能为空");
						return;
					} else if(reason == "" ) {
						plus.nativeUI.toast("请假原因不能为空");
						return;
					}else if($.trim(reason) == ""){
						plus.nativeUI.toast("请假原因不能为空");
						return;
					}
					else{
						plus.nativeUI.confirm("确定提交请假申请?", function(e) {
							if(e.index == 0) {
								//请假类型
								var type = parseInt($("#vacat-t").data('type'), 10);
								$.ajax({
									type: "post",
									url: url + "/client/vacate/addVacate",
									data: {
										"VACATE_TYPE": type,
										"START_TIME": $("#startime").val(),
										"END_TIME": $("#endtime").val(),
										"VACATE_REASON": $("#reason").val(),
										"VACATE_PERSON_ID": CURRENT_USER.USER_ID,
										"USER_NAME": CURRENT_USER.USER_NAME,
										"VACATE_PERSON_ROLE": CURRENT_USER.ROLE,
										"VACATE_PERSON_NAME": $("#vacatename").val(),
										"STATUS": 0, //请假状态默认是0审核中,1是审核完成  
									},
									success: function(data) {
										if(data.SystemCode == 1) {
											plus.nativeUI.toast("新增成功");
											$.router.replacePage({
												url: "page-vacation.html",
												noAnimation: true,
												replace: true
											});
										} else if(data.SystemCode == 10002) {
											plus.nativeUI.toast("请假记录已经存在");
										} else {
											plus.nativeUI.toast("请假出错");
										}
									}
								});
							}
						}, "新增请假申请", ["确定", "取消"]);
					}
				} else {
					plus.nativeUI.toast("开始时间不能大于等于结束时间");
					return;
				}

			});
			//请假类型
			function vacateType() {
				$.ajax({
					type: "get",
					url: url + "/client/vacate/toVacate",
					async: true,
					data: {
						roleId: role
					},
					success: function(data) {
						vm.vacatetype = data.enumsList;

					}
				});
			}
		});

		/**
		 *页面:教师查看学生请假列表
		 *事件：页面加载
		 *创建/修改：李路丹
		 *时间：2016/6/13 14:37
		 */
		$DOCUMENT.on('pageInit', '#page-vacationlist', function(e, id, page) {
			var records;
			var vacationLoading = false;
			var waitLoading = false;
			var vacationNextUrl = 10001;
			var waitNextUrl = 10001;
			var userId = CURRENT_USER.USER_ID;
			var PHONE = CURRENT_USER.USER_NAME;
			var roleId = CURRENT_USER.ACCEPT_ID;
			var vm = new Vue({
				el: '#page-vacationlist',
				data: {
					vacationList: [],
					waitList: [],
					role: roleId,
					urgecount: []
				},
				components: {
					'v-bar': vBar
				},
				methods: {
					getTimeTip: utils.getTimeTip,
					waitMd5: function(code) {
						$.router.loadPage({
							url: "vacation-information.html?id=" + code + "&status=" + 0 + "&pageId=" + 1,
							noAnimation: true,
							replace: false
						});
					},
					vacateMd5: function(code) {
						$.router.loadPage({
							url: "vacation-information.html?id=" + code + "&status=" + 1,
							noAnimation: true,
							replace: false
						});
					},
					urgcount: function(count) {
						if(count == 0) {
							return false;
						} else {
							return true;
						}
					}

				}

			});
			njyy_data.getVacationList(PHONE, function(data) {
				if(data.SystemCode == 1) {
					vacationNextUrl = data.nextUrl;
					vm.vacationList = data.vacateList;
				} else if(data.SystemCode == 10001) {
					records = 1;
				}

			});
			njyy_data.getwaitList(PHONE, function(data) {
				if(data.SystemCode == 1) {
					waitNextUrl = data.nextUrl;
					vm.waitList = data.vacateList;
				} else if(data.SystemCode == 10001) {
					plus.nativeUI.toast('没有待办事项');
				}
			});
			$('#page-vacationlist').on('refresh', '#tab1', function() {
				setTimeout(function() {
					njyy_data.getwaitList(PHONE, function(data) {
						if(data.SystemCode == 1) {
							waitNextUrl = data.nextUrl;
							vm.waitList = data.vacateList;
						} else if(data.SystemCode == 10001) {
							plus.nativeUI.toast('没有待办事项');
						}

					});
					$.pullToRefreshDone('.pull-to-refresh-content');
				}, 2000);

			});
			$('#page-vacationlist').on('refresh', '#tab2', function() {
				setTimeout(function() {
					njyy_data.getVacationList(PHONE, function(data) {
						vacationNextUrl = data.nextUrl;
						vm.vacationList = data.vacateList;
					});
					$.pullToRefreshDone('.pull-to-refresh-content');
				}, 2000);
			});
			//请假完成页面上拉加载
			$('#page-vacationlist').on('infinite', '#tab2', function() {
				// 如果正在加载，则退出
				if(vacationLoading) {
					return;
				}
				vacationLoading = true;
				if(vacationNextUrl !== 10001) {
					$('#tab2 .infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getVacationList(PHONE, function(data) {
						vacationNextUrl = data.nextUrl;
						vm.vacationList = vm.vacationList.concat(data.vacateList);
						vacationLoading = false;
					}, vacationNextUrl);
				} else {
					vacationLoading = false;
					$('#tab2 .infinite-scroll-preloader').html('已经到底了...');
				}
			});
			//我的待办上拉加载
			$('#page-vacationlist').on('infinite', '#tab1', function() {
				// 如果正在加载，则退出
				if(waitLoading) {
					return;
				}
				waitLoading = true;
				if(waitNextUrl !== 10001) {
					$('#tab1 .infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getwaitList(PHONE, function(data) {
						waitNextUrl = data.nextUrl;
						vm.waitList = vm.waitList.concat(data.vacateList);
						waitLoading = false;
					}, waitNextUrl);
				} else {
					waitLoading = false;
					$('#tab1 .infinite-scroll-preloader').html('已经到底了...');
				}
			});
			var $pubCircleBtn = $('#pubCircleBtn');
			$('#page-vacationlist .com-tab').find('#tab1Btn').click(function() {
				$pubCircleBtn.show();
			}).end().find('#tab2Btn').click(function() {
				if(records == 1) {
					plus.nativeUI.toast('没有审批完成记录');
				}
				$pubCircleBtn.hide();
			});
		});
		/**
		 *页面:学生请假列表
		 *事件：页面加载
		 *创建/修改：李路丹
		 *时间：2016/6/13 14:37
		 */
		$DOCUMENT.on('pageInit', '#page-vacation', function(e, id, page) {
			var records;
			var vacationLoading = false;
			var waitLoading = false;
			var vacationNextUrl = 10001;
			var waitNextUrl = 10001;
			var PHONE = CURRENT_USER.USER_NAME;
			var vm = new Vue({
				el: '#page-vacation',
				data: {
					vacationList: [],
					waitList: [],
				},
				components: {
					'v-bar': vBar
				},
				methods: {
					getTimeTip: utils.getTimeTip,
					waitMd5: function(code) {
						$.router.loadPage({
							url: "vacation-information.html?id=" + code + "&status=" + 3,
							noAnimation: true,
							replace: false
						});
					},
					vacateMd5: function(code) {
						$.router.loadPage({
							url: "vacation-information.html?id=" + code + "&status=" + 4,
							noAnimation: true,
							replace: false
						});
					},
					urgcount: function(count) {
						if(count == 0) {
							return false;
						} else {
							return true;
						}
					}

				}

			});
			getwait(); //代办
			getVacation(); //完成
			$('#page-vacation').on('refresh', '#tab1', function() {
				setTimeout(function() {
					getwait(true);
					$.pullToRefreshDone('.pull-to-refresh-content');
				}, 2000);
			});
			$('#page-vacation').on('refresh', '#tab2', function() {
				setTimeout(function() {
					getVacation(true);
					$.pullToRefreshDone('.pull-to-refresh-content');
				}, 2000);
			});
			//请假代办页面上拉加载
			$DOCUMENT.on('infinite', '#tab1', function() {
				// 如果正在加载，则退出
				if(waitLoading) {
					return;
				}
				// 设置flag
				waitLoading = true;
				if(waitNextUrl == 10001) {
					waitNextUrl = false;
					$('#tab1 .infinite-scroll-preloader').html("已经到底了...");
				} else {
					$('#page-vacation .infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getwait(PHONE, function(data) {
						if(data.SystemCode == 1) {
							waitNextUrl = data.nextUrl;
							vm.waitList = vm.waitList.concat(data.vacateList);
							records = 0;
						} else {
							plus.nativeUI.toast("请求出错");
						}
						waitLoading = false;
					}, waitNextUrl);

				}
			});
			//我的完成上拉刷新
			$DOCUMENT.on('infinite', '#tab2', function() {
				// 如果正在加载，则退出
				if(vacationLoading) {
					return;
				}
				// 设置flag
				vacationLoading = true;
				if(vacationNextUrl == 10001) {
					vacationNextUrl = false;
					$('#tab2 .infinite-scroll-preloader').html("已经到底了...");
				} else {
					$('#page-vacation .infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getVacation(PHONE, function(data) {
						if(data.SystemCode == 1) {
							vacationNextUrl = data.nextUrl;
							vm.vacationList = vm.vacationList.concat(data.vacateList);
						} else {
							plus.nativeUI.toast("请求出错");
						}
						vacationLoading = false;
					}, vacationNextUrl);

				}
			});

			//初始化代办列表
			function getwait(isRefresh) {
				isRefresh = isRefresh || false;
				njyy_data.getwait(PHONE, function(data) {
					if(data.SystemCode == 1) {
						waitNextUrl = data.nextUrl;
						vm.waitList = data.vacateList;
						$('#tab1 .infinite-scroll-preloader').html('');
						if(isRefresh) {
							$.pullToRefreshDone('#tab1 .pull-to-refresh-content');
						}
					} else if(data.SystemCode == 10001) {
						plus.nativeUI.toast('没有待办记录');
						vm.waitList = "";
					} else {
						plus.nativeUI.toast("请求出错");
					}
				});
			}
			//初始化完成列表
			function getVacation(isRefresh) {
				isRefresh = isRefresh || false;
				njyy_data.getVacation(PHONE, function(data) {
					if(data.SystemCode == 1) {
						records = 0;
						vacationNextUrl = data.nextUrl;
						vm.vacationList = data.vacateList;
						$('#tab2 .infinite-scroll-preloader').html('');
						if(isRefresh) {
							$.pullToRefreshDone('#tab2 .pull-to-refresh-content');
						}
					} else if(data.SystemCode == 10001) {
						records = 1;
					} else {
						plus.nativeUI.toast("请求出错");
					}
				});
			}
			var $pubCircleBtn = $('#pubCircleBtn');
			$('#page-vacation .com-tab').find('#tab1Btn').click(function() {
				$pubCircleBtn.show();
			}).end().find('#tab2Btn').click(function() {
				if(records == 1) {
					plus.nativeUI.toast('没有请假完成记录');
				}
				$pubCircleBtn.hide();
			});
		});
		/**
		 *页面：消息通知页面
		 *事件：页面加载
		 *创建/修改：左武洲
		 *时间：2016/6/20 9:02
		 */
		$DOCUMENT.on('pageInit', '#page-message', function(e, id, page) {
			var userId = CURRENT_USER.USER_ID;
			var roleId = CURRENT_USER.ROLE;
			var nextUrl = 10001;
			var loading = false;
			var vm = new Vue({
				el: '#page-message',
				data: {
					role: roleId,
					infoList: [],
					host: NGINX_PATH
				},
				methods: {
					getTimeTip: utils.getTimeTip,
					delete: function(message) {
						njyy_data.deleteMessage(message.MD5CODE, function(data) {
							if(data.SystemCode == 1) {
								vm.infoList.$remove(message);
							} else {
								plus.nativeUI.toast('操作失败');
							}
						});

					},
					chooseMe: function(item) {
						var detailUrl = item.URL;
						detailUrl = detailUrl.substring(detailUrl.indexOf("?") + 9, detailUrl.length);
						$.router.loadPage({
							url: "vacation-information.html?id=" + detailUrl + "&status=" + 0 + "&pageId=" + 0,
							noAnimation: true,
							replace: false
						});
					}

				},
				components: {
					'v-bar': vBar,
					'v-nav': vNav,
					'v-messageItem': vMessageItem,
					'v-public': vNavPublic
				}
			});
			initMessage();

			//轮询请求
			if(MESSAGE_TIMER == null) {
				MESSAGE_TIMER = setInterval(function() {
					initMessage();
				}, INTERVAL_TIME);
			}

			//下拉刷新
			$('#page-message').on('refresh', '.pull-to-refresh-content', function(e) {
				initMessage(true);
			});

			//上拉加载
			$('#page-message').on('infinite', '.infinite-scroll', function() {
				// 如果正在加载，则退出
				if(loading) return;
				loading = true;
				if(nextUrl == 10001) {
					loading = false;
					$('#page-message .infinite-scroll-preloader').html('已经到底了...');
				} else {
					$('#page-message .infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getMessageList(userId, function(data) {
						if(data.SystemCode == 1) {
							nextUrl = data.nextUrl;
							vm.infoList = vm.infoList.concat(data.infoList);
						} else {
							plus.nativeUI.toast('请求失败');
						}
						loading = false;
					}, nextUrl);
				}
			});

			//初始化消息列表
			function initMessage(isRefresh) {
				isRefresh = isRefresh || false;
				var currentPageId = document.querySelector('.page-current').getAttribute('id');
				//为消息页面则请求数据
				if(currentPageId == "page-message") {
					njyy_data.getMessageList(userId, function(data) {
						if(data.SystemCode == 1) {
							nextUrl = data.nextUrl;
							vm.infoList = data.infoList;
							$('#page-message .infinite-scroll-preloader').html('');
							if(isRefresh) {
								$.pullToRefreshDone('#page-message .pull-to-refresh-content');
							}
						} else {
							plus.nativeUI.toast('请求失败');
						}
					});
				}
			}
		});
		/**
		 *页面：通讯录
		 *事件：通讯界面
		 *创建/修改：李路丹
		 *时间：2016/6/23 09:51
		 */
		$DOCUMENT.on('pageInit', '#page-roster', function(e, id, page) {
			var vm = new Vue({
				el: '#page-roster',
				components: {
					'v-bar': vBar,
					'v-nav': vNav
				}
			});

		});
		/**
		 *页面：注册登录导航
		 *创建: wangshujing
		 *时间：2016/6/20
		 */
		$DOCUMENT.on('pageInit', '#login-index', function(e, id, page) {
			//登录跳转
			$('#loginIndexBtn').on('click', function() {
				if(GESTURE_SETTING.PASSWORD && GESTURE_SETTING.PASSWORD != null && GESTURE_SETTING.IS_USED == true) {
					$.router.loadPage({
						url: 'gesture-login.html',
						noAnimation: true,
						replace: false
					});
				} else {
					$.router.loadPage({
						url: 'login-login.html',
						noAnimation: true,
						replace: false
					});
				}
			});
		});
		/**
		 *页面：登录页面
		 *事件：用户登录
		 *创建: wangshujing
		 *时间：2016/6/16
		 */
		$DOCUMENT.on('pageInit', '#login-login', function(e, id, page) {
			//显示密码
			var ic = false;
			$("#show-password-checkbox").change(function() {
				if(!ic) {
					$("#show-password-text").val("隐藏密码");
					$("#password").attr("type", "text");
				} else {
					$("#show-password-text").val("显示密码");
					$("#password").attr("type", "password");
				}
				ic = !ic;
			});
			$("#btn-login").on('click', function() {
				var username = $("#username").val();
				var password1 = $("#password").val();
				//数据校验
				if(username == "") {
					plus.nativeUI.toast("请输入正确的账号!");
					return;
				}
				if($.trim(password1) == "") {
					plus.nativeUI.toast("密码不能为空!");
					return;
				}
				if(password1 == "") {
					plus.nativeUI.toast("密码不能为空!");
					return;
				}
				var user = {
					"USERNAME": username,
					"PASSWORD": password1
				};
				njyy_data.postLogin(user, function(data) {
					console.log(JSON.stringify(data))
					switch(data.SystemCode) {
						case 1:
							CURRENT_USER.USER_NAME = username; //登录名
							CURRENT_USER.USER_ID = data.USER_ID; //用户id
							CURRENT_USER.ROLE = data.ROLE; //角色
							CURRENT_USER.IS_CHARGE = data.IS_CHARGE; //是否为班主任
							CURRENT_USER.NAME = data.NAME; //昵称
							CURRENT_USER.PATH = data.PATH; //头像	
							CURRENT_USER.CLASS_ID = data.CLASS_ID; //学生所在班级
							//手势配置不存在或者手势配置存在但不是当前用户
							if(!GESTURE_SETTING.USER_NAME || GESTURE_SETTING.USER_NAME != CURRENT_USER.USER_NAME) {
								GESTURE_SETTING.USER_NAME = CURRENT_USER.USER_NAME;
								GESTURE_SETTING.IS_USED = true;
								GESTURE_SETTING.PASSWORD = data.G_PASSWORD;
							} else {
								GESTURE_SETTING.PASSWORD = data.G_PASSWORD;
							}
							//更新本地配置
							plus.storage.setItem('GESTURE_SETTING', JSON.stringify(GESTURE_SETTING));
							//						plus.nativeUI.showWaiting('请稍等...');
							switch(data.ROLE) {
								case "1":
									// 角色:教师
									//班级id
									CURRENT_USER.CLASS_ID = data.CLASS_ID;
									$.router.loadPage({
										url: "yy-circle.html",
										noAnimation: true,
										replace: false
									});
									break;
								case "2":
									//角色:家长
									//孩子
									CURRENT_USER.CHILDREN = data.stuInfoMap[0];
									console.log(JSON.stringify(CURRENT_USER.CHILDREN))
									//被选中的孩子
									$.router.loadPage({
										url: "yy-circle.html",
										noAnimation: true,
										replace: false
									});
									break;
								case "3":
									//角色:游客
									//环信登录
									//								Chat.init(data.HX_NAME,data.HX_PASSWORD,function(){
									//									plus.nativeUI.closeWaiting();
									$.router.loadPage({
										url: "yy-public.html",
										noAnimation: true,
										replace: false
									});
									//								});	
							}
							break;
						case 1003:
							plus.nativeUI.toast("用户名错误!");
							break;
						case 1004:
							plus.nativeUI.toast("密码错误!");
							break;
					}
				});
			});
		});
		/**
		 *页面：注册页面——设置密码
		 *事件：设置密码
		 *创建: wangshujing
		 *时间：2016/6/20
		 */
		$DOCUMENT.on('pageInit', '#login-set-password', function(e, id, page) {

		});

		/**
		 * 忘记密码——输入手机号
		 *创建: wangshujing
		 *时间：2016/6/20
		 */
		$DOCUMENT.on('pageInit', '#login-retrieve-password', function(e, id, page) {

		});
		/**
		 * 忘记密码——重设密码
		 *创建: wangshujing
		 *时间：2016/6/20
		 */
		$DOCUMENT.on('pageInit', '#login-reset-password', function(e, id, page) {

		});
		/**
		 * 手势密码
		 */
		$DOCUMENT.on('pageInit', '#set-gestures-password', function(e, id, page) {
			new Vue({
				el: '#set-gestures-password',
				components: {
					'v-bar': vBar,
				}
			});
			new H5lock({
				chooseType: 3
			}).init();
		});
		/**
		 * 我的主界面
		 * 创建:wangshujing
		 * 时间: 2016/6/22 10:34
		 */
		$DOCUMENT.on('pageInit', "#mine-index", function(e, id, page) {
			var headimg = CURRENT_USER.PATH;
			var roleId = CURRENT_USER.ROLE;
			var charge = CURRENT_USER.IS_CHARGE;
			var vm = new Vue({
				el: '#mine-index',
				data: {
					role: roleId,
					charge: charge,
					headimg: headimg,
					name: CURRENT_USER.NAME,
					nginx: NGINX_PATH

				},
				methods: {
					hasChoose: function() {
						chooseImage();
					},
					noChoose: function() {
						chooseImage();
					}
				},
				components: {
					'v-bar': vBar,
					'v-nav': vNav,
					'v-public': vNavPublic
				}
			});
			//列表项点击事件
			$("#mineMenuList").on("click", "li", function() {
				var href = $(this).data('href');
				$.router.loadPage({
					url: href,
					noAnimation: true,
					replace: false
				});
			});
			var userImgDOM = document.getElementById('mineUserImg'),
				bgImgDOM = document.getElementById('mineIndexBg');
			//头像缓存
			utils.fetchImage(CURRENT_USER.PATH, userImgDOM, 0);
			setTimeout(function() {
				utils.fetchImage(CURRENT_USER.PATH, bgImgDOM, 0);
			});
			document.getElementById('userNameDiv').innerText = CURRENT_USER.NAME;
			//上传头像
			function chooseImage() {
				plus.nativeUI.actionSheet({
					cancel: "取消",
					buttons: [{
						title: "从相册选择"
					}, {
						title: "拍照"
					}]
				}, function(event) {
					if(event.index == 1) {
						plus.gallery.pick(function(path) {
							plus.nativeUI.showWaiting('等待中...');
							plus.zip.compressImage({
								src: path,
								dst: "_downloads/camera/" + path.substring(path.lastIndexOf('/')),
								overwrite: true,
								quality: 20
							}, function(event) {
								uploadUserImage(event.target);
							}, function() {
								plus.nativeUI.closeWaiting();
								plus.nativeUI.toast("操作出错");
							});
						}, function() {}, {
							filter: "image"
						});
					} else if(event.index == 2) {
						utils.getCamera(function(path) {
							plus.nativeUI.showWaiting('等待中...');
							plus.zip.compressImage({
								src: path,
								dst: path,
								overwrite: true,
								quality: 20
							}, function(event) {
								uploadUserImage(event.target);
							}, function() {
								plus.nativeUI.closeWaiting();
								plus.nativeUI.toast("请求出错");
							});
						});
					}
				});
			};

			function uploadUserImage(path) {
				var task = plus.uploader.createUpload(USERIMAGE_UPLOAD_PATH, {
					method: "POST"
				}, function(t, status) {
					if(status == 200) {
						var result = JSON.parse(t.responseText);
						CURRENT_USER.PATH = result.path;
						vm.headimg = result.path;
						utils.fetchImage(result.path, userImgDOM, 0);
						setTimeout(function() {
							utils.fetchImage(CURRENT_USER.PATH, bgImgDOM, 0);
						});
						plus.nativeUI.closeWaiting();
					} else {
						plus.nativeUI.closeWaiting();
						plus.nativeUI.toast("上传失败");
					}
				});
				task.addFile(path, {
					key: "file"
				});
				task.addData('userId', CURRENT_USER.USER_ID);
				task.addData('supply', 'user_head_portrait');
				task.start();
			}

		});
		/**
		 * 我的设置
		 */
		$DOCUMENT.on('pageInit', "#mine-setting", function(e, id, page) {
			var phone = CURRENT_USER.USER_NAME;
			//显示创建修改手势
			if(window.GESTURE_SETTING.PASSWORD !== null) {
				document.getElementById('mineGestureBtn').querySelector('.item-after').innerHTML = '修改';
			}
			//隐藏手机号
			document.getElementById('minePhoneDiv').innerText = phone.replace(phone.substring(3, 7), '****');
			var roleId = CURRENT_USER.ROLE;
			var vm = new Vue({
				el: '#mine-setting',
				data: {
					role: roleId,
					name: CURRENT_USER.USER_NAME
				},
				components: {
					'v-bar': vBar
				}
			});

			//跳转手势密码页面
			$('#mineGestureBtn').on('click', function() {
				$.router.loadPage({
					url: "gesture-index.html",
					noAnimation: true,
					replace: false
				});
			});

			//跳转登录密码页
			$('#loginPasswordBtn').on('click', function() {
				$.router.loadPage({
					url: "password-index.html",
					noAnimation: true,
					replace: false
				});
			});
			//退出登录
			$("#btn-logout").on('click', function() {
				//删除手势配置
				plus.storage.removeItem('GESTURE_SETTING');
				//重启应用
				plus.runtime.restart();
			});

			//清除缓存
			$('#clearCacheBtn').on('click', function() {
				plus.nativeUI.confirm("是否清除缓存", function(event) {
					if(event.index == 0) {
						utils.cleanCache();
					}
				}, '确认', ["确定", "取消"]);
			});
		});

		/*页面：投票列表页面
		 *事件：页面加载
		 *创建/修改：左武洲
		 *时间：2016/6/27 9:02
		 */
		$(document).on('pageInit', '#page-voteList', function(e, id, page) {
			var roleId = CURRENT_USER.ROLE;
			var nextUrl = 10001;
			var loading = false;
			var timeTotle = [];
			var vm = new Vue({
				el: '#page-voteList',
				data: {
					voteClassList: [],
					voteList: [],
					timeTotle: [],
					roleId: roleId
				},
				methods: {
					getTimeTip: utils.getTimeTip,
					hrefSchool: function(item) {
						var pp = item.VOTE_ID
						$.router.loadPage({
							url: "voteDetail.html?id=" + pp,
							noAnimation: true,
							replace: false
						});
					},
					hrefClass: function(item) {
						var pp = item.VOTE_ID
						$.router.loadPage({
							url: "voteDetail.html?id=" + pp,
							noAnimation: true,
							replace: false
						});
					}

				},
				components: {
					'v-bar': vBar
				},
			});
			getVoteSchollList(); //校园
			$('#tab1').bind('refresh', '.pull-to-refresh-content', function(e) {
				getVoteSchollList(true);
			});
			//上拉加载
			$('#page-voteList').on('infinite', '#tab1', function() {
				// 如果正在加载，则退出
				if(loading) return;
				loading = true;
				if(nextUrl == 10001) {
					loading = false;
					$('#page-voteList .infinite-scroll-preloader').html('已经到底了...');
				} else {
					$('#page-voteList .infinite-scroll-preloader').html('<div class="preloader"></div>');
					njyy_data.getSchoolList(function(data) {
						if(data.SystemCode == 1) {
							nextUrl = data.nextUrl;
							vm.voteList = vm.voteList.concat(data.votesList);
						} else if(data.SystemCode == 10001) {
							plus.nativeUI.toast('没有校园投票记录');
						}
						loading = false;
					}, nextUrl);
				}
			});

			//初始化校园信息列表
			function getVoteSchollList(isRefresh) {
				isRefresh = isRefresh || false;
				njyy_data.getSchoolList(function(data) {
					if(data.SystemCode == 1) {
						nextUrl = data.nextUrl;
						vm.voteList = data.votesList;
						$('#page-voteList .infinite-scroll-preloader').html('');
						if(isRefresh) {
							$.pullToRefreshDone('#page-voteList .pull-to-refresh-content');
						}
					} else if(data.SystemCode == 10001) {
						plus.nativeUI.toast('没有校园投票记录');
					}
				});
			}
		});
		/**
		 *页面：投票详情页面
		 *事件：页面加载
		 *创建/修改：左武洲
		 *时间：2016/6/28 9:02
		 */
		$(document).on('pageInit', '#page-voteDetail', function(e, id, page) {
			var recordPeopleId = CURRENT_USER.USER_ID;
			$("#RECORED_PEOPLE_ID").val(recordPeopleId);
			var id = utils.getId();
			var userId = CURRENT_USER.USER_ID;
			$("#VOTE_ID").val(id);
			var data = {};
			var example1 = new Vue({
				el: '#page-voteDetail',
				data: {
					item: [],
					items: [],
					greeting: greeting
				},
				components: {
					'v-bar': vBar,
					'v-nav': vNav
				}
			})
			njyy_data.getVoteDetail(id, userId, function(data, greeting) {
				console.log(JSON.stringify(data))
				example1.item = data;
				example1.items = data.votelist;
				if(greeting == 10002) {
					example1.greeting = 1;
				} else {
					example1.greeting = 0;
				}

			});

			/*点击提交投票结果*/
			$(document).off('click', '#expert-answer-button').on('click', '#expert-answer-button', function() {
				var JsonDateValue  = new Date();
				var year = JsonDateValue.getFullYear();
				var month = JsonDateValue.getMonth()+1;
				var day = JsonDateValue.getDate();
				var nowdate = year+"-"+(month>10?month:("0"+month))+"-"+(day>10?day:("0"+day));  
				var starTime=example1.item.vote_STAR;
				var endTime=example1.item.vote_END;
				var result=utils.getUnixTime(nowdate,starTime);
				if(result==true){
					plus.nativeUI.toast('投票时间没有开始');
					return;
				}
				var result1=utils.getUnixTime(endTime,nowdate);
				console.log(result1)
				if(result1==true){
					plus.nativeUI.toast('投票时间已经结束');
					return;
				}
				obj = document.getElementsByName("DETAIL_ID");
				check_val = [];
				for(k in obj) {
					if(obj[k].checked)
						check_val.push(obj[k].value);
				}
				var obj = {
					VOTE_ID: $("#VOTE_ID").val(),
					RECORED_PEOPLE_ID: $("#RECORED_PEOPLE_ID").val(),
					DETAIL_ID: check_val.toString()
				}
				if(check_val == "") {
					plus.nativeUI.toast('请选择投票选项');
					return;
				} else {
					plus.nativeUI.confirm("确定提交投票?", function(e) {
						if(e.index == 0) {
							njyy_data.postVotePerson(obj, function(data) {
								if(data.SystemCode == 1) {
									plus.nativeUI.toast('提交成功');
									$.router.back();
								} else {
									plus.nativeUI.toast('你已经投过票了');
								}
							})
						}
					}, "提交投票", ["确定", "取消"]);
				}
			});

		});
		/**
		 * 绑定的手机号
		 */
		$DOCUMENT.on('pageInit', "#setting-current-phonenum", function(e, id, page) {
			var phoneNum = CURRENT_USER.USER_NAME;
			$("#current-phonenum").val(phoneNum);
			new Vue({
				el: '#setting-current-phonenum',
				components: {
					'v-bar': vBar
				}
			});
		});
		/**
		 * 修改绑定的手机号
		 */
		$DOCUMENT.on('pageInit', "#change-current-phonenum", function(e, id, page) {
			var phoneNum = CURRENT_USER.USER_NAME;
			$("#current-phonenum").val(phoneNum);
			new Vue({
				el: '#change-current-phonenum',
				components: {
					'v-bar': vBar
				}
			});
		});
		/**
		 *页面：班级课表
		 *事件：页面加载
		 *创建/修改：李路丹
		 *时间：2016/6/28 9:02
		 */
		$DOCUMENT.on('pageInit', "#page-class", function(e, id, page) {
			new Vue({
				el: '#page-class',
				components: {
					'v-bar': vBar
				}
			});
		});
		/**
		 *页面：手势密码
		 *事件:页面加载
		 *创建/修改:左武洲
		 *时间：2016/7/29 14:20
		 */
		$DOCUMENT.on('pageInit', '#gesture-index', function() {
			if(!window.GESTURE_SETTING.IS_USED) {
				document.getElementById('gestureIsUsedBtn').removeAttribute('checked');
			}
			var vm = new Vue({
				el: '#gesture-index',
				methods: {
					clickMe: function() {
						plus.nativeUI.toast('请联系管理员索取新密码');
					}
				},
				components: {
					'v-bar': vBar
				}
			});
			//启用手势
			$('#gestureIsUsedBtn').on('click', function() {
				if($(this).is(":checked")) {
					window.GESTURE_SETTING.IS_USED = true;
					plus.nativeUI.toast('已启用手势密码');
				} else {
					window.GESTURE_SETTING.IS_USED = false;
					plus.nativeUI.toast('已关闭手势密码');
				}
				//更新本地手势配置
				plus.storage.setItem('GESTURE_SETTING', JSON.stringify(window.GESTURE_SETTING));
			});
			//修改手势
			$('#changeGestureBtn').on('click', function() {
				$.router.loadPage({
					url: 'gesture-panel.html',
					noAnimation: true,
					replace: false
				});
			});
		});

		/**
		 *页面：登录密码
		 *事件:页面加载
		 *创建/修改:左武洲
		 *时间：2016/7/29 14:20
		 */
		$DOCUMENT.on('pageInit', '#password-index', function() {
			var vm = new Vue({
				el: '#password-index',
				methods: {
					clickMe: function() {
						plus.nativeUI.toast('请联系管理员索取新密码');
					}
				},
				components: {
					'v-bar': vBar
				}
			});

			//跳转修改登录密码页面
			$('#changePdBtn').on('click', function() {
				$.router.loadPage({
					url: "password-change.html",
					noAnimation: true,
					replace: false
				});
			});
		});

		/**
		 *页面：修改登录密码
		 *事件:页面加载
		 *创建/修改:左武洲
		 *时间：2016/7/29 15:00
		 */
		$DOCUMENT.on('pageInit', '#password-change', function() {
			var vm = new Vue({
				el: '#password-change',
				components: {
					'v-bar': vBar
				}
			});

			$('#cpChangePdBtn').on('click', function() {
				var oldPd = $('#cpOldPassword').val();
				var newPd = $('#cpNewPassword').val();
				var repeatPd = $('#cpRepeatPassword').val();
				if(oldPd === "") {
					plus.nativeUI.toast('原密码不能为空');
					return;
				}
				if(newPd === "") {
					plus.nativeUI.toast('新密码不能为空');
					return;
				}
				if(repeatPd === "") {
					plus.nativeUI.toast('重复密码不能为空');
					return;
				}
				if(repeatPd !== newPd) {
					plus.nativeUI.toast('密码输入不一致');
					return;
				}
				njyy_data.updatePassword(CURRENT_USER.USER_ID, oldPd, newPd, CURRENT_USER.ROLE, function(data) {
					switch(data.SystemCode) {
						case 0:
							plus.nativeUI.toast('服务器错误');
							break;
						case 1:
							plus.nativeUI.toast('修改成功,请重新登录');
							//重启应用
							plus.runtime.restart();
							break;
						case 1004:
							plus.nativeUI.toast('密码错误');
							break;
						default:
							plus.nativeUI.toast('请求失败');
							break;
					}
				});
			});
		});

		/**
		 *页面：修改手势密码
		 *事件:页面加载
		 *创建/修改:左武洲
		 *时间：2016/8/2 16:56
		 */
		$DOCUMENT.on('pageInit', '#gesture-panel', function() {
			var vm = new Vue({
				el: '#gesture-panel',
				components: {
					'v-bar': vBar
				}
			});
			new H5lock({
				chooseType: CHOOSE_TYPE,
				container: 'gesturePanelCotainer',
				title: 'gesturePanelTitle'
			}).init();
		});

		/**
		 *页面：手势密码登录
		 *事件:页面加载
		 *创建/修改:左武洲
		 *时间：2016/8/3 17:55
		 */
		$DOCUMENT.on('pageInit', '#gesture-login', function() {
			new H5lock({
				chooseType: CHOOSE_TYPE,
				container: 'gestureLoginCotainer',
				title: 'gestureLoginTitle',
				isLogin: true
			}).init();
		});

		/**
		 *页面：我的孩子
		 *事件:页面加载
		 *创建/修改:左武洲
		 *时间：2016/8/3 17:55
		 */
		$DOCUMENT.on('pageInit', '#mine-my-children', function() {
			new Vue({
				el: '#mine-my-children',
				data: {
					childrenList: CURRENT_USER.CHILDREN
				},
				components: {
					'v-bar': vBar
				}
			});
			//加载孩子
			for(var item in CURRENT_USER.CHILDREN) {
				if(CURRENT_USER.CHILDREN[item].IS_DEFAULT_STUDENT == 1) {
					$('#myChildrenPicker').append(
						'<option value="' + CURRENT_USER.CHILDREN[item].STUDENT_ID + '" selected="selected">' +
						CURRENT_USER.CHILDREN[item].CLASS_NAME + '  ' + CURRENT_USER.CHILDREN[item].STUDENT_NAME +
						'</option>');
				} else {
					$('#myChildrenPicker').append(
						'<option value="' + CURRENT_USER.CHILDREN[item].STUDENT_ID + '">' +
						CURRENT_USER.CHILDREN[item].CLASS_NAME + '  ' + CURRENT_USER.CHILDREN[item].STUDENT_NAME +
						'</option>');
				}
			}
		});

		/**
		 *页面：班级圈详情
		 *事件:页面加载
		 *创建/修改:左武洲
		 *时间：2016/8/3 17:55
		 */
		$DOCUMENT.on('pageInit', '#yy-circle-detail', function() {
			var vm = new Vue({
				el: '#yy-circle-detail',
				data: {
					nginx: NGINX_PATH,
					circleInfo: {},
					commentsList: []
				},
				components: {
					'v-bar': vBar
				},
				methods: {
					//返回图片地址数组
					getImagePath: function(path) {
						var arr = [];
						if(path.length > 0 && path.indexOf(',') > -1) {
							arr = path.split(',');
						} else {
							arr.push(path);
						}
						return arr;
					}
				}
			});
			var circleId = utils.getId();
			njyy_data.getClassCircleDetail(circleId, CURRENT_USER.USER_ID, function(data) {
				vm.circleInfo = data.msgClassMap;
				vm.commentsList = data.comList;
				vm.$nextTick(function() {
					loadImage();
				})
			});
			//缓存图片
			function loadImage() {
				//缓存并显示图片
				$('.yy-circle-item-image[src=""]').each(function() {
					var path = this.dataset.src;
					utils.fetchImage(path, this);
				});
			}
		});

		/**
		 *页面：聊天面板
		 *事件:页面加载
		 *创建/修改:左武洲
		 *时间：2016/8/25 9:25
		 */
		$DOCUMENT.on('pageInit', '#page-chat-panel', function() {
			//环信用户名
			var name = decodeURI(utils.getQueryString('name'));
			var isGroup = utils.getQueryString('isGroup');
			var id = undefined;
			if(isGroup == 1) { //群聊
				id = utils.getQueryString('id');
			}
			var vm = new Vue({
				el: '#page-chat-panel',
				data: {
					name: name,
					chatList: []
				},
				components: {
					'v-bar': vBar
				},
				methods: {
					parseEmoji: WebIM.utils.parseEmoji
				}
			});
			vm.chatList = Chat.getChatList(isGroup == 0 ? name : id);
			//发送图片,语音按钮
			$('#chatActionBtn').on('click', function() {
				//发送图片,发送语音
				plus.nativeUI.actionSheet({
					cancel: '取消',
					buttons: [{
						title: "发送图片"
					}, {
						title: "发送语音"
					}]
				}, function(e) {
					if(e.index == 1) {
						plus.nativeUI.toast('功能暂未开放');
						//						plus.gallery.pick(function(path) {
						//							plus.nativeUI.showWaiting('等待中...');
						//							plus.zip.compressImage({
						//								src: path,
						//								dst: "_downloads/camera/" + path.substring(path.lastIndexOf('/')),
						//								overwrite: true,
						//								quality: 20
						//							}, function(event) {
						//								plus.io.resolveLocalFileSystemURL(event.target,function(entry){
						//									entry.file(function(file){
						//										Chat.sendImgMessage(name,file,function(){
						//											plus.nativeUI.closeWaiting();
						//										});
						//									});
						//								},function(){
						//									plus.nativeUI.toast('获取图片失败');
						//								});
						//							}, function() {
						//								plus.nativeUI.closeWaiting();
						//								plus.nativeUI.toast("操作出错");
						//							});
						//						}, function() {
						//						}, {
						//							filter: "image"
						//						});
					} else if(e.index == 2) {
						plus.nativeUI.toast('功能暂未开放');
					}
				});
			});

			//发送聊天消息
			$('#sendChatMsgBtn').on('click', function() {
				var $chatInput = $('#chatMsgInput');
				var message = $chatInput.val();
				//消息内容不能为空
				if(message === "") {
					plus.nativeUI.toast('消息内容不能为空');
					return;
				}
				//发送消息
				Chat.sendTextMessage(isGroup == 0 ? name : id, CURRENT_USER.HX_NAME, message, function() {
					$chatInput.val('');
					//隐藏表情框
					var $panel = $('#chatEmotionPanel');
					if(!$panel.is(':hidden')) {
						$panel.hide('normal');
					}
				}, isGroup);

			});

			//显示隐藏表情面板
			$('#chatEmotionBtn').on('click', function() {
				var $panel = $('#chatEmotionPanel');
				if($panel.is(':hidden')) {
					Chat.showEmotionPanel($panel);
				} else {
					$panel.hide('normal');
				}
			});

			//选择表情
			$('#chatEmotionPanel').on('click', 'img', function() {
				var input = document.getElementById('chatMsgInput');
				input.value += this.id;
			});
		});

		/**
		 *页面:小营成绩单
		 *事件:页面加载
		 *创建/修改:zwz
		 *时间：2016/10/30 15:00
		 */
		$DOCUMENT.on('pageInit', '#page-score', function() {
			var vm = new Vue({
				el: '#page-score',
				data: {
					scoreList: [], //成绩列表
					scoreYearList: [] //年度成绩列表
				},

				methods: {
					radarchart: function(subjcet, gradeId, kmid) {
						$.router.loadPage({
							url: "radarchart.html?userId=" + CURRENT_USER.USER_ID + "&subject=" + subjcet + "&gradeId=" + gradeId + "&kmid=" + kmid,
							noAnimation: true,
							replace: false
						});
					},
					linechart: function(subjcet) {
						$.router.loadPage({
							url: "linechart.html?userId=" + CURRENT_USER.USER_ID + "&subject=" + subjcet,
							noAnimation: true,
							replace: false
						});
					}

				},
				components: {
					'v-bar': vBar
				}

			});
			//折叠面板点击效果
			$('.object-list li').click(function() {
				if($(this).hasClass("active")) {
					$(this).children("a").removeClass("bgicons").addClass("bgicon");
					$(this).children(".detail-list").hide();
					$(this).removeClass("active");
				} else {
					$(this).children("a").removeClass("bgicon").addClass("bgicons");
					$(this).children(".detail-list").show();
					$(this).addClass("active");
				}
			});

			//成绩列表
			njyy_data.getTestList(CURRENT_USER.USER_ID, function(data) {
				console.log(JSON.stringify(data))
				vm.scoreList = data.rg;

			});
			//年度成绩列表
			njyy_data.getYearTestList(CURRENT_USER.USER_ID, function(data) {
				vm.scoreYearList = data.rg;
			});

		});

		/**
		 *页面:年度成绩分析
		 *事件:页面加载
		 *创建/修改:zwz
		 *时间：2016/10/30 15:00
		 */
		$DOCUMENT.on('pageInit', '#page-linechart', function() {
			var subject = utils.getQueryString("subject"); //科目id
			var subjectApp = [];
			var subjectApp2 = [];
			var vm = new Vue({
				el: '#page-linechart',
				data: {
					allsocre: [], //得分列表
					linescore: [], //单次得分折线
					lineaverage: [], //平均分折线
					charnum: []
				},
				components: {
					'v-bar': vBar
				}
			});

			//获取年度成绩数据
			njyy_data.getYearTestDetail(CURRENT_USER.CHILDREN.STUDENT_ID, subject, function(data) {
				var ls = []; //单次得分
				var la = []; //平均分
				var num = []; //考试次数
				for(var i = 0; i < data.listMap.length; i++) {
					var n = String.fromCharCode(65 + i);
					num.push(n);
					if(data.listMap[i].COUNT_MARK != undefined) {
						ls.push(data.listMap[i].COUNT_MARK.toFixed(2));
					} else {
						ls.push("-");
					}
					if(data.listMap[i].TOTALCOUNT != undefined) {
						la.push(data.listMap[i].TOTALCOUNT.toFixed(2));
					} else {
						la.push("-");
					}
				}
				vm.charnum = num;
				vm.allsocre = data.listMap;
				vm.linescore = ls;
				vm.lineaverage = la;
				console.log(JSON.stringify(ls))
				console.log(JSON.stringify(la))
				vm.$nextTick(function() {
					var option = {
						title: {
							text: ''
						},
						tooltip: {
							trigger: 'axis'
						},
						legend: {
							data: ['本次测试', '班级平均分']
						},
						grid: {
							width: '85%',
							height: '70%',
							top: '15%',
							left: '10%',
							right: '15%',
							bottom: 'center'
						},
						xAxis: {
							type: 'category',
							boundaryGap: false,
							data: ['A', 'B', 'C', 'D', 'E', 'F', 'G', "H", "I", "J", "K", "L", "M", "N"]
						},
						yAxis: {
							type: 'value'
						},
						series: [{
							name: '本次测试',
							type: 'line',
							data: vm.linescore
						}, {
							name: '班级平均分',
							type: 'line',
							data: vm.lineaverage
						}],
						animation: false //关闭动画
					};
					var myChart = echarts.init(document.getElementById('mainw'));
					myChart.setOption(option);
				});
			});

		});

		/**
		 * 页面: 教师版成绩表(所任课班级列表)
		 * 创建: 沈 培
		 * 时间: 2017/01/15
		 */
		$DOCUMENT.on('pageInit', '#page-resultsList', function() {
			var TEST_TYPE = utils.getQueryString('TEST_TYPE');
			var vm = new Vue({
				el: '#page-resultsList',
				data: {
					resultslist: []
				},
				methods: {
					resultsListClick: function(item) {
						$.router.loadPage({
							url: "resultsStudents.html?gradeId=" + item.GRADE_ID + "&ruleTid=" + item.RULE_TID + "&TESTNUM=" + item.TESTNUM + "&CLASS_ID=" + item.CLASS_ID,
							noAnimation: true,
							replace: false
						});
					}
				},
				components: {
					'v-bar': vBar
				}
			});

			njyy_data.getResultsList(CURRENT_USER.USER_NAME, TEST_TYPE, function(data) {
				if(data.SystemCode == "1") {
					vm.resultslist = data.classList[0];

				} else {
					plus.nativeUI.toast("很抱歉,您所任课班级无最新考试列表!");
					return;
				}
			});

		});

		/**
		 * 页面: 教师版成绩表(所任课某班级学生列表)
		 * 创建: 沈 培
		 * 时间: 2017/01/15
		 */
		$DOCUMENT.on('pageInit', '#page-resultsStudents', function() {
			var gradeId = utils.getQueryString('gradeId');
			var ruleTid = utils.getQueryString('ruleTid');
			var TESTNUM = utils.getQueryString('TESTNUM');
			var CLASS_ID = utils.getQueryString('CLASS_ID');
			var vm = new Vue({
				el: '#page-resultsStudents',
				data: {
					stuList: [],
					items: [],
					show: false,
					goBack: ruleTid
				},
				methods: {
					stuItemClick: function(item) {
						if(ruleTid == undefined) {
							var stuId = item.STUDENT_ID;
							$.router.loadPage({
								url: "radarchart-comment.html?stuId=" + stuId,
								noAnimation: true,
								replace: false
							});
						} else {
							item.LEAVE_STATUS = 1;
							var userId = item.USER_ID;
							var stuId = item.STUDENT_ID;
							var TESTNUM = item.TESTNUM;
							var CLASS_ID = item.CLASS_ID;
							$.router.loadPage({
								url: "radarchart-tea.html?userId=" + userId + "&gradeId=" + gradeId + "&ruleTid=" + ruleTid + "&stuId=" + stuId + "&TESTNUM=" + TESTNUM + "&CLASS_ID=" + CLASS_ID,
								noAnimation: true,
								replace: false
							});
						}

					},
					statis: function() {
						$.router.loadPage({
							url: "radarchart-statis.html?TESTNUM=" + TESTNUM + "&CLASS_ID=" + CLASS_ID,
							noAnimation: true,
							replace: false
						});
					}
				},
				components: {
					'v-bar': vBar
				}
			});
			if(ruleTid == undefined) {
				vm.show = true;
				var result = JSON.parse(sessionStorage.getItem("studList"));
				vm.stuList = result;
			} else {
				njyy_data.getClassStuList(gradeId, function(data) {
					console.log(JSON.stringify(data))
					if(data.SystemCode == "1") {
						if(data.stuList == "") {
							plus.nativeUI.toast("很抱歉,该期成绩尚未录入");
							return;
						}
						vm.stuList = data.stuList;

					} else {
						plus.nativeUI.toast("很抱歉,此班级学生列表未能获取!");
						return;
					}
				});
			}
		});

		/**
		 * 页面: 教师版成绩表(所任课某班级某学生的成绩详情)
		 * 创建: 沈 培
		 * 时间: 2017/01/16
		 */
		$DOCUMENT.on('pageInit', '#page-radarchartTea', function() {
			var userId = utils.getQueryString('userId');
			var gradeId = utils.getQueryString('gradeId');
			var ruleTid = utils.getQueryString('ruleTid');
			var stuId = utils.getQueryString('stuId');
			var vm = new Vue({
				el: '#page-radarchartTea',
				data: {
					classname: "",
					stuname: "",
					stucode: "",
					suggest_content: [], //家长给任课教师留言内容
					flag: "",
					items: "",
					tesType:"",
					score:"",
					show:true
				},
				methods: {
					checkComent: function() {
						$.router.loadPage({
							url: "radarchart-comment.html?userId=" + userId + "&stuId=" + stuId,
							noAnimation: true,
							replace: false
						});
					}
				},
				components: {
					'v-bar': vBar
				}
			});
			njyy_data.getTestDetail(CURRENT_USER.ROLE, gradeId, userId, ruleTid, stuId, function(data) {
				console.log(JSON.stringify(data))
				vm.items = data.clist;
				vm.classname = data.CLASS_NAME;
				vm.stuname = data.STUDENT_NAME;
				vm.stucode = data.STU_CODE;
				vm.suggest_content = data.messages;
				vm.tesType="个人";
				vm.score=data.stuAvg;
				var classnum = data.class_test_Num; //班级参考人数
				var grade = data.gread_Num;
				var gradenum = data.test_Num;
				var score1_data = [];
				//var tip = $(".classscore li a.active").children("span").text();
				var rleave = []; //题目名称
				var scoreavg = []; //得分率
				var st = "#ff0000";
				var change_data = [];
				var personnal = [];
				var classal = [];
				var gradeal = [];
				for(var i = 0; i < data.clist.length; i++) {
					rleave.push({
						text: data.clist[i].LEAVE,
						max: data.clist[i].MAX
					});
					scoreavg.push(data.clist[i].EVE_SCORE);
				}
				var len = data.messages.length;
				if(len > 0) {
					vm.flag = true;
				} else {
					vm.flag = false;
				}

				$(".classscore li a").on('click', function(e) {
					e.preventDefault();
					$(this).addClass("active").siblings("a").removeClass("active");
					var tip = $(".classscore li a.active").children("span").text();
					scoreavg = []; //得分率
					personnal = [];
					classal = [];
					gradeal = [];
					var score_data = [];
					if(tip == "个人") {
						vm.show=true;
						vm.tesType="个人";
						vm.score=data.stuAvg;
						score_data = data.clist;
						vm.items = score_data;
						st = '#ff0000';
						clickScoreTab(score_data, tip);
						echarsScore(rleave, scoreavg, st);

					} else if(tip == "班级") {
						vm.show=true;
						vm.tesType="班级";
						vm.score=data.classAvg;
						score_data = data.classlist;
						vm.items = score_data;
						st = '#000000';
						clickScoreTab(score_data, tip);
						echarsScore(rleave, scoreavg, st);

					} else if(tip == "年级") {
						vm.show=true;
						vm.tesType="年级";
						vm.score=data.gradeAvg;
						score_data = data.gradelist;
						vm.items = score_data;
						st = '#0000ff';
						clickScoreTab(score_data, tip);
						echarsScore(rleave, scoreavg, st);
					} else if(tip == "对比") {
						vm.show=false;
						vm.items = "";
						change_data = [];
						change_data = change_data.concat(data.clist, data.classlist, data.gradelist);
						clickContrastTab(change_data);
						change(rleave, personnal, classal, gradeal);
					}
				});
				echarsScore(rleave, scoreavg, st);
				//对比
				function clickContrastTab(data) {
					for(var i = 0; i < data.length / 3; i++) {
						personnal.push(data[i].EVE_SCORE);
					}
					for(var i = data.length / 3; i < 2 * data.length / 3; i++) {
						classal.push(data[i].EVE_SCORE / classnum);
					}
					for(var i = 2 * data.length / 3; i < data.length; i++) {
						gradeal.push(data[i].EVE_SCORE / gradenum);
					}

				}

				function change(score, personal, classal, gradeal) {
					vm.$nextTick(function() {
						var option = {
							title: {
								text: ''
							},
							legend: {
								data: ['']
							},
							radar: [{
									indicator: score,
									center: ['50%', '50%'],
									radius: 80,
									startAngle: 90,
									splitNumber: 4,
									shape: 'circle',
									name: {
										formatter: '【{value}】',
										textStyle: {
											color: '#72ACD1'
										}
									},

								},

							],
							series: [{
								name: '雷达图',
								type: 'radar',
								data: [{
										value: personal,
										name: '成绩',
										lineStyle: {
											normal: {
												color: '#ff0000'
											}
										}

									},
									{
										value: classal,
										name: '成绩',
										lineStyle: {
											normal: {
												color: '#000000'
											}
										}

									},
									{
										value: gradeal,
										name: '成绩',
										lineStyle: {
											normal: {
												color: '#0000ff'
											}
										}

									}
								]
							}],
							animation: false //关闭动画
						};
						var myChart = echarts.init(document.getElementById('main'));
						myChart.setOption(option);
					});
				}

				function clickScoreTab(data, tip) {
					if(tip == "个人") {
						for(var i = 0; i < data.length; i++) {
							scoreavg.push(data[i].EVE_SCORE);
						}
					}
					if(tip == "班级") {
						for(var i = 0; i < data.length; i++) {
							scoreavg.push(data[i].EVE_SCORE / classnum);
						}
					}
					if(tip == "年级") {
						for(var i = 0; i < data.length; i++) {
							scoreavg.push(data[i].EVE_SCORE / gradenum);
						}
					}
				}

				function echarsScore(score, average, st) {
					vm.$nextTick(function() {
						var option = {
							title: {
								text: ''
							},
							legend: {
								data: ['']
							},
							radar: [{
									indicator: score,
									center: ['50%', '50%'],
									radius: 80,
									startAngle: 90,
									splitNumber: 4,
									shape: 'circle',
									name: {
										formatter: '【{value}】',
										textStyle: {
											color: '#72ACD1'
										}
									},
									splitArea: {
										areaStyle: {
											color: ['rgb(255, 255, 255)',
												'rgb(255, 255, 255)', 'rgb(255, 255, 255)',
												'rgb(255, 255, 255)', 'rgb(255, 255, 255)'
											],
											shadowColor: 'rgb(255, 255, 255)',
											shadowBlur: 10
										}
									},
									axisLine: {
										lineStyle: {
											color: 'rgb(219, 219, 219)'
										}
									},
									splitLine: {
										lineStyle: {
											color: 'rgb(219, 219, 219)'
										}
									}
								},

							],
							series: [{
								name: '雷达图',
								type: 'radar',
								data: [

									{
										value: average,
										name: '成绩',

										lineStyle: {
											normal: {
												color: st,
											}
										},
										itemStyle: {
											normal: {
												color: "#72ACD1"
											}
										}
									}
								]
							}],
							animation: false //关闭动画
						};
						var myChart = echarts.init(document.getElementById('main'));
						myChart.setOption(option);
					});
				}

			});
			$('input[type="text"],textarea').on('click', function() {
				var target = this;
				setTimeout(function() {
					target.scrollIntoViewIfNeeded();
					console.log('scrollIntoViewIfNeeded');
				}, 400);
			});
			$("#suggest_but_sure").click(function() {
				var suggestD = $("#suggest_val").val();
				for(var i = 0; i < suggestD.length; i++) {
					var hs = suggestD.charCodeAt(i);
					if(0xd800 <= hs && hs <= 0xdbff) {
						if(suggestD.length > 1) {
							var ls = suggestD.charCodeAt(i + 1);
							var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
							if(0x1d000 <= uc && uc <= 0x1f77f) {
								plus.nativeUI.toast("不能输入emoji表情!");
								return;
							}
						}
					} else if(suggestD.length > 1) {
						var ls = suggestD.charCodeAt(i + 1);
						if(ls == 0x20e3) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						}
					} else {
						if(0x2100 <= hs && hs <= 0x27ff) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						} else if(0x2B05 <= hs && hs <= 0x2b07) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						} else if(0x2934 <= hs && hs <= 0x2935) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						} else if(0x3297 <= hs && hs <= 0x3299) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						} else if(hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030 ||
							hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b ||
							hs == 0x2b50) {
							plus.nativeUI.toast("不能输入emoji表情!");
							return;
						}
					}
				}
				if(suggestD == "" || $.trim(suggestD) == "") {
					plus.nativeUI.toast('发布内容不能为空');
					return;
				}
				var usertype = "1";
				njyy_data.setCourseSuggest(suggestD, gradeId, CURRENT_USER.USER_ID, usertype, stuId, function(data) {
					if(data.SystemCode == "1") {
						njyy_data.getTestDetail(CURRENT_USER.ROLE, gradeId, userId, ruleTid, stuId, function(data) {
							var len = data.messages.length;
							if(len > 0) {
								vm.flag = true;
							} else {
								vm.flag = false;
							}
							vm.suggest_content = data.messages;
						});

					} else {
						plus.nativeUI.toast("很抱歉,留言失败!");
						return;
					}
				});

				$("#suggest_val").val("");
			});

		});
		/**
		 * 页面: 查看学生评价
		 * 创建: 李路丹
		 * 时间: 2017/01/16
		 */
		$DOCUMENT.on('pageInit', '#page-radarchartComment', function() {
			var starNum;
			var starTotal;
			var userId = CURRENT_USER.USER_ID;
			var stuId = utils.getQueryString('stuId');
			var time = [];
			var starNum;
			var totalStar = [];
			var totalNum;
			var total = 0;
			var dataList;
			var selectDate="";
			var vm = new Vue({
				el: '#page-radarchartComment',
				data: {
					disList: [],
					show: true
				},
				methods: {
					publish: function() {
						if(selectDate==""){
							$.router.loadPage({
							url: "comment-detail.html?userId=" + userId + "&stuId=" + stuId + "&starNum=" + starNum,
							noAnimation: true,
							replace: false
						});
						}else if(selectDate===nowData){
							$.router.loadPage({
							url: "comment-detail.html?userId=" + userId + "&stuId=" + stuId + "&starNum=" + starNum,
							noAnimation: true,
							replace: false
						});
						}else{
							plus.nativeUI.toast("只能新增当前月份评价");
							return;
						}
						
					}
				},
				components: {
					'v-bar': vBar
				}
			})
			var today = new Date(); //获取系统当前时间
			var year = today.getFullYear();
			var month = today.getMonth()+1;
			var nowData=year+"-"+month;
			console.log(nowData);
			$("#search").picker({
				toolbarTemplate: '<header class="bar bar-nav">\
			  <button class="button button-link pull-left">取消</button>\
			  <button class="button button-link pull-right close-picker">确定</button>\
			  <h1 class="title">评价时间</h1>\
			  </header>',
				value: [today.getMonth()+1, today.getFullYear()],
				formatValue: function(p, values, displayValues) {
					year = values[1];
					month = values[0];
					selectDate=values[1]+"-"+values[0]
					console.log(selectDate);
					njyy_data.radarchartCommentDetail(userId, stuId, year, month, function(data) {
						if(data.SystemCode == 1) {
							vm.show = true;
							totalStar = [];
							starTotal = "";
							time=[];
							dataList = data.INFO;
							vm.disList = data.INFO[0];
							starTotal = data.INFO[0].length * 5;
							starNum = data.INFO.length;
							console.log(starNum)
							for(var i = 0; i < data.INFO.length; i++) {
								totalNum = data.INFO[i];
								for(var a = 0; a < totalNum.length; a++) {
									var num = totalNum[a].START_NUM;
									total = total + num;
								}
								totalStar.push(total);
								time.push(i + 1);
								total = 0;
							}
							changes (time ,starTotal,totalStar )
						} else {
							vm.show = false;
							vm.disList = "";
							plus.nativeUI.toast("没有评价记录");
						}
					})
					return displayValues[0] + " " + values[1];
				},
				cols: [
					// Months
					{
						values: ('1 2 3 4 5 6 7 8 9 10 11 12').split(' '),
						displayValues: ('一月 二月 三月 四月 五月 六月 七月 八月 九月 十月 十一月 十二月').split(' '),
						textAlign: 'left'
					},
					// Years
					{
						values: (function() {
							var arr = [];
							for(var i = 1950; i <= 2030; i++) {
								arr.push(i);
							}
							return arr;
						})(),
					}
				]
			});
			njyy_data.radarchartCommentDetail(userId, stuId, year, month, function(data) {
				console.log(JSON.stringify(data))
				if(data.SystemCode == 1) {
					dataList = data.INFO;
					vm.disList = data.INFO[0];
					starTotal = data.INFO[0].length * 5;
					starNum = data.INFO.length;
					console.log(starNum)
					for(var i = 0; i < data.INFO.length; i++) {
						totalNum = data.INFO[i];
						for(var a = 0; a < totalNum.length; a++) {
							var num = totalNum[a].START_NUM;
							total = total + num;
						}
						totalStar.push(total);
						time.push(i + 1);
						total = 0;
					}
					changes(time ,starTotal,totalStar );
				} else {
					vm.show = false;
					vm.disList = "";
					plus.nativeUI.toast("没有评价记录");
				}
			})
			function changes (time ,starTotal,totalStar ){
				console.log(time)
			vm.$nextTick(function() {
				var option = {
					title: {
						text: ''
					},
					tooltip: {
						trigger: 'axis'
					},
					legend: {
						data: ['星星总数']
					},
					grid: {
						width: '85%',
						height: '70%',
						top: '15%',
						left: '10%',
						right: '15%',
						bottom: 'center'
					},
					xAxis: {
						type: 'category',
						boundaryGap: true,
						data: time,
						axisLabel: {
							clickable: true
						}
					},
					yAxis: {
						type: 'value',
						max: starTotal
					},
					series: [{
						name: '星星总数',
						type: 'bar',
						barMaxWidth: 30, //最大宽度
						data: totalStar
						/*data: vm.linescore*/
					}],
					animation: false //关闭动画
				};
				var myChart = echarts.init(document.getElementById('mainw'));
				myChart.setOption(option);
				myChart.on('click', function(params) {
					var num1 = params.name - 1;
					vm.disList = dataList[num1];
				});
			})
			}
		})
		/**
		 * 页面: 新增评价
		 * 创建: 李路丹
		 * 时间: 2017/01/16
		 */
		$DOCUMENT.on('pageInit', '#comment-detail', function() {
			var starNum = utils.getQueryString('starNum');
			var stuId = utils.getQueryString('stuId');
			var NUM;
			var num = 0;
			var arr = new Array();
			var vm = new Vue({
				el: '#comment-detail',
				data: {
					disList: [],
				},
				methods: {
					publish: function() {
						if(starNum >= 10) {
							plus.nativeUI.toast("您的评价已经超过10次,超过评价上限");
							return;
						}
						for(var i = 0; i < arr.length; i++) {
							var totalNum = arr[i].NUM;
							if(totalNum == 0) {
								plus.nativeUI.toast("每个评价选项至少有一颗星");
								return
							}
						}
						njyy_data.publish(arr, CURRENT_USER.USER_ID, stuId, function(data) {
							if(data.SystemCode == "1") {
								plus.nativeUI.toast("新增评价成功");
								$.router.replacePage({
									url: "radarchart-comment.html?stuId=" + stuId,
									noAnimation: true,
									replace: false
								});
							} else {
								plus.nativeUI.toast("请求出错");
								return;
							}
						})
					},
					initEvent: function(item, index) {
						initEvent(item, index);
					}
				},
				components: {
					'v-bar': vBar
				}
			});

			function ObjStory(ID, NAME, NUM) //声明对象
			{
				this.ID = ID
				this.NAME = NAME;
				this.NUM = NUM;
			}
			njyy_data.radarchartComment(function(data) {
				NUM = data.disList.length;
				vm.disList = data.disList;
				for(var i = 0; i < data.disList.length; i++) {
					var ID = data.disList[i].ID;
					var NAME = data.disList[i].NAME;
					var NUM = 0;
					var writer = new ObjStory(ID, NAME, NUM);
					arr.push(writer);
				}
			})
			var isclick = false;

			function change(mydivid, num, item) {
				if(!isclick) {
					var tds = $("#" + mydivid + " ul li");
					for(var i = 0; i < num; i++) {
						var td = tds[i];
						$(td).find("img").attr("src", "assets/img/evaluate/star_on.png");
					}
					var tindex = $("#" + mydivid).attr("currentIndex");
					tindex = tindex == 0 ? 0 : tindex + 1;
					for(var j = num; j < tindex; j++) {
						var td = tds[j];
						$(td).find("img").attr("src", "assets/img/evaluate/star_off.png");
					}
					$("#" + mydivid).attr("currentIndex", num);
					item.NUM = num;
					var id = mydivid; //要删除的id
					var newArr = arr.filter(function(obj) {
						return id !== obj.ID;
					});
					arr = [];
					newArr.push(item);
					arr = newArr;
				}
			}

			function repeal(mydivid, num) {
				if(!isclick) {
					var tds = $("#" + mydivid + " ul li");
					var tindex = $("#" + mydivid).attr("currentIndex");
					tindex = tindex == 0 ? 0 : tindex + 1;
					for(var i = tindex; i < num; i++) {
						var td = tds[i];
						$(td).find("img").attr("src", "assets/img/star_on.png");
					}
					$("#" + mydivid).attr("currentIndex", num);
				}
			}

			function change1(mydivid, num, item) {
				if(!isclick) {
					change(mydivid, num, item);

				} else {
					alert("Sorry,You had clicked me!");
				}
			}

			function initEvent(item, index) {
				var mydivid = item.ID;
				var tds = $("#" + mydivid + " ul li");
				for(var i = 0; i < tds.length; i++) {
					var td = tds[i];
					$(td).on('click', function() {
						var num = $(this).attr("num");
						change1(mydivid, num, item);
					});
				}
			}

		})
		/**
		 *页面：单次测试详细
		 *事件:页面加载
		 *创建/修改:王乐乐
		 *时间：2016/11/30 
		 */
		$DOCUMENT.on('pageInit', '#page-radarchart', function() {
			var stuId = CURRENT_USER.CHILDREN.STUDENT_ID;
			var username = CURRENT_USER.USER_NAME;
			var usertype = CURRENT_USER.USER_TYPE;
			var kmid = utils.getQueryString("kmid");
			var subject = utils.getQueryString("subject"); //科目id
			var gradeId = utils.getQueryString("gradeId"); //测试id

			var vm = new Vue({
				el: '#page-radarchart',
				data: {
					allradarsocre: [], //测试详细数据
					radaraverage: [], //得分率
					radarscore: [], //题目名称
					rc: [],
					stuname: [], //学生姓名
					stucode: [], //学号
					classname: [], //班级名称
					stu_name: "",
					suggest_content: [], //家长给任课教师留言内容
					flag: ""

				},
				methods: {
					DelSuggest: function(content) {
						njyy_data.DelCourseSuggest(content, function(data) {
							if(data.SystemCode == "1") {
								vm.suggest_content.$remove(content);
								var nowlen = $('.suggest-font').length - 1;
								if(nowlen == 0) {
									vm.flag = false;
								}

							} else {
								plus.nativeUI.toast('很抱歉,留言删除失败!');
								return;
							}
						});
					}
				},
				components: {
					'v-bar': vBar
				}

			});
			$('input[type="text"],textarea').on('click', function() {
				var target = this;
				setTimeout(function() {
					target.scrollIntoViewIfNeeded();
					console.log('scrollIntoViewIfNeeded');
				}, 400);
			});
			//获取测试详细数据
			njyy_data.getTestDetail(CURRENT_USER.ROLE, gradeId, CURRENT_USER.USER_ID, subject, stuId, function(data) {
				console.log(JSON.stringify(data))
				var classnum = data.class_test_Num;
				var gradenum = data.test_Num;
				var tip = $(".classscore li a.active").children("span").text();
				var st = "#ff0000";
				var change_data = [];
				var personnal = [];
				var classal = [];
				var gradeal = [];
				var rleave = []; //题目名称
				var scoreavg = []; //得分率
				for(var i = 0; i < data.clist.length; i++) {
					rleave.push({
						text: data.clist[i].LEAVE,
						max: data.clist[i].MAX
					});
					scoreavg.push(data.clist[i].EVE_SCORE);
				}
				vm.stuname = data.STUDENT_NAME;
				vm.stucode = data.STU_CODE;
				vm.classname = data.CLASS_NAME;
				vm.rc = data.gr;
				vm.allradarsocre = data.clist;

				vm.stu_name = data.STUDENT_NAME;
				vm.suggest_content = data.messages;
				var len = data.messages.length;
				if(len > 0) {
					vm.flag = true;
				} else {
					vm.flag = false;
				}

				$(".classscore li a").on('click', function(e) {
					e.preventDefault();
					$(this).addClass("active").siblings("a").removeClass("active");
					var tip = $(".classscore li a.active").children("span").text();
					scoreavg = []; //得分率
					personnal = [];
					classal = [];
					gradeal = [];
					var score_data = [];
					if(tip == "个人") {
						score_data = data.clist;
						st = '#ff0000';
						clickScoreTab(score_data, tip);
						echarsScore(rleave, scoreavg, st);

					} else if(tip == "班级") {
						score_data = data.classlist;
						st = '#000000';
						clickScoreTab(score_data, tip);
						echarsScore(rleave, scoreavg, st);

					} else if(tip == "年级") {
						score_data = data.gradelist;
						st = '#0000ff';
						clickScoreTab(score_data, tip);
						echarsScore(rleave, scoreavg, st);
					} else if(tip == "对比") {
						change_data = [];
						change_data = change_data.concat(data.clist, data.classlist, data.gradelist);
						clickContrastTab(change_data);
						change(rleave, personnal, classal, gradeal);
					}
				});
				echarsScore(rleave, scoreavg, st);
				//对比
				function clickContrastTab(data) {
					for(var i = 0; i < data.length / 3; i++) {
						personnal.push(data[i].EVE_SCORE);
					}
					for(var i = data.length / 3; i < 2 * data.length / 3; i++) {
						classal.push(data[i].EVE_SCORE / classnum);
					}
					for(var i = 2 * data.length / 3; i < data.length; i++) {
						gradeal.push(data[i].EVE_SCORE / gradenum);
					}

				}

				function change(score, personal, classal, gradeal) {
					vm.$nextTick(function() {
						var option = {
							title: {
								text: ''
							},
							legend: {
								data: ['']
							},
							radar: [{
									indicator: score,
									center: ['50%', '50%'],
									radius: 80,
									startAngle: 90,
									splitNumber: 4,
									shape: 'circle',
									name: {
										formatter: '【{value}】',
										textStyle: {
											color: '#72ACD1'
										}
									},

								},

							],
							series: [{
								name: '雷达图',
								type: 'radar',
								data: [

									{
										value: personal,
										name: '成绩',
										lineStyle: {
											normal: {
												color: '#ff0000'
											}
										}

									},
									{
										value: classal,
										name: '成绩',
										lineStyle: {
											normal: {
												color: '#000000'
											}
										}

									},
									{
										value: gradeal,
										name: '成绩',
										lineStyle: {
											normal: {
												color: '#0000ff'
											}
										}

									}
								]
							}],
							animation: false //关闭动画
						};
						var myChart = echarts.init(document.getElementById('main'));
						myChart.setOption(option);
					});
				}

				function clickScoreTab(data, tip) {
					if(tip == "个人") {
						for(var i = 0; i < data.length; i++) {
							scoreavg.push(data[i].EVE_SCORE);
						}
					}
					if(tip == "班级") {
						for(var i = 0; i < data.length; i++) {
							scoreavg.push(data[i].EVE_SCORE / classnum);
						}
					}
					if(tip == "年级") {
						for(var i = 0; i < data.length; i++) {
							scoreavg.push(data[i].EVE_SCORE / gradenum);
						}
					}
				}

				function echarsScore(score, average, st) {
					vm.$nextTick(function() {
						var option = {
							title: {
								text: ''
							},
							legend: {
								data: ['']
							},
							radar: [{
									indicator: score,
									center: ['50%', '50%'],
									radius: 80,
									startAngle: 90,
									splitNumber: 4,
									shape: 'circle',
									name: {
										formatter: '【{value}】',
										textStyle: {
											color: '#72ACD1'
										}
									},
									splitArea: {
										areaStyle: {
											color: ['rgb(255, 255, 255)',
												'rgb(255, 255, 255)', 'rgb(255, 255, 255)',
												'rgb(255, 255, 255)', 'rgb(255, 255, 255)'
											],
											shadowColor: 'rgb(255, 255, 255)',
											shadowBlur: 10
										}
									},
									axisLine: {
										lineStyle: {
											color: 'rgb(219, 219, 219)'
										}
									},
									splitLine: {
										lineStyle: {
											color: 'rgb(219, 219, 219)'
										}
									}
								},

							],
							series: [{
								name: '雷达图',
								type: 'radar',
								data: [

									{
										value: average,
										name: '成绩',

										lineStyle: {
											normal: {
												color: st,
											}
										},
										itemStyle: {
											normal: {
												color: "#72ACD1"
											}
										}
									}
								]
							}],
							animation: false //关闭动画
						};
						var myChart = echarts.init(document.getElementById('main'));
						myChart.setOption(option);
					});
				}

			});

			$("#suggest_but_sure").click(function() {
				var suggestD = $("#suggest_val").val();
				if(suggestD == "" || $.trim(suggestD) == "") {
					plus.nativeUI.toast('发布内容不能为空');
					return;
				}
				var usertype = "2";
				njyy_data.setCourseSuggest(suggestD, gradeId, CURRENT_USER.USER_ID, usertype, stuId, function(data) {
					if(data.SystemCode == "1") {

						njyy_data.getTestDetail(CURRENT_USER.ROLE, gradeId, CURRENT_USER.USER_ID, subject, stuId, function(data) {
							var len = data.messages.length;
							if(len > 0) {
								vm.flag = true;
							} else {
								vm.flag = false;
							}
							vm.stu_name = data.STUDENT_NAME;
							vm.suggest_content = data.messages;
						});

					} else {
						plus.nativeUI.toast("很抱歉,留言失败!");
						return;
					}

				});

				$("#suggest_val").val("");
			});

		});
		//学生课表
		$DOCUMENT.on('pageInit', '#classtable', function() {
			var classId = CURRENT_USER.CHILDREN.CLASS_ID;
			var vm = new Vue({
				el: '#classtable',
				data: {
					classtablemlist: [],
					classtablealist: [],
					classname: {}
				},
				components: {
					'v-bar': vBar
				}
			});
			njyy_data.ClassTable(classId, function(data) {
				vm.classtablemlist = data.Morning;
				vm.classtablealist = data.Afternoon;
				vm.classname = data.className;

			});
		});
		//教师课表
		$DOCUMENT.on('pageInit', '#teachertable', function() {
			var userId = CURRENT_USER.USER_ID;
			var vm = new Vue({
				el: '#teachertable',
				data: {
					teachertablemlist: [],
					teachertablealist: [],
					teacher: {}
				},
				components: {
					'v-bar': vBar
				}
			});
			njyy_data.teacherTable(userId, function(data) {
				vm.teachertablemlist = data.Morning;
				vm.teachertablealist = data.Afternoon;
				vm.teacher = data.teacher;

			});
		});
		//学生请假列表
		$DOCUMENT.on('pageInit', '#page-list-vacate', function() {
			var userId = CURRENT_USER.USER_ID;
			var vm = new Vue({
				el: '#page-list-vacate',
				data: {
					teachertablemlist: [],
				},
				components: {
					'v-bar': vBar
				}
			});
			njyy_data.teacherTable(userId, function(data) {
				vm.teachertablemlist = data.Morning;
				vm.teachertablealist = data.Afternoon;
				vm.teacher = data.teacher;

			});
		});
		//学生考试类型
		$DOCUMENT.on('pageInit', '#test-type', function() {
			var userId = CURRENT_USER.USER_ID;
			var vm = new Vue({
				el: '#test-type',
				data: {
					items: []
				},
				methods: {
					testListClick: function(TEST_TYPE) {
						$.router.loadPage({
							url: "resultsList.html?TEST_TYPE=" + TEST_TYPE,
							noAnimation: true,
							replace: false
						});
					}
				},
				components: {
					'v-bar': vBar
				}
			});
			njyy_data.testType(userId, function(data) {
				if(data.SystemCode == 1) {
					vm.items = data.TYPE_LIST
				} else {
					plus.nativeUI.toast("没有测试记录!");
				}

			});
		});
		//学生考试分析
		$DOCUMENT.on('pageInit', '#radarchart-statis', function() {
			var userId = CURRENT_USER.USER_ID;
			var TESTNUM = utils.getQueryString('TESTNUM');
			var CLASS_ID = utils.getQueryString('CLASS_ID');
			var vm = new Vue({
				el: '#radarchart-statis',
				data: {
					items: [],
					itemsTotal: "",
					show: true,
					showDetail: false
				},
				components: {
					'v-bar': vBar
				}
			});
			njyy_data.findAllTextList(TESTNUM, CLASS_ID, function(data) {
				vm.items = data.roleList;
				vm.itemsTotal = data.classSumAvg[0];
			});
			document.getElementById('statis').onchange = function() {
				var num = this.options[this.options.selectedIndex].value;
				if(num == 1) {
					vm.show == true ? vm.show = false : vm.show = true;
					vm.showDetail == false ? vm.showDetail = true : vm.showDetail = false;
				} else {
					vm.show == true ? vm.show = false : vm.show = true;
					vm.showDetail == false ? vm.showDetail = true : vm.showDetail = false;
				}
			}
		});
		/*学生请假详情页*/
		$DOCUMENT.on('pageInit', '#page-vacation-information', function(e, id, page) {
			var status = utils.getQueryString("status");
			var pageId = utils.getQueryString('pageId');
			var md5 = utils.getQueryString('id');
			var vm = new Vue({
				el: '#page-vacation-information',
				data: {
					vacation: [],
					status: status
				},
				methods: {
					MD5: function() {
						njyy_data.getupdate(md5, function(data) {
							if(data.SystemCode == 1) {
								plus.nativeUI.toast('确认成功');
								if(pageId == 0) {
									$.router.loadPage({
										url: "message-list.html",
										noAnimation: true,
										replace: true
									});
								} else {
									$.router.loadPage({
										url: "page-vacationlist.html",
										noAnimation: true,
										replace: true
									});
								}

							} else {
								plus.nativeUI.toast('确认失败');
							}
						});
					}
				},
				components: {
					'v-bar': vBar
				}
			});
			//获取详情
			njyy_data.getVacationDetail(md5, function(data) {
				if(data.SystemCode == 1) {
					vm.vacation = data;
				} else if(data.SystemCode == 10001) {
					plus.nativeUI.toast('没有记录');
				} else {
					plus.nativeUI.toast('请求出错');
				}
			});
		})
		/*教师查看学生列表*/
		$DOCUMENT.on('pageInit', '#class-list', function(e, id, page) {
			var vm = new Vue({
				el: '#class-list',
				data: {
					vacation: [],
					status: status,
					items: []
				},
				methods: {
					MD5: function(studList) {
						sessionStorage.setItem("studList", JSON.stringify(studList));
						$.router.loadPage({
							url: "resultsStudents.html",
							noAnimation: true,
							replace: true
						});
					}
				},
				components: {
					'v-bar': vBar
				}
			});
			//获取详情
			njyy_data.getStudentList(CURRENT_USER.USER_ID, function(data) {
				console.log(JSON.stringify(data.SystemCode))
				if(data.SystemCode == "1") {
					vm.items = data.STUDENT_LIST;

				} else {
					plus.nativeUI.toast("很抱歉,此班级学生列表未能获取!");
					return;
				}
			});
		})
		$.init(); //页面初始化
	})
}