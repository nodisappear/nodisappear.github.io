---
title: javascript事件循环机制
categories: 技术
tags:
  - 编程语言
comments: true
author: Lzb
abbrlink: 182c94d6
date: 2022-02-21 01:19:00
---
## 1.JavaScript是单线程语言

Javascript语言是一种单线程语言，所有任务都在一个线程上完成。单线程如果遇到某个任务比较耗时，比如涉及很多I/O操作：读取文件、HTTP请求、SQL查询等，线程的大部分运行时间都会在空等I/O操作的返回结果。Event Loop就是为了解决单线程语言的这个问题。

## 2.事件循环Event Loop

为了解决JavaScript这种单线程语言带来的堵塞问题，Javascript程序会在程序中设置两个线程：一个负责程序本身的运行，称为主线程；另一个负责主线程与其他进程（主要是各种I/O操作）的通信，被称为"Event Loop线程"。Event Loop线程中主线程从任务队列中读取事件，这个过程是循环不断得，所以整个的这种运行机制又被称为事件循环。在事件循环中，异步事件并不会放到当前任务执行队列，而是会被挂起，放入另外一个回调队列。当前的任务队列执行结束以后，JavaScript引擎回去检查回调队列中是否有等待执行的任务【Perform a microtask checkpoint, 即执行微任务检查点】，若有会把第一个任务加入执行队列，然后不断的重复这个过程。JavaScrip是单线程，因此同一个执行队列产生的微任务总是会在宏任务之前被执行。 

### 2.1 宏任务与微任务

宏任务必然是在微任务之后才执行。
宏任务：
- setTimeout
- setInterval
- I/O
- setImmediate[在浏览器中是微任务，在Node中是宏任务]
- requestAnimationFrame[在浏览器中是宏任务，在Node中是微任务]

微任务：
- Promise.then / catch / finally / async/await本质上还是基于Promise的一些封装
- process.nextTick[在Node中是微任务]
- MutationObserver[在浏览器中是微任务]

## 3. javascript执行上下文和执行栈

JavaScript 中有三种执行上下文类型：

- 全局执行上下文 — 这是默认或者说基础的上下文，任何不在函数内部的代码都在全局上下文中。它会执行两件事：创建一个全局的 window 对象（浏览器的情况下），并且设置 this 的值等于这个全局对象。一个程序中只会有一个全局执行上下文。

- 函数执行上下文 — 每当一个函数被调用时, 都会为该函数创建一个新的上下文。每个函数都有它自己的执行上下文，不过是在函数被调用时创建的。函数上下文可以有任意多个。每当一个新的执行上下文被创建，它会按定义的顺序（将在后文讨论）执行一系列步骤。

- Eval 函数执行上下文 — 执行在 eval 函数内部的代码也会有它属于自己的执行上下文，但由于 JavaScript 开发者并不经常使用 eval，所以在这里我不会讨论它。

执行栈，也就是在其它编程语言中所说的“调用栈”，是一种拥有 LIFO（后进先出）数据结构的栈，被用来存储代码运行时创建的所有执行上下文。当 JavaScript 引擎第一次遇到你的脚本时，它会创建一个全局的执行上下文并且压入当前执行栈。每当引擎遇到一个函数调用，它会为该函数创建一个新的执行上下文并压入栈的顶部。
引擎会执行那些执行上下文位于栈顶的函数。当该函数执行结束时，执行上下文从栈中弹出，控制流程到达当前栈中的下一个上下文。

## 4. 示例
```javascript
console.log(1);
setTimeout(() => {console.log(2)}, 1000)
async function fn() {
    console.log(3)
    setTimeout(() => {console.log(4)}, 20)
    return Promise.resolve()
}
async function run() {
    console.log(5)
    await fn()
    console.log(6)
}
run()
for(let i=0; i<50000000000; i++) {}
setTimeout(() => {
    console.log(7)
    new Promise(resolve => {
        console.log(8)
        resolve()
    }).then(() => {console.log(9)})
}, 0)
console.log(10)
```
