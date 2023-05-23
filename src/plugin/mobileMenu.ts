import './mobileMenu.less'
import MindElixir from '..'
import i18n from '../i18n'
import { findEle } from '../utils/dom'
import { isOutOfBoundary, getBranchDepth, createToast, throttle } from '../utils/index'

export default function (mind, option?) {
  //  重置nodeMenu
  const clearSelect = (klass, remove) => {
    var elems = mind.container.querySelectorAll(klass)
    ;[].forEach.call(elems, function (el) {
      el.classList.remove(remove)
    })
  }

  const resetNodeMenu = () => {
    const nemnu = mind.container.querySelector('nmenu')
    if (!nemnu) return
    clearSelect('.palette', 'nmenu-selected')
    clearSelect('.size', 'size-selected')
    clearSelect('.bold', 'size-selected')
    // const inputs: NodeListOf<HTMLInputElement> = mind.container.querySelectorAll('nmenu input')
    // const textarea: HTMLTextAreaElement = mind.container.querySelector('nmenu textarea')
    // for (let i = 0; i < inputs.length; i++) {
    //   inputs[i].value = ''
    // }
    // textarea.value = ''
  }

  const createLi = (id, name) => {
    const div = document.createElement('div')
    div.id = id
    div.innerHTML = name
    return div
  }

  const createTips = words => {
    const div = document.createElement('div')
    div.innerText = words
    div.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);'
    return div
  }

  const createButton = (id, name, icon) => {
    const button = document.createElement('div')
    button.id = id
    const folder = ['save'].includes(icon) ? 'toolbar' : 'cmenu'
    const imgUrl = require(`../icons/${folder}/${icon}.svg`)
    button.innerHTML = `<img src='${imgUrl}'/><span>${name}</span>`
    return button
  }

  const locale = i18n[mind.locale] ? mind.locale : 'en'
  // 创建节点菜单
  const edit = createLi('cm-edit', i18n[locale].edit)
  const edit_style = createLi('cm-edit_style', i18n[locale].editStlye)
  const remove = createLi('cm-remove_child', i18n[locale].remove)
  const up = createLi('cm-up', i18n[locale].moveUp)
  const down = createLi('cm-down', i18n[locale].moveDown)
  const link = createLi('cm-link', i18n[locale].link)

  // 左侧固定菜单
  const goback = createButton('cm-goback', i18n[locale].goback, 'goback')
  const save = createButton('save', i18n[locale].save, 'save')

  // 右侧固定菜单
  const add_child = createButton('cm-add_child', i18n[locale].addChild, 'child')
  const add_sibling = createButton('cm-add_sibling', i18n[locale].addSibling, 'sibling')

  // 创建菜单容器
  // const menuUl = document.createElement('ul')
  // menuUl.className = 'menu-list'

  // if (option && option.extend) {
  //   for (let i = 0; i < option.extend.length; i++) {
  //     const item = option.extend[i]
  //     const dom = createLi(item.name, item.name)
  //     menuUl.appendChild(dom)
  //     dom.onclick = e => {
  //       item.onclick(e)
  //     }
  //   }
  // }

  const leftBar = document.createElement('lbar')
  leftBar.appendChild(goback)
  leftBar.appendChild(save)

  const rightBar = document.createElement('rbar')
  rightBar.appendChild(add_child)
  rightBar.appendChild(add_sibling)
  rightBar.hidden = true

  const menuContainer = document.createElement('mmenu')
  menuContainer.appendChild(edit)
  menuContainer.appendChild(edit_style)
  menuContainer.appendChild(remove)
  menuContainer.appendChild(up)
  menuContainer.appendChild(down)
  menuContainer.appendChild(link)

  menuContainer.hidden = true

  mind.container.append(menuContainer)
  mind.container.append(leftBar)
  mind.container.append(rightBar)
  let isRoot = true

  // 移动时隐藏菜单栏
  mind.container.addEventListener(
    'touchmove',
    throttle(function () {
      menuContainer.hidden = true
      rightBar.hidden = true
    }, 1500)
  )

  mind.bus.addListener('unselectNode', function () {
    menuContainer.hidden = true
    rightBar.hidden = true
  })

  mind.bus.addListener('selectNode', function (nodeObj) {
    menuContainer.hidden = false
    rightBar.hidden = false
    // 计算菜单显示位置
    const nodeEle = findEle(nodeObj.id)
    const { top, left, width: nodeWidth } = nodeEle.getBoundingClientRect()
    const { width: mapWidth } = mind.container.getBoundingClientRect()
    const { width: menuWidth, height: menuHeight } = menuContainer.getBoundingClientRect()

    const menuTop = top - menuHeight > 20 ? top - menuHeight - 20 : top + menuHeight + 20
    let menuLeft = left + nodeWidth / 2 - menuWidth / 2
    // 判断边界值
    if (menuLeft > mapWidth - menuWidth) menuLeft = mapWidth - menuWidth - 20
    if (menuLeft < 20) menuLeft = 20

    menuContainer.style.top = menuTop + 'px'
    menuContainer.style.left = menuLeft + 'px'

    if (nodeObj.root) {
      isRoot = true
    } else {
      isRoot = false
    }
  })
  menuContainer.onclick = e => {
    if (e.target === menuContainer) menuContainer.hidden = true
  }

  edit.onclick = e => {
    mind.beginEdit()
  }

  edit_style.onclick = e => {
    const nmenu = mind.container.querySelector('nmenu')
    nmenu.style.top = '35px'
    nmenu.style.right = '50px'
    nmenu.hidden = false
  }

  remove.onclick = e => {
    if (isRoot) return
    if (mind.currentLink) return mind.removeLink()
    mind.removeNode()
    if (MindElixir.SIDE === mind.direction) mind.initSide()
  }

  up.onclick = e => {
    if (isRoot) return
    mind.moveUpNode()
  }
  down.onclick = e => {
    if (isRoot) return
    mind.moveDownNode()
  }

  add_child.onclick = e => {
    if (!mind.currentNode) return
    const depth = getBranchDepth(mind.currentNode.nodeObj)
    const childLength = mind.currentNode.nodeObj.children?.length ?? 0

    if (depth >= mind.maxChildNode && childLength <= 1) return createToast(i18n[locale].boundaryTips)
    mind.addChild()
    resetNodeMenu()
  }

  add_sibling.onclick = e => {
    if (isRoot || !mind.currentNode) return
    const isOut = isOutOfBoundary(mind, 'insertSibling')
    if (isOut) return createToast(i18n[locale].boundaryTips)
    mind.insertSibling()
    resetNodeMenu()
  }

  goback.onclick = e => {
    if (mind.history.length) mind.undo()
  }

  save.onclick = () => {
    if (mind.saveFn && mind.saveInstance) mind.saveFn.call(mind.saveInstance)
    console.log('failed save', mind.saveFn, mind.saveInstance)
  }

  link.onclick = e => {
    if (!mind.currentNode) return
    const from = mind.currentNode
    const tips = createTips(i18n[locale].clickTips)
    mind.container.appendChild(tips)
    mind.map.addEventListener(
      'click',
      e => {
        e.preventDefault()
        tips.remove()
        if (e.target.parentElement.nodeName === 'T' || e.target.parentElement.nodeName === 'ROOT') {
          mind.createLink(from, mind.currentNode)
          mind.bus.fire('operation', { name: 'linkNode', from: from.nodeObj, to: mind.currentNode.nodeObj }) // add to history
          mind.currentLink = null // 修复创建连接线后删除节点会优先删除连接线问题
        } else {
          console.log('link cancel')
        }
      },
      {
        once: true,
      }
    )
  }
}
