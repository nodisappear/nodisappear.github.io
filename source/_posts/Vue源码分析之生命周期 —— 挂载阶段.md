---
title: Vue源码分析之生命周期 —— 挂载阶段
categories: 技术
tags: 源码
author: Zyx
abbrlink: b4a9504f
date: 2022-03-10 13:56:31
---
## 一. 挂载阶段
将 Vue 实例挂载到 DOM 元素上，也就是将模板渲染到指定的 DOM 元素中。在挂载的过程中，Vue.js 会开启 Watcher 来持续追踪依赖的变化。
```javascript
// 配置 el 选项
new Vue({ el: "#app" })

// 手动挂载
new Vue().$mount('#app')

// 在文档外渲染之后挂载
var component = new Vue().$mount()
document.getElementById('app').appendChild(component.$el)
```
## 二. 衍生知识
1. 在不同的构建版本中，vm.$mount的表现都不一样。  
（1）运行时版本：
```javascript
/* ------ src/platforms/web/runtime/index.js ------*/
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
/* ------ src/core/instance/lifecycle.js ------ */
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  // 设置默认的渲染函数
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
  }

  callHook(vm, 'beforeMount')

  let updateComponent = () => {
    // _render：执行渲染函数，得到最新的 VNode 节点树
    // _update：调用虚拟 DOM 中的 patch 方法，执行节点的比对与更新操作
    vm._update(vm._render(), hydrating)
  }

  // Watcher 第二个参数为函数：会同时观察函数中所读取的所有 Vue.js 实例上的响应式数据
  new Watcher(vm, updateComponent, noop, {
    if (vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'beforeUpdate')
    }
  }, true)

  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }

  return vm
}
```
（2）完整版本：
```javascript
/* ------ src/platforms/web/entry-runtime-with-compiler.js ------*/
const mount = Vue.prototype.$mount
// 通过“函数劫持”在原始功能上新增一些其他功能
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // el: "#app"
  // el: document.getElementById("app")
  // typeof el === 'string' ? document.querySelector(el) : el
  el = el && query(el) 

  const options = this.$options

  // 未设置 render 选项时，将模板编译成渲染函数
  // render: (h) => h(App)
  if(!options.render) { 
    let template = options.template
    if(template) {
      if (typeof template === 'string') { // 字符串模板
        // 根据 选择符 获取 DOM：query(id).innerHTML
        // template: "#app"
        if (template.charAt(0) === '#') { 
          template = idToTemplate(template) 
        }
      } else if (template.nodeType) { // DOM 模板
        // template: document.getElementById("app")
        template = template.innerHTML
      } else { // 格式不符
        return this
      }
    }else if(el) { 
      // 未配置 template时，从 el 选项中获取 HTML 字符串当作模板
      // el.outerHTML ? el.outerHTML : document.createElement('div').appendChild(el.cloneNode(true)).innerHTML
      template = getOuterHTML(el) 
    }

    // 将模板编译成渲染函数
    // template: "<App/>"
    if(template) {
      const { render, staticRenderFns } = compileToFunctions(template, {...}, this) 
      options.render = render
      options.staticRenderFns = staticRenderFns
    }
  }

  return mount.call(this, el, hydrating)
}
```
