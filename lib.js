function checkTouchScreen() {
	let prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
	let mq = function(query) {
		return window.matchMedia(query).matches;
	}
	if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) 
		return true;
	let query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
	return mq(query);
}

window.isTouchScreen = false;
if (checkTouchScreen()) {
    window.isTouchScreen = true;
}

window.requestAnimationFrame = (function(callback) {
	return requestAnimationFrame || webkitRequestAnimationFrame || mozRequestAnimationFrame || oRequestAnimationFrame || msRequestAnimationFrame || function(callback) {
		setTimeout(callback, 1000/60);
	};
})();

window.canvas = document.querySelector('canvas');
window.context = canvas.getContext('2d');

function update() {}; function draw() {};
function keydown() {}; function keyup() {};
function mousedown() {}; function mouseup() {}; function mousemove() {};
function touchstart() {}; function touchend() {}; function touchmove() {};

function init(options={}) {
    let clear = typeof options.clear !== 'undefined'? options.clear: true;
    let fullScreen = typeof options.fullScreen !== 'undefined'? options.fullScreen: false;
    let updateDelay = typeof options.updateDelay !== 'undefined'? options.updateDelay: 10;

    if (fullScreen) {
        let resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight-40;
        };
        resize();
        window.onresize = resize;
    }

    window.onkeydown = ev => {
        keydown(ev.key, ev.keyCode);
    };
    window.onkeyup = ev => {
        keyup(ev.key, ev.keyCode);
    };
    
    window.mouseX = 0, window.mouseY = 0;
    window.touchX = 0, window.touchY = 0;

    if (isTouchScreen) {
        let touch = cb => ev => {
            let touchobj = ev.changedTouches[0];
            touchX = parseInt(touchobj.pageX - canvas.offsetLeft);
            touchY = parseInt(touchobj.pageY - canvas.offsetTop);
            cb();
        };
        canvas.ontouchstart = touch(touchstart);
        canvas.ontouchend = touch(touchend);
        canvas.ontouchmove = touch(touchmove);
    } else {
        let mouse = cb => ev => {
            mouseX = ev.pageX - canvas.offsetLeft;
            mouseY = ev.pageY - canvas.offsetTop;
            cb();
        };
        canvas.onmousemove = mouse(mousemove); 
        canvas.onmousedown = mouse(mousedown);
        canvas.onmouseup = mouse(mouseup); 
    }

    if (clear) {
        function calldraw() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            draw();
            requestAnimationFrame(calldraw);
        }
    } else {
        function calldraw() {
            draw();
            requestAnimationFrame(calldraw);
        }
    }

    function callupdate() {
        update();
        setTimeout(callupdate, updateDelay);
    }

    setTimeout(callupdate, 0);
    setTimeout(calldraw, 0);
}
