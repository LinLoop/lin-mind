import './toolBar.less'
import i18n from '../i18n'

const createButton = (id, name, icon) => {
  const button = document.createElement('div')
  button.id = id
  if (['unfocus', 'focus'].includes(id)) button.className = 'disabled'
  const imgUrl = require(`../icons/toolbar/${icon}.svg`)
  button.innerHTML = `<img src='${imgUrl}'/><span>${name}</span>`
  return button
}

function createToolBarRBContainer(mind, option) {
  const toolBarRBContainer = document.createElement('toolbar')

  const locale = i18n[mind.locale] ? mind.locale : 'en'

  const focus = createButton('focus', i18n[locale].focus, 'focus')
  const unfocus = createButton('unfocus', i18n[locale].unfocus, 'unfocus')
  const minimize = createButton('minimize', i18n[locale].minimize, 'minimize')
  const gc = createButton('toCenter', i18n[locale].toCenter, 'tocenter')
  const zo = createButton('zoomin', i18n[locale].zoomout, 'zoomin')
  const zi = createButton('zoomout', i18n[locale].zoomin, 'zoomout')
  const save = createButton('save', i18n[locale].save, 'save')
  const exit = createButton('exit', i18n[locale].exit, 'exit')
  const percentage = document.createElement('span')
  percentage.innerText = '100%'

  if (!option || option.focus) {
    toolBarRBContainer.appendChild(focus)
    toolBarRBContainer.appendChild(unfocus)
  }

  if (mind.allowMinimize) toolBarRBContainer.appendChild(minimize)
  toolBarRBContainer.appendChild(gc)
  toolBarRBContainer.appendChild(zi)
  toolBarRBContainer.appendChild(zo)
  if (mind.allowSave) toolBarRBContainer.appendChild(save)
  if (mind.allowExit) toolBarRBContainer.appendChild(exit)
  if (mind.allowExit && mind.allowSave) {
    toolBarRBContainer.className = 'rb rb-save-line'
  } else if (mind.allowExit) {
    toolBarRBContainer.className = 'rb rb-exit-line'
  } else {
    toolBarRBContainer.className = 'rb'
  }

  focus.onclick = e => {
    if (focus.className === 'disabled') return
    if (!mind.currentNode) return
    const isRoot = mind.currentNode.parentElement?.tagName === 'ROOT'
    if (isRoot) return
    mind.focusNode(mind.currentNode)
    focus.className = 'disabled'
    unfocus.className = ''
    const nmenuContainer = document.getElementsByTagName('nmenu') as any
    if (nmenuContainer[0]) nmenuContainer[0].hidden = true
  }

  unfocus.onclick = e => {
    if (unfocus.className === 'disabled') return
    mind.cancelFocus()
    focus.className = ''
    unfocus.className = 'disabled'
  }
  minimize.onclick = () => {
    if (mind.miniFn && mind.miniInstance) mind.miniFn.call(mind.miniInstance)
    console.log('failed mini', mind.miniFn, mind.miniInstance)
  }
  save.onclick = () => {
    console.log(mind.nodeData)

    if (mind.saveFn && mind.saveInstance) mind.saveFn.call(mind.saveInstance)
    console.log('failed save', mind.saveFn, mind.saveInstance)
  }
  exit.onclick = () => {
    if (mind.exitFn && mind.exitInstance) mind.exitFn.call(mind.exitInstance)
    console.log('failed exit', mind.miniFn, mind.miniInstance)
  }
  gc.onclick = () => {
    mind.toCenter()
  }
  zo.onclick = () => {
    if (mind.scaleVal < 0.4) return
    mind.scale((mind.scaleVal -= 0.2))
  }
  zi.onclick = () => {
    if (mind.scaleVal > 1.6) return
    mind.scale((mind.scaleVal += 0.2))
  }
  return toolBarRBContainer
}
export default function (mind, option) {
  mind.container.append(createToolBarRBContainer(mind, option))
  // mind.container.append(createToolBarLTContainer(mind))
}
