var Todo = angular.module("Todo", []);
Todo.controller("managerTodo", function($scope, $timeout) {
	$scope.tip = {
		msg: "test",
		type: false,
		tipClassName: ""
	};

	$scope.angularActive = "active";

	/**
	 * [todoList 本地存储TODO的key]
	 * @type {String}
	 */
	$scope.todoKey = "todo";

	/**
	 * [filter 当前TODO列表显示的状态]
	 * @type {String}
	 */
	$scope.filter = "all";

	/**
	 * [noFinishTotal 当前未完成条目总数]
	 * @type {Number}
	 */
	$scope.noFinishTotal = 0;

	/**
	 * [finishTotal 当前已完成条目总数]
	 * @type {Number}
	 */
	$scope.finishTotal = 0;

	/**
	 * [allTotal 当前总条目总数]
	 * @type {Number}
	 */
	$scope.allTotal = 0;

	/**
	 * [toggleAllTodo 切换所有TODO完成或者不完成]
	 * @type {Boolean}
	 */
	$scope.toggleAllTodo = false;

	/**
	 * [todoList 本地存储的TODO数据数组]
	 * @type {Array}
	 */
	$scope.todoList = [];


	/**
	 * [todoValue TODOinput默认值]
	 * @type {String}
	 */
	$scope.todoValue = "";


	/**
	 * TODO初始化一些操作
	 * 获取TODO列表，并进行渲染
	 */
	$scope.initTodo = function() {
		$scope.getTodo().statisTodo();
	};


	/**
	 * 统计各个状态总条目数
	 * @return {Object} TODO对象
	 */
	$scope.statisTodo = function() {
		if ($scope.todoList.length) {
			for (var i = 0; i < $scope.todoList.length; i++) {
				$scope.allTotal++;
				$scope[$scope.todoList[i].status ? 'finishTotal' : 'noFinishTotal']++;
				if (!$scope.todoList[i].status) {
					$scope.toggleAllTodo = true;
				}
			}
		} else {
			$scope.toggleAllTodo = true;
		}
		return $scope;
	};


	/**
	 * 获取TODO列表
	 * @return {Object} TODO对象
	 */
	$scope.getTodo = function() {
		$scope.todoList = store($scope.todoKey) ? JSON.parse(store($scope.todoKey)) : [];
		return $scope;
	};


	/**
	 * 设置TODO数据
	 * @return {Object} TODO对象
	 */
	$scope.setTodoList = function() {
		store($scope.todoKey, JSON.stringify($scope.todoList));
		// store($scope.todoKey, angular.toJson($scope.todoList));
		return $scope;
	};


	/**
	 * 添加TODO数据
	 * @param {String} value 输入的TODO数据
	 * @return {Object} TODO对象
	 */
	$scope.addTodo = function() {
		if ($scope.checkValueTodo($scope.todoValue)) {
			$scope.getTodo();
			$scope.todoList.push({
				id: parseInt($scope.todoList[$scope.todoList.length - 1] ? $scope.todoList[$scope.todoList.length - 1].id : 0) + 1,
				name: $scope.todoValue,
				status: false
			});
			$scope.setTodoList();
			$scope.allTotal++;
			$scope.noFinishTotal++;
			$scope.todoValue = "";
		} else {
			$scope.tipTodo("执行addTodo 错误:todoValue值不合法。", true);
		}
		return $scope;
	};


	/**
	 * 根据TODO索引删除TODO
	 * @param  {Number} index TODO索引
	 * @return {Object}       TODO对象
	 */
	$scope.deleteTodo = function(index) {
		if (index >= 0) {
			$scope.allTotal--;
			$scope[$scope.todoList[index].status ? 'finishTotal' : 'noFinishTotal']--;
			$scope.todoList.splice(index, 1);
			$scope.toggleAllTodo = $scope.allTotal != $scope.finishTotal || $scope.allTotal == 0;
			$scope.setTodoList();
		} else {
			$scope.tipTodo("deleteTodo需要传入一个>=0的参数。", true);
		}
		return $scope;
	};


	/**
	 * 改变TODO状态
	 * @param  {Number}   index TODO索引
	 * @param  {Function} fn    改变完成后的回调函数
	 */
	$scope.changeStatusTodo = function(index, fn) {
		if (index >= 0) {
			$scope[$scope.todoList[index].status ? 'finishTotal' : 'noFinishTotal']--;
			$scope[$scope.todoList[index].status ? 'noFinishTotal' : 'finishTotal']++;
			$scope.todoList[index].status = !$scope.todoList[index].status;
			$scope.toggleAllTodo = $scope.allTotal != $scope.finishTotal || $scope.allTotal == 0;
			$scope.setTodoList();
		} else {
			$scope.tipTodo("changeStatusTodo需要传入一个>=0的参数。", true);
		}
	};


	/**
	 * 筛选TODO
	 * @param  {String} filter 筛选类型
	 * @return {Object}        TODO对象
	 */
	$scope.filterTodo = function(filter) {
		if (filter) {
			if (filter === "all" || filter === "finished" || filter === "nofinish") {
				$scope.filter = filter;
			} else {
				$scope.tipTodo("filterTodo的参数必须为(all,finished,nofinish)中的任何一个。", true);
			}
		} else {
			$scope.tipTodo("filterTodo必须传入一个参数。", true);
		}
	};


	/**
	 * 清空已完成TODO
	 * @return {Object} TODO对象
	 */
	$scope.clearFinishedTodo = function() {
		var data = $scope.todoList,
			tempData = [];
		if (data.length) {
			for (var i = 0; i < data.length; i++) {
				if (!data[i].status) {
					tempData.push(data[i]);
				};
			};
			$scope.todoList = tempData;
			$scope.finishTotal = 0;
			if ($scope.todoList.length == 0) {
				$scope.allTotal = 0;
				$scope.noFinishTotal = 0;
			} else {
				$scope.allTotal = $scope.noFinishTotal;
			}
			$scope.toggleAllTodo = $scope.allTotal != $scope.finishTotal || $scope.allTotal == 0;
			$scope.setTodoList();
		};
		return $scope;
	};


	/**
	 * 完成所有TODO
	 * @return {Object} TODO对象
	 */
	$scope.finishAllTodo = function() {
		if ($scope.todoList.length) {
			$scope["finishTotal"] = 0;
			$scope["noFinishTotal"] = 0;
			for (var i = 0; i < $scope.todoList.length; i++) {
				if ((!$scope.todoList[i].status && $scope.toggleAllTodo) || ($scope.todoList[i].status && !$scope.toggleAllTodo)) {
					$scope.todoList[i].status = $scope.toggleAllTodo;
				};
				$scope[$scope.todoList[i].status ? 'finishTotal' : 'noFinishTotal']++;
			};
		};
		$scope.toggleAllTodo = !$scope.toggleAllTodo;
		$scope.setTodoList();
	};


	/**
	 * 检测TODO是否合法
	 * @param  {String}   value TODO
	 * @param  {Function} fn    操作成功后的回调函数
	 * @return {Object}         TODO对象
	 */
	$scope.checkValueTodo = function(value, fn) {
		if (!value) {
			return false;
		} else {
			return true;
		}
	};


	/**
	 * TODO提示
	 * @param  {String} str  TODO
	 * @param  {Boolean} type 为true,错误提示;为false,成功提示
	 * @return {Object}      TODO对象
	 */
	$scope.tipTodo = function(msg, type) {
		$scope.tip.msg = msg;
		$scope.tip.type = type;
		$scope.tip.tipClassName = type ? "text-danger bg-danger" : "text-success bg-success";
		$timeout(function() {
			$scope.tip.type = false;
		}, 1000);
		return $scope;
	};


	$scope.initTodo();
	// console.log($scope.todoList);
});