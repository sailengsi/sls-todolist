var Todo = new Vue({
	el: "#managerTodo",
	data: {
		vueActive: "active",
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
		toggleAllTodo: false,

		/**
		 * [todoList 本地存储的TODO数据数组]
		 * @type {Array}
		 */
		todoList: [],

		/**
		 * [todoValue TODOinput默认值]
		 * @type {String}
		 */
		todoValue: ""
	},
	methods: {
		/**
		 * TODO初始化一些操作
		 * 获取TODO列表，并进行渲染
		 */
		initTodo: function() {
			this.getTodo();
			this.statisTodo();
		},

		/**
		 * 统计各个状态总条目数
		 * @return {Object} TODO对象
		 */
		statisTodo: function() {
			var list = this.todoList;
			if (list.length) {
				for (var i = 0; i < list.length; i++) {
					this.allTotal++;
					this[list[i].status ? 'finishTotal' : 'noFinishTotal']++;
					if (!list[i].status) {
						this.toggleAllTodo = true;
					}
				}
			} else {
				this.toggleAllTodo = true;
			}
			return this;
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
			store(this.todoKey, JSON.stringify(this.getPure("todoList")));
			return this;
		},


		/**
		 * 添加TODO数据
		 * @param {String} value 输入的TODO数据
		 * @return {Object} TODO对象
		 */
		addTodo: function(value) {
			if (this.checkValueTodo(this.todoValue)) {
				this.getTodo();
				var list = this.getPure("todoList");
				list.push({
					id: parseInt(list[list.length - 1] ? list[list.length - 1].id : 0) + 1,
					name: this.todoValue,
					status: false
				});
				this.todoList = list;
				this.setTodoList();
				this.allTotal++;
				this.noFinishTotal++;
				this.todoValue = "";
			} else {
				alert("执行addTodo 错误:todoValue值不合法。");
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
				this.allTotal--;
				this[this.todoList[index].status ? 'finishTotal' : 'noFinishTotal']--;
				this.todoList.splice(index, 1);
				this.toggleAllTodo = this.allTotal != this.finishTotal || this.allTotal == 0;
				this.setTodoList();
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
				this[this.todoList[index].status ? 'finishTotal' : 'noFinishTotal']--;
				this[this.todoList[index].status ? 'noFinishTotal' : 'finishTotal']++;
				this.todoList[index].status = !this.todoList[index].status;
				this.toggleAllTodo = this.allTotal != this.finishTotal || this.allTotal == 0;
				this.setTodoList();
				fn && fn(this.todoList[index].status);
			} else {
				alert("changeStatusTodo需要传入一个>=0的参数。");
			}
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
				this.finishTotal = 0;
				if (this.todoList.length == 0) {
					this.allTotal = 0;
					this.noFinishTotal = 0;
				} else {
					this.allTotal = this.noFinishTotal;
				}
				this.toggleAllTodo = this.allTotal != this.finishTotal || this.allTotal == 0;
				this.setTodoList();
			};
			return this;
		},


		/**
		 * 完成所有TODO
		 * @return {Object} TODO对象
		 */
		finishAllTodo: function() {
			if (this.todoList.length) {
				this["finishTotal"] = 0;
				this["noFinishTotal"] = 0;
				for (var i = 0; i < this.todoList.length; i++) {
					if ((!this.todoList[i].status && this.toggleAllTodo) || (this.todoList[i].status && !this.toggleAllTodo)) {
						this.todoList[i].status = this.toggleAllTodo;
					};
					this[this.todoList[i].status ? 'finishTotal' : 'noFinishTotal']++;
				};
			};
			this.toggleAllTodo = !this.toggleAllTodo;
			this.setTodoList();
		},


		/**
		 * 检测TODO是否合法
		 * @param  {String}   value TODO
		 * @param  {Function} fn    操作成功后的回调函数
		 * @return {Object}         TODO对象
		 */
		checkValueTodo: function(value, fn) {
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
	}
});

Todo.initTodo();
Todo.getPure("todoList");