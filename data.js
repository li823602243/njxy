/**
 *数据接口
 *说明：封装调用接口与数据处理的方法
 *创建/修改：左武洲
 *时间：2016/5/31 11:07
 */
'use strict'
window.njyy_data = {
	HOST: njyy_config_host,
	/**
	 *方法：获取校园圈子
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：圈子json数据
	 *创建/修改：刘有
	 *时间：2016/6/14 10:43
	 */
	getSchool: function(callBack, url) {
		url = url || "/client/message/listPage?currentPage=1";
		url = this.HOST + url;
		/*$.ajaxSettings.async = false;*/
		$.getJSON(url, function(data) {
			console.log(JSON.stringify(data))
			callBack(data);
		});
	},
	/**
	 *方法：获取校园风光
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：圈子json数据
	 *创建/修改：刘有
	 *时间：2016/6/15 16:00
	 */
	getSurroundings: function(callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/pictures/list",
			contentType: "json",
		/*	async: false,*/
			error: function() {
				plus.nativeUI.toast('请求出错');
			},
			success: function(data) {
				callBack(data.varList);
			}
		})
	},
	/**
	 *方法：获取班级圈子
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：圈子json数据
	 *创建/修改：刘有
	 *时间：2016/6/14 15:06
	 */
	getClassCircleList: function(userId, classId, callBack, url) {
		url = url || "/client/messageClass/listPage?currentPage=1";
		$.ajax({
			type: "get",
			url: this.HOST + url,
			data: {
				userId: userId,
				CLASS_ID: classId
			},
			/*async: false,*/
			error: function() {
				plus.nativeUI.toast('请求出错');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	/**
	 *方法：获取公告列表
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：公告列表json数据
	 *创建/修改：李路丹
	 *时间：2016/6/13 15:45
	 */
	getNotice: function(callBack, url) {
		url = url || "/client/notice/listPage?currentPage=1&NO_RANGE=1";
		url = this.HOST + url;
		$.ajaxSettings.async = false;///同步执行
		$.getJSON(url, function(data) {
			callBack(data);
		});
	},
	/**
	 *方法：获取公告详情
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：公告列表json数据
	 *创建/修改：李路丹
	 *时间：2016/6/13 15:45
	 */
	getNoticeDetail: function(id, callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/notice/findNoticeDetail",
			contentType: "json",
			data: {
				'NO_ID': id
			},
			/*async: false,*/
			error: function() {
				plus.nativeUI.toast('请求出错');
			},

			success: function(data) {
				callBack(data.notice);
			}
		});
	},

	/**
	 *方法：获取消息列表
	 *方式:GET
	 *参数：url:url;callBack:回调方法
	 *返回值：消息列表json
	 *创建/修改：左武洲
	 *时间：2016/6/21 14:00
	 */
	getMessageList: function(userId, callBack, url) {
		url = url || "/client/remind/listPage";
		var data = url === "/client/remind/listPage" ? {
			currentPage: 1,
			receiveId: userId
		} : {};
		$.ajax({
			type: "get",
			url: this.HOST + url,
			data: data,
			/*async: false,*/
			error: function() {
				plus.nativeUI.toast('请求出错');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	/**
	 *方法：删除消息
	 *方式:GET
	 *参数：url:url;callBack:回调方法
	 *返回值：systemCode 0 失败 1成功
	 *创建/修改：左武洲
	 *时间：2016/6/21 14:00
	 */
	deleteMessage: function(md5, callBack) {
		$.getJSON(this.HOST + "/client/remind/hideRemind", {
			md5Code: md5
		}, function(data) {
			callBack(data);
		});
	},
	/**
	*方法：获取校园投票列表
	*方式:GET
	*参数：url:url;callBack:回调方法
	*返回值：消息列表json
	*创建/修改：李路丹
	*时间：2016/6/21 14:00
	*/
	getSchoolList:function(callBack,url){
		url=url||"/client/vote/listPage?currentPage=1&ranageNum=2";
		url=this.HOST+url;
		/* $.ajaxSettings.async = false;*/
		 $.getJSON(url,function(data){
		 		console.log(JSON.stringify(data))
                callBack(data);
      });
	},
	/**
	 *方法：获取投票详情页面
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：公告列表json数据
	 *创建/修改：李路丹
	 *时间：2016/6/13 15:45
	 */
	getVoteDetail: function(id, userId, callBack) {
		jQuery.support.cors = true; //查询数据
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/vote/findById",
			async: false,
			contentType: "json",
			data: {
				'voteId': id,
				'userId': userId
			},
			success: function(data) {
				callBack(data.vlist[0], data.isHave);
			}
		});
	},
	/**
	 *方法：修改密码
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：1004  密码错误 1 修改成功 0 失败
	 *创建/修改：左武洲
	 *时间：2016/8/1
	 */
	updatePassword: function(userId, oldPassword, newPassword, roleId, callBack) {
		$.ajax({
			type: "get",
			url: this.HOST + "/client/login/updatePassword",
			data: {
				userId: userId,
				passWord: oldPassword,
				newPassWord: newPassword,
				roleId: roleId
			},
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	/**
	 *方法：学生请假完成列表
	 *方式:GET
	 *参数：url:url;callBack:回调方法
	 *返回值：请假列表json
	 *创建/修改：左武洲
	 *时间：2016/8/2 11:00
	 */
	getVacation: function(PHONE, callBack, url) {
		url = url || "/client/vacate/StuListPage";
		var data = url === "/client/vacate/StuListPage" ? {
			currentPage: 1,
			STUCODE: PHONE,
			STATUS: 1
		} : {};
		$.ajax({
			type: "get",
			url: this.HOST + url,
			data: data,
			async: false,
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	/**
	 *方法：获取学生请假代办列表
	 *方式:GET
	 *参数：url:url;callBack:回调方法
	 *返回值：报修列表json
	 *创建/修改：左武洲
	 *时间：2016/8/2 11:00
	 */
	getwait: function(PHONE, callBack, url) {
		url = url || "/client/vacate/StuListPage";
		var data = url === "/client/vacate/StuListPage" ? {
			currentPage: 1,
			STUCODE: PHONE,
			STATUS: 0
		} : {};
		$.ajax({
			type: "get",
			url: this.HOST + url,
			data: data,
			async: false,
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success:function(data){
				console.log("请假-我的代办："+JSON.stringify(data))
				callBack(data);
			}
		});
	},
	/**
	 *方法：教师查看学生请假列表完成
	 *方式:GET
	 *参数：url:url;callBack:回调方法
	 *返回值：请假列表json
	 *创建/修改：左武洲
	 *时间：2016/8/2 11:00
	 */
	getVacationList: function(PHONE, callBack, url) {
		url = url || "/client/vacate/listPage";
		var data = url === "/client/vacate/listPage" ? {
			currentPage: 1,
			PHONE: PHONE,
			STATUS: 1
		} : {};
		$.ajax({
			type: "get",
			url: this.HOST + url,
			data: data,
			async: false,
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	/**
	 *方法：教师查看学生请假列表代办
	 *方式:GET
	 *参数：url:url;callBack:回调方法
	 *返回值：报修列表json
	 *创建/修改：左武洲
	 *时间：2016/8/2 11:00
	 */
	getwaitList: function(PHONE, callBack, url) {
		url = url || "/client/vacate/listPage";
		var data = url === "/client/vacate/listPage" ? {
			currentPage: 1,
			PHONE: PHONE,
			STATUS: 0
		} : {};
		$.ajax({
			type: "get",
			url: this.HOST + url,
			data: data,
			async: false,
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	/**
	 *方法：获取请假详情
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：请假json
	 *创建/修改：王乐乐
	 *时间：2016/12/2 
	 */
	getVacationDetail: function(md5, callBack) {
		$.ajax({
			type: "get",
			url: this.HOST + "/client/vacate/findDetailVacate",
			data: {
				md5Code: md5

			},
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {

				callBack(data);
			}
		});
	},

	/**
	 *方法：老师审批学生请假
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：请假json
	 *创建/修改：王乐乐
	 *时间：2016/12/2 
	 */
	getupdate: function(md5, callBack) {
		$.ajax({
			type: "get",
			url: this.HOST + "/client/vacate/updateById",
			data: {
				STATUS: 1,
				md5Code: md5

			},
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {

				callBack(data);
			}
		});
	},
	/**
	 *方法：手势登录
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：请假json
	 *创建/修改：左武洲
	 *时间：2016/8/4 11:00
	 */
	gestureLogin: function(userName, gPassword, scallBack, ecallBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/login/userLogin",
			data: {
				"USERNAME": userName,
				"G_PASSWORD": gPassword
			},
			error: function() {
				plus.nativeUI.toast('请求失败');
				ecallBack();
			},
			success: function(data) {
				scallBack(data);
			}
		});
	},
	/**
	 *方法：修改手势密码
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：1004  密码错误 1 修改成功 0 失败
	 *创建/修改：左武洲
	 *时间：2016/8/4
	 */
	updateGesturePassword: function(userId, newGPassword, scallBack, ecallBack) {
		$.ajax({
			type: "get",
			url: this.HOST + "/client/login/updatePassword",
			data: {
				userId: userId,
				newGPassWord: newGPassword
			},
			error: function() {
				plus.nativeUI.toast('请求失败');
				ecallBack();
			},
			success: function(data) {
				scallBack(data);
			}
		});
	},

	/**
	 *方法：发布班级圈
	 *方式:POST
	 *参数：callBack:回调方法
	 *返回值：
	 *创建/修改：左武洲
	 *时间：2016/8/12
	 */
	addClassMessage: function(content, userId, classId, path, pictureId, callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/messageClass/addMessageClass",
			data: {
				CLA_CONTENT: content,
				NAME_ID: userId,
				CLASS_ID: classId,
				PATH: path,
				PICTURE_ID: pictureId
			},
			error: function() {
				plus.nativeUI.toast("请求出错");
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	/**
	 *方法：修改默认孩子
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：
	 *创建/修改：左武洲
	 *时间：2016/8/12
	 */
	updateSeletedChild: function(parentId, studentId, callBack) {
		$.ajax({
			type: "get",
			url: this.HOST + "/client/rel/modifyPS",
			data: {
				parentId: parentId,
				studentId: studentId
			},
			error: function() {
				plus.nativeUI.toast("请求出错");
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	/**
	 *方法：登录数据接口
	 *方式:POST
	 *参数：callBack:回调方法
	 *返回值：1004  密码错误 1 提交成功 0 失败
	 *创建/修改：王书静/李路丹
	 *时间：2016/8/12
	 */
	postLogin: function(user, callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/login/userLogin",
			data: user,
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	/**
	 *方法：投票提交
	 *方式:POST
	 *参数：callBack:回调方法
	 *返回值：1004  密码错误 1 提交成功 0 失败
	 *创建/修改：李路丹/李路丹
	 *时间：2016/8/12
	 */
	postVote: function(dt, callBack) {
		jQuery.support.cors = true;
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/vote/addVote",
			data: dt,
			async: false,
			contentType: false,
			processData: false,
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	/**
	 *方法：点赞
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：
	 *创建/修改：左武洲
	 *时间：2016/8/12
	 */
	pushCircle: function(userId, circleId, callBack) {
		$.ajax({
			type: "get",
			url: this.HOST + "/client/messageClass/addPositive",
			data: {
				CLA_ID: circleId,
				POS_NAME_ID: userId,
			},
			error: function() {
				plus.nativeUI.toast("点赞失败");
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	/**
	 *方法：评论
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：
	 *创建/修改：左武洲
	 *时间：2016/8/12
	 */
	makeComment: function(userId, circleId, content, callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/comment/addComment",
			data: {
				COM_CONTENT: content,
				CRITIC_ID: userId,
				CLA_ID: circleId
			},
			error: function() {
				plus.nativeUI.toast("请求出错");
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	/**
	 *方法：获取评论列表
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：
	 *创建/修改：左武洲
	 *时间：2016/8/12
	 */
	getCommentList: function(circleId, callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/messageClass/comAllPage",
			data: {
				CLA_ID: circleId
			},
			error: function() {
				plus.nativeUI.toast("请求出错");
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	/**
	 *方法：获取班级圈详情
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：
	 *创建/修改：左武洲
	 *时间：2016/8/12
	 */
	getClassCircleDetail: function(circleId, userId, callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/messageClass/findById",
			data: {
				claId: circleId,
				userId: userId
			},
			error: function() {
				plus.nativeUI.toast("请求出错");
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	/**
	 *方法：获取工作日历
	 *方式:GET
	 *参数：callBack:回调方法
	 *返回值：
	 *创建/修改：左武洲
	 *时间：2016/8/12
	 */
	addCalendar: function(title, MEN_TIME, content, nowtime, userid, callBack) {
		$.ajax({
			type: "post",
			url: this.HOST + "/client/calendar/add",
			scriptCharset: 'utf-8',
			data: {
				TITLE: title,
				CONTENT: content,
				PLAN_DATE: nowtime,
				USER_ID: userid,
				MEN_TIME: MEN_TIME
			},
			error: function() {
				plus.nativeUI.toast("请求出错");
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	Calendarlist: function(nowtime, userid, callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/calendar/listCalendar",
			async: true,
			data: {
				dateId: nowtime,
				userId: userid

			},
			error: function() {
				plus.nativeUI.toast("请求出错");
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	/**
	 *方法：提交投票选项
	 *方式:POST
	 *参数：callBack:回调方法
	 *返回值：
	 *创建/修改：李路丹
	 *时间：2016/8/15
	 */
	postVotePerson: function(dt, callBack) {
		jQuery.support.cors = true;
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/vote/add",
			data: dt,
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	/**
	 *方法：获取测试成绩列表
	 *方式:GET
	 *参数：userId:用户id,callBack:回调方法
	 *返回值：
	 *创建/修改：zwz
	 *时间：2016/10/30
	 */
	getTestList: function(userId, callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/gradeCount/list",
			data: {
				userId: userId
			},
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	/**
	 *方法：获取年度成绩列表
	 *方式:GET
	 *参数：userId:用户id,callBack:回调方法
	 *返回值：
	 *创建/修改：zwz
	 *时间：2016/10/30
	 */
	getYearTestList: function(userId, callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/gradeCount/yearList",
			data: {
				userId: userId
			},
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	/**
	 *方法：获取测试成绩详细
	 *方式:GET
	 *参数：gradeId:测试id,userId:用户id,ruleTId:科目id，callBack:回调方法
	 *返回值：
	 *创建/修改：zwz
	 *时间：2016/10/30
	 */
	getTestDetail: function(roleId, gradeId, userId, ruleTId, stuId, callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/gradeCount/gradeanalysis",
			data: {
				gradeId: gradeId,
				userId: userId,
				ruleTId: ruleTId,
				stuId: stuId,
				roleId: roleId

			},
			async: false,
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);

			}
		});
	},

	/**
	 *方法：获取年度成绩详细
	 *方式:GET
	 *参数：year:年份,studentId:孩子id,subject:科目id，callBack:回调方法
	 *返回值：
	 *创建/修改：zwz
	 *时间：2016/10/30
	 */
	getYearTestDetail: function(studentId, subject, callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/gradeCount/gradetrend",
			data: {
				studentId: studentId,
				subject: subject
			},
			async: false,
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	/**
	 *方法：删除圈子
	 *方式:Get
	 *参数：callBack:回调方法
	 *返回值：
	 *创建/修改：左武洲
	 *时间：2016/10/13
	 */
	DeleteClassCircle: function(classId, callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/messageClass/delMessageClass",
			data: {
				CLA_ID: classId
			},
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	//课程表
	ClassTable: function(classId, callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/timetables/getClassTimetable",
			data: {
				CLASS_ID: classId
			},
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			async: false,
			success: function(data) {
				callBack(data);
			}
		});
	},
	//教师课表
	teacherTable: function(userid, callBack) {
		$.ajax({
			type: "GET",
			url: this.HOST + "/client/timetables/getClassTimetable",
			async: false,
			data: {
				USER_ID: userid
			},
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	//成绩表 —— 家长给任课教师留言
	setCourseSuggest: function(suggestD, gradeId, userid, usertype, stuId, callBack) {
		console.log(suggestD);
		$.ajax({
			type: "post",
			url: this.HOST + "/client/gradeCount/addMessage",
			data: {
				GRADE_ID: gradeId,
				USER_TYPE: usertype,
				USER_ID: userid,
				USER_MESSAGE: suggestD,
				STU_ID: stuId
			},
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	//成绩表 —— 删除家长给任课教师的某条留言
	DelCourseSuggest: function(item, callBack) {
		$.ajax({
			type: "post",
			url: this.HOST + "/client/gradeCount/removeMessage",
			data: {
				MESSAGE_ID: item.MESSAGE_ID
			},
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				console.log("hz====" + JSON.stringify(data))
				callBack(data);
			}
		});
	},

	//成绩表 —— 教师版（获取当前登录教师所带的班级列表数据） 
	getResultsList: function(userName, TEST_TYPE, callBack) {
		$.ajax({
			type: "post",
			url: this.HOST + "/client/gradeCount/listClassbyTeacher",
			data: {
				PHONE: userName,
				TEST_TYPE: TEST_TYPE
			},
			async: false,
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},

	//成绩表 —— 教师版  （获取某个班级的学生列表）
	getClassStuList: function(gradeId, callBack) {
		$.ajax({
			type: "post",
			url: this.HOST + "/client/gradeCount/listStudent",
			data: {
				GRADE_ID: gradeId
			},
			error: function() {
				plus.nativeUI.toast('请求失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	barCode: function(userid, username, code, callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/activitys/codeSign",
			data: {
				userId: userid,
				name: username,
				code: code
			},
			error: function() {
				plus.nativeUI.toast('操作失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	radarchartComment: function(callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/discuss/list",
			error: function() {
				plus.nativeUI.toast('操作失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	radarchartCommentDetail: function(userId, stuId,year,month, callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/discuss/getStuStart",
			data: {
				USER_ID: userId,
				STUDENT_ID: stuId,
				year: year,
				month: month
			},
			async: true,
			error: function() {
				plus.nativeUI.toast('操作失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	publish: function(arr, userId, stuId, callBack) {
		var operatorIDs = JSON.stringify(arr); //将数组转为JSON字符串
		//alert(operatorIDs);
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/discuss/save",
			data: {
				USER_ID: userId,
				INFO: operatorIDs,
				STUDENT_ID: stuId
			},
			error: function() {
				plus.nativeUI.toast('操作失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	getStudentList: function(userId, callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/discuss/listStudent",
			data: {
				USER_ID: userId
			},
			async: false,
			error: function() {
				plus.nativeUI.toast('操作失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	testType: function(userId, callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/gradeCount/getTestTypeToClient",
			data: {
				USER_ID: userId
			},
			error: function() {
				plus.nativeUI.toast('操作失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	radarchartStatis: function(userId, callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/gradeCount/getTestTypeToClient",
			data: {
				USER_ID: userId
			},
			error: function() {
				plus.nativeUI.toast('操作失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	//查询规则类型
	findAllTest: function(userId, callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/gradeCount/getTestTypeToClient",
			data: {
				USER_ID: userId
			},
			error: function() {
				plus.nativeUI.toast('操作失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	//查询规则类型值
	findAllTextList: function(TESTNUM, CLASS_ID, callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/gradeCount/census",
			data: {
				TESTNUM: TESTNUM,
				CLASSID: CLASS_ID
			},
			error: function() {
				plus.nativeUI.toast('操作失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	//查询新闻列表
	getNews: function(TYPE, callBack, url) {
		url = url || "/client/news/list?currentPage=1";
		url = this.HOST + url;
		$.ajax({
			type: "POST",
			url: url,
			async: false,
			data: {
				TYPE: TYPE
			},
			error: function() {
				plus.nativeUI.toast('操作失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	},
	//查询新闻详情
	getNewsDetail: function(URL, callBack) {
		$.ajax({
			type: "POST",
			url: this.HOST + "/client/news/newInfo",
			data: {
				URL: URL
			},
			error: function() {
				plus.nativeUI.toast('操作失败');
			},
			success: function(data) {
				callBack(data);
			}
		});
	}
};