import './nodeMenu.less'
import i18n from '../i18n'
// import { E } from '../index'

const createDiv = (id, innerHTML) => {
  const div = document.createElement('div')
  div.id = id
  div.innerHTML = innerHTML
  return div
}

const colorList = [
  '#2c3e50',
  '#34495e',
  '#7f8c8d',
  '#94a5a6',
  '#bdc3c7',
  '#ecf0f1',
  '#8e44ad',
  '#9b59b6',
  '#2980b9',
  '#3298db',
  '#c0392c',
  '#e74c3c',
  '#d35400',
  '#f39c11',
  '#f1c40e',
  '#17a085',
  '#27ae61',
  '#2ecc71',
]

export default function (mind) {
  function clearSelect(klass, remove) {
    var elems = mind.container.querySelectorAll(klass)
    ;[].forEach.call(elems, function (el) {
      el.classList.remove(remove)
    })
  }

  // create element
  const locale = i18n[mind.locale] ? mind.locale : 'en'
  const styleDiv = createDiv(
    'nm-style',
    `
  <div class="nm-fontsize-container">
    ${['15', '24', '32', '64']
      .map(size => {
        return `<div class="size"  data-size="${size}">
    <svg class="icon" style="width: ${size}px;height: ${size}px" aria-hidden="true">
      <use xlink:href="#icon-a"></use>
    </svg></div>`
      })
      .join('')}<div class="bold"><svg class="icon" aria-hidden="true">
<use xlink:href="#icon-B"></use>
</svg></div>
  </div>
  <div class="nm-fontcolor-container">
    ${colorList
      .map(color => {
        return `<div class="split6"><div class="palette" data-color="${color}" style="background-color: ${color};"></div></div>`
      })
      .join('')}
  </div>
  <div class="bof">
  <span class="font">${i18n[locale].font}</span>
  <span class="background">${i18n[locale].background}</span>
  </div>`
  )
  const tagDiv = createDiv(
    'nm-tag',
    `${i18n[locale].tag}<input class="nm-tag" tabindex="-1"  maxlength="40"  placeholder="${i18n[locale].tagsSeparate}"/>`
  )
  // const iconDiv = createDiv(
  //   'nm-icon',
  //   `${i18n[locale].icon}<input class="nm-icon" tabindex="-1"  maxlength="40" placeholder="${i18n[locale].iconsSeparate}" />`
  // )
  // const urlDiv = createDiv('nm-url', `${i18n[locale].url}<input class="nm-url" tabindex="-1" />`)
  const memoDiv = createDiv('nm-memo', `${i18n[locale].memo || 'Memo'}<textarea class="nm-memo" rows="5" tabindex="-1" />`)

  // create container
  const menuContainer = document.createElement('nmenu')
  menuContainer.innerHTML = `
  <div class="button-container"><svg class="icon" aria-hidden="true">
  <use xlink:href="#icon-close"></use>
  </svg></div>
  `
  menuContainer.appendChild(styleDiv)
  if (!mind.mobileMenu) {
    menuContainer.appendChild(tagDiv)
    // menuContainer.appendChild(iconDiv)
    menuContainer.appendChild(memoDiv)
  }
  menuContainer.hidden = true
  mind.container.append(menuContainer)

  // query input element
  const sizeSelector = menuContainer.querySelectorAll('.size')
  const bold: HTMLElement = menuContainer.querySelector('.bold')
  const buttonContainer: HTMLElement = menuContainer.querySelector('.button-container')
  const fontBtn: HTMLElement = menuContainer.querySelector('.font')
  const tagInput: HTMLInputElement = mind.container.querySelector('.nm-tag')
  // const iconInput: HTMLInputElement = mind.container.querySelector('.nm-icon')
  // const urlInput:HTMLInputElement = mind.container.querySelector('.nm-url')
  const memoInput: HTMLInputElement = mind.container.querySelector('.nm-memo')

  // handle input and button click
  let bgOrFont
  menuContainer.onclick = e => {
    if (!mind.currentNode) return
    const nodeObj = mind.currentNode.nodeObj
    const target = e.target as HTMLElement
    if (target.className === 'palette') {
      if (!nodeObj.style) nodeObj.style = {}
      clearSelect('.palette', 'nmenu-selected')
      target.className = 'palette nmenu-selected'
      if (bgOrFont === 'font') {
        nodeObj.style.color = target.dataset.color
      } else if (bgOrFont === 'background') {
        nodeObj.style.background = target.dataset.color
      }
      mind.updateNodeStyle(nodeObj)
    } else if (target.className === 'background') {
      clearSelect('.palette', 'nmenu-selected')
      bgOrFont = 'background'
      target.className = 'background selected'
      target.previousElementSibling.className = 'font'
      if (nodeObj.style && nodeObj.style.background) {
        menuContainer.querySelector('.palette[data-color="' + nodeObj.style.background + '"]').className = 'palette nmenu-selected'
      }
    } else if (target.className === 'font') {
      clearSelect('.palette', 'nmenu-selected')
      bgOrFont = 'font'
      target.className = 'font selected'
      target.nextElementSibling.className = 'background'
      if (nodeObj.style && nodeObj.style.color) {
        menuContainer.querySelector('.palette[data-color="' + nodeObj.style.color + '"]').className = 'palette nmenu-selected'
      }
    }
  }
  Array.from(sizeSelector).map(dom => {
    ;(dom as HTMLElement).onclick = e => {
      if (!mind.currentNode.nodeObj.style) mind.currentNode.nodeObj.style = {}
      clearSelect('.size', 'size-selected')
      const size = e.currentTarget as HTMLElement
      mind.currentNode.nodeObj.style.fontSize = size.dataset.size
      size.className = 'size size-selected'
      mind.updateNodeStyle(mind.currentNode.nodeObj)
    }
  })
  bold.onclick = (e: MouseEvent & { currentTarget: Element }) => {
    if (!mind.currentNode.nodeObj.style) mind.currentNode.nodeObj.style = {}
    if (mind.currentNode.nodeObj.style.fontWeight === 'bold') {
      delete mind.currentNode.nodeObj.style.fontWeight
      e.currentTarget.className = 'bold'
      mind.updateNodeStyle(mind.currentNode.nodeObj)
    } else {
      mind.currentNode.nodeObj.style.fontWeight = 'bold'
      e.currentTarget.className = 'bold size-selected'
      mind.updateNodeStyle(mind.currentNode.nodeObj)
    }
  }

  if (!mind.mobileMenu) {
    tagInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
      if (!mind.currentNode) return
      if (typeof e.target.value === 'string') {
        const newTags = e.target.value.split(',')
        mind.updateNodeTags(
          mind.currentNode.nodeObj,
          newTags.filter(tag => tag)
        )
      }
    }

    memoInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
      if (!mind.currentNode) return
      mind.currentNode.nodeObj.memo = e.target.value
    }
  }

  // iconInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
  //   if (!mind.currentNode) return
  //   if (typeof e.target.value === 'string') {
  //     const newIcons = e.target.value.split(',')
  //     mind.updateNodeIcons(
  //       mind.currentNode.nodeObj,
  //       newIcons.filter(icon => icon)
  //     )
  //   }
  // }
  // urlInput.onchange = (e:InputEvent & { target: HTMLInputElement}) => {
  //   if (!mind.currentNode) return
  //   mind.updateNodeHyperLink(mind.currentNode.nodeObj, e.target.value)
  // }

  let state = 'open'
  buttonContainer.onclick = e => {
    if (state === 'open') {
      state = 'close'
      menuContainer.className = 'close'
      buttonContainer.innerHTML = `<svg class="icon" aria-hidden="true"><use xlink:href="#icon-menu"></use></svg>`
    } else {
      state = 'open'
      menuContainer.className = ''
      buttonContainer.innerHTML = `<svg class="icon" aria-hidden="true"><use xlink:href="#icon-close"></use></svg>`
    }
  }

  // handle node selection
  mind.bus.addListener('unselectNode', function () {
    const currentImg = document.getElementById('currentImg')
    if (currentImg) {
      currentImg.setAttribute('id', '')
      currentImg.style.border = '0'
    }
    menuContainer.hidden = true
    // 将固定菜单恢复为禁止状态
    const cmenu = document.getElementsByClassName('menu-list')
    for (let i = 0; i < cmenu[0]?.children.length; i++) {
      cmenu[0].children[i].className = i < 4 || (cmenu[0].children[i].id === 'cm-goback' && mind.history.length) ? '' : 'disabled'
    }
    if (mind.toolBar) {
      document.getElementById('focus').className = 'disabled'
      document.getElementById('unfocus').className = 'disabled'
    }
  })
  // 鼠标左键点击事件的逻辑处理--node节点
  mind.bus.addListener('selectNode', function (nodeObj, clickEvent) {
    if (!clickEvent) return
    const currentImg = document.getElementById('currentImg')
    if (currentImg) {
      currentImg.setAttribute('id', '')
      currentImg.style.border = '0'
    }
    // TODO:好像可以去掉
    const cmenu = document.getElementsByClassName('menu-list')
    for (let i = 0; i < cmenu[0]?.children.length; i++) {
      if (mind.editable) cmenu[0].children[i].className = cmenu[0].children[i].id === 'cm-goback' && !mind.history.length ? 'disabled' : ''
    }
    // 判断是否是根节点
    const isRoot = nodeObj.root
    if (isRoot && mind.editable && !mind.mobileMenu) document.getElementById('cm-add_parent').className = 'disabled'
    // 判断是否专注模式
    const isFocusMode = !!mind.isFocusMode

    if (mind.toolBar) {
      document.getElementById('unfocus').className = isFocusMode ? '' : 'disabled'
      document.getElementById('focus').className = isRoot ? 'disabled' : ''
    }

    if (mind.editable && !mind.mobileMenu) {
      mind.container.oncontextmenu(clickEvent)
      menuContainer.hidden = false
    }

    clearSelect('.palette', 'nmenu-selected')
    clearSelect('.size', 'size-selected')
    clearSelect('.bold', 'size-selected')
    bgOrFont = 'font'
    fontBtn.className = 'font selected'
    fontBtn.nextElementSibling.className = 'background'
    if (nodeObj.style) {
      if (nodeObj.style.fontSize) {
        menuContainer.querySelector('.size[data-size="' + nodeObj.style.fontSize + '"]').className = 'size size-selected'
      }
      if (nodeObj.style.fontWeight) {
        menuContainer.querySelector('.bold').className = 'bold size-selected'
      }
      if (nodeObj.style.color) {
        menuContainer.querySelector('.palette[data-color="' + nodeObj.style.color + '"]').className = 'palette nmenu-selected'
      }
    }
    if (!mind.mobileMenu) {
      if (nodeObj.tags) {
        tagInput.value = nodeObj.tags.join(',')
      } else {
        tagInput.value = ''
      }

      memoInput.value = nodeObj.memo || ''
    }

    // if (nodeObj.icons) {
    //   iconInput.value = nodeObj.icons.join(',')
    // } else {
    //   iconInput.value = ''
    // }
    // urlInput.value = nodeObj.hyperLink || ''
  })
  // 处理图片点击
  mind.map.addEventListener('click', function (e) {
    if (e.target.tagName === 'IMG') {
      const ele = e.target
      ele.setAttribute('id', 'currentImg')
      ele.style.border = '1px solid #00AAFF'
    }
  })
}
