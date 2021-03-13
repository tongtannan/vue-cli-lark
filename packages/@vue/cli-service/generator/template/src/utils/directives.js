import Vue from 'vue';

Vue.directive('dialogDrag', {
  bind(el) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    dialogHeaderEl.style.cssText += ';cursor:move;';
    const dragDom = el.querySelector('.el-dialog');
    dragDom.style.cssText += ';left:0px;top:0px;';
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null);
    let cx, cy;
    let x, y;
    let isMove = false;
    dragDom.onmousedown = e => {
      x = parseInt(sty.left.replace(/\px/g, ''));
      y = parseInt(sty.top.replace(/\px/g, ''));
      cx = e.clientX;
      cy = e.clientY;
      isMove = true;
    };
    dragDom.onmousemove = e => {
      if (isMove) {
        dragDom.style.left = e.clientX - cx + x + 'px';
        dragDom.style.top = e.clientY - cy + y + 'px';
      }
    };
    dragDom.onmouseup = () => {
      isMove = false;
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }
});
