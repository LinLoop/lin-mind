import { NodeObj } from '../index'
import { findEle } from './dom'

// 获取分支深度
export function getBranchDepth(nodeObj: NodeObj) {
  const childDepth = getNodeChildDepth(nodeObj)
  const nodeDepth = getNodeDepth(nodeObj)
  return childDepth + nodeDepth - 1
}

// 获取子节点深度
export function getNodeChildDepth(nodeObj: NodeObj) {
  let depth = 0
  if (nodeObj.children) {
    for (let i = 0; i < nodeObj.children.length; i++) {
      const childDepth = getNodeChildDepth(nodeObj.children[i])
      if (childDepth > depth) {
        depth = childDepth
      }
    }
  }
  return depth + 1
}

// 判断当前深度
export function getNodeDepth(nodeObj: NodeObj, currentDepth: number = 0) {
  currentDepth = !nodeObj.parent ? currentDepth++ : getNodeDepth(nodeObj.parent, currentDepth) + 1
  return currentDepth
}

// 判断新增元素是否超出边界 是返回true 否返回false
export function isOutOfBoundary(mind: any, option: string) {
  const isRoot = mind.currentNode.parentElement.tagName === 'ROOT'
  if (isRoot && option !== 'insertSibling') return false
  const currentNode = mind.currentNode.parentElement.parentElement
  const currentNodeObj = mind.currentNode.nodeObj
  const { primaryNodeHorizontalGap, primaryNodeVerticalGap } = mind

  let nodeEle
  let maxChildWidth = 800
  let maxChildHeight = 200
  const canvasHeight = 20000
  const canvasWidth = 20000

  if (option === 'insertParent' || option === 'addChild') {
    const { node: deepestChild } = findDeepestChild(currentNodeObj)
    nodeEle = findEle(deepestChild.id).parentElement.parentElement
  } else if (option === 'copyNode') {
    maxChildWidth = mind.waitCopy.parentElement.parentElement.offsetWidth
    maxChildHeight = mind.waitCopy.parentElement.parentElement.offsetHeight
    nodeEle = currentNode
  } else if (option === 'insertSibling') {
    // insertSibling
    nodeEle = currentNode.parentElement.lastElementChild
  } else {
    return false
  }

  const canvas = document.querySelector('.map-canvas')
  const nodePosition = nodeEle.getBoundingClientRect()
  const canvasPosition = canvas.getBoundingClientRect()

  // 节点相对 canvas 距离
  const left = nodePosition.left - canvasPosition.left
  const top = nodePosition.top - canvasPosition.top

  // console.log(left, top, maxChildWidth, maxChildHeight)

  if (
    ['insertParent', 'addChild', 'copyNode'].includes(option) &&
    (left < maxChildWidth + primaryNodeHorizontalGap || left > canvasWidth - maxChildWidth - primaryNodeHorizontalGap)
  ) {
    return true
  }
  if (
    ['insertSibling', 'copyNode'].includes(option) &&
    (top < maxChildHeight + primaryNodeVerticalGap || top > canvasHeight - maxChildHeight - primaryNodeVerticalGap)
  ) {
    return true
  }
  return false
}

// 查找最深子节点
export function findDeepestChild(element) {
  const children = element?.children ?? []
  if (children.length === 0) {
    return { node: element, depth: 1 }
  }
  let maxDepth = -1
  let deepestChild = null
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const { node, depth } = findDeepestChild(child)
    if (depth > maxDepth) {
      maxDepth = depth
      deepestChild = node
    }
  }
  return { node: deepestChild, depth: maxDepth + 1 }
}

// 创建提示语
export const createToast = words => {
  if (document.getElementById('mindToast')) return
  const div = document.createElement('div')
  const mindContainer = document.querySelector('.map-container')
  div.id = 'mindToast'
  div.innerText = words
  div.style.cssText =
    'position:absolute;top:110px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.7);color:#FFF;border-radius:5px;padding:8px 12px'
  mindContainer.appendChild(div)
  const timer = setTimeout(() => {
    mindContainer.removeChild(div)
    clearTimeout(timer)
  }, 2000)
}

export function encodeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

export const isMobile = (): boolean => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

export const rgbHex = rgb => {
  return rgb.replace(/\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, function ($0, $1, $2, $3) {
    return '#' + ('0' + Number($1).toString(16)).substr(-2) + ('0' + Number($2).toString(16)).substr(-2) + ('0' + Number($3).toString(16)).substr(-2)
  })
}

export const getObjById = function (id: string, data: NodeObj) {
  data = data || this.nodeData
  if (data.id === id) {
    return data
  } else if (data.children && data.children.length) {
    for (let i = 0; i < data.children.length; i++) {
      const res = getObjById(id, data.children[i])
      if (res) return res
    }
  } else {
    return null
  }
}

export const addParentLink = (data: NodeObj, parent?: NodeObj) => {
  data.parent = parent
  if (data.children) {
    for (let i = 0; i < data.children.length; i++) {
      addParentLink(data.children[i], data)
    }
  }
}

export function refreshIds(data: NodeObj) {
  data.id = generateUUID()
  if (data.children) {
    for (let i = 0; i < data.children.length; i++) {
      refreshIds(data.children[i])
    }
  }
}

export const throttle = (fn: (any) => void, wait: number) => {
  var pre = Date.now()
  return function () {
    var context = this
    var args = arguments
    var now = Date.now()
    if (now - pre >= wait) {
      fn.apply(context, args)
      pre = Date.now()
    }
  }
}

export function getArrowPoints(p3x: number, p3y: number, p4x: number, p4y: number) {
  const deltay = p4y - p3y
  const deltax = p3x - p4x
  let angle = (Math.atan(Math.abs(deltay) / Math.abs(deltax)) / 3.14) * 180
  if (deltax < 0 && deltay > 0) {
    angle = 180 - angle
  }
  if (deltax < 0 && deltay < 0) {
    angle = 180 + angle
  }
  if (deltax > 0 && deltay < 0) {
    angle = 360 - angle
  }
  const arrowLength = 20
  const arrowAngle = 30
  var a1 = angle + arrowAngle
  const a2 = angle - arrowAngle
  return {
    x1: p4x + Math.cos((Math.PI * a1) / 180) * arrowLength,
    y1: p4y - Math.sin((Math.PI * a1) / 180) * arrowLength,
    x2: p4x + Math.cos((Math.PI * a2) / 180) * arrowLength,
    y2: p4y - Math.sin((Math.PI * a2) / 180) * arrowLength,
  }
}

export function calcP1(fromData, p2x, p2y) {
  let x, y
  const k = (fromData.cy - p2y) / (p2x - fromData.cx)
  if (k > fromData.h / fromData.w || k < -fromData.h / fromData.w) {
    if (fromData.cy - p2y < 0) {
      x = fromData.cx - fromData.h / 2 / k
      y = fromData.cy + fromData.h / 2
    } else {
      x = fromData.cx + fromData.h / 2 / k
      y = fromData.cy - fromData.h / 2
    }
  } else {
    // console.log('斜率', k)
    // console.log('fromData.cx-x', fromData.cx - p2x)
    if (fromData.cx - p2x < 0) {
      x = fromData.cx + fromData.w / 2
      y = fromData.cy - (fromData.w * k) / 2
    } else {
      x = fromData.cx - fromData.w / 2
      y = fromData.cy + (fromData.w * k) / 2
    }
  }
  return {
    x,
    y,
  }
}

export function calcP4(toData, p3x, p3y) {
  let x, y
  const k = (toData.cy - p3y) / (p3x - toData.cx)
  if (k > toData.h / toData.w || k < -toData.h / toData.w) {
    if (toData.cy - p3y < 0) {
      x = toData.cx - toData.h / 2 / k
      y = toData.cy + toData.h / 2
    } else {
      x = toData.cx + toData.h / 2 / k
      y = toData.cy - toData.h / 2
    }
  } else {
    // console.log('斜率', k)
    // console.log('toData.cx-x', toData.cx - p3x)
    if (toData.cx - p3x < 0) {
      x = toData.cx + toData.w / 2
      y = toData.cy - (toData.w * k) / 2
    } else {
      x = toData.cx - toData.w / 2
      y = toData.cy + (toData.w * k) / 2
    }
  }
  return {
    x,
    y,
  }
}

export function generateUUID(): string {
  return (new Date().getTime().toString(16) + Math.random().toString(16).substr(2)).substr(2, 16)
}

export function generateNewObj(): NodeObj {
  const id = generateUUID()
  return {
    topic: this.newTopicName || 'new node',
    id,
  }
}

export function generateNewLink(from, to) {
  const id = generateUUID()
  return {
    id,
    name: '',
    from,
    to,
    delta1: { x: 0, y: -100 },
    delta2: { x: 0, y: -100 },
  }
}

export function checkMoveValid(from: NodeObj, to: NodeObj) {
  let valid = true
  while (to.parent) {
    if (to.parent === from) {
      valid = false
      break
    }
    to = to.parent
  }
  return valid
}

export function getObjSibling(obj: NodeObj): NodeObj {
  const childrenList = obj.parent.children
  const index = childrenList.indexOf(obj)
  if (index + 1 >= childrenList.length) {
    // 最后一个
    return null
  } else {
    return childrenList[index + 1]
  }
}

export function moveBeforeObj(obj, targetObj) {
  const childrenList = obj.parent.children
  let index = childrenList.indexOf(obj)
  const targetIndex = childrenList.indexOf(targetObj)
  childrenList.splice(targetIndex, 0, obj)
  if (targetIndex < index) index += 1
  childrenList.splice(index, 1)
  // console.log(childrenList.map(item => item.topic))
}

export function moveAfterObj(obj, targetObj) {
  const childrenList = obj.parent.children
  const index = childrenList.indexOf(obj)
  const targetIndex = childrenList.indexOf(targetObj)
  childrenList.splice(targetIndex + 1, 0, obj)
  childrenList.splice(index, 1)
}

export function moveUpObj(obj: NodeObj) {
  const childrenList = obj.parent.children
  const index = childrenList.indexOf(obj)
  const t = childrenList[index]
  if (index === 0) {
    childrenList.push(t)
    childrenList.splice(0, 1)
  } else {
    childrenList[index] = childrenList[index - 1]
    childrenList[index - 1] = t
  }
}

export function moveDownObj(obj: NodeObj) {
  const childrenList = obj.parent.children
  const index = childrenList.indexOf(obj)
  const t = childrenList[index]
  if (index === childrenList.length - 1) {
    childrenList.splice(childrenList.length - 1, 1)
    childrenList.unshift(t)
  } else {
    childrenList[index] = childrenList[index + 1]
    childrenList[index + 1] = t
  }
}

export function removeNodeObj(obj: NodeObj) {
  const childrenList = obj.parent.children
  const index = childrenList.indexOf(obj)
  childrenList.splice(index, 1)
  return childrenList.length
}

export function insertNodeObj(obj: NodeObj, newObj: NodeObj) {
  const childrenList = obj.parent.children
  const index = childrenList.indexOf(obj)
  childrenList.splice(index + 1, 0, newObj)
}

export function insertBeforeNodeObj(obj: NodeObj, newObj: NodeObj) {
  const childrenList = obj.parent.children
  const index = childrenList.indexOf(obj)
  childrenList.splice(index, 0, newObj)
}

export function insertParentNodeObj(obj: NodeObj, newObj: NodeObj) {
  const childrenList = obj.parent.children
  const index = childrenList.indexOf(obj)
  childrenList[index] = newObj
  newObj.children = [obj]
}

export function moveNodeObj(from: NodeObj, to: NodeObj) {
  removeNodeObj(from)
  if (to.children) to.children.push(from)
  else to.children = [from]
}
// 获取url参数
export function getQueryVariable(variable) {
  const query = window.location.search.substring(1)
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] == variable) {
      return pair[1]
    }
  }
  return false
}

export function moveNodeBeforeObj(from: NodeObj, to: NodeObj) {
  removeNodeObj(from)
  const childrenList = to.parent.children
  let toIndex = 0
  for (let i = 0; i < childrenList.length; i++) {
    if (childrenList[i] === to) {
      toIndex = i
      break
    }
  }
  childrenList.splice(toIndex, 0, from)
}

export function moveNodeAfterObj(from: NodeObj, to: NodeObj) {
  removeNodeObj(from)
  const childrenList = to.parent.children
  let toIndex = 0
  for (let i = 0; i < childrenList.length; i++) {
    if (childrenList[i] === to) {
      toIndex = i
      break
    }
  }
  childrenList.splice(toIndex + 1, 0, from)
}

export const dragMoveHelper = {
  afterMoving: false, // 区别click事件
  mousedown: false,
  lastX: null,
  lastY: null,
  onMove(e, container) {
    if (this.mousedown) {
      this.afterMoving = true
      if (!this.lastX) {
        this.lastX = e.pageX
        this.lastY = e.pageY
        return
      }
      const deltaX = this.lastX - e.pageX
      const deltaY = this.lastY - e.pageY
      container.scrollTo(container.scrollLeft + deltaX, container.scrollTop + deltaY)
      this.lastX = e.pageX
      this.lastY = e.pageY
    }
  },
  clear() {
    this.afterMoving = false
    this.mousedown = false
    this.lastX = null
    this.lastY = null
  },
}

export function LinkDragMoveHelper(dom) {
  this.dom = dom
  this.mousedown = false
  this.lastX = null
  this.lastY = null
}

LinkDragMoveHelper.prototype.init = function (map, cb) {
  this.handleMouseMove = e => {
    e.stopPropagation()
    if (this.mousedown) {
      if (!this.lastX) {
        this.lastX = e.pageX
        this.lastY = e.pageY
        return
      }
      const deltaX = this.lastX - e.pageX
      const deltaY = this.lastY - e.pageY
      cb(deltaX, deltaY)
      this.lastX = e.pageX
      this.lastY = e.pageY
    }
  }
  this.handleMouseDown = e => {
    e.stopPropagation()
    this.mousedown = true
  }
  this.handleClear = e => {
    e.stopPropagation()
    this.clear()
  }
  map.addEventListener('mousemove', this.handleMouseMove)
  map.addEventListener('mouseleave', this.handleClear)
  map.addEventListener('mouseup', this.handleClear)
  this.dom.addEventListener('mousedown', this.handleMouseDown)
}

LinkDragMoveHelper.prototype.destory = function (map) {
  map.removeEventListener('mousemove', this.handleMouseMove)
  map.removeEventListener('mouseleave', this.handleClear)
  map.removeEventListener('mouseup', this.handleClear)
  this.dom.removeEventListener('mousedown', this.handleMouseDown)
}

LinkDragMoveHelper.prototype.clear = function () {
  this.mousedown = false
  this.lastX = null
  this.lastY = null
}
