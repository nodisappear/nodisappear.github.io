---
title: core-decorator源码解析
categories: 技术
tags:
  - 源码解析
comments: true
author: 李泽滨
abbrlink: b483b17d
date: 2021-12-15 11:21:00
---

### 一. core-decorator装饰器库

core-decorator是封装了一些常用功能的装饰器库，采用了es6的装饰器语法，可以装饰类和类的方法。

### 二. es6的装饰器语法

装饰器是一种函数，写成 @ + 函数名，它可以放在类和类方法的定义前面。

#### 1. 默认参数列表

(1) 装饰类

默认参数列表中包含一个参数，即要装饰的目标类; 

(2) 装饰类的方法 

默认参数列表中三个参数:第一个是要装饰的类的实例target【但这个时候实例还未生成，所以实际装饰的是类的原型】；

第二个key是要装饰的属性名；第三个参数descriptor是属性的描述对象【描述对象中包含的属性有：'value', 'initializer', 'get', 'set', 'writable', 'enumerable'】

### 三. 主要流程

以防抖的装饰器debounce为例

#### 1. 封装一个装饰器的功能函数handleDescriptor

这里metaFor只是绑定在this对象上、保存定时器ID的对象

```javascript
import { decorate, metaFor, internalDeprecation } from './private/utils';

const DEFAULT_TIMEOUT = 300;

function handleDescriptor(target, key, descriptor, [wait = DEFAULT_TIMEOUT, immediate = false]) {
  const callback = descriptor.value;

  if (typeof callback !== 'function') {
    throw new SyntaxError('Only functions can be debounced');
  }

  return {
    ...descriptor,
    value() {
      const { debounceTimeoutIds } = metaFor(this);
      const timeout = debounceTimeoutIds[key];
      const callNow = immediate && !timeout;
      const args = arguments;

      clearTimeout(timeout);

      debounceTimeoutIds[key] = setTimeout(() => {
        delete debounceTimeoutIds[key];
        if (!immediate) {
          callback.apply(this, args);
        }
      }, wait);

      if (callNow) {
        callback.apply(this, args);
      }
    }
  };
}
```

#### 2. 对外暴露整个装饰器

将功能函数handleDescriptor、默认参数列表作为参数传递给装饰器的工具函数decoratoe， 并对外暴露。

这里internalDeprecation只是一个在调用时显示是否deprecated的工具函数。

```javascript
export default function debounce(...args) {
  internalDeprecation('@debounce is deprecated and will be removed shortly. Use @debounce from lodash-decorators.\n\n  https://www.npmjs.com/package/lodash-decorators');
  return decorate(handleDescriptor, args);
}
```

#### 3. 装饰器decorate函数的主要逻辑

decorate主要对是否传递额外参数做了一下判断，其中怎么参数涉及的过程还是略微复杂的, 

不明白可以参照 js-learning/decortor/core-decorator-test.js下的实际过程加深了解。

```javascript
export function isDescriptor(desc) {
  if (!desc || !desc.hasOwnProperty) {
    return false;
  }

  const keys = ['value', 'initializer', 'get', 'set'];

  for (let i = 0, l = keys.length; i < l; i++) {
    if (desc.hasOwnProperty(keys[i])) {
      return true;
    }
  }

  return false;
}

export function decorate(handleDescriptor, entryArgs) {
  if (isDescriptor(entryArgs[entryArgs.length - 1])) {
    // 没有额外参数的情况下，entryArgs就是默认参数列表 [target, key descriptor]
    return handleDescriptor(...entryArgs, []);
  } else {
    return function () {
      // Array.prototype.slice.call(arguments) 这个是编译时的最外层调用的默认参数列表 [target, key descriptor]
      return handleDescriptor(...Array.prototype.slice.call(arguments), entryArgs);
    };
  }
}
```

### 参考文献

[1] [core-decorator的github地址](https://github.com/jayphelps/core-decorators)

[2] [ECMAScript6入门](https://es6.ruanyifeng.com/#docs/decorator)