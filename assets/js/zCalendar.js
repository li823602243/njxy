/*
 *工作日历控件
 *zwz
 */

//dateUtil
(function($) {
	$.dateUtil = {
		//添加天数
		addDate: function(date, inc) {
			var d = new Date(date);
			d.setTime(date.getTime() + inc * 24 * 3600 * 1000);
			return d;
		},
		//获取天数差
		getDateDiff: function(base, target) {
			return(target.getTime() - base.getTime()) / (24 * 3600 * 1000);
		},
		//获取当天日期
		getToday: function() {
			var d = new Date();
			d.setHours(0, 0, 0, 0);
			return d;
		}
	};
})(jQuery);

//calendar
(function($) {
	var _calView = (function($) {
		//日历模板
		var mainTemp = [
			'<ul class="zcalendar-header">',
			'<li class="header-item">日</li>',
			'<li class="header-item">一</li>',
			'<li class="header-item">二</li>',
			'<li class="header-item">三</li>',
			'<li class="header-item">四</li>',
			'<li class="header-item">五</li>',
			'<li class="header-item">六</li>',
			'</ul>',
			'<div class="zcalendar-body" id="zcalBody"></div>'
		].join('');
		var secDate, secCell, firstDate;
		var onCompleted, onSwipeLeft, onSwipeRight, onSelected;

		//渲染模板
		function randerCalendar(container) {
			var div = document.createElement('div');
			div.setAttribute('id', 'zcalContainer');
			div.className = 'zcalendar-container';
			div.innerHTML = mainTemp;
			container.appendChild(div);
			var html = '';
			for(var i = 0; i < 42; i++) {
				html += '<div class="zcalendar-item" data-index="' + i + '"><span class="zcalendar-date"></span><p class="zcalendar-tag"></p></div>';
			}
			document.getElementById('zcalBody').innerHTML = html;
		}

		//修改月份
		function changeMonth(date) {
			firstDate = getFirstDate(date);
			var i = 0;
			$(".zcalendar-item").each(function() {
				this.className = 'zcalendar-item';
				var d = $.dateUtil.addDate(firstDate, i++);
				this.firstChild.innerHTML = d.getDate();
				this.querySelector('.zcalendar-tag').innerHTML = '';
				this.dataset.time = d.getTime();
				if(d.getMonth() != date.getMonth()) {
					this.classList.add('disabled');
				}
				if(d.getTime() == date.getTime()) {
					this.classList.add('active');
					secCell = this;
					secDate = d;
				}
			});
		}

		//修改日期
		function changeDate(date) {
			date && date.setHours(0, 0, 0, 0);
			if(secCell) {
			secCell.classList.remove('active');
			if((secDate.getFullYear() == date.getFullYear()) && (secDate.getMonth() == date.getMonth())) {
					var index = 1 * secCell.dataset.index + $.dateUtil.getDateDiff(secDate, date);
					secCell = $(".zcalendar-item")[index];
					secCell.classList.add('active');
					secDate = date;
				}
			}
			changeMonth(date);
			onSelected && onSelected(date);
		}

		//修改工作提示
		function changeTag(date, str) {
			var d = new Date(date);
			d.setHours(0, 0, 0, 0);
			var dom = $('.zcalendar-item[data-time=' + d.getTime() + ']')[0];
			if(dom) {
				dom.querySelector('.zcalendar-tag').innerHTML = str.length > 6 ? str.substr(0, 6) + '...' : str;
			}
		}

		//获取日历中的第一天
		function getFirstDate(date) {
			var d = new Date(date);
			d.setDate(1);
			d.setHours(0, 0, 0, 0);
			return $.dateUtil.addDate(d, (0 - d.getDay()));
		}

		return {
			secDate: function() {
				return secDate;
			},
			init: function(o) {
				randerCalendar(o.container);
				onCompleted = o.onCompleted;
				onSwipeLeft = o.onSwipeLeft;
				onSwipeRight = o.onSwipeRight;
				onSelected = o.onSelected;
				this.changeDate(o.date || $.dateUtil.getToday());
				var swipeMonth = function(direction) {
					var d = new Date(secDate);
					var m = d.getMonth() + direction;
					if(m == 12) {
						d.setMonth(0);
						d.setFullYear(d.getFullYear() + 1);
					} else if(m == -1) {
						d.setMonth(11);
						d.setFullYear(d.getFullYear() - 1);
					} else {
						d.setMonth(m);
					}
					changeDate(d);
				};
				//手势事件绑定
				var hammer = new Hammer(document.getElementById('zcalContainer'));
				hammer.on('tap', function(e) {
					var target = e.target;
					if(!e.target.classList.contains('zcalendar-item')) {
						target = target.parentNode;
					}
					var idx = target.dataset.index;
					idx && changeDate($.dateUtil.addDate(firstDate, idx));
				});
				hammer.on('swipeleft', function() {
					swipeMonth(1);
					onSwipeLeft && onSwipeLeft();
				});
				hammer.on('swiperight', function() {
					swipeMonth(-1);
					onSwipeRight && onSwipeRight();
				});

				onCompleted && onCompleted();
			},
			changeDate: changeDate,
			changeTag: changeTag
		};
	}($));

	$.fn.zcalendar = function(option) {
		var options = {
			container: this[0],
			date: undefined,
			onSwipeLeft: undefined,
			onSwipeRight: undefined,
			onCompleted: undefined,
			onSelected: undefined
		};
		$.extend(options, option || {});

		var _zcalendar = {
			options: {},
			getDate: function() {
				return _calView.secDate();
			},
			init: function() {
				this.options = options;
				_calView.init(options);
			},
			show: function() {
				options.container.style.display = 'block';
			},
			hide: function() {
				options.container.style.display = 'none';
			},
			changeDate: function(date) {
				_calView.changeDate(date);
			},
			changeTag: function(date, str) {
				_calView.changeTag(date, str);
			}
		};

		_zcalendar.init();
		return _zcalendar;
	};
})(jQuery);