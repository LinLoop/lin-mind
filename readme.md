## lu-mind-mapping

lu-mind-mapping 是一个无框架依赖的思维导图内核,本项目是基于[Mind elixir](https://github.com/ssshooter/mind-elixir-core)的功能上进行二次开发，
所以本项目大部分功能与用法均与Mind elixir相同。

## 建议
本项目是根据公司业务需求，在原项目([Mind elixir](https://github.com/ssshooter/mind-elixir-core))进行的二次开发。而且，本项目的功能也可能会随业务需求不定时进行改动，如果
需要一个稳定的版本，强烈建议使用原项目[Mind elixir](https://github.com/ssshooter/mind-elixir-core)，个人认为该项目已满足大部分日常使用。

## 立即尝试

![lu-mind-mapping](https://user-images.githubusercontent.com/9455826/201805817-fdcca8f2-0848-4751-9b7f-89d5b22731e2.png)

## 如何使用

### 安装

#### NPM

```bash
npm i lu-mind-mapping -S
```

```javascript
import MindElixir, { E } from 'lu-mind-mapping'
```

### HTML 结构

```html
<div id="map"></div>
<style>
  #map {
    height: 500px;
    width: 100%;
  }
</style>
```

### 初始化

```javascript
import MindElixir, { E } from 'lu-mind-mapping'
import { exportSvg, exportPng } from '../dist/painter'
import example from '../dist/example1'

let options = {
  el: '#map',
  direction: MindElixir.LEFT,
  // create new map data
  data: MindElixir.new('new topic') or example,
  // the data return from `.getAllData()`
  draggable: true, // default true
  contextMenu: true, // default true
  toolBar: true, // default true
  nodeMenu: true, // default true
  keypress: true, // default true
  locale: 'en', // [zh_CN,zh_TW,en,ja,pt] waiting for PRs
  overflowHidden: false, // default false
  primaryLinkStyle: 2, // [1,2] default 1
  primaryNodeVerticalGap: 15, // default 25
  primaryNodeHorizontalGap: 15, // default 65
  contextMenuOption: {
    focus: true,
    link: true,
    extend: [
      {
        name: 'Node edit',
        onclick: () => {
          alert('extend menu')
        },
      },
    ],
  },
  allowUndo: false,
  before: {
    insertSibling(el, obj) {
      return true
    },
    async addChild(el, obj) {
      await sleep()
      return true
    },
  },
}

let mind = new MindElixir(options)
mind.init()

// get a node
E('node-id')

```

### 数据结构

```javascript
// whole node data structure up to now
{
  topic: 'node topic',
  id: 'bd1c24420cd2c2f5',
  style: { fontSize: '32', color: '#3298db', background: '#ecf0f1' },
  parent: null,
  tags: ['Tag'],
  icons: ['😀'],
  hyperLink: 'https://github.com/ssshooter/mind-elixir-core',
}
```

### 事件处理

```javascript
mind.bus.addListener('operation', operation => {
  console.log(operation)
  // return {
  //   name: action name,
  //   obj: target object
  // }

  // name: [insertSibling|addChild|removeNode|beginEdit|finishEdit]
  // obj: target

  // name: moveNode
  // obj: {from:target1,to:target2}
})

mind.bus.addListener('selectNode', node => {
  console.log(node)
})

mind.bus.addListener('expandNode', node => {
  console.log('expandNode: ', node)
})
```

### 数据导出

```javascript
mind.getAllData() // javascript object, see src/example.js
mind.getAllDataString() // stringify object
mind.getAllDataMd() // markdown
```

### 输出图片

**WIP**

```javascript
import painter from 'lu-mind-mapping/dist/painter'
painter.exportSvg()
painter.exportPng()
```

### 操作拦截

```javascript
let mind = new MindElixir({
  ...
  before: {
    insertSibling(el, obj) {
      console.log(el, obj)
      if (this.currentNode.nodeObj.parent.root) {
        return false
      }
      return true
    },
    async addChild(el, obj) {
      await sleep()
      if (this.currentNode.nodeObj.parent.root) {
        return false
      }
      return true
    },
  },
})
```

## 文档

https://doc.mind-elixir.com/

## 与原版本不同的点
1. 支持用鼠标滚轮缩放整个画布  
2. 支持触摸屏下双指缩放(已在希沃一体机中测试成功)  
3. 将原来的鼠标右键点击才会出现的菜单，改为常驻在页面上方，且不在固定只有右键触发该事件  
4. 去除原来左键菜单的url功能  
5. 增加分享后仅可阅读，不可编辑的功能(尚未完全完成)  
6. 修改原来的线条样式，使不同线条区分度更明显  
7. 增加菜单按钮是否为禁用模式的判断条件，提高用户体验  
8. ......(TODO)

## 感谢

[canvg](https://github.com/canvg/canvg)  
[Mind elixir](https://github.com/ssshooter/mind-elixir-core)



