/**
 * 版本切换
 */
var VersionToggle=React.createClass({
	render:function(){
		return (
			<div className="list-group version-container">
				<a href="index.html" className="list-group-item col-sm-3 col-xs-6 version-jquery">jquery版</a>
				<a href="ng-todo.html" className="list-group-item col-sm-3 col-xs-6 version-angular">angular-1.3.2版</a>
				<a href="vue-todo.html" className="list-group-item col-sm-3 col-xs-6 version-vue">vue版</a>
				<a href="react-todo.html" className="list-group-item col-sm-3 col-xs-6 version-react active">react版</a>
			</div>
		);
	}
});


/**
 * TODO按钮
 */
var TodoBtn=React.createClass({
	filter:function(e){
		var ele=e.target,
			filter=ele.getAttribute("data-filter");
		this.props.filterTodo(filter);
	},


	/**
	 * 渲染todo按钮dom
	 * @return {Jsx} dom
	 */
	render:function(){
		var toggleAllBtnClass="col-sm-2 col-xs-6 btn ";
			toggleAllBtnClass+=!this.props.toggleAllTodo ? "btn-info" : "btn-default";
		return (
			<div className="col-sm-12 pd todo-btn-container">
                <button type="button" className={toggleAllBtnClass} onClick={this.props.finishAllTodo}>全选/不选</button>
                <button type="button" className="btn btn-danger col-sm-3 col-xs-6" onClick={this.props.clearFinishedTodo}>清空已完成</button>

                <button type="button" className="btn btn-info col-sm-2 col-xs-4" data-filter="all" onClick={this.filter}>所有(<span className="todo-total">{this.props.allTotal}</span>)</button>
                <button type="button" className="btn btn-default col-sm-2 col-xs-4" data-filter="finished" onClick={this.filter}>已完成(<span className="todo-finish-total">{this.props.finishTotal}</span>)</button>
                <button type="button" className="btn btn-default col-sm-3 col-xs-4" data-filter="nofinish" onClick={this.filter}>未完成(<span className="todo-nofinish-total">{this.props.noFinishTotal}</span>)</button>
            </div>
		);
	}
});



/**
 * TODO列表
 */
var TodoList=React.createClass({

	/**
	 * 渲染todo列表dom
	 * @return {Jsx} dom
	 */
	render:function(){
		// console.log(this.props.list);
		return (
			<ul className="list-group todo-list">
				{
                    this.props.list.map(function (item, i) {
                    	if ((this.props.filter === "finished" && item.status) || (this.props.filter === "nofinish" && !item.status) || this.props.filter === "all") {
	                    	var liClass=item.status ? "list-group-item todo-li todo-li-finished" : "list-group-item todo-li";
	                        return (
	                            <li className={liClass} key={i}>
	                                <label className="todo-span todo-check">
	                                    <input type="checkbox" className="todo-btn-check" checked={item.status} value={item.status} data-index={i} data-action="changeStatusTodo" onChange={this.props.actionByIndex} />
	                                </label>
	                                <span className="todo-content">{item.name}</span>
	                                <span className="todo-span todo-delete text-danger todo-btn-delete" data-index={i} data-action="deleteTodo" onClick={this.props.actionByIndex}>x</span>
	                            </li>
	                        );
                    	}
                     }.bind(this))
                }
			</ul>
		);
	}
});


/**
 * TODO表单Form
 */
var TodoForm=React.createClass({
	/**
	 * 检测TODO是否合法
	 * @param  {String}   value TODO值
	 * @return {Object}         TODO对象
	 */
	checkValueTodo: function() {
		if (this.props.todoValue) {
			this.props.addTodo();
			this.refs.todoInput.value="";
		} else {
			alert("必须输入TODOvalue");
		}
	},
	
	/**
	 * 渲染todo表单dom
	 * @return {Jsx} dom
	 */
	render:function(){
		var changeTotoValue=this.props.changeTotoValue,
			todoValue=this.props.todoValue,
			addTodo=this.addTodo;
		return (
			<div className="col-sm-12 todo-form pd">
				<div className="col-sm-8 col-xs-9 pd">
                    <input type="text" className="form-control col-sm-8 col-xs-9 todo-input" onChange={changeTotoValue} defaultValue={todoValue} ref="todoInput"  />
                </div>
                <div className="btn btn-info col-sm-4 col-xs-3" onClick={this.checkValueTodo}>添加</div>
			</div>
		);
	}
});



/**
 * TODO最大容器
 */
var TodoContainer=React.createClass({
	/**
	 * 初始化数据
	 * @return {Object} 初始化数据
	 */
	getInitialState:function(){
		return {
			/**
			 * [todoList 本地存储的TODO数据数组]
			 * @type {Array}
			 */
			todoList:[],

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
			 * [todoValue TODOinput值]
			 * @type {String}
			 */
			todoValue:"",


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
			 * [toggleAllToto 切换所有TODO完成或者不完成,默认为true->全部完成状态]
			 * @type {Boolean}
			 */
			toggleAllTodo: false
		}
	},


	/**
	 * 更新初始化数据
	 */
	componentWillMount:function(){
		var list=this.getTodo();
		if (list.length) {
			for (var i = 0; i < list.length; i++) {
				this.state.allTotal++;
				if (!list[i].status) {
					this.setState({
						toggleAllTodo:true
					});
					this.state.noFinishTotal++;
				}else{
					this.state.finishTotal++;
				}
			}
			this.setState({
				todoList:list,
				allTotal:this.state.allTotal,
				noFinishTotal:this.state.noFinishTotal,
				finishTotal:this.state.finishTotal
			});
		}else{
			this.setState({
				toggleAllTodo:true
			});
		}
	},


	/**
	 * 渲染完毕后更新本地
	 * @return {[type]} [description]
	 */
	componentDidUpdate:function(){
		// this.setTodo(this.state.list);
	},

	
	/**
	 * 设置TODO数据
	 * @return {Object} TODO对象
	 */
	setTodo:function(){
		store(this.state.todoKey,JSON.stringify(this.state.todoList));
	},


	/**
	 * 获取TODO列表
	 * @return {Object} TODO对象
	 */
	getTodo:function(){
		return store(this.state.todoKey) ? JSON.parse(store(this.state.todoKey)) : [];
	},


	/**
	 * 添加TODO数据
	 */
	addTodo:function(){
		var newItem={
			id: parseInt(this.state.todoList[this.state.todoList.length - 1] ? this.state.todoList[this.state.todoList.length - 1].id : 0) + 1,
			name: this.state.todoValue,
			status: false
		};
		this.state.todoList.push(newItem);
		this.state.allTotal++;
		this.state.noFinishTotal++;
		this.setState({
			todoList:this.state.todoList,
			allTotal:this.state.allTotal,
			noFinishTotal:this.state.noFinishTotal
		});
		this.setTodo();
	},


	/**
	 * 改变TODO的值
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
    changeTotoValue:function(e){
    	this.state.todoValue=e.target.value;
    	this.setState({
    		todoValue:this.state.todoValue,
    	});
    },


	/**
	 * 切换全部完成/不完成
	 */
	finishAllTodo:function(){
		var list=this.state.todoList;
		if (list.length) {
			var toggleAllTodo=this.state.toggleAllTodo;
			for (var i = 0; i < list.length; i++) {
				list[i].status = toggleAllTodo;
			}
			this.state[toggleAllTodo ? "finishTotal" : "noFinishTotal"]=this.state.allTotal;
			this.state[toggleAllTodo ? "noFinishTotal" : "finishTotal"]=0;
			this.setState({
				todoList:list,
				toggleAllTodo:!toggleAllTodo,
				finishTotal:this.state.finishTotal,
				noFinishTotal:this.state.noFinishTotal
			});
			this.setTodo();
		}
	},


	/**
	 * 清楚已完成todo
	 */
	clearFinishedTodo:function(){
		var list=this.state.todoList,
			temp=[];
		for (var i = 0; i < list.length; i++) {
			if (!list[i].status) {
				temp.push(list[i]);
			}
		}
		this.state.todoList=temp;

		this.state.finishTotal=0;
		this.state.allTotal=temp.length;
		this.state.noFinishTotal=temp.length;

		this.setState({
			todoList:temp,
			allTotal:this.state.allTotal,
			finishTotal:this.state.finishTotal,
			noFinishTotal:this.state.noFinishTotal
		});
		this.setTodo();
	},


	filterTodo:function(filter){
		this.state.filter=filter;
		this.setState({
			filter:filter
		});
		console.log("filter");
	},


	/**
	 * 改变todo列表状态
	 * @param  {Number} i   [当前操作的索引	]
	 * @param  {DOMObject} ele [DOM对象]
	 */
	changeStatusTodo:function(i,ele){
		if (ele.checked) {
			this.state.finishTotal++;
			this.state.noFinishTotal--;
		}else{
			this.state.finishTotal--;
			this.state.noFinishTotal++;
		}

		//更改值
		this.state.todoList[i].status=ele.checked;
	},
	/**
	 * 删除TODO
	 * @param  {Number} i   [当前操作的索引	]
	 */
	deleteTodo:function(i){
		var status=this.state.todoList[i].status;
		this.state.allTotal--;
		this.state[status ? "finishTotal" : "noFinishTotal"]--;
		this.state.todoList.splice(i,1);
	},
	/**
	 * 通过索引操作TODO列表(changeStatusTodo,deleteTodo)
	 * @param  {Object} e event对象
	 */
	actionByIndex:function(e){
		//获取当前dom元素和索引
		var ele=e.target,
			i=ele.getAttribute("data-index"),
			action=ele.getAttribute("data-action");

		//更改值
		this[action](i,ele);

		this.state.toggleAllTodo=this.state.finishTotal!=this.state.allTotal || this.state.allTotal==0;

		//让react自动更新dom
		this.setState({
			todoList:this.state.todoList,
			toggleAllTodo:this.state.toggleAllTodo,
			allTotal:this.state.allTotal,
			finishTotal:this.state.finishTotal,
			noFinishTotal:this.state.noFinishTotal
		});

		this.setTodo();
	},

	/**
	 * 渲染todo容器dom
	 * @return {Jsx} dom
	 */
	render:function(){
		return (
			<div className="row">
			 	<div className="col-sm-12">
				 	<div className="col-sm-6 col-sm-offset-2 pd">
                        <div className="col-sm-12 todo-container pd">
                        	<VersionToggle />
                        	<div className="clear clearfix"></div>
			 				<TodoForm todoValue={this.state.todoValue} changeTotoValue={this.changeTotoValue} addTodo={this.addTodo} />
			 				<TodoBtn finishAllTodo={this.finishAllTodo} toggleAllTodo={this.state.toggleAllTodo} clearFinishedTodo={this.clearFinishedTodo} filterTodo={this.filterTodo} allTotal={this.state.allTotal} noFinishTotal={this.state.noFinishTotal} finishTotal={this.state.finishTotal} />
			 				<div className="clear clearfix"></div>
			 				<TodoList list={this.state.todoList} actionByIndex={this.actionByIndex} filter={this.state.filter}  />
			 			</div>
			 		</div>
			 	</div>
			</div>
		);
	},
});



/**
 * [TodoDom 渲染todo容器]
 */
var TodoDom= ReactDOM.render(
  	<TodoContainer />,
  	document.getElementById('managerTodo')
);
