import { LEFT, RIGHT, SIDE } from '../const'
import { NodeObj } from '../index'
import { encodeHTML, createToast } from '../utils/index'
export type Top = HTMLElement

export type Group = HTMLElement

export interface Topic extends HTMLElement {
  nodeObj?: NodeObj
  linkContainer?: HTMLElement
}

export interface Expander extends HTMLElement {
  expanded?: boolean
}

// DOM manipulation
const $d = document
export const findEle = (id: string, instance?) => {
  const scope = instance ? instance.mindElixirBox : $d
  return scope.querySelector(`[data-nodeid=me${id}]`)
}

export const shapeTpc = function (tpc: Topic, nodeObj: NodeObj) {
  tpc.textContent = nodeObj.topic

  if (nodeObj.style) {
    tpc.style.color = nodeObj.style.color // || 'inherit'    //修复向左向右结构root丢失样式bug
    tpc.style.background = nodeObj.style.background // || 'inherit' //修复向左向右结构root丢失样式bug
    tpc.style.fontSize = nodeObj.style.fontSize + 'px'
    tpc.style.fontWeight = nodeObj.style.fontWeight || 'normal'
  }

  // TODO allow to add online image
  // if (nodeObj.image) {
  //   const imgContainer = $d.createElement('img')
  //   imgContainer.src = nodeObj.image.url
  //   imgContainer.style.width = nodeObj.image.width + 'px'
  //   tpc.appendChild(imgContainer)
  // }
  if (nodeObj.hyperLink) {
    const linkContainer = $d.createElement('a')
    linkContainer.className = 'hyper-link'
    linkContainer.target = '_blank'
    linkContainer.innerText = '🔗'
    linkContainer.href = nodeObj.hyperLink
    tpc.appendChild(linkContainer)
    tpc.linkContainer = linkContainer
    // console.log(linkContainer)
  } else if (tpc.linkContainer) {
    tpc.linkContainer.remove()
    tpc.linkContainer = null
  }
  if (nodeObj.icons && nodeObj.icons.length) {
    const iconsContainer = $d.createElement('span')
    iconsContainer.className = 'icons'
    iconsContainer.innerHTML = nodeObj.icons.map(icon => `<span>${encodeHTML(icon)}</span>`).join('')
    tpc.appendChild(iconsContainer)
  }
  if (nodeObj.tags && nodeObj.tags.length) {
    const tagsContainer = $d.createElement('div')
    tagsContainer.className = 'tags'
    tagsContainer.innerHTML = nodeObj.tags.map(tag => `<span>${encodeHTML(tag)}</span>`).join('')
    tpc.appendChild(tagsContainer)
  }
}

export const createGroup = function (nodeObj: NodeObj, omitChildren?: boolean) {
  const grp: Group = $d.createElement('GRP')
  const top: Top = this.createTop(nodeObj)
  grp.appendChild(top)
  if (!omitChildren && nodeObj.children && nodeObj.children.length > 0) {
    top.appendChild(createExpander(nodeObj.expanded))
    if (nodeObj.expanded !== false) {
      const children = this.createChildren(nodeObj.children)
      grp.appendChild(children)
    }
  }
  return { grp, top }
}

export const createTop = function (nodeObj: NodeObj): Top {
  const top = $d.createElement('t')
  const tpc = this.createTopic(nodeObj)
  shapeTpc(tpc, nodeObj)
  top.appendChild(tpc)
  return top
}

export const createTopic = function (nodeObj: NodeObj): Topic {
  const topic: Topic = $d.createElement('tpc')
  topic.nodeObj = nodeObj
  topic.dataset.nodeid = 'me' + nodeObj.id
  topic.draggable = this.draggable
  return topic
}

export function selectText(div: HTMLElement) {
  const range = $d.createRange()

  range.selectNodeContents(div)
  const getSelection = window.getSelection()
  if (getSelection) {
    getSelection.removeAllRanges()
    getSelection.addRange(range)
  }
}

export function createInputDiv(tpc: Topic) {
  // console.time('createInputDiv')
  if (!tpc) return
  let div = $d.createElement('div')
  const origin = tpc.childNodes[0].textContent as string
  tpc.appendChild(div)
  div.id = 'input-box'
  div.textContent = origin
  div.contentEditable = 'true'
  div.spellcheck = false

  // 修复输入框宽度不够问题
  const style = getComputedStyle(tpc)
  const gap = +style.getPropertyValue('padding-left').replace('px', '') * 2 + 2
  div.style.cssText = `min-width:${tpc.offsetWidth - gap}px`

  if (this.direction === LEFT) div.style.right = '0'
  div.focus()

  selectText(div)
  this.inputDiv = div

  this.bus.fire('operation', {
    name: 'beginEdit',
    obj: tpc.nodeObj,
  })

  div.addEventListener('keydown', e => {
    e.stopPropagation()
    const key = e.key

    if (key === 'Enter' || key === 'Tab') {
      // keep wrap for shift enter
      if (e.shiftKey) return

      e.preventDefault()
      this.inputDiv.blur()
      this.map.focus()
    }
  })

  div.addEventListener('blur', e => {
    if (!div) return
    const node = tpc.nodeObj
    const topic = div.textContent!.trim()
    if (topic === '') node.topic = origin
    else node.topic = topic
    div.remove()
    this.inputDiv = div = null
    if (topic === origin) return
    tpc.childNodes[0].textContent = node.topic
    this.linkDiv()

    const canvsContainer = document.querySelector('.map-canvas .box')
    const lastChild = canvsContainer.lastElementChild
    if (lastChild) {
      const style = window.getComputedStyle(lastChild)
      if (parseInt(style.top) > 20000 || parseInt(style.height) > 20000) createToast('文字篇幅过长，请调整')
    }

    this.bus.fire('operation', {
      name: 'finishEdit',
      obj: node,
      origin,
    })
  })

  div.addEventListener('paste', event => {
    event.preventDefault() // 阻止默认的黏贴行为
    const clipboardData = event.clipboardData
    const types = clipboardData.types
    const text = clipboardData.getData('text/plain')
    if (types.includes('Files')) createToast('不支持黏贴图片文件')
    // 将处理后的文本插入到需要黏贴的位置
    document.execCommand('insertHTML', false, text)

    // const items = event.clipboardData && event.clipboardData.items
    // if (items && items.length) {
    // const fr = new FileReader()
    // // 读取file 然后取回base64 编码路径
    // if (file) fr.readAsDataURL(file)
    // fr.onload = e => {
    //   const tempDiv = document.createElement('div')
    //   tempDiv.style.marginTop = '6px'
    //   const img = document.createElement('img')
    //   img.src = e.target.result as string
    //   img.style.maxWidth = '350px'
    //   tpc.appendChild(tempDiv)
    //   tpc.childNodes[0].textContent = ''
    //   tpc.appendChild(img)
    // }
    // }
  })
  // console.timeEnd('createInputDiv')
}

export const createExpander = function (expanded: boolean | undefined): Expander {
  const expander: Expander = $d.createElement('epd')
  // 包含未定义 expanded 的情况，未定义视为展开
  expander.expanded = expanded !== false
  expander.className = expanded !== false ? 'minus' : ''
  return expander
}

/**
 * traversal data and generate dom structure of mind map
 * @ignore
 * @param {object} data node data object
 * @param {object} container node container(mostly primary node)
 * @param {number} direction primary node direction
 * @return {ChildrenElement} children element.
 */
export function createChildren(data: NodeObj[], container?: HTMLElement, direction?) {
  let chldr: HTMLElement
  if (container) {
    chldr = container
  } else {
    chldr = $d.createElement('children')
  }
  for (let i = 0; i < data.length; i++) {
    const nodeObj = data[i]
    const grp = $d.createElement('GRP')
    if (direction === LEFT) {
      grp.className = 'lhs'
    } else if (direction === RIGHT) {
      grp.className = 'rhs'
    } else if (direction === SIDE) {
      if (nodeObj.direction === LEFT) {
        grp.className = 'lhs'
      } else if (nodeObj.direction === RIGHT) {
        grp.className = 'rhs'
      }
    }
    const top = this.createTop(nodeObj)
    if (nodeObj.children && nodeObj.children.length > 0) {
      top.appendChild(createExpander(nodeObj.expanded))
      grp.appendChild(top)
      if (nodeObj.expanded !== false) {
        const children = this.createChildren(nodeObj.children)
        grp.appendChild(children)
      }
    } else {
      grp.appendChild(top)
    }
    chldr.appendChild(grp)
  }
  return chldr
}

// Set primary nodes' direction and invoke createChildren()
export function layout() {
  console.time('layout')
  this.root.innerHTML = ''
  this.box.innerHTML = ''
  const tpc = this.createTopic(this.nodeData)
  shapeTpc(tpc, this.nodeData) // shape root tpc
  tpc.draggable = false
  this.root.appendChild(tpc)

  const primaryNodes: NodeObj[] = this.nodeData.children
  if (!primaryNodes || primaryNodes.length === 0) return
  if (this.direction === SIDE) {
    // initiate direction of primary nodes
    // 均分左右方向
    // const hasDirection = primaryNodes.map(item => item.direction).filter(item => item !== undefined)
    // if (hasDirection.length === primaryNodes.length) {
    //   const half = Math.ceil(primaryNodes.length / 2)
    //   const tranceDirection = primaryNodes[half - 1].direction === LEFT ? RIGHT : LEFT
    //   const originDirection = tranceDirection === LEFT ? RIGHT : LEFT
    //   primaryNodes.forEach((item, index) => {
    //     item.direction = index >= half ? tranceDirection : originDirection
    //   })
    // }

    let lcount = 0
    let rcount = 0
    primaryNodes
      .sort((a, b) => a.direction - b.direction)
      .map(node => {
        if (node.direction === undefined) {
          if (lcount <= rcount) {
            node.direction = LEFT
            lcount += 1
          } else {
            node.direction = RIGHT
            rcount += 1
          }
        } else {
          if (node.direction === LEFT) {
            lcount += 1
          } else {
            rcount += 1
          }
        }
      })
  }

  this.createChildren(this.nodeData.children, this.box, this.direction)
  console.timeEnd('layout')
}
