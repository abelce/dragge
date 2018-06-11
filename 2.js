const CORNER_WIDTH = 9;
const MIN_SIZE = 10;

window.onload = (e) => {
    e = e || window.event;
    let start = {
        x: 0,
        y: 0,
     };
     let diff = {
        x: 0,
        y: 0,
     };

     let origin = {
         width: 0,
         height: 0
     }

     let operator = null; // dragging: 拖拽, creating: 创建：， scaling： 缩放, default: ‘点击空白处'

    document.onmousedown = (e) => {
        e.stopPropagation();        
        start = {
            x: e.pageX,
            y: e.pageY,
        };
        
        if (e.target.className.match(/box/)) {
            operator = 'dragging';

            removeActiveBoxId();
            e.target.id = 'active_box';
            diff.x = start.x - e.target.offsetLeft;
            diff.y = start.y - e.target.offsetTop;
            showCorners(e.target);
        } else if (e.target.className.match(/corner/)) {
            operator = 'scaling';                       
            let box = document.getElementById('active_box');
            e.target.id='active_corner';
            diff.x = start.x - box.offsetLeft;
            diff.y = start.y - box.offsetTop;
            origin.width = box.offsetWidth;
            origin.height = box.offsetHeight;
        } else if(e.target.tagName === 'BODY'){
            operator = 'default';
            removeActiveBoxId();
            hideCorner();
        }
    }

    document.onmousemove = (e) => {
        if (operator === 'creating' && document.getElementById('active_box')) {
            let box = document.getElementById('active_box');
            box.style.width = Math.abs(e.pageX - start.x) + 'px';
            box.style.height = Math.abs(e.pageY - start.y) + 'px';
            if (e.pageX - start.x < 0) {  //创建时移动过程中鼠标坐标小于起始点时，修改left, top
                box.style.left = e.pageX;
            } 
            if (e.pageY - start.y < 0) {
                box.style.top = e.pageY;
            }
        } else if (operator === 'dragging' && document.getElementById('active_box')) {  // 拖拽box
            let box = document.getElementById('active_box');
             box.style.left = e.pageX - diff.x + 'px';
             box.style.top = e.pageY - diff.y + 'px';
             showCorners(box);
        } else if (operator === 'scaling' && document.getElementById('active_box')) {  // 缩放
            let box = document.getElementById('active_box');
            let corner = document.getElementById('active_corner');
            let originX = start.x - diff.x;
            let originY = start.y - diff.y;

            let diffWidth = e.pageX - start.x;
            let diffHeight = e.pageY - start.y;

            if (corner.className.indexOf('corner_lt') !== -1 && checkSize(origin.width - diffWidth) && checkSize(origin.height - diffHeight)) {
                console.log(origin.width, diffWidth, origin.width - diffWidth)
                box.style.top = originY + diffHeight;
                box.style.left = originX + diffWidth;
                box.style.width = origin.width - diffWidth;
                box.style.height = origin.height - diffHeight; 
            } else if (corner.className.indexOf('corner_rt') !== -1 && checkSize(origin.width + diffWidth) && checkSize(origin.height - diffHeight)) {  // x不变
                box.style.top = originY + diffHeight;
                box.style.width = origin.width + diffWidth;
                box.style.height = origin.height - diffHeight;
            } else if (corner.className.indexOf('corner_rb') !== -1 && checkSize(origin.width + diffWidth) && checkSize(origin.height + diffHeight)) { // x, y均不变
                box.style.width = origin.width + diffWidth;
                box.style.height = origin.height + diffHeight; 
            } 
            else if (corner.className.indexOf('corner_lb') !== -1 && checkSize(origin.width - diffWidth) && checkSize(origin.height + diffHeight)) { // y不变
                box.style.left = originX + diffWidth;
                box.style.width = origin.width - diffWidth;
                box.style.height =  origin.height + diffHeight; 
            }
            showCorners(box);
        } else if (operator === 'default') {  // 创建box: 点击空白处后拖动鼠标在创建，并将状态设为creating
            //
            removeActiveBoxId();
            let box = document.createElement('div');
            box.className='box';
            box.id = 'active_box';
            box.style.top = start.y;
            box.style.left = start.x;
            document.body.appendChild(box);

            operator = 'creating';
        }
    }

    document.onmouseup = (e) => {
        if (document.getElementById('active_box')) {
            let box = document.getElementById('active_box');
            // box.removeAttribute('id');
            if (operator === 'creating') {
                showCorners(box);            
            }
            if (operator === 'scaling') {
                if (document.getElementById('active_corner') !== null) {
                    document.getElementById('active_corner').removeAttribute('id');
                }
            }
            operator = null;            
        }
    }

    // 验证width， height，
    checkSize = (size) => {
        if (size >= MIN_SIZE) {
            return true;
        }
        return false;
    }

    scale = (box, type) => {
        // if (type === 'corner_lt') {
        //     box.style.top = 
        // }
    }

    // 获取角标，没有时自动创建
    getCorner = (tag) => {
        let corner = null;
        if (document.getElementsByClassName(`corner_${tag}`).length === 0) {
            corner = document.createElement('div');
            corner.className=`corner corner_${tag}`;
            document.body.appendChild(corner);
        } else {
            corner = document.getElementsByClassName(`corner_${tag}`)[0];
        }
        corner.style.display = 'block';        
        return corner;
    }

    // 显示角标
    showCorners = (ele) => {
        offset = Math.ceil(CORNER_WIDTH / 2);
        //左上脚
        let lt = getCorner('lt');
        lt.style.top = ele.offsetTop - offset;
        lt.style.left = ele.offsetLeft - offset;

        // 右上角
        let rt = getCorner('rt');
        rt.style.top = ele.offsetTop - offset;
        rt.style.left = ele.offsetLeft + ele.offsetWidth - offset;

        // 右下角
        let rb = getCorner('rb');
        rb.style.top = ele.offsetTop + ele.offsetHeight - offset - 1;
        rb.style.left = ele.offsetLeft + ele.offsetWidth - offset;

        // 左⬇️角
        let lb = getCorner('lb');
        lb.style.top = ele.offsetTop + ele.offsetHeight - offset - 1;
        lb.style.left = ele.offsetLeft - offset;  
    }

    // 隐藏角标
    hideCorner = () => {
        Array.from(document.querySelectorAll('.corner'))
        .forEach(cr => cr.style.display = 'none');
    }

    removeActiveBoxId = () => {
        if (document.getElementById('active_box') !== null) {
            document.getElementById('active_box').removeAttribute('id');
        }
    }
}