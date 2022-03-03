## 一. Vue实例的生命周期
1. 初始化阶段：  
new Vue() -> created  
    （1）合并 options 得到 vm.$options （用户传递的 options 选项、当前构造函数的 options 、父级实例构造函数的 options ）  
    （2）调用 initLifecycle 向Vue实例挂载属性  
    
    （3）调用 initEvents 将父组件在模板中使用 v-on 注册的事件添加到子组件的事件系统中（v-on:eventName="eventMethod"）  
    （4）调用 initRender ，定义 vm._vnode 、vm._staticTrees 和 vm.$slots 、vm.$scopedSlots ，定义 vm.$createElement ，调用 defineReactive 方法让 $attrs 和 $listeners 变成响应式  
    （5）遍历 beforeCreate 钩子函数数组，并依次执行  
    （6）调用 initInjections ，初始化 inject 配置  
    （7）调用 initState ，初始化状态，包括 props 、methods 、data 、computed 和 watch  
    （8）调用 initProvide ，初始化 provide 配置  
    （9）遍历 created 钩子函数数组，并依次执行
```javascript
/* ------ src/core/instance/index.js ------ */
// 创建实例，初始化流程
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options) 
}

/* ------ src/core/instance/init.js ------ */
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    // merge options
    if (options && options._isComponent) { // TODO: 组件优化策略
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions( // TODO: 单独展开写一篇
        /* Vue.options = { 
          components: { KeepAlive, Transition, TransitionGroup}, 
          directive: { model, show }, 
          filter: Object.create(null), 
          _base: Vue 
        } */
        resolveConstructorOptions(vm.constructor), // TODO: Vue.extend
        options || {},
        vm
      )
    }
    
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate') 
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    // 存在el选项时自动开启模板编译与挂载阶段，不存在el选项时需要执行vm.$mount手动开启模板编译与挂载阶段
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

/* ------ src/core/instance/lifecycle.js ------ */
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent 非抽象父级
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm) // 将当前实例添加到父组件实例的$children
  }

  // 初始化组件实例的关系属性
  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

/* ------ src/core/instance/event.js ------ */
export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  // init parent attached events
  const listeners = vm.$options._parentListeners // { eventName: function() {} } // TODO: 获取_parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}
function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  // 对比 listeners 和 oldListeners 的不同，执行注册事件和卸载事件的操作
  // function add (event, fn) { target.$on(event, fn) }
  // function remove$1 (event, fn) { target.$off(event, fn) }
  updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);  
  target = undefined;
}

/* ------ src/core/instance/render.js ------ */
export function initRender (vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context

  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject

  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  const parentData = parentVnode && parentVnode.data
  defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
  defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
}

/* ------ src/core/instance/lifecycle.js ------ */
export function callHook (vm: Component, hook: string) {
  pushTarget()
  const handlers = vm.$options[hook]
  const info = `${hook} hook`
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info) // try...catch...
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook) // @hook:mounted="onMounted" this.$on('hook:mounted', function () {})
  }
  popTarget()
}

/* ------ src/core/instance/inject.js ------ */
export function initInjections (vm: Component) {
  // 使用 provide 注入内容，其实是将内容注入到实例的 _provide 中
  // resolveInject 从下而上，不断在父组件中搜索 inject 设置的所有属性的内容
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    toggleObserving(false)
    Object.keys(result).forEach(key => {
      defineReactive(vm, key, result[key])
    })
    toggleObserving(true)
  }
}

/* ------ src/core/instance/state.js ------ */
export function initState (vm: Component) { 
  // 保存组件所有的watcher实例（vm.$watch/watch选项添加的实例)
  vm._watchers = [] // TODO: 13.3.2
  // 实例化时用到哪些状态，就初始化哪些状态
  // 初始化顺序为：props -> methods -> data -> computed -> watch，相同名称会发生覆盖
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // 只有根组件需要转换成响应式
  if (!isRoot) { 
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    // propOptions：子组件用户设置的 props 选项（ props: { model: Object, msg: String } ）
    // propsData: 父组件或用户提供的 props 数据（ <item :model="treeData" :msg="'hello'"> ）
    const value = validateProp(key, propsOptions, propsData, vm)
    defineReactive(props, key, value) // TODO: defineReactive与shouldObserve
    if (!(key in vm)) {
      proxy(vm, `_props`, key) // 代理，vm[key] -> vm._props[key]
    }
  }
  toggleObserving(true)
}
function initMethods (vm: Component, methods: Object) {
  const props = vm.$options.props
  for (const key in methods) {
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
}
function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {} // TODO: pushTarget popTarget
  const keys = Object.keys(data)
  let i = keys.length
  while (i--) {
    const key = keys[i]
    proxy(vm, `_data`, key) // 代理，vm[key] -> vm._data[key]
  }
  // 变成响应式
  observe(data, true /* asRootData */)
}
function initComputed (vm: Component, computed: Object) {
  // 保存所有计算属性的watcher实例
  const watchers = vm._computedWatchers = Object.create(null)
  // 判断是否为服务端渲染
  const isSSR = isServerRendering()
  for (const key in computed) {
    // computed1: function() { return this.val }
    // computed2: function() { set: function(val) { this.val = val }, get: function() { return this.val } } 
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions // const computedWatcherOptions = { lazy: true }
      )
    }
    if (!(key in vm)) {
      // 将计算属性设置到vm上 Object.defineProperty(target, key, sharedPropertyDefinition)
      // createComputedGetter：缓存并添加响应式，createGetterInvoker：不缓存且不响应
      defineComputed(vm, key, userDef) 
    } 
  }
}
function initWatch (vm: Component, watch: Object) {
  // watcher1: 'methodName'
  // watcher2: function(nVal, oVal) {} 
  // watcher3: { handler: function(nVal, oVal) {}, deep: true, immediate: true } 
  // watcher4: [ watcher1, watcher2 ] 
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler) // vm.$watch(expOrFn, handler, options) 
    }
  }
}

/* ------ src/core/instance/inject.js ------ */
export function initProvide (vm: Component) {
  const provide = vm.$options.provide
  if (provide) {
    vm._provided = typeof provide === 'function' ? provide.call(vm) : provide
  }
}
```
1. 模板编译阶段

2. 挂载阶段
   
3. 卸载阶段

## 衍生知识点
1. Vue事件注册的两种情况  
（1）v-on写在组件标签上：注册到子组件的Vue事件系统中  
（2）v-on写在普通标签上：注册到浏览器事件中  
在模板编译阶段，当模板解析到组件标签时，会实例化子组件，同时将标签上注册的事件解析成object并通过参数传递给子组件，当子组件被实例化时，可以在参数中获取父组件向自己注册的事件(vm.$options._parentListeners)
2. normalizeEvent函数的作用
Vue模板中支持事件修饰符capture、once和passive等，normalizeEvent函数的作用是将这些事件修饰符解析出来
```javascript
var normalizeEvent = cached(function (name) {
  var passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  var once = name.charAt(0) === '~'; // Prefixed last, checked first
  name = once ? name.slice(1) : name;
  var capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name: name,
    once: once,
    capture: capture,
    passive: passive
  }
});
```
3. 抽象组件  
Vue常用的抽象组件有<keep-alive> <transtions> <transition-group>等，这些组件自身不会渲染一个DOM元素，也不会出现在组件的父组件链中
4. provide 和 inject  
provide：Object | () => { return Object }  
inject: Array<string> | { [key: string]: string | Symbol | Object } 
```javascript 
provide：{ foo: 'bar' } 
inject: [ 'foo' ]  

const s = Symbol() 
provide() { return { [s]: 'bar' } } 
inject: { foo: { from: 'foo', default: () => 'foo' } } 
```
5. provide和inject绑定不是可响应的，但是，如果传入一个可监听的对象，该对象的property是可响应的

## 参考
1. [Vue中的Provide/Inject实现响应式数据](https://blog.csdn.net/weixin_43459866/article/details/114691818)
2. [Vue源码解剖系列1](https://juejin.cn/user/3087084381539816/posts)
3. [Vue源码解读系列2](https://juejin.cn/user/1028798616461326/posts)
4. [Vue官方文档里没告诉你的神秘钩子——@hook](https://juejin.cn/post/7006616545119961101)