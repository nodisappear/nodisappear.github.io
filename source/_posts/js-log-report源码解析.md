---
title: js-log-report源码解析
categories: 技术
tags:
  - 源码解析
comments: true
author: Lzb
abbrlink: 4816ed5f
date: 2022-06-12 23:07:00
---
这个库的想法很简单，就是 window.onerror 监听浏览器控制台的报错事件，把报错信息【控制台输出错误信息，以及出错的文件，行号，堆栈信息】通过ajax直接上传到服务器端，解决项目现场，移动端调试比较难的问题。

github地址：【 https://github.com/ecitlm/js-log-report 】

# 1. js-log-report的使用方法

## 1.1 包含哪些报错信息

```javascript
var defaults = {
  ua: window.navigator.userAgent,
  browser: '',
  os: '',
  osVersion: '',
  errUrl: window.location.href,
  msg: '', // 错误的具体信息
  url: '', // 错误所在的url
  line: '', // 错误所在的行
  col: '', // 错误所在的列
  error: '' // 具体的error对象
}
```

## 1.2 上传接口形式
上报错误日志的ajax接口形式: 接口的url自定义，post请求, 请求数据以 json 形式放在 body 中。


## 1.3 数据库设置
服务端需要执行一下下面的SQL语句：

```mysql
DROP TABLE IF EXISTS `j_log`;
CREATE TABLE `j_log` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'id号',
  `os_version` char(10) DEFAULT NULL COMMENT '系统版本号',
  `msg` varchar(255) DEFAULT NULL COMMENT '错误信息',
  `error_url` varchar(255) DEFAULT NULL COMMENT '错误所在的url',
  `line` int(10) DEFAULT NULL COMMENT '错误所在的行',
  `col` int(10) DEFAULT NULL COMMENT '错误所在的列',
  `error` varchar(255) DEFAULT NULL COMMENT '具体的error对象',
  `url` varchar(255) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL COMMENT '浏览器类型',
  `product_name` char(255) CHARACTER SET utf8 DEFAULT '' COMMENT '产品名称',
  `error_time` char(20) DEFAULT NULL COMMENT '时间戳',
  `os` char(10) DEFAULT NULL COMMENT '系统类型',
  `extend` varchar(255) DEFAULT NULL COMMENT '业务扩展字段、保存JSON字符串',
  `ua` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=55 DEFAULT CHARSET=utf8;
```

# 2. js-log-report的主要流程

（1） 取window.onerror中的报错信息, 这里会把3层堆栈报错信息上传

```javascript
window.onerror = function (msg, url, line, col, error) {
      // 采用异步的方式,避免阻塞
      setTimeout(function () {
        // 不一定所有浏览器都支持col参数，如果不支持就用window.event来兼容
        col = col || (window.event && window.event.errorCharacter) || 0
        defaults.url = url
        defaults.line = line
        defaults.col = col
        if (error && error.stack) {
          // 如果浏览器有堆栈信息，直接使用
          defaults.msg = error.stack.toString()
        } else if (arguments.callee) {
          // 尝试通过callee拿堆栈信息
          var ext = []
          var fn = arguments.callee.caller
          var floor = 3 // 这里只拿三层堆栈信息
          while (fn && (--floor > 0)) {
            ext.push(fn.toString())
            if (fn === fn.caller) {
              break// 如果有环
            }
            fn = fn.caller
          }
          defaults.msg = ext.join(',')
        }
        // 合并上报的数据，包括默认上报的数据和自定义上报的数据
        var reportData = extendObj(params.data || {}, defaults)
        console.log(reportData)
 ......
}
```

（2）用浏览器自带的 XMLHttpRequest 将报错数据上报， 不用依赖任何第三方库

## 2.1 自己封装的ajax库

自己封装的ajax库, 在浏览器上运行，主要用到了浏览器的 XMLHttpRequest API，从中可以看到XMLHttpRequest的用法。

```javascript

  function ajax (options) {
    options = options || {}
    options.type = (options.type || 'GET').toUpperCase()
    options.dataType = options.dataType || 'json'
    var params = formatParams(options.data)
    if (window.XMLHttpRequest) {
      var xhr = new XMLHttpRequest()
    } else {
      var xhr = new ActiveXObject('Microsoft.XMLHTTP')
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var status = xhr.status
        if (status >= 200 && status < 300) {
          options.success && options.success(xhr.responseText, xhr.responseXML)
        } else {
          options.fail && options.fail(status)
        }
      }
    }
    if (options.type == 'GET') {
      xhr.open('GET', options.url + '?' + params, true)
      xhr.send(null)
    } else if (options.type == 'POST') {
      xhr.open('POST', options.url, true)
      // 设置表单提交时的内容类型
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.send(params)
    }
  }
```