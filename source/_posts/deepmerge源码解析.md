---
title: deepmerge源码解析
categories: 技术
tags:
  - 源码
comments: true
author: Lzb
abbrlink: a519f8f
date: 2021-10-08 16:45:41
---

### 一. 介绍

deepmerge: 以深拷贝的方式，合并两个或多个对象的可枚举属性。

### 二. 模块加载，

CommonJs规范：module.exports = deepmerge;

### 三. 主要流程

```javascript
function deepmerge(target, source, options) {
	options = options || {}
	options.arrayMerge = options.arrayMerge || defaultArrayMerge
	options.isMergeableObject = options.isMergeableObject || defaultIsMergeableObject
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified

	var sourceIsArray = Array.isArray(source)
	var targetIsArray = Array.isArray(target)
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}
```

#### 1. 判断target和source的类型

主要分为：  
（1）source和target是不同的类型，执行cloneUnlessOtherwiseSpecified(source, options)；   
（2）source和target都是数组类型，执行options.arrayMerge(target, source, options)；  
（3）sourc和target都是Object类型，执行mergeObject(target, source, options)。

```javascript
function mergeObject(target, source, options) {
	var destination = {}
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options)
		})
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options)
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options)
		}
	})
	return destination
}
```
#### 2. mergeObject(target, source, options)
（1）对target对象执行深拷贝操作；  
（2）遍历source对象，如果key值是在target原型链中存在，直接返回；如果key值是target中自有属性且可以合并，则执行 getMergeFunction(key, options)(target[key], source[key], options)；否则直接将source属性深拷贝到target中，执行 cloneUnlessOtherwiseSpecified(source[key], options)。


```javascript
function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}
```

#### 3. cloneUnlessOtherwiseSpecified(value, options)

将source中存在，而target中不存在的属性直接以一个空Object，进行深拷贝合并。

```javascript
function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}
```

#### 4. 数组合并

对target和source两个数组执行concat操作，然后对每个值执行深拷贝cloneUnlessOtherwiseSpecified(element, options) 

```javascript
deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
}
```
#### 5. deepmerge.all 

对多个对象执行深拷贝操作，这里直接将all函数作为deepmerge函数的一个属性

### 四. 补充知识点

deemerge 就是一个考虑全面、比较通用的深拷贝实现【比如source和target不同类型、能否merge、包含原型对象属性、预留自定义merge方法等】。代码本身比较精炼，值得学习参考。

#### 1. getKeys考虑了Symbol属性

```javascript
function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return target.propertyIsEnumerable(symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}
```

#### 2. 属性是否位于原型链上，自由属性是否可枚举

```javascript
function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}
```

### 参考文献
[1] [deepmerge的npm官方文档](https://www.npmjs.com/package/deepmerge)
