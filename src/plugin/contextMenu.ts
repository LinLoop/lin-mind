import i18n from '../i18n'
import { encodeHTML, isOutOfBoundary } from '../utils/index'
import './contextMenu.less'

export default function(mind, option) {
  const createTips = words => {
    const div = document.createElement('div')
    div.innerText = words
    div.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);'
    return div
  }
  const createLi = (id, name, keyname, icon) => {
    const li = document.createElement('li')
    li.id = id
    li.className = 'disabled'
    const imgUrl = require(`../icons/cmenu/${icon}.svg`)
    li.innerHTML = `<img src='${imgUrl}'/><span>${encodeHTML(name)}</span>`
    return li
  }

  const createButton = (id, name, icon, tag = 'li') => {
    const button = document.createElement(tag)
    button.id = id
    const imgUrl = require(`../icons/cmenu/${icon}.svg`)
    button.innerHTML = `<img src='${imgUrl}'/><span>${encodeHTML(name)}</span>`
    return button
  }

  const locale = i18n[mind.locale] ? mind.locale : 'en'
  const packup = createButton('cm-packup', i18n[locale].packup, 'packup')
  const expend = createButton('cm-expend', i18n[locale].expend, 'expend', 'div')
  const left = createButton('cm-left', i18n[locale].left, 'left')
  const right = createButton('cm-right', i18n[locale].right, 'right')
  const side = createButton('cm-side', i18n[locale].side, 'side')
  const add_child = createLi('cm-add_child', i18n[locale].addChild, 'tab', 'child')
  const add_parent = createLi('cm-add_parent', i18n[locale].addParent, '', 'parent')
  const add_sibling = createLi('cm-add_sibling', i18n[locale].addSibling, 'enter', 'sibling')
  const remove_child = createLi(
    'cm-remove_child',
    i18n[locale].removeNode,
    'delete',
    'delete'
  )
  const up = createLi('cm-up', i18n[locale].moveUp, 'PgUp', 'moveup')
  const down = createLi('cm-down', i18n[locale].moveDown, 'Pgdn', 'movedown')
  const link = createLi('cm-link', i18n[locale].link, '', 'link')
  const goback = createLi('cm-goback', i18n[locale].goback, '', 'goback')

  const initBtn = () => {
    add_child.className = ''
    add_parent.className = ''
    // focus.className = ''
    up.className = ''
    down.className = ''
    add_sibling.className = ''
    remove_child.className = ''
    link.className = ''
    // unfocus.className = 'disabled'
  }

  const menuUl = document.createElement('ul')
  menuUl.className = 'menu-list'
  menuUl.appendChild(packup)
  menuUl.appendChild(left)
  menuUl.appendChild(right)
  menuUl.appendChild(side)
  menuUl.appendChild(add_child)
  menuUl.appendChild(add_parent)
  menuUl.appendChild(add_sibling)
  menuUl.appendChild(remove_child)
  menuUl.appendChild(up)
  menuUl.appendChild(down)
  if (!option || option.link) {
    menuUl.appendChild(link)
  }
  if (mind.allowUndo) menuUl.appendChild(goback)
  if (option && option.extend) {
    for (let i = 0; i < option.extend.length; i++) {
      const item = option.extend[i]
      const dom = createLi(item.name, item.name, item.key || '', 'goback')
      menuUl.appendChild(dom)
      dom.onclick = e => {
        item.onclick(e)
      }
    }
  }
  const menuContainer = document.createElement('cmenu')
  menuContainer.appendChild(menuUl)
  menuContainer.appendChild(expend)
  // menuContainer.hidden = true

  mind.container.append(menuContainer)
  let isRoot = true
  // 鼠标右键点击事件的逻辑处理
  mind.container.oncontextmenu = function(e) {
    e.preventDefault()
    if (!mind.editable) return
    const target = e.target
    if (target.tagName === 'TPC') {
      if (target.parentElement.tagName === 'ROOT') {
        isRoot = true
      } else {
        isRoot = false
      }
      // 判断是否是根节点
      if (isRoot) {
        up.className = 'disabled'
        down.className = 'disabled'
        add_sibling.className = 'disabled'
        remove_child.className = 'disabled'
      } else {
        initBtn()
      }
      mind.selectNode(target)
      menuContainer.hidden = false
      const height = menuUl.offsetHeight
      const width = menuUl.offsetWidth
      if (height + e.clientY > window.innerHeight) {
        menuUl.style.top = ''
        menuUl.style.bottom = '0px'
      } else {
        menuUl.style.bottom = ''
        // menuUl.style.top = e.clientY + 15 + 'px'
      }
      if (width + e.clientX > window.innerWidth) {
        menuUl.style.left = ''
        // menuUl.style.right = '0px'
      } else {
        menuUl.style.right = ''
        // menuUl.style.left = e.clientX + 10 + 'px'
      }
    }
  }

  // menuContainer.onclick = e => {
  //   if (e.target === menuContainer) menuContainer.hidden = true
  // }

  packup.onclick = () => {
    const cmenuContainer = document.querySelector('cmenu')
    const cmenu = document.querySelector('cmenu .menu-list')
    cmenuContainer.classList.add('cmenu-close')
    cmenu.classList.add('hide')
  }

  expend.onclick = () => {
    const cmenuContainer = document.querySelector('cmenu')
    const cmenu = document.querySelector('cmenu .menu-list')
    cmenuContainer.classList.remove('cmenu-close')
    cmenu.classList.remove('hide')
  }

  left.onclick = () => {
    mind.initLeft()
  }
  right.onclick = () => {
    mind.initRight()
  }
  side.onclick = () => {
    mind.initSide()
  }

  add_child.onclick = e => {
    if (!mind.currentNode) return
    const isOut = isOutOfBoundary(mind, 'addChild')
    if (isOut) return
    mind.addChild()
    // menuContainer.hidden = true
  }
  add_parent.onclick = e => {
    const isOut = isOutOfBoundary(mind, 'insertParent')
    if (isOut) return
    mind.insertParent()
    // menuContainer.hidden = true
  }
  add_sibling.onclick = e => {
    if (isRoot || !mind.currentNode) return
    const isOut = isOutOfBoundary(mind, 'insertSibling')
    if (isOut) return
    mind.insertSibling()
    // menuContainer.hidden = true
  }
  remove_child.onclick = e => {
    if (isRoot) return
    mind.removeNode()
    // menuContainer.hidden = true
  }
  goback.onclick = e => {
    if (mind.history.length) mind.undo()
    // menuContainer.hidden = true
  }
  up.onclick = e => {
    if (isRoot) return
    mind.moveUpNode()
    // menuContainer.hidden = true
  }
  down.onclick = e => {
    if (isRoot) return
    mind.moveDownNode()
    // menuContainer.hidden = true
  }
  link.onclick = e => {
    if (!mind.currentNode) return
    // menuContainer.hidden = true
    const from = mind.currentNode
    const tips = createTips(i18n[locale].clickTips)
    mind.container.appendChild(tips)
    mind.map.addEventListener(
      'click',
      e => {
        e.preventDefault()
        tips.remove()
        if (
          e.target.parentElement.nodeName === 'T' ||
          e.target.parentElement.nodeName === 'ROOT'
        ) {
          mind.createLink(from, mind.currentNode)
          mind.bus.fire('operation', { name: 'linkNode', from: from.nodeObj, to: mind.currentNode.nodeObj }) // add to history
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
