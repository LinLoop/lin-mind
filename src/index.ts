import { LEFT, RIGHT, SIDE } from './const'
import { isMobile, addParentLink, getObjById, generateUUID, generateNewObj } from './utils/index'
import { findEle, createInputDiv, layout, Topic, createChildren, createGroup, createTop, createTopic } from './utils/dom'
import { createLinkSvg, createLine } from './utils/svg'
import {
  selectNode,
  unselectNode,
  selectNextSibling,
  selectPrevSibling,
  selectFirstChild,
  selectParent,
  getAllDataString,
  getAllData,
  getAllDataMd,
  scale,
  toCenter,
  focusNode,
  cancelFocus,
  initLeft,
  initRight,
  initSide,
  setLocale,
  enableEdit,
  disableEdit,
  expandNode,
  refresh,
} from './interact'
import {
  insertSibling,
  insertBefore,
  insertParent,
  addChild,
  copyNode,
  moveNode,
  removeNode,
  moveUpNode,
  moveDownNode,
  beginEdit,
  updateNodeStyle,
  updateNodeTags,
  updateNodeIcons,
  updateNodeHyperLink,
  judgeDirection,
  setNodeTopic,
  moveNodeBefore,
  moveNodeAfter,
} from './nodeOperation'
import { createLink, removeLink, selectLink, hideLinkController, showLinkController } from './customLink'
import linkDiv from './linkDiv'
import initMouseEvent from './mouse'

import contextMenu from './plugin/contextMenu'
import toolBar from './plugin/toolBar'
import nodeMenu from './plugin/nodeMenu'
import nodeDraggable from './plugin/nodeDraggable'
import keypress from './plugin/keypress'
import mobileMenu from './plugin/mobileMenu'

import Bus from './utils/pubsub'

import './index.less'
import './iconfont/iconfont.js'

// TODO show up animation

/**
 * @function
 * @global
 * @name E
 * @param {string} id Node id.
 * @return {TargetElement} Target element.
 * @example
 * E('bd4313fbac40284b')
 */
export const E = findEle
type LinkObj = object
type operation = {
  name: string
}
export interface NodeObj {
  topic: string
  id: string
  style?: {
    fontSize?: string
    color?: string
    background?: string
    fontWeight?: string
  }
  parent?: NodeObj
  children?: NodeObj[]
  tags?: string[]
  icons?: string[]
  hyperLink?: string
  expanded?: boolean
  direction?: number
  root?: boolean
}

export interface NodeElement extends HTMLElement {
  nodeObj: Object
}
export interface MindElixirData {
  nodeData: NodeObj
  linkData?: LinkObj
  direction?: number
}
export interface MindElixirInstance {
  miniFn: Function
  miniInstance: Object
  exitFn: Function
  exitInstance: Object
  saveFn: Function
  saveInstance: Object
  mindElixirBox: HTMLElement
  nodeData: NodeObj
  linkData: LinkObj
  focusHistory: NodeObj[]
  currentNode: Topic | null
  currentLink: SVGElement | null
  inputDiv: HTMLElement | null
  scaleVal: number
  tempDirection: number | null
  bus: object // wip

  // wip
  history: operation[]
  isUndo: boolean
  undo: () => void
  initMiniHook: (fn: Function, instance: Object) => void
  initSaveHook: (fn: Function, instance: Object) => void
  initExitHook: (fn: Function, instance: Object) => void

  direction: number
  locale: string
  draggable: boolean
  editable: boolean
  contextMenu: boolean
  contextMenuOption: object
  toolBar: boolean
  nodeMenu: boolean
  keypress: boolean
  before: object
  newTopicName: string
  allowUndo: boolean
  allowMinimize: boolean
  allowSave: boolean
  allowExit: boolean
  overflowHidden: boolean
  primaryLinkStyle: number
  primaryNodeHorizontalGap: number
  primaryNodeVerticalGap: number
  maxChildNode: number
  mobileMenu: boolean
  upload: Function

  container: HTMLElement
  map: HTMLElement
  root: HTMLElement
  box: HTMLElement
  lines: SVGElement
  linkController: SVGElement
  P2: HTMLElement
  P3: HTMLElement
  line1: SVGElement
  line2: SVGElement
  linkSvgGroup: SVGElement
}
export interface Options {
  el: string | Element
  data: MindElixirData
  direction?: number
  locale?: string
  draggable?: boolean
  editable?: boolean
  contextMenu?: boolean
  contextMenuOption?: object
  toolBar?: boolean
  nodeMenu?: boolean
  keypress?: boolean
  before?: object
  newTopicName?: string
  allowUndo?: boolean
  allowMinimize?: boolean
  allowSave?: boolean
  allowExit?: boolean
  overflowHidden?: boolean
  primaryLinkStyle?: number
  primaryNodeHorizontalGap?: number
  maxChildNode?: number
  primaryNodeVerticalGap?: number
  mobileMenu?: boolean
  upload?: Function
}
const $d = document
/**
 * @export MindElixir
 * @example
 * let mind = new MindElixir({
  el: '#map',
  direction: 2,
  data: data,
  draggable: true,
  editable: true,
  contextMenu: true,
  toolBar: true,
  nodeMenu: true,
  keypress: true,
})
mind.init()
 *
 */
function MindElixir(
  this: MindElixirInstance,
  {
    el,
    direction,
    locale,
    draggable,
    editable,
    contextMenu,
    contextMenuOption,
    toolBar,
    nodeMenu,
    keypress,
    before,
    newTopicName,
    allowUndo,
    allowMinimize,
    allowSave,
    allowExit,
    primaryLinkStyle,
    overflowHidden,
    primaryNodeHorizontalGap,
    primaryNodeVerticalGap,
    maxChildNode,
    mobileMenu,
    upload,
  }: Options
) {
  // console.log('ME_version ' + MindElixir.version, this)
  let box
  const elType = Object.prototype.toString.call(el)
  if (elType === '[object HTMLDivElement]') {
    box = el as HTMLElement
  } else if (elType === '[object String]') {
    box = document.querySelector(el as string) as HTMLElement
  }
  if (!box) return new Error('MindElixir: el is not a valid element')
  this.mindElixirBox = box
  this.before = before || {}
  this.locale = locale
  this.contextMenuOption = contextMenuOption
  this.contextMenu = contextMenu === undefined ? true : contextMenu
  this.toolBar = toolBar === undefined ? true : toolBar
  this.nodeMenu = nodeMenu === undefined ? true : nodeMenu
  this.keypress = keypress === undefined ? true : keypress
  this.mobileMenu = mobileMenu
  this.upload = upload
  // record the direction before enter focus mode, must true in focus mode, reset to null after exit focus
  // todo move direction to data
  this.direction = typeof direction === 'number' ? direction : 1
  this.draggable = draggable === undefined ? true : draggable
  this.newTopicName = newTopicName
  this.editable = editable === undefined ? true : editable
  this.allowUndo = allowUndo === undefined ? true : allowUndo
  this.allowMinimize = allowMinimize === undefined ? true : allowMinimize
  this.allowSave = allowSave === undefined ? true : allowSave
  this.allowExit = allowExit === undefined ? true : allowExit
  // this.parentMap = {} // deal with large amount of nodes
  this.currentNode = null // the selected <tpc/> element
  this.currentLink = null // the selected link svg element
  this.inputDiv = null // editor
  this.scaleVal = 1
  this.tempDirection = null
  this.primaryLinkStyle = primaryLinkStyle || 0
  this.overflowHidden = overflowHidden
  this.primaryNodeHorizontalGap = primaryNodeHorizontalGap
  this.primaryNodeVerticalGap = primaryNodeVerticalGap

  this.maxChildNode = maxChildNode || 10 // 最大子节点数
  this.focusHistory = []

  this.bus = new Bus()
  ;(this.bus as any).addListener('operation', (operation: operation) => {
    if (this.isUndo) {
      this.isUndo = false
      // return
    }
    if (
      [
        'moveNode',
        'removeNode',
        'addChild',
        'insertParent',
        'insertSibling',
        'moveUpNode',
        'moveDownNode',
        'linkNode',
        'finishEdit',
        'editStyle',
        'editTags',
        'editIcons',
      ].includes(operation.name)
    ) {
      this.history.push(operation)
    }
  })

  this.history = [] // TODO
  this.isUndo = false

  this.initMiniHook = function (Fn, instance) {
    this.miniFn = Fn
    this.miniInstance = instance
  }

  this.initSaveHook = function initSaveHook(Fn, instance) {
    this.saveFn = Fn
    this.saveInstance = instance
  }

  this.initExitHook = function initExitHook(Fn, instance) {
    this.exitFn = Fn
    this.exitInstance = instance
  }

  this.undo = function () {
    const operation = this.history.pop()
    if (!operation) return

    this.isUndo = true
    if (operation.name === 'moveNode') {
      this.moveNode(E(operation.obj.fromObj.id), E(operation.obj.originParentId), false)
    } else if (operation.name === 'removeNode') {
      if (operation.originSiblingId) {
        this.insertBefore(E(operation.originSiblingId), operation.obj, false)
      } else {
        this.addChild(E(operation.originParentId), operation.obj, false)
      }
    } else if (operation.name === 'addChild' || operation.name === 'copyNode' || operation.name === 'insertSibling') {
      this.removeNode(E(operation.obj.id), false)
    } else if (operation.name === 'insertParent') {
      this.moveNodeBefore(E(operation.obj.children[0].id), E(operation.obj.id), false)
      this.removeNode(E(operation.obj.id), false)
    } else if (operation.name === 'moveUpNode') {
      this.moveDownNode(E(operation.obj.id), false)
    } else if (operation.name === 'moveDownNode') {
      this.moveUpNode(E(operation.obj.id), false)
    } else if (operation.name === 'linkNode') {
      let linkSvg
      const linkSvgId = Object.keys(this.linkData).pop()
      const g = document.querySelectorAll('.topiclinks g')
      g.forEach(el => {
        if (el.getAttribute('data-linkid') === linkSvgId) linkSvg = el
      })
      if (linkSvg) this.removeLink(linkSvg)
    } else if (operation.name === 'editStyle') {
      operation.origin.fontSize = operation.origin.fontSize.replace(/px/g, '')
      operation.obj.style = operation.origin
      this.updateNodeStyle(operation.obj, false)
    } else if (operation.name === 'editTags') {
      this.updateNodeTags(operation.obj, operation.origin, false)
    } else if (operation.name === 'editIcons') {
      this.updateNodeIcons(operation.obj, operation.origin, false)
    } else if (operation.name === 'finishEdit') {
      this.setNodeTopic(E(operation.obj.id), operation.origin)
    } else {
      this.isUndo = false
    }
  }

  this.mindElixirBox.className += ' mind-elixir'
  this.mindElixirBox.innerHTML = ''

  this.container = $d.createElement('div') // map container
  this.container.className = 'map-container'

  this.map = $d.createElement('div') // map-canvas Element
  this.map.className = 'map-canvas'
  this.map.setAttribute('tabindex', '0')
  this.container.appendChild(this.map)
  this.mindElixirBox.appendChild(this.container)
  this.root = $d.createElement('root')

  this.box = $d.createElement('children')
  this.box.className = 'box'

  // infrastructure

  this.lines = createLinkSvg('lines') // main link container

  this.linkController = createLinkSvg('linkcontroller') // bezier controller container
  this.P2 = $d.createElement('div') // bezier P2
  this.P3 = $d.createElement('div') // bezier P3
  this.P2.className = this.P3.className = 'circle'
  this.line1 = createLine(0, 0, 0, 0) // bezier auxiliary line1
  this.line2 = createLine(0, 0, 0, 0) // bezier auxiliary line2
  this.linkController.appendChild(this.line1)
  this.linkController.appendChild(this.line2)

  this.linkSvgGroup = createLinkSvg('topiclinks') // storage user custom link svg

  this.map.appendChild(this.root)
  this.map.appendChild(this.box)
  this.map.appendChild(this.lines)
  this.map.appendChild(this.linkController)
  this.map.appendChild(this.linkSvgGroup)
  this.map.appendChild(this.P2)
  this.map.appendChild(this.P3)

  if (this.overflowHidden) {
    this.container.style.overflow = 'hidden'
  } else initMouseEvent(this)
}

function beforeHook(fn: (el: any, node?: any) => void, fnName: string) {
  return async function (...args: unknown[]) {
    if (!this.before[fnName] || (await this.before[fnName].apply(this, args))) {
      fn.apply(this, args)
    }
  }
}

MindElixir.prototype = {
  addParentLink,
  getObjById,
  generateNewObj,
  // node operation
  insertSibling: beforeHook(insertSibling, 'insertSibling'),
  insertBefore: beforeHook(insertBefore, 'insertBefore'),
  insertParent: beforeHook(insertParent, 'insertParent'),
  addChild: beforeHook(addChild, 'addChild'),
  copyNode: beforeHook(copyNode, 'copyNode'),
  moveNode: beforeHook(moveNode, 'moveNode'),
  removeNode: beforeHook(removeNode, 'removeNode'),
  moveUpNode: beforeHook(moveUpNode, 'moveUpNode'),
  moveDownNode: beforeHook(moveDownNode, 'moveDownNode'),
  beginEdit: beforeHook(beginEdit, 'beginEdit'),
  moveNodeBefore: beforeHook(moveNodeBefore, 'moveNodeBefore'),
  moveNodeAfter: beforeHook(moveNodeAfter, 'moveNodeAfter'),
  updateNodeStyle,
  updateNodeTags,
  updateNodeIcons,
  updateNodeHyperLink,
  judgeDirection,
  setNodeTopic,

  createLink,
  removeLink,
  selectLink,
  hideLinkController,
  showLinkController,

  layout,
  linkDiv,
  createInputDiv,

  createChildren,
  createGroup,
  createTop,
  createTopic,

  selectNode,
  unselectNode,
  selectNextSibling,
  selectPrevSibling,
  selectFirstChild,
  selectParent,
  getAllDataString,
  getAllData,
  getAllDataMd,
  scale,
  toCenter,
  focusNode,
  cancelFocus,
  initLeft,
  initRight,
  initSide,
  setLocale,
  enableEdit,
  disableEdit,
  expandNode,
  refresh,
  install(plugin) {
    plugin(this)
  },
  init(data: MindElixirData) {
    if (!data || !data.nodeData) return new Error('MindElixir: `data` is required')
    if (data.direction) {
      this.direction = data.direction
    }
    this.nodeData = data.nodeData
    this.linkData = data.linkData || {}
    // plugin
    this.toolBar && toolBar(this, this.contextMenuOption)
    this.nodeMenu && nodeMenu(this)
    this.keypress && keypress(this)

    // if (isMobile() && this.mobileMenu) {
    if (this.mobileMenu) {
      mobileMenu(this)
    } else {
      this.contextMenu && contextMenu(this, this.contextMenuOption)
    }
    this.draggable && nodeDraggable(this)

    addParentLink(this.nodeData)
    this.toCenter()
    this.layout(false) // 初始化不执行side排版
    this.linkDiv()
  },
}

MindElixir.LEFT = LEFT
MindElixir.RIGHT = RIGHT
MindElixir.SIDE = SIDE
/**
 * @memberof MindElixir
 * @static
 */
MindElixir.version = '1.0.0'
MindElixir.E = findEle

/**
 * @function new
 * @memberof MindElixir
 * @static
 * @param {String} topic root topic
 */
MindElixir.new = (topic: string): MindElixirData => ({
  nodeData: {
    id: generateUUID(),
    topic: topic || 'new topic',
    root: true,
    children: [],
  },
  linkData: {},
})

export default MindElixir
