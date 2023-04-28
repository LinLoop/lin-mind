import { dragMoveHelper, getQueryVariable } from './utils/index'
import AlloyFinger from 'alloyfinger'
export default function(mind) {
  var timeer = null
  mind.map.addEventListener('click', e => {
    // if (dragMoveHelper.afterMoving) return
    // e.preventDefault() // can cause a tag don't work
    if (e.target.nodeName === 'EPD') {
      mind.expandNode(e.target.previousSibling)
    } else if (!getQueryVariable('isOnlyR')) {
      // 判断是否是只读模式，如果是只读模式，只允许展开缩放节点。
      if (
        e.target.parentElement.nodeName === 'T' ||
        e.target.parentElement.nodeName === 'ROOT'
      ) {
        mind.selectNode(e.target, false, e)
      } else if (e.target.nodeName === 'path') {
        if (e.target.parentElement.nodeName === 'g') {
          mind.selectLink(e.target.parentElement)
        }
      } else if (e.target.className === 'circle') {
        // skip circle
      } else {
        mind.unselectNode()
        // lite version doesn't have hideLinkController
        mind.hideLinkController && mind.hideLinkController()
      }
    }
  })

  mind.map.addEventListener('dblclick', e => {
    e.preventDefault()
    if (!mind.editable) return
    if (
      e.target.parentElement.nodeName === 'T' ||
      e.target.parentElement.nodeName === 'ROOT'
    ) {
      mind.beginEdit(e.target)
    }
  })

  /**
   * drag and move
   */
  mind.map.addEventListener('mousemove', e => {
    // click trigger mousemove in windows chrome
    // the 'true' is a string
    if (e.target.contentEditable !== 'true') {
      dragMoveHelper.onMove(e, mind.container)
    }
  })
  mind.map.addEventListener('mousedown', e => {
    if (e.target.contentEditable !== 'true') {
      dragMoveHelper.afterMoving = false
      dragMoveHelper.mousedown = true
    }
  })
  mind.map.addEventListener('mouseleave', e => {
    dragMoveHelper.clear()
  })
  mind.map.addEventListener('mouseup', e => {
    dragMoveHelper.clear()
  })
  // 监听滚轮事件
  mind.map.addEventListener('mousewheel', e => {
    e.preventDefault()
    clearTimeout(timeer)
    timeer = setTimeout(() => {
      if (e.wheelDelta > 0) {
        // 鼠标滚轮前滚
        if (mind.scaleVal >= 0.6) {
          mind.scale(mind.scaleVal -= 0.1)
        }
      } else {
        // 鼠标滚轮后滚
        if (mind.scaleVal <= 1.6) {
          mind.scale(mind.scaleVal += 0.1)
        }
      }
    }, 20)
  })

  /**
   * 手势放大事件
   * TODO:放在index里感觉可能会好一点
   */
  var initScale = 1
  new AlloyFinger(mind.map, {
    multipointStart: function() {
      initScale = mind.scaleVal
    },
    pinch: function(evt) {
      mind.scale(initScale * evt.zoom)
    },
  })
}
