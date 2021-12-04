---
title: 读《JavaScript设计模式核心原理与应用实践》
categories: 技术
tags: 笔记
author: Zyx
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

更多内容，见另一篇文章 [深、浅拷贝]()

## 参考链接

1. [vue.use()方法从源码到使用](https://juejin.cn/post/6844903842035793928)
2. [vuex 实现原理](https://blog.csdn.net/qq_14993375/article/details/103981954)
