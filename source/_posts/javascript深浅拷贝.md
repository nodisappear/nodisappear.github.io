---
title: javascript深浅拷贝
categories: 编程语言
tags: 知识点
abbrlink: ad2c1b4b
date: 2021-12-04 10:32:31
author: 张雅娴
---

### 生成指定深度和广度的对象

```javascript
function createData(deep, breadth) {
  var data = {};
  var temp = data;

  for (var i = 0; i < deep; i++) {
    temp = temp["data"] = {};
    for (var j = 0; j < breadth; j++) {
      temp[j] = j;
    }
  }

  return data;
}

// 2层深度，每层有3个数据
createData(1, 3); 
```

### 浅拷贝 —— 一层拷贝
1. 遍历属性
```javascript
function shallowClone(source) {
  var target = {};
  // key in Obj：判断自身或原型链上是否存在某个属性
  // for key in Obj: 遍历自身以及原型链上enumerable为true的可枚举属性，结合hasOwnProperty可以过滤掉原型链上的属性
  // Object.keys(Obj): 遍历自身的可枚举属性
  // Object.getOwnPropertyNames(Obj): 遍历自身的所有属性
  for (var i in source) {
    if (source.hasOwnProperty(i)) {
      target[i] = source[i];
    }
  }

  return target;
}
```
2. Object.assign(target, ...sources)
3. { ...source }
4. lodash.clone
```javascript
let _ = require('lodash');
_.clone(source);
```

### 深拷贝 —— 无限层级拷贝

1. 扩展浅拷贝 **[不推荐]**

```javascript
// 存在问题：1.未直接检验参数是否为对象；2.判断属性是否为对象的逻辑不严谨，未考虑null；3.未兼容多种数据格式，如Map、Set等；...
function deepClone(source) {
  var target = {};
  for (var i in source) {
    if (source.hasOwnProperty(i)) {
      if (typeof source[i] === "object") {
        target[i] = deepClone(source[i]);
      } else {
        target[i] = source[i];
      }
    }
  }

  return target;
}

// 递归，栈溢出
deepClone(createData(10000)); // Maximum call stack size exceeded

// 循环引用，栈溢出
let data = {};
data.data = data;
deepClone(data); // Maximum call stack size exceeded
```
1. JSON.parse(JSON.stringify(source)) **[适用于JSON对象, 不保留引用，会爆栈]**
2. 构造函数 + 集合 **[可保留引用，会爆栈]**
```javascript
function deepClone(source, hash = new WeakMap()) {
  if (source === null) return source; 
  if (source instanceof Date) return new Date(source);
  if (source instanceof RegExp) return new RegExp(source);
  if (typeof source !== "object") return source;
  if (hash.get(source)) return hash.get(source);
  let target = new source.constructor();
  hash.set(source, target);
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = deepClone(source[key], hash);
    }
  }
  return target;
}
```
4. lodash.cloneDeep
```javascript
let _ = require('lodash');
_.cloneDeep(source);
```
5. deepmerge
```javascript
const merge = require('deepmerge');
merge(target, source);
```

### 扩展内容

#### 1. 判断对象

```javascript
function isObject(x) {
  // 与 typeof x 相比，能够区分null、array: typeof null === 'object'; typeof [1,2,3] === 'object'
  // 与 x.toString() 相比，调用的不是Object对象实例重写的方法而是Object原型对象的方法: [1,2,3].toString() === '1,2,3'; Object.prototype.toString.call([1,2,3]) === '[object Array]'
  // 不能准确判断自定义对象: function func() {}; Object.prototype.toString.call(new func()) === '[object Object]';
  return Object.prototype.toString.call(x) === "[object Object]";
}
```

#### 2. 判断类型

```javascript
function type(x, strict = false) {
  // 将strict转换为布尔型
  strict = !!strict;

  // 解决 typeof null === 'object' 无法判断的问题
  if (x === null) {
    return "null";
  }

  const t = typeof x;

  // typeof NaN === 'number'
  if (strict && t === Number && isNaN(x)) {
    return "NaN";
  }

  // typeof 1 === 'number'
  // typeof '1' === 'string'
  // typeof false === 'boolean'
  // typeof undefined === 'undefined'
  // typeof Symbol() === 'symbol'
  // typeof function (){} === 'function'
  if (t !== "object") {
    return t;
  }

  let cls, clsLow;
  try {
    cls = Object.prototype.toString.call(x).slice(8, -1);
    clsLow = cls.toLowercase();
  } catch (e) {
    // ie，new ActiveXObject(String)报错
    return "object";
  }

  if (clsLow !== "object") {
    if (strict) {
      // Object.prototype.toString.call(new Number(NaN)) === '[object Number]'
      if (clsLow === "number" && isNaN(clsLow)) {
        return "NaN";
      }
      // Object.prototype.toString.call(new Number()) === '[object Number]'; 
      // Object.prototype.toString.call(new Boolean()) === '[object Boolean]'; 
      // Object.prototype.toString.call(new String()) === '[object String]'; 
      if (clsLow === "number" || clsLow === "boolean" || clsLow === "string") {
        return cls;
      }
    }
    // Object.prototype.toString.call([]) === '[object Array]'; 
    // Object.prototype.toString.call(new Array()) === '[object Array]'
    // Object.prototype.toString.call(new Set()) === '[object Set]'
    // Object.prototype.toString.call(new WeakSet()) === '[object WeakSet]'
    // Object.prototype.toString.call(new Map()) === '[object Map]'
    // Object.prototype.toString.call(new WeakMap()) === '[object WeakMap]'
    // Object.prototype.toString.call(new WeakRef({})) === '[object WeakRef]'
    return clsLow;
  }

  // Object.prototype.toString.call({}) === '[object Object]'; constructor: Object
  // Object.prototype.toString.call(new Object()) === '[object Object]'; constructor: Object
  if (x.constructor == Object) {
    return clsLow;
  }

  try {
    // Object.prototype.toString.call(Object.create(null)) === '[object Object]'; constructor: undefined
    // Object.getPrototypeOf(Object.create(null)) === null
    // x.__prototype__ === null 应用于早期firefox
    if (Object.getPrototypeOf(x) === null || x.__prototype__ === null) {
      return "object";
    }
  } catch (e) {
    // ie，无Object.getPrototypeOf会报错
  }

  try {
    // Object.prototype.toString.call(new function(){}) === '[object Object]'; constructor: f(){}（）
    const cname = x.constructor.name;
    if(typeof cname === 'string') {
      return cname;
    }
  } catch (e) {
    // 无constructor
  }

  // function A() {}; A.prototype.constructor = null; new A
  // new A instanceof A === true
  return 'unknown';
}
```

#### 3. 通过 "循环+栈" 破解 "递归爆栈" 
&emsp;(1) 深度优先遍历, 用栈做中间节点缓存
```javascript
function deepLoopClone(obj) {
    if(obj === null || typeof obj !== 'object') {
        return obj
    }

    // 保留不同属性之间存在的引用关系 
    const uniqueList = [];

    const root = Array.isArray(obj) ? [] : {};
    const stack = [ 
        {
            parent: root,
            key: undefined,
            value: obj,
        }
    ];

    while(stack.length) {
        const node = stack.pop();
        const { parent, key, value } = node;

        let res = parent;
        if (typeof key !== 'undefined') {
            res = parent[key] = Array.isArray(value) ? [] : {};
        }

        let uniqueData = find(uniqueList, value);
        if(uniqueData) {
            parent[key] = uniqueData.target;
            break; 
        }

        uniqueList.push({
            source: value,
            target: res
        });

        for(let prop in value) {
            if (value.hasOwnProperty(prop)) {
                if (prop && typeof value[prop] === 'object') {
                    stack.push({
                        parent: res,
                        key: prop,
                        value: value[prop],
                    });
                } else {
                    res[prop] = value[prop];
                }
            }
        }
    }

    return root;
}

// 查找对象
function find(arr, item) {
    for(let i = 0; i < arr.length; i++) {
        if (arr[i].source === item) {
            return arr[i];
        }
    }

    return null;
}
```
&emsp;(2) 广度优先遍历, 用队列做中间节点缓存  
```javascript
function rangeLoopClone(obj) {
    if(obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    // 保留不同属性之间存在的引用关系 
    const uniqueList = [];

    const root = Array.isArray(obj) ? [] : {};
    const queue = [
        {
            parent: root,
            key: undefined,
            value: obj,
        }
    ];

    while(queue.length) {
        const node = queue.shift();
        const { parent, key, value } = node;

        if (typeof key !== 'undefined') {
            res = parent[key] = Array.isArray(value) ? [] : {};
        }

        let uniqueData = find(uniqueList, value);
        if(uniqueData) {
            parent[key] = uniqueData.target;
            break; 
        }

        uniqueList.push({
            source: value,
            target: res
        });

        for(let prop in value) {
            if (value.hasOwnProperty(prop)) {
                if (prop && typeof value[prop] === 'object') {
                    queue.push({
                        parent: res,
                        key: prop,
                        value: value[prop],
                    });
                } else {
                    res[prop] = value[prop];
                }
            }
        }
    }
    
    return root;
}

// 查找对象
function find(arr, item) {
    for(let i = 0; i < arr.length; i++) {
        if (arr[i].source === item) {
            return arr[i];
        }
    }

    return null;
}
```

#### 4. 循环引用

&emsp;(1) 常见类型 
 
- 对象之间相互引用
```javascript  
let obj1 = { name: '1' };
let obj2 = { name: '2' };
obj1.obj = obj2;
obj2.obj = obj1;  
```
- 对象的属性引用对象本身  
```javascript  
// 直接引用最外层的对象
let obj = { name: '1' };
obj.child = obj;

// 引用对象的部分属性
let obj = { name: '1', child: {} };
obj.child.child = obj.child;  
```

&emsp;(2) 判断循环引用
```javascript  
const isCyclic = (obj) => {
    // 用Set数据类型存储检测过的对象
    let stackSet = new Set();
    let detected = false;

    const detect = (obj) => {
            if(obj && typeof obj != 'object') {
            return;
        }

        if(stackSet.has(obj)) {
            return detected = true;
        }

        stackSet.add(obj);

        for(let key in obj) {
            if(obj.hasOwnProperty(key)) {
                detect(obj[key]);
            }
        }

        // 平级检测完成之后，将当前对象删除
        stackSet.delete(obj);
    };

    detect(obj);

    return detected;
};  
```

&emsp;(3) 用JSON.stringify输出有循环引用的对象
```javascript  
let obj = { };
obj.child = obj;
// JSON.stringify()内部做了循环引用的检测
JSON.stringify(obj); // Uncaught TypeError: Converting circular structure to JSON

let cache = [];
JSON.stringify(obj, (key,value)=>{
    if(value && typeof value === 'object') {
        if(cache.indexOf(value) !== -1) {
            return;
        }
        cache.push(value);
    }
    return value;
});
cache = null;
```

## 参考链接

1. [深拷贝的终极探索（99%的人都不知道）](https://segmentfault.com/a/1190000016672263)
2. [用 Object.prototype.toString.call(obj)检测对象类型原因分析](https://www.jb51.net/article/148604.htm)
3. [详解 forin，Object.keys 和 Object.getOwnPropertyNames 的区别](https://yanhaijing.com/javascript/2015/05/09/diff-between-keys-getOwnPropertyNames-forin/)  
4. [如何优雅地嗅探”对象“是否存在”环“？](https://juejin.cn/post/7023898521010962462#heading-0)
5. [Javascript中的尾递归及其优化](https://zhuanlan.zhihu.com/p/47155064)
6. [尾调用和尾递归](https://juejin.cn/post/6844903590033621006#heading-11)
7. [利用深度/广度优先遍历手动实现JavaScript对象的深度拷贝](https://segmentfault.com/a/1190000019991949)