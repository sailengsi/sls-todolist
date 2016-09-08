$(function() {

	/**
	 * Todo操作类
	 */
	var Todo = function() {};

	Todo.prototype = {

		/**
		 * [constructor 还原构造器]
		 */
		constructor: Todo,

		/**
		 * [todoList 本地存储TODO的key]
		 * @type {String}
		 */
		todoKey: "todo",

		/**
		 * [filter 当前TODO列表显示的状态]
		 * @type {String}
		 */
		filter: "all",

		/**
		 * [noFinishTotal 当前未完成条目总数]
		 * @type {Number}
		 */
		noFinishTotal: 0,

		/**
		 * [finishTotal 当前已完成条目总数]
		 * @type {Number}
		 */
		finishTotal: 0,

		/**
		 * [allTotal 当前总条目总数]
		 * @type {Number}
		 */
		allTotal: 0,

		/**
		 * [toggleAllTodo 切换所有TODO完成或者不完成]
		 * @type {Boolean}
		 */
		toggleAllTodo: true,

		/**
		 * [todoList 本地存储的TODO数据数组]
		 * @type {Array}
		 */
		todoList: [],

		/**
		 * [toggleAllTodo 切换所有TODO完成或者不完成,默认为true->全部完成状态]
		 * @type {Boolean}
		 */
		toggleAllTodo: false,


		/**
		 * TODO初始化一些操作
		 * 获取TODO列表，并进行渲染
		 */
		initTodo: function() {
			this.getTodo().renderTodo();
		},


		/**
		 * 获取TODO列表
		 * @return {Object} TODO对象
		 */
		getTodo: function() {
			this.todoList = store(this.todoKey) ? JSON.parse(store(this.todoKey)) : [];
			return this;
		},


		/**
		 * 设置TODO数据
		 * @return {Object} TODO对象
		 */
		setTodoList: function() {
			store(this.todoKey, JSON.stringify(this.todoList));
			return this;
		},


		/**
		 * 添加TODO数据
		 * @param {String} value 输入的TODO数据
		 * @return {Object} TODO对象
		 */
		addTodo: function(value) {
			if (this.checkValueTodo(value)) {
				this.getTodo();
				this.todoList.push({
					id: parseInt(this.todoList[this.todoList.length - 1] ? this.todoList[this.todoList.length - 1].id : 0) + 1,
					name: value,
					status: false
				});
				this.setTodoList().renderTodo(true).updateTodoTotal("allTotal").updateTodoTotal("noFinishTotal");
				clearInput();
			} else {
				this.tipTodo("addTodo 缺少一个参数value。");
			}
			return this;
		},


		/**
		 * 根据TODO索引删除TODO
		 * @param  {Number} index TODO索引
		 * @return {Object}       TODO对象
		 */
		deleteTodo: function(index) {
			if (index >= 0) {
				this.todoList.splice(index, 1);
				this.setTodoList().renderTodo();
			} else {
				this.tipTodo("deleteTodo需要传入一个>=0的参数。", true);
			}
		},


		/**
		 * 改变TODO状态
		 * @param  {Number}   index TODO索引
		 * @param  {Function} fn    改变完成后的回调函数
		 */
		changeStatusTodo: function(index, fn) {
			if (index >= 0) {
				this.todoList[index].status = !this.todoList[index].status;
				this.setTodoList().updateTodoTotal("noFinishTotal", this.todoList[index].status).updateTodoTotal("finishTotal", !this.todoList[index].status);
				fn && fn(this.todoList[index].status);
			} else {
				this.tipTodo("changeStatusTodo需要传入一个>=0的参数。", true);
			}
		},


		/**
		 * 更新TODO数量
		 * @param  {String} todoType todo类型
		 * @param  {[Boolean]} type     true,递增;false,递减
		 * @return {[Object]}          TODO对象
		 */
		updateTodoTotal: function(todoType, type) {
			if (this[todoType] !== undefined) {
				!type ? this[todoType]++ : this[todoType]--;
				$('#' + todoType).html(this[todoType]);

				this.toggleAllTodo = this.allTotal == this.finishTotal && this.allTotal != 0;
				$('.todo-btn-finish-all').addClass(this.toggleAllTodo ? 'btn-info' : 'btn-default')
					.removeClass(!this.toggleAllTodo ? 'btn-info' : 'btn-default');
			} else {
				this.tipTodo("updateTodoTotal参数必须是(allTotal,finishTotal,noFinishTotal)其中一个。", true);
			}
			return this;
		},


		/**
		 * 筛选TODO
		 * @param  {String} filter 筛选类型
		 * @return {Object}        TODO对象
		 */
		filterTodo: function(filter) {
			if (filter) {
				if (filter === "all" || filter === "finished" || filter === "nofinish") {
					this.filter = filter;
					this.renderTodo();
				} else {
					this.tipTodo("filterTodo的参数必须为(all,finished,nofinish)中的任何一个。", true);
				}
			} else {
				this.tipTodo("filterTodo必须传入一个参数。", true);
			}
		},


		/**
		 * 清空已完成TODO
		 * @return {Object} TODO对象
		 */
		clearFinishedTodo: function() {
			var data = this.todoList,
				tempData = [];
			if (data.length) {
				for (var i = 0; i < data.length; i++) {
					if (!data[i].status) {
						tempData.push(data[i]);
					};
				};
				this.todoList = tempData;
				this.setTodoList().renderTodo();
			};
			return this;
		},


		/**
		 * 完成所有TODO
		 * @return {Object} TODO对象
		 */
		finishAllTodo: function() {
			if (this.todoList.length) {
				for (var i = 0; i < this.todoList.length; i++) {
					if ((!this.todoList[i].status && this.toggleAllTodo) || (this.todoList[i].status && !this.toggleAllTodo)) {
						this.todoList[i].status = this.toggleAllTodo;
					};
				};
			};
			this.setTodoList().renderTodo();
		},


		/**
		 * 渲染TODO数据
		 * @param  {Boolean} type 为true时,append(TODO)；为false时,html(TODO)	
		 */
		renderTodo: function(type) {
			var data = !type ? this.todoList : (this.todoList.length ? [this.todoList[this.todoList.length - 1]] : []),
				str = "";
			if (!type) {
				this.noFinishTotal = 0;
				this.finishTotal = 0;
				this.allTotal = 0;
			};
			if (data.length) {
				for (var i = 0; i < data.length; i++) {
					if ((this.filter === "finished" && data[i].status) || (this.filter === "nofinish" && !data[i].status) || this.filter === "all") {
						str += '<li class="list-group-item todo-li ' + (data[i].status ? "todo-li-finished" : "") + '" data-id="' + data[i].id + '" data-index="' + (!type ? i : this.todoList.length - 1) + '">';
						str += '<label class="todo-span todo-check" for="' + data[i].id + '"><input type="checkbox" class="todo-btn-check" id="' + data[i].id + '" ' + (data[i].status ? "checked" : "") + '></label>';
						str += '<span class="todo-content">' + data[i].name + '</span>';
						str += '<span class="todo-span todo-delete text-danger todo-btn-delete">x</span>';
						str += '</li>';
					};
					if (!type) {
						if (!data[i].status) {
							this.noFinishTotal++;
						};
						if (data[i].status) {
							this.finishTotal++;
						};
						this.allTotal++;
					}
					if (!data[i].status) {
						this.toggleAllTodo = true;
					}
				};
			};
			$('.todo-list')[!type ? "html" : "append"](str);
			$('.todo-nofinish-total').html(this.noFinishTotal);
			$('.todo-finish-total').html(this.finishTotal);
			$('.todo-total').html(this.allTotal);
			this.toggleAllTodo = this.allTotal != this.finishTotal || this.allTotal == 0;
			$('.todo-btn-finish-all').addClass(!this.toggleAllTodo ? 'btn-info' : 'btn-default')
				.removeClass(this.toggleAllTodo ? 'btn-info' : 'btn-default');
			return this;
		},


		/**
		 * 检测TODO是否合法
		 * @param  {String}   value TODO值
		 * @return {Object}         TODO对象
		 */
		checkValueTodo: function(value) {
			if (!value) {
				return false;
			} else {
				return true;
			}
		},


		/**
		 * TODO提示
		 * @param  {String} str  TODO
		 * @param  {Boolean} type 为true,错误提示;为false,成功提示
		 * @return {Object}      TODO对象
		 */
		tipTodo: function(str, type) {
			$('.todo-tip').html(str).addClass(type ? "text-danger bg-danger" : "text-success bg-success").removeClass(type ? "text-success bg-success" : "text-danger bg-danger").slideDown('fast', function() {
				$(this).delay(800).slideUp("fast");
			});
			return this;
		}

	};

	var Td = new Todo();

	Td.initTodo();


	/**
	 * TODO输入框回车提交
	 */
	$('.todo-input').keyup(function(event) {
		if (event.keyCode == 13) {
			Td.addTodo($.trim($(this).val()));
		}
	});

	/**
	 * TODO按钮提交
	 */
	$('.todo-btn-add').click(function(event) {
		Td.addTodo($.trim($('.todo-input').val()));
	});

	/**
	 * TODO列表删除
	 */
	$('.todo-list').on("click", ".todo-btn-delete", function() {
		var index = $(this).parents(".todo-li").data("index");
		Td.deleteTodo(index);
	});

	/**
	 * 改变TODO状态
	 */
	$('.todo-list').on("click", ".todo-btn-check", function() {
		var li = $(this).parents(".todo-li");
		var index = li.data("index");
		Td.changeStatusTodo(index, function(status) {
			li[status ? "addClass" : "removeClass"]('todo-li-finished');
		});
	});

	/**
	 * TODO筛选
	 */
	$('.todo-btn-filter').click(function(event) {
		$(this).addClass('btn-info').removeClass('btn-default').siblings().removeClass('btn-info').addClass('btn-default');
		var filter = $(this).data("filter");
		Td.filterTodo(filter);
	});

	/**
	 * 清空已完成TODO
	 */
	$('.todo-btn-clear-finished').click(function(event) {
		Td.clearFinishedTodo();
	});

	/**
	 * 完成/不完成所有TODO
	 */
	$('.todo-btn-finish-all').click(function(event) {
		Td.finishAllTodo();
	});

	/**
	 * 清空input
	 */
	function clearInput() {
		$('.todo-input').val("");
	}

	$('.version-jquery').addClass('active');
});