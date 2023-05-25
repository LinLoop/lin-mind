import { getBranchDepth, isOutOfBoundary, createToast, getNodeChildDepth, getNodeDepth } from '../utils/index'
import i18n from '../i18n'
import MindElixir from '..'

export default function (mind) {
  const locale = i18n[mind.locale] ? mind.locale : 'en'
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
    const inputs: NodeListOf<HTMLInputElement> = mind.container.querySelectorAll('nmenu input')
    const textarea: HTMLTextAreaElement = mind.container.querySelector('nmenu textarea')
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].value = ''
    }
    textarea.value = ''
  }
  const key2func = {
    13: () => {
      // enter
      if (!mind.currentNode) return
      const isOut = isOutOfBoundary(mind, 'insertSibling')
      if (isOut) return createToast(i18n[locale].boundaryTips)
      mind.insertSibling()
      resetNodeMenu()
    },
    9: () => {
      // tab
      if (!mind.currentNode) return
      const depth = getBranchDepth(mind.currentNode.nodeObj)
      const childLength = mind.currentNode.nodeObj.children?.length ?? 0
      if (depth >= mind.maxChildNode && childLength <= 1) return createToast(i18n[locale].boundaryTips)
      mind.addChild()
      resetNodeMenu()
    },
    113: () => {
      // f2
      mind.beginEdit()
    },
    38: () => {
      // up
      mind.selectPrevSibling()
    },
    40: () => {
      // down
      mind.selectNextSibling()
    },
    37: () => {
      // left
      if (!mind.currentNode) return
      if (mind.currentNode.offsetParent.offsetParent.className === 'rhs') {
        mind.selectParent()
      } else if (mind.currentNode.offsetParent.offsetParent.className === 'lhs' || mind.currentNode.nodeObj.root) {
        mind.selectFirstChild()
      }
    },
    39: () => {
      // right
      if (!mind.currentNode) return
      if (mind.currentNode.offsetParent.offsetParent.className === 'rhs' || mind.currentNode.nodeObj.root) {
        mind.selectFirstChild()
      } else if (mind.currentNode.offsetParent.offsetParent.className === 'lhs') {
        mind.selectParent()
      }
    },
    33() {
      // pageUp
      mind.moveUpNode()
    },
    34() {
      // pageDown
      mind.moveDownNode()
    },
    67(e) {
      if (e.metaKey || e.ctrlKey) {
        // ctrl c
        mind.waitCopy = mind.currentNode
      }
    },
    86(e) {
      if (!mind.waitCopy) return
      if (e.metaKey || e.ctrlKey) {
        // ctrl v
        if (!mind.currentNode) return
        const childDepth = getNodeChildDepth(mind.waitCopy.nodeObj)
        const nodeDepth = getNodeDepth(mind.currentNode.nodeObj)
        if (childDepth + nodeDepth > 10) return createToast(i18n[locale].boundaryTips)

        mind.copyNode(mind.waitCopy, mind.currentNode)
        mind.waitCopy = null
      }
    },
    // ctrl z
    90: e => {
      if (!mind.allowUndo) return
      if (e.metaKey || e.ctrlKey) mind.undo()
    },
    // ctrl +
    187: e => {
      if (e.metaKey || e.ctrlKey) {
        if (mind.scaleVal > 1.6) return
        mind.scale((mind.scaleVal += 0.2))
      }
    },
    // ctrl -
    189: e => {
      if (e.metaKey || e.ctrlKey) {
        if (mind.scaleVal < 0.4) return
        mind.scale((mind.scaleVal -= 0.2))
      }
    },
  }
  mind.map.onkeydown = e => {
    // console.log(e)
    e.preventDefault()
    const ele = document.getElementById('currentImg')
    const div = document.getElementById('currentImg')?.previousElementSibling
    if (ele) {
      ele.parentNode.removeChild(div)
      ele.parentNode.removeChild(ele)
      mind.linkDiv()
    }
    if (!mind.editable) return
    // console.log(e, e.target)
    if (e.target !== e.currentTarget) {
      // input
      return
    }
    if (e.keyCode === 8 || e.keyCode === 46) {
      // del,backspace
      if (mind.currentLink) mind.removeLink()
      else {
        mind.removeNode()
        mind.unselectNode()
      }
    } else {
      key2func[e.keyCode] && key2func[e.keyCode](e)
    }
  }
}
