---
title: 读《JavaScript设计模式核心原理与应用实践》
categories: 技术
tags: 笔记
author: 张雅娴
abbrlink: 806a46bc
date: 2021-11-03 16:18:10
---

[掘金小册——JavaScript 设计模式核心原理与应用实践](https://juejin.cn/book/6844733790204461070)

## 开篇：前端工程师的成长论

### 一. 软件工程师的核心竞争力

&ensp;**驾驭技术的能力**

1. 能用健壮的代码解决具体问题
2. 能用抽象的思维应对复杂系统
3. 能用工程化思想规划大型业务

## 设计模式的“道”与“术”

### 一. 设计模式的指导理论

&ensp;**SOLID 设计原则**

1. \*单一职责 [单一功能]
2. \*开放封闭 —— 对扩展开放，对修改封闭
   - 类、模块、函数等软件实体可以扩展，但不可以修改
3. 李式置换 [里式替换]
4. 接口独立 [接口隔离]
5. 依赖导致 [依赖反转]

### 二. 设计模式的核心思想

&ensp;**封装变化**

&ensp;观察整个逻辑里面的变与不变并分离它们，使变化的部分灵活而不变的部分稳定

### 三. 23 种设计模式

&ensp;**创建型 —— 封装创建对象过程中的变化**

1. 单例模式
2. 原型模式
3. 构造器模式
4. 工厂模式
5. 抽象工厂模式

&ensp;**结构型 —— 封装对象之间组合方式的变化**

1. 桥接模式
2. 外观模式
3. 组合模式
4. 装饰器模式
5. 适配器模式
6. 代理模式
7. 享元模式

&ensp;**行为型 —— 封装对象千变万化的行为**

1. 迭代器模式
2. 解释器模式
3. 观察者模式
4. 中介者模式
5. 访问者模式
6. 状态模式
7. 备忘录模式
8. 策略模式
9. 模板方法模式
10. 职责链模式
11. 命令模式

## 创建型：工厂模式 —— 区分“变与不变”

### 一. 构造器模式

&ensp;**用构造函数初始化对象 —— 抽象不同对象实例之间的变与不变**

```javascript
// 将赋值过程封装，确保每个对象具备 共性
function User(name, age, career) {
  this.name = name;
  this.age = age;
  this.career = career;
}

// 将取值操作开放，确保每个对象具备 个性
const user = new User("李雷", 25, "coder");
```

### 二. 简单工厂模式

&ensp;**将创建对象的过程单独封装 —— 抽象不同构造函数之间的变与不变**

```javascript
function User(name, age, career, work) {
  this.name = name;
  this.age = age;
  this.career = career;
  this.work = work;
}

// 将 承载共性的构造函数 和 承载个性的逻辑判断 写入同一函数
function Factory(name, age, career) {
  let work;
  switch (career) {
    case "boss":
      work = ["喝茶", "看报", "见客户"];
      break;
    case "coder":
      work = ["写代码", "写系分", "修Bug"];
      break;
  }
  return new User("李雷", 25, "coder");
}
```

&ensp;**`重要提示：`**
&emsp;在写了大量构造函数、调用了大量 new 的情况下，就应该思考是不是可以用工厂模式重构代码了！

### 三. 抽象工厂模式

&ensp;**围绕一个超级工厂创建其他工厂 —— 遵循“开放封闭”设计原则**

&ensp;将一个复杂场景中不同的类按性质划分为 4 个关键角色[1 - 4]：

&nbsp;0. 超级工厂：拥有多个抽象工厂的系统 【电子厂】

1. 抽象工厂：抽象类，用于声明最终目标产品的共性，每个抽象工厂对应的一类产品称为“产品族” 【手机厂，电脑厂，...】
2. 具体工厂：继承自抽象工厂，用于生成产品族里的一类具体产品 【智能手机厂，非智能手机厂，...】
3. 抽象产品：抽象类，用于声明具体产品所依赖的细粒度产品的共性 【操作系统厂，硬件厂，...】
4. 具体产品： 继承自抽象产品，用于生成具体产品所依赖的细粒度产品 【安卓操作系统厂/苹果操作系统厂，小米硬件厂/高通硬件厂，...】

```javascript
// 抽象工厂，定义手机的共性
class MobilePhoneFactory {
  createOS() {
    // 提供操作系统的接口
    throw new Error("抽象工厂方法不允许直接调用，你需要将我重写！");
  }
  createHardWare() {
    // 提供硬件的接口
    throw new Error("抽象工厂方法不允许直接调用，你需要将我重写！");
  }
}
// 具体工厂，用于生成手机实例
class FakeStarFactory extends MobilePhoneFactory {
  createOS() {
    // 提供操作系统实例
    return new AndroidOS();
  }
  createHardWare() {
    // 提供硬件实例
    return new QualcommHardWare();
  }
}
// 抽象产品，定义手机操作系统的共性
class OS {
  controlHardWare() {
    throw new Error("抽象产品方法不允许直接调用，你需要将我重写！");
  }
}
// 具体产品，定义具体的手机操作系统
class AndroidOS extends OS {
  controlHardWare() {
    console.log("操作系统：我会用安卓的方式去操作硬件");
  }
}
// 抽象产品，定义手机硬件的共性
class HardWare {
  operateByOrder() {
    throw new Error("抽象产品方法不允许直接调用，你需要将我重写！");
  }
}
// 具体产品：定义具体的手机硬件
class QualcommHardWare extends HardWare {
  operateByOrder() {
    console.log("硬件：我会用高通的方式去运转");
  }
}

// 生产一台拥有安卓操作系统和高通硬件的手机
const myMobilePhone = new FakeStarFactory(); // 创建手机实例
const myOS = myMobilePhone.createOS(); // 添加操作系统
const myHardWare = myMobilePhone.createHardWare(); // 添加硬件
myOS.controlHardWare(); // 启动操作系统
myHardWare.operateByOrder(); // 启动硬件

// 扩展具体工厂， 生产一款新的手机
class newStarFactory extends MobilePhoneFactory {
  createOS() {}
  createHardWare() {}
}
```

&ensp;**`重要提示：`**
&emsp;1. 抽象工厂和简单工厂的共同之处是都基于“封装变化”的思想去分离一个系统中变与不变的部分，不同之处是应用的场景复杂度不同，简单工厂的处理对象是不苛求可扩展性的简单类，抽象工厂的处理对象是存在各种扩展可能性的能进一步划分的复杂类。
&emsp;2. 抽象工厂目前在 JS 中应用得并不广泛，需要留意三点：(1) 学会用 ES6 模拟 Java 中的抽象类；(2) 了解抽象工厂模式中四个角色的定位和作用；(3) 理解“开放封闭”设计原则，知道它的好用之处和执行之必要性。

## 创建型：单例模式 —— Vuex 的数据管理哲学

### 一. 单例模式的实现思路

&ensp;**保证一个类仅有一个实例，并提供一个访问它的全局访问点 —— 不管尝试创建多少次，都只返回第一次创建的实例**

&ensp;构造函数需要具备判断自己是否已经创建过一个实例的能力

```javascript
// 1.判断逻辑写在静态方法中
class SingleDog {
  constructor() {
    this.instance = null;
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new SingleDog();
    }
    return this.instance;
  }
}
const s1 = SingleDog.getInstance();
const s2 = SingleDog.getInstance();

// 2.判断逻辑写在闭包中
function SingleDog() {}
const getInstance = (function () {
  let instance = null;
  return function () {
    if (!instance) {
      instance = new SingleDog();
    }
    return instance;
  };
})();
const s1 = getInstance();
const s2 = getInstance();

// s1和s2都指向唯一的实例
s1 === s2; // true
```

### 二. 生产实践：Vuex 中的单例模式

**理解 Vuex 中的 Store**

1. 引入 Vuex 插件

```javascript
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
```

- Vue.use 源码

```javascript
// 截取参数
function toArray(list: any, start?: number): Array<any> {
  start = start || 0;
  let i = list.length - start;
  const ret: Array<any> = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}
// 注册插件
export function initUse(Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = []); // 已安装插件列表
    if (installedPlugins.indexOf(plugin) > -1) {
      // 防止重复注册
      return this;
    }

    const args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === "function") {
      // 如果插件是一个对象，必须提供install方法
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === "function") {
      // 如果插件是一个函数，它会被直接当作install方法
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this;
  };
}
```

- Vuex install 源码

```javascript
let vue; // instance
function install(_Vue) {
  if (Vue && _Vue === Vue) {
    // 判断传入的Vue实例对象是否已经被install过Vuex插件
    if (__DEV__) {
      console.error(
        "[vuex] already installed. Vue.use(Vuex) should be called only once."
      );
    }
    return;
  }
  Vue = _Vue; // 若没有，为该Vue实例对象install一个唯一的Vuex
  applyMixin(Vue); // 将Vuex的初始化逻辑写进Vue的钩子函数里
}
// applyMixin(Vue)
function vuexInit() {
  const options = this.$options; // 当前Vue实例的初始化选项
  if (options.store) {
    // 根实例有store
    this.$store =
      typeof options.store === "function" ? options.store() : options.store;
  } else if (options.parent && options.parent.$store) {
    // 根实例没有store，就找父节点的store
    this.$store = options.parent.$store;
  }
}
Vue.mixin({ beforeCreate: vuexInit }); // 全局混入
```

2. 创建 store

```javascript
const store = new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {},
});
```

3. 将 store 注入到 Vue 实例中

```javascript
new Vue({
  el: "#app",
  store,
});
```

## 创建型：原型模式 —— 谈 Prototype 无小事

### 一. 以类为中心的语言和以原型为中心的语言

&ensp;**以类为中心的语言，原型模式不是必选项，它只用于特定场景** 

&ensp;Java在大多数情况下以“实例化类”的方式来创建对象，虽然专门针对原型模式设计了一套接口和方法，但是只在必要场景下通过原型方法来应用原型模式，实现类型之间的解耦
```java
// 实例化类：通过传递相同的参数来创建相同的实例
Dog dog = new Dog('旺财', 'male', 3, '柴犬')
Dog dog_copy = new Dog('旺财', 'male', 3, '柴犬')
```
&ensp;**以原型为中心的语言，原型模式是根基，是一种编程范式** 

&ensp;JavaScript本身类型比较模糊，不存在类型耦合的问题，使用原型模式不是为了得到一个副本，而是为了得到与构造函数（类）相对应类型的实例，实现数据和方法的共享

### 二. 谈原型模式，其实是谈原型范式
&ensp;**在JavaScript中，原型编程范式的体现就是基于原型链的继承**

#### 1. 原型 

&ensp;(1) 每个构造函数都有一个prototype属性指向其原型对象，而其原型对象又有一个constructor属性指回构造函数本身  
&ensp;(2) 每个实例都有一个__proto__属性，使用构造函数创建实例时，实例的__proto__属性就会指向构造函数的原型对象

```javascript
// 创建Dog构造函数
// Dog.prototype.constructor === Dog
function Dog(name, age) {
  this.name = name
  this.age = age
}
Dog.prototype.eat = function() {
  console.log('肉骨头真好吃')
}

// 使用Dog构造函数创建dog实例
// dog.__proto__ === Dog.prototype
// dog.hasOwnProperty('name') === true; dog.hasOwnProperty('age') === true
// dog.eat === Dog.prototype.eat; dog.hasOwnProperty('eat') === false
const dog = new Dog('旺财', 3)

// 原型链： 实例 -> 实例的原型对象 -> 实例的原型对象的原型对象 ... -> Object
// dog -> dog.__proto__(Dog.prototype) ->  Dog.prototype.__proto__(Object.prototype)
// Object.prototype.__proto__ === null
dog.toString() === '[object Object]'

// 创建一个没有原型的对象
Object.create(null).__proto__ === undefined
```

### 对象的深拷贝
&ensp;**深拷贝没有完美方案，每一种方案都有它的边界case，需要考虑不同数据结构（Array、Object、Map和Set等）的处理**

用递归实现深拷贝的核心思路
```javascript
function deepClone(obj) {
    // 值类型或null
    if(obj === null || typeof obj !== 'object') {
        return obj
    }

    // 定义结果对象
    let copy = {}
    if(obj.constructor === Array) {
        copy = []
    }

    for(key in obj) {
        if(obj.hasOwnProperty(key)) {
            copy[key] = deepClone(obj[key])
        }
    }

    return copy
}
```

更多内容： [深浅拷贝](https://nodisappear.github.io/ad2c1b4b.html)

## 结构型：装饰器模式 —— 对象装上它，就像开了挂
&ensp;**在不改变原对象的基础上，对原对象进行包装拓展使其可以满足用户更复杂的需求**

### 装饰器模式初相见
&ensp;**为了不被业务逻辑所干扰，应该将旧逻辑与新逻辑分离**  
```html
<!-- button -->
<button id='open'>点击</button>
```
```javascript
// modal
const Modal = (function() {
    let modal = null
    return function() {
        if(!modal) {
            modal = document.createElement('div')
            modal.innerText = 'modal'
            modal.style.display = 'none'
            document.body.appendChild(modal)
        }
        return modal
    }
})()
// 封装旧逻辑-显示modal
class OpenButton {
    onClick() {
        const modal = new Modal()
        modal.style.display = 'block'
    }
}
// 装饰器-修改按钮的文字和状态
class Decorator {
    constructor(open_button) {
        this.open_button = open_button // 传入内含旧逻辑的实例
    }
    onClick() {
        this.open_button.onClick() // 执行-旧逻辑
        this.changeButtonStatus() // 执行-新逻辑
    }
    // 整合新逻辑
    changeButtonStatus() {
        this.changeButtonText()
        this.disableButton()
    }
    // 拆分新逻辑
    disableButton() {
        const btn =  document.getElementById('open')
        btn.setAttribute("disabled", true)
    }
    changeButtonText() {
        const btn = document.getElementById('open')
        btn.innerText = '置灰'
    }
}
const openButton = new OpenButton()
const decorator = new Decorator(openButton)
document.getElementById('open').addEventListener('click', function() {
    decorator.onClick()
})
```

### 值得关注的细节
&ensp;**`重要提示：`**  
&emsp;在日常开发中，当遇到两段各司其职的代码逻辑时，首先要有“尝试拆分”的敏感，其次要有“该不该拆”的判断，当逻辑粒度过小时，盲目拆分会导致代码中存在过多零碎的小方法，反而不会使代码变得更好

## 结构型：装饰器模式 —— 深入装饰器原理与优秀案例

### 前置知识：ES7中的装饰器
&ensp;**在ES7中，可以用 @语法糖 去装饰一个类或一个类的方法**
```javascript
// 装饰器函数
function classDecorator(target) {
    target.hasDecorator = true 
    return target
}
// 类装饰器
@classDecorator
class Button {} 
Button.hasDecorator // true

function funDecorator(target, name, descriptor) { 
    let originalMethod = descriptor.value 
    descriptor.value = function() {
        console.log('装饰器逻辑')
        return originalMethod.apply(this, arguments)
    }
    return descriptor
}
// 方法装饰器
Class Button {
    @funDecorator
    onClick() {
        console.log('原有逻辑')
    }
} 
const button = new Button() 
button.onClick() // 装饰器逻辑 原有逻辑
```

### 装饰器语法糖背后的故事
&ensp;**装饰器最基本的操作是定义装饰器函数，将被装饰者“交给”装饰器** 

1. 装饰器函数传参  
(1) 类修饰器：第一个参数是目标类  
(2) 方法装饰器：第一个参数是目标类的原型对象，第二个参数是目标属性名，第三个参数是属性描述对象
2. 装饰器函数的调用时机  
装饰器函数在编译阶段执行，类的实例在代码运行时动态生成，为了让实例能正常调用被装饰好的类的方法，只能用装饰器去修饰目标类的原型对象

### 生产实践

#### React中的装饰器：HOC
&ensp;**HOC（Higher Order Component），高阶组件**

1. 编写一个高阶组件，把传入的组件丢进一个有红色边框的容器中

```javascript
// 高阶组件是一个函数，接收一个组件作为参数，并返回一个新组件
import React, { Component } from 'react'

const BorderHoc = WrappedComponent => class extends Component {
    return() {
        return <div style="{{ border: 'solid 1px red' }}"> 
            <WrappedComponent />
        </div>
    }
}

// 装饰目标组件
@BorderHoc
class TargetComponent extends React.Component {
    render() {}
}
```

2. 用装饰器改写 Redux connect

```javascript
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import action from './action.js'

// 建立组件和状态之间的映射关系
function mapStateToProps(state) {
    return state.app 
}

// 建立组件和store.dispatch的关系，使组件具备通过dispatch来派发状态的能力
function mapDispatchToProps(dispatch) {
    return bindActionCreators(action, dispatch)
}

/* ------ 原本 ------- */
class App extends Component {
    render() {}
}
// 调用connect可以返回一个具有装饰作用的函数，接收一个组件作为参数，传入组件与Redux结合，具备Redux提供的数据和能力
connect(mapStateToProps, mapDispatchToProps)(App) 

/* ------ 改写 ------ */
// 将调用connect的结果作为一个装饰器
const _connect = connect(mapStateToProps, mapDispatchToProps)

@_connect 
class App extends Component {
    render()
}
```

## 结构型：适配器模式 —— 兼容代码就是一把梭
&ensp;**通过把一个类的接口变换成客户端所期待的另一种接口，解决一些兼容性问题**

### 适配器的业务场景
&ensp;**用适配器承接旧接口的参数，实现新旧接口的无缝衔接**

```javascript
// 旧接口
function Ajax(type, url, data, success, failed) {
    if(type === 'Get') {}
    else if(type === 'Post') {}
}
Ajax('get', url, data, function(res){}, function(err){})
Ajax('post', url, data, function(res){}, function(err){})

// 新接口
class HttpUtils {
    static get(url) {}
    static post(url, data) {}
}

// 适配器 - 入参与旧接口保持一致
function AjaxAdapter(type, url, data, success, failed) {
    let res
    try {
        if(type === 'Get') {
            res = HttpUtils.get(url)
        } else if(type === 'Post') {
            res = HttpUtils.post(url, data)
        }
        success(res)
    } catch(err) {
        failed(err)
    }
}
function Ajax(type, url, data, success, failed) {
    AjaxAdapter(type, url, data, success, failed)
}
``` 
### 生产实践：axios中的适配器
&ensp;**用dispatchRequest方法派发请求**

```javascript
// 1. 统一接口
Axios.prototype.request = function request(config) {
    return dispatchRequest(newConfig) 
}
// 用getDefaultAdapter方法获取默认适配器
var defaults = {
    adapter: getDefaultAdapter()
}
function getDefaultAdapter() { 
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') { // 浏览器环境
        adapter = function xhrAdapter(config) {
            return new Promise(function dispatchXhrRequest(resolve, reject) {}) // 4. 统一规则
        }
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') { // Node环境
        adapter = function httpAdapter(config) {
            return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {} // 4. 统一规则
        }
    }
    return adapter; // 3. 统一出参，都是Promise
}

// 2. 统一入参，调用适配器
function dispatchRequest(config) {
    // 转换请求体
    config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
    );
    var adapter = config.adapter || defaults.adapter;
    return adapter(config).then(
        function onAdapterResolution(response) {
            // 转换响应体
            response.data = transformData.call(
                config,
                response.data,
                response.headers,
                config.transformResponse
            );
            return response
        }, 
        function onAdapterRejection(reason) {
            // 转换响应体
            if (reason && reason.response) {
                reason.response.data = transformData.call(
                    config,
                    reason.response.data,
                    reason.response.headers,
                    config.transformResponse
                )
            }
            return Promise.reject(reason)
        }
    );
}
```

## 结构型：代理模式 —— 应用实践范例解析
&ensp;**一个对象不能直接访问另一个对象，需要第三者牵线搭桥而间接达到访问目的**

### 前置知识 ES6中的Proxy
```javascript
const proxy = new Proxy(target, handler) // target为目标对象，handler为拦截行为
```

### 事件代理
&ensp;**基于事件冒泡特性，将子元素的事件监听绑定到父元素上，操作不会直接触及目标子元素，而是由父元素进行处理分发后间接作用于子元素**
```html
<div id="father">
    <a href="#">链接1号</a>
    <a href="#">链接2号</a> 
</div>
```
```javascript
// 未代理，监听每个子元素
const aNodes = document.getElementById('father').getElementsByTagName('a')
for(let i=0;i<aNodes.length;i++) {
    aNodes[i].addEventListener('click', function(e) {
        e.preventDefault()
        alert(`我是${aNodes[i].innerText}`)                  
    })
}
// 代理，只监听父元素
document.getElementById('father').addEventListener('click', function(e) {
    if(e.target.tagName === 'A') {
        e.preventDefault()
        alert(`我是${e.target.innerText}`) 
    }
})
```

### 虚拟代理
&ensp;**图片预加载时，页面img元素先展示占位图片，创建一个Image实例加载目标图片，然后将页面img元素的src指向目标图片（已缓存）**
```javascript
// 操作真实Image
class PreLoadImage { 
    constructor(imgNode) {
        this.imgNode = imgNode
    }
    setSrc(imgUrl) {
        this.imgNode.src = imgUrl
    }
}

// 接收真实Image，操作虚拟Image
class ProxyImage { 
    static LOADING_URL = 'xxxxxx'
    constructor(targetImage) {
        this.targetImage = targetImage
    }
    setSrc(targetUrl) {
        this.targetImage.setSrc(ProxyImage.LOADING_URL) // 真实Image初始化显示占位图片
        const virtualImage = new Image() // 创建虚拟Image实例
        virtualImage.onload = () => { // 虚拟Image加载完毕，真实Image显示真实图片
            this.targetImage.setSrc(targetUrl)
        }
        virtualImage.src = targetUrl // 虚拟Image初始化显示真实图片
    }
}
```

### 缓存代理
&ensp;**对运算结果进行缓存**
```javascript
// 未代理，每次都重新计算
const addAll = function() {
    let result = 0
    const len = arguments.length
    for(let i = 0; i < len; i++) {
        result += arguments[i]
    }
    return result
}

// 代理，优先从缓存中读取计算结果
const proxyAddAll = (function(){                     
    const resultCache = {}
    return function() {
        const args = Array.prototype.join.call(arguments, ',')
        if(args in resultCache) {
            return resultCache[args]
        }
        return resultCache[args] = addAll(...arguments)
    }
})()
proxyAddAll(1,2)
```

### 保护代理
&ensp;**在访问层的getter和setter函数里添加校验和拦截，确保一部分变量是安全的**
```javascript
const person = {
    age: 18,
    career: 'teacher',
    phone: 12345654321
}
const baseInfo = ['age', 'career']
const privateInfo = ['phone']
const user = {isValidated: true, isVIP: false}

const accessProxy = new Proxy(person, {
    get: function(person, key) {
        if(!user.isValidated) {
            alert('您还没有完成验证哦')
            return
        } 
        if(!user.isVIP && privateInfo.indexOf(key)!==-1) {
            alert('只有VIP才可以查看该信息哦')
            return
        } 

        return person[key]
    }
})
```

## 行为型：策略模式 —— 重构小能手，拆分胖逻辑
&ensp;**定义一系列的算法,把它们一个个封装起来, 并且使它们可相互替换**

```javascript
// 对象映射：把相关算法收敛到一个对象里 
// 单一职责原则：各行为函数相互独立，不依赖调用主体
const priceProcessor = {
    processor1(originPrice) {
        if (originPrice >= 100) {
            return originPrice - 20
        }
        return originPrice * 0.9
    },
    processor2(originPrice) {
        if (originPrice >= 100) {
            return originPrice - 30
        }
        return originPrice * 0.8
    }
};

// 通过委托实现行为分发
function askPrice(tag, originPrice) {
  return priceProcessor[tag](originPrice)
}

// 扩展：开发封闭原则
priceProcessor.processor3 = function(originPrice) {
    if (originPrice >= 100) {
        return originPrice - 50
    }
    return originPrice
}

askPrice('processor3', 150) // 100
```

## 行为型：状态模式 —— 自主咖啡机背后的力量
&ensp;**允许一个对象在其内部状态改变时改变它的行为，对象看起来似乎修改了它的类**

```javascript
class CoffeeMaker {
    constructor() {
        this.state = 'init'
        this.excessMile = '1000ml' // 主体状态
    }
    // 单一职责原则：各行为函数可能不会特别割裂，和状态主体之间存在着关联
    stateToProcess = {
        that: this,
        american() {
            console.log('咖啡机现在的牛奶存储量是:', this.that.leftMilk) // 获取主体状态
            console.log('我只吐黑咖啡')
        }
        latte() {
            this.american()
            console.log('加点奶')
        },
        mocha() {
            this.latte();
            console.log('加点巧克力')
        }
        changeState(state) { // 状态切换函数
            this.state = state
            if (!this.stateToProcessor[state]) {
                return
            }
            this.stateToProcessor[state]()
        }
    }
}

const mk = new CoffeeMaker();
mk.changeState('latte');
```

## 行为型：观察者模式 —— 鬼故事：产品经理拉了一个钉钉群
&ensp;**观察者模式定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个目标对象，当这个目标对象的状态发生变化时，会通知所有观察者对象，使它们能够自动更新，发布者可以直接触及到订阅者**

```javascript
/* ------ 角色划分 状态变化 发布者通知订阅者 ------ */
// 抽象的发布者类
class Publisher {
    constructor() {
        this.observers = [] // *维护订阅者的集合
        console.log('Publisher created')
    }
    addObserver(observer) { // 增加订阅者
        console.log('Publisher.addObserver invoked')
        this.observers.push(observer)
    }
    removeObserver(observer) { // 移除订阅者
        console.log('Publisher.removeObserver invoked')
        this.observers.forEach((item, i) => {
            if (item === observer) {
                this.observers.splice(i, 1)
            }
        })
    }
    notifyObserver() { // 通知所有订阅者
        console.log('Publisher.notifyObserver invoked')
        this.observers.forEach((observer) => {
            observer.update(this)
        })
    }
}

// 抽象的订阅者类
class Observer {
    constructor() {
        console.log('Observer created')
    }
    update() {
        console.log('Observer.update invoked') // *提供统一方法供发布者调用
    }
}

// 具体的发布者类
class SpPublisher extends Publisher {
    constructor() {
        super()
        this.state = null
        console.log('SpPublisher created')
    }
    getState() {
        console.log('SpPublisher.getState invoked')
        return this.state
    }
    setState(state) {
        console.log('SpPublisher.setState invoked')
        this.state = state
        this.notifyObserver()
    }
}

// 具体的订阅者类
class SpObserver extends Observer {
    constructor() {
        super()
        this.state = null
        console.log('SpObserver created')
    }
    update(publisher) {
        console.log('SpObserver.update invoked')
        this.state = publisher.getState()
        this.do()
    }
    do() {
        console.log('SpObserver.do invoked')
        console.log(this.state)
    }
}

const publisher = new SpPublisher()
const observer1 = new SpObserver()
const observer2 = new SpObserver()
publisher.addObserver(observer1)
publisher.addObserver(observer2)
publisher.setState('go!!!')
```

## 行为型：观察者模式 —— 面试真题手把手教学

### Vue数据双向绑定（响应式系统）的实现原理
&ensp;**“发布-订阅”模式：发布者不直接触及到订阅者，而是由统一的第三方完成实际的通信操作,实现了完全地解耦**  

1. 三个关键角色：监听器、订阅者、编译器   
(1) observer监听器：监听数据并转发给订阅者（发布者）  
(2) watcher订阅者：接收数据并更新视图  
(3) compile编译器：初始化视图，更新订阅者...
1. 核心代码
```javascript
// observer：在init阶段，对数据进行响应式化
function observer(target) {
    if(target && typeof target === 'object') {
        Object.keys(target).forEach((key)=>{
            defineReactive(target, key, target[key])      
        })
    }
}
function defineReactive(target, key, val) {
    const dep = new Dep()
    observer(val)
    Object.defineProperty(target, key, {
        enumerable: true,
        configurable: false,
        get: function() {
            dep.addSub(Dep.target) // 依赖收集：将watcher对象存放到dep中
            return val
        },
        set: function(value) { // 通过setter -> Watcher -> update的流程来修改视图
            if(val !== value) {
                val = value
                dep.notify()
            }
        }
    })
}
// Dep：订阅者收集器（发布者）
class Dep {
    constructor() {
        this.subs = [] //存放watcher
    }
    addSub(sub) {
        this.subs.push(sub)
    }
    notify() {
        this.subs.forEach((sub)=>{
            sub.update()
        })
    }
}

// watcher: 订阅者（观察者)
class Watcher {
    constructor() {
        Dep.target = this
    }
    update() {
        console.log("视图更新啦～")
    }
}

// Vue data
class Vue {
    constructor(options) {
        this._data = options.data
        observer(this._data)
        new Watcher()
        console.log('render:', this._data.test) // 模拟渲染，触发get
    }
}
let obj = new Vue({
    data: { test: 1 }
})
obj._data.test = 2

// 全局事件总线 Event Bus：所有事件的发布/订阅操作必须经由事件中心
class EventBus {
    constructor() {
        this.handlers = {} // 存储事件与回调的对应关系
    }
    on(eventName, callback) {
        if(!this.handlers[eventName]) {
            this.handlers[eventName] = [] // 初始化监听函数队列
        }
        this.handlers[eventName].push(callback)
    }
    emit(eventName, ...args) {
        if(this.handlers[eventName]) {
            const handlers = this.handlers[eventName].slice() // 浅拷贝，避免once移除监听器时弄乱顺序
            handlers.forEach((callback) => { // 逐个调用监听函数队列里的回调函数
                callback(...args)
            })
            /* this.handlers[eventName].forEach((callback) => {
                callback(...args)
            }) */
        }
    }
    off(eventName, callback) { // 移除监听函数队列里的指定回调函数
        const callbacks = this.handlers[eventName]
        const index = callbacks.indexOf(callback)
        if (index !== -1) {
            callbacks.splice(index, 1)
        }
    }
    once(eventName, callback) { // 单次监听
        const wrapper = (...args) => {
            callback(...args)
            this.off(eventName, wrapper)
        }
        this.on(eventName, wrapper)
    }
}

let bus = new EventBus()
function getNum(num) {
    console.log('get:', num)
}
bus.on('event1', getNum)
bus.emit('event1', 8)
bus.once('event2', getNum)
bus.emit('event2', 10)
```

## 行为型：迭代器模式 —— 真·遍历专家
&ensp;**迭代器模式提供一种方法顺序访问一个聚合对象中的各个元素，而又不暴露该对象的内部表示**

### ES6对迭代器的实现
&ensp;**ES6约定，任何数据结构只要具备Symbol.iterator属性，就可以通过迭代器.next()和for(...of...)进行遍历**

```javascript
const arr = [1, 2, 3]
// 迭代器.next()
const iterator = arr[Symbol.iterator]()
let now = { done: false }
while(!now.done) {
    now = iterator.next()
    if(!now.done) {
        console.log(`现在遍历到了${now.value}`)
    }
}
// for(...of...)
for(item of arr) { // 实际是next方法的反复调用
    console.log(`当前元素是${item}`)
}
```

### 实现一个迭代器生成函数

```javascript
// 通过闭包记录每次遍历的位置
function iteratorGenerator(list) {
    var idx = 0
    var len = list.length
    return {
        next: function() {
            var done = idx >= len
            var value = !done ? list[idx++] : undefined
            return {
                done: done,
                value: value
            }
        }
    }
}
```

## 参考链接

1. [vue.use()方法从源码到使用](https://juejin.cn/post/6844903842035793928)
2. [vuex 实现原理](https://blog.csdn.net/qq_14993375/article/details/103981954)
3. [响应式系统的基本原理](https://www.kancloud.cn/sllyli/vuejs/1244018)
4. [响应式系统的依赖收集追踪原理](https://www.kancloud.cn/sllyli/vuejs/1244019)