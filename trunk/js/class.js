//define(function(require, exports, module) {
	
	var toString = Object.prototype.toString;
	var slice = [].slice;

    var isArray = Array.isArray || function(val) {
		return toString.call(val) === '[object Array]'
    };

    var isFunction = function(val) {
    	return toString.call(val) === '[object Function]'
    };
    
    /*
	 * 实现js的原型继承: 
	 * 1. 原型继承： 占用内存比较小，保持对父对象的继承（父类修改，子类也可以同步修改，这个不一定好，原则上父类创建后，最好不要改）
	 * 2. 拷贝继承：原型链会比较短，访问速度比较快，父类修改不会影响子类；但比较占用内存,拷贝过程需要一些计算量
	 * 3. 基本原则：尽量减少内存占用，多采用extend
	 */
	function Class(arg) {
		
		return Class.create(arg);
	}
	
	Class.create = function(arg) {
		var SubClass = create(arg);
		
		SubClass.extend = function(SuperClass) {
			
			return Class.extend(SubClass, SuperClass);
		};
		
		SubClass.implement = function() {
			var interfaces = slice.call(arguments, 0);
			interfaces.unshift(SubClass);
			return Class.implement.apply(Class, interfaces);
		};

		return SubClass;
	};
	//比implement少占用内存，但父类修改会影响子类
	Class.extend = function(SubClass, SuperClass) {
		SubClass = create(SubClass);
		SuperClass = create(SuperClass);
		//继承SuperClass的prototype
		SubClass.prototype = extend(SuperClass.prototype, SubClass.prototype);
		//在继承后的对象中，如果要初始化父类的构造函数，需要再initialize方法或构造方法中
		//调用this.superclass.apply(this, arguments)或this.superclass(arg1, arg2,...)
		//这里没有用驼峰式，为了和用户自定义的区分开来
		SubClass.prototype.superclass = SuperClass;
		
		return SubClass;
	};
	//比extend占内存，但父类的修改不影响到子类，子类不可调用父类的构造函数
	Class.implement = function(SubClass) {
		var interfaces = slice.call(arguments, 0);
		interfaces[0] = {};
		interfaces.push(SubClass = create(SubClass));
		SubClass.prototype = extend.apply(null, interfaces);
		if (arguments.length == 2) {
			SubClass.prototype.superclass = create(arguments[1]);
		}
		
		return SubClass;
	};
	
	function create(arg) {
		var superclass = noop;
		if (isFunction(arg)) {
			superclass = arg;
			arg = arg.prototype;
		}
		
		function SubClass() {
			superclass.apply(this, arguments);
			//防止调用this.superclass.apply(this, arguments)时造成死循环
			if (this.constructor === SubClass && isFunction(this.initialize)) {
		        this.initialize.apply(this, arguments);
		      }
		}
		
		SubClass.prototype = createProto(arg, SubClass);
		
		return SubClass;
	}
	
	function createProto(obj, constructor) {
		var F = noop;
		F.prototype = obj || {};
		F = new F();
		F.constructor = constructor;
		return F;
	}
	
	function noop() {}
	
	function extend(target, src) {
		var proto = target;
		if (isFunction(target)) {
			target.prototype = proto = target.prototype || {};
		}
		for (var i = 1, len = arguments.length; i < len; i++) {
			src = arguments[i];
			if (isFunction(src)) {
				src = src.prototype || {};
			}
			for (var j in src) {
				proto[j] = src[j];
			}
		}
		
		return target;
	}
	
//);