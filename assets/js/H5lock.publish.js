(function(){
        window.H5lock = function(obj){
            this.height = obj.height;
            this.width = obj.width;
            this.chooseType = obj.chooseType;
            this.container = obj.container;
            this.title=document.getElementById(obj.title);
            this.isLogin=obj.isLogin;
        };


        H5lock.prototype.drawCle = function(x, y) { // 初始化解锁密码面板
            this.ctx.fillStyle = '#5ecfd9';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.fillStyle = '#FCFFFD';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.r/4, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.strokeStyle = '#FCFFFD';
            this.ctx.lineWidth=2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        H5lock.prototype.drawPoint = function(x,y,type) { // 画圆心
                this.ctx.fillStyle = type;
                this.ctx.beginPath();
                this.ctx.arc(x,y, this.r / 4, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.fill();
        }
        H5lock.prototype.drawStatusPoint = function(type, psw) { // 初始化状态线条
            var obj = {
                'right': '#FCFFFD',
                'error': 'red'
            };
            type = obj[type];
            this.ctx.strokeStyle = type;
            for (var i = 0 ; i < psw.length ; i++) {
                this.ctx.beginPath();
                this.ctx.arc(psw[i].x, psw[i].y, this.r, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.stroke();
                this.drawPoint(psw[i].x, psw[i].y,type);
            }
            this.ctx.beginPath();
            this.ctx.lineWidth = 5;
            this.ctx.moveTo(psw[0].x, psw[0].y);
            for (var i = 1 ; i < psw.length ; i++) {
                this.ctx.lineTo(psw[i].x, psw[i].y);
            }
            this.ctx.stroke();
            this.ctx.closePath();
        }
        H5lock.prototype.drawLine = function(po, lastPoint) {// 解锁轨迹
        	this.ctx.strokeStyle='#ffffff';
            this.ctx.beginPath();
            this.ctx.lineWidth = 5;
            this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
            for (var i = 1 ; i < this.lastPoint.length ; i++) {
                this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
            }
            this.ctx.lineTo(po.x, po.y);
            this.ctx.stroke();
            this.ctx.closePath();

        }
        H5lock.prototype.createCircle = function() {// 创建解锁点的坐标，根据canvas的大小来平均分配半径
            var n = this.chooseType;
            var count = 0;
            this.r = this.ctx.canvas.width / (2 + 4 * n);// 公式计算
            this.lastPoint = [];
            this.arr = [];
            this.restPoint = [];
            var r = this.r;
            for (var i = 0 ; i < n ; i++) {
                for (var j = 0 ; j < n ; j++) {
                    count++;
                    var obj = {
                        x: j * 4 * r + 3 * r,
                        y: i * 4 * r + 3 * r,
                        index: count
                    };
                    this.arr.push(obj);
                    this.restPoint.push(obj);
                }
            }
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            for (var i = 0 ; i < this.arr.length ; i++) {
                this.drawCle(this.arr[i].x, this.arr[i].y);
            }
        }
        H5lock.prototype.getPosition = function(e) {// 获取touch点相对于canvas的坐标
            var rect = e.currentTarget.getBoundingClientRect();
            var po = {
                x: 2*e.touches[0].clientX - 2*rect.left,
                y: 2*e.touches[0].clientY - 2*rect.top
              };
            return po;
        }
        H5lock.prototype.update = function(po) {// 核心变换方法在touchmove时候调用
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            for (var i = 0 ; i < this.arr.length ; i++) { // 每帧先把面板画出来
                this.drawCle(this.arr[i].x, this.arr[i].y);
            }
            this.drawPoint(this.lastPoint);// 每帧花轨迹
            this.drawLine(po , this.lastPoint);// 每帧画圆心
            for (var i = 0 ; i < this.restPoint.length ; i++) {
                if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                    this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
                    this.lastPoint.push(this.restPoint[i]);
                    this.restPoint.splice(i, 1);
                    break;
                }
            }

        }
		 //转换密码
		H5lock.prototype.parsePassword=function(psw){
			 var str= '';
            for (var i = 0 ; i < psw.length ; i++) {
                str += psw[i].index;
            }
            return str;
		}
		//手势密码登录
		H5lock.prototype.login=function(psw,self){
			var passwd=this.parsePassword(psw);
			//密码为空
			if(passwd===''){
				self.reset();
				return false;
			}
			njyy_data.gestureLogin(window.GESTURE_SETTING.USER_NAME,passwd,function(data){
				if(data.SystemCode==1) {	
					self.title.innerHTML = '解锁成功';
					self.reset();
					window.CURRENT_USER.USER_NAME=window.GESTURE_SETTING.USER_NAME;//登录名
					window.CURRENT_USER.USER_ID=data.USER_ID;//用户id
					window.CURRENT_USER.ROLE=data.ROLE;//角色
					window.CURRENT_USER.NAME=data.NAME;//昵称
					window.CURRENT_USER.IS_CHARGE = data.IS_CHARGE;//是否为班主任
					window.CURRENT_USER.PATH = data.PATH; //头像
	//				plus.nativeUI.showWaiting('请稍等...');
					switch(data.ROLE) {
						case "1":
							window.CURRENT_USER.CLASS_ID=data.CLASS_ID;
							//环信登录
//							Chat.init(data.HX_NAME,data.HX_PASSWORD,function(){
//								plus.nativeUI.closeWaiting();
								$.router.loadPage({
									url: "yy-circle.html",
									noAnimation: true,
									replace: false
								});
//						});
							break;
						case "2":
							CURRENT_USER.CHILDREN = data.stuInfoMap[0];
							//环信登录
//							Chat.init(data.HX_NAME,data.HX_PASSWORD,function(){
	//							plus.nativeUI.closeWaiting();
								$.router.loadPage({
									url: "yy-circle.html",
									noAnimation: true,
									replace: false
								});
//							});
							break;
						case "3":
							//环信登录
//							Chat.init(data.HX_NAME,data.HX_PASSWORD,function(){
								plus.nativeUI.closeWaiting();
								$.router.loadPage({
									url: "yy-public.html",
									noAnimation: true,
									replace: false
								});
//							});						
					}
							
				}else{
					self.title.innerHTML = '解锁失败';
	                self.drawStatusPoint('error',psw);
	                setTimeout(function(){
	                	self.title.innerHTML = '请解锁';
	                	self.reset();
	                },500);
				}
			},function(){
				self.reset();
			});
		}
		
		//修改创建手势密码 1创建，2修改
        H5lock.prototype.storePass = function(psw,self) {// touchend结束之后对密码和状态的处理
        	var passwd=this.parsePassword(psw);
            if (this.pswObj.step == 1) {
                if (this.pswObj.fpassword==passwd) {
                	//修改配置密码
                    window.GESTURE_SETTING.PASSWORD = passwd;
                    //保存密码到服务器
                    njyy_data.updateGesturePassword(window.CURRENT_USER.USER_ID,passwd,function(data){
                    	if(data.SystemCode==1){
                    		//保存密码到本地
                    		plus.storage.setItem('window.GESTURE_SETTING',JSON.stringify(window.GESTURE_SETTING));
		                  	self.title.innerHTML = '密码保存成功';
		                    plus.nativeUI.toast('修改成功,请重新登录');
		                    $.router.loadPage({
								url: 'gesture-login.html',
								noAnimation: true,
								replace: false
							});
                    	}else{
                    		plus.nativeUI.toast('请求失败');
                    		self.reset();
                    	}
                    },function(){
                    	self.reset();
                    });
                   
                } else {
                    this.title.innerHTML = '两次不一致，重新输入';
                    this.drawStatusPoint('error',psw);
                    this.reset();
                    delete this.pswObj.step;
                }
            } else if (this.pswObj.step == 2) {
            	var self=this;
            	njyy_data.gestureLogin(window.GESTURE_SETTING.USER_NAME,passwd,function(data){
            		if(data.SystemCode==1){
            			self.reset();
	                   	self.title.innerHTML='绘制登录手势';
	                    delete self.pswObj.step;
            		}else{
            			self.title.innerHTML = '验证失败';
	                    self.drawStatusPoint('error',psw);
	                    setTimeout(function(){
	                    	self.title.innerHTML = '验证当前手势';
	                    	self.reset();
	                    },500);
            		}
            	});
            } else {
                this.pswObj.step = 1;
                this.pswObj.fpassword = passwd;
                this.reset();
                this.title.innerHTML = '再次输入';
            }
        }

        H5lock.prototype.initDom = function(){
            var wrap = document.getElementById(this.container);
            var str = '<canvas id="canvas" width="720" height="1200" style="display:block;margin:0 auto;width:360px;height:600px"></canvas>';
            wrap.innerHTML = str;
        }
        H5lock.prototype.init = function() {
            this.initDom();
            //判断修改还是创建手势密码
            if(window.GESTURE_SETTING.PASSWORD!==null){
            	this.pswObj={
            		step: 2
            	};
            	if(!this.isLogin){
            		this.title.innerHTML="验证当前手势";
            	}
            }else{
            	this.pswObj={};
            	
            }
            this.lastPoint = [];
            this.prevPoint = [];
            this.touchFlag = false;
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.createCircle();
            this.bindEvent();
        }
        H5lock.prototype.reset = function() {
            this.createCircle();
        }
        H5lock.prototype.bindEvent = function() {
            var self = this;
            this.canvas.addEventListener("touchstart", function (e) {
                e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
                 var po = self.getPosition(e);

                 for (var i = 0 ; i < self.arr.length ; i++) {
                    if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {

                        self.touchFlag = true;
                        self.drawPoint(self.arr[i].x,self.arr[i].y);
                        self.lastPoint.push(self.arr[i]);
                        self.restPoint.splice(i,1);
                        break;
                    }
                 }
             }, false);
             this.canvas.addEventListener("touchmove", function (e) {
                if (self.touchFlag) {
                    self.update(self.getPosition(e));
                }
             }, false);
             this.canvas.addEventListener("touchend", function (e) {
                 if (self.touchFlag) {
                     self.touchFlag = false;
                     if(self.isLogin){
                     	self.login(self.lastPoint,self);
                     }else{
                     	self.storePass(self.lastPoint,self);
                     }
                 }
             }, false);


        }
})();
