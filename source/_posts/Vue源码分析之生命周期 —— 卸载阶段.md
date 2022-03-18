---
title: Vue源码分析之生命周期 —— 卸载阶段
categories: 技术
tags: 源码
author: Zyx
abbrlink: 7d684f8e
date: 2022-03-11 15:41:54
---
## 一. 卸载阶段
调用 vm.$destroy 方法之后，Vue.js 的生命周期会进入卸载阶段。
```javascript
Vue.prototype.$destroy = function () {
  callHook(vm, 'beforeDestroy')

  // 子组件在不同父组件中是不同的 Vue.js 实例
  // 从父组件实例的 $children 属性中删除
  const parent = vm.$parent
  if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
    remove(parent.$children, vm)
  }

  // 销毁实例上的所有 watcher
  if (vm._watcher) {
    vm._watcher.teardown()
  }
  let i = vm._watchers.length
  while (i--) {
    vm._watchers[i].teardown()
  }

  // 移除引用
  if (vm._data.__ob__) {
    vm._data.__ob__.vmCount--
  }

  vm._isDestroyed = true
  
  vm.__patch__(vm._vnode, null) TODO: __patch__

  callHook(vm, 'destroyed')

  // 移除事件监听器
  vm.$off()

  // 移除引用
  if (vm.$el) {
    vm.$el.__vue__ = null
  }
  if (vm.$vnode) {
    vm.$vnode.parent = null
  }
}
```
