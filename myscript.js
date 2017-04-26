var canvas = document.getElementById("myCanvas");
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

var ctx = canvas.getContext("2d");


function animate(options) {

    var start = performance.now();

    requestAnimationFrame(function animate(time) {
        // timeFraction от 0 до 1
        var timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;

        // текущее состояние анимации
        var progress = options.timing(timeFraction);

        options.draw(progress);

        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        }

    });
}


function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
};

function MoveableObject(position,speed) {
    this.position = position;
    this.speed = speed;
}

MoveableObject.prototype.draw = function(context) {
    throw "Method draw is not implemented";
};

MoveableObject.prototype.step = function(width, height) {
    throw "Method step is not implemented";
};


function ImageObject (position, speed, src, scale) {
    var self = this;
    MoveableObject.apply(this, arguments);
    this.img = new Image();
    this.img.src = src;
    this.img.onload = function () {
        self.imgWidth = this.width*scale;
        self.imgHeight = this.height*scale;
    };
    this.angle = 0;
}

ImageObject.prototype = Object.create(MoveableObject.prototype);
ImageObject.prototype.constructor = ImageObject;

ImageObject.prototype.draw = function(context) {
    context.save();
    context.beginPath();
    context.translate(this.position.x + this.imgWidth/2, this.position.y + this.imgHeight/2);
    context.rotate(this.angle * Math.PI / 180);
    context.drawImage(this.img, -this.imgWidth/2, -this.imgHeight/2, this.imgWidth, this.imgHeight);
    context.closePath();
    context.restore();
};

ImageObject.prototype.step = function(width, height) {
    if(this.position.x + this.speed.x > width || this.position.x + this.speed.x < 0) {
        this.speed.x = -this.speed.x;
    }
    if(this.position.y + this.speed.y > height  || this.position.y + this.speed.y < 0) {
        this.speed.y = -this.speed.y;
    }

    this.position.add(this.speed);
};


var firsImg = new ImageObject(
    new Vector (canvas.width/2, canvas.height/2),
    new Vector (1, -2),
    "fish13.png",
    1
);


function bezier3 (p1, p2, p3) {

    return function(t) {
        return Math.pow((1 - t), 2) * p1 + 2 * (1 - t) * t * p2 + Math.pow(t, 2) * p3;
    }
}

function bezier3Der(p1, p2, p3) {
    return function(t) {
        return 2* (1 - t) *(p2 - p1) + 2* t * (p3 - p2);
    }
}

function bezier4 (p1, p2, p3, p4) {

    return function(t) {
        return Math.pow((1 - t), 3) * p1 + 3 * Math.pow((1-t), 2) * t * p2 + 3 * (1-t) * Math.pow(t, 2)* p3 + Math.pow(t,3)* p4;
    }
}

function bezier4Der (p1, p2, p3, p4) {

    return function(t) {
        return 3*Math.pow((1-t), 2) * (p2 - p1) + 6 * (1 - t) * t * (p3 - p2) + 3 * Math.pow(t, 2)* (p4 - p3);
    }
}

var bez1x = bezier3(200, 400, 800);
var bez1y = bezier3(400, 800, 400);

var bez1xD = bezier3Der(200, 400, 800);
var bez1yD = bezier3Der(400, 800, 400);

var bez2x = bezier4(100, 340, 600, 780);
var bez2y = bezier4(90, 420, 200, 400);

var bez2xD = bezier4Der(100, 340, 600, 780);
var bez2yD = bezier4Der(90, 420, 200, 400);

function drawLine (context, bezierX, bezierY, numPoints) {
    var step = 1 / numPoints;
    var t = 0;
    context.fill();
    while (t <= 1) {
        var x = bezierX(t);
        var y = bezierY(t);
        t += step;
        context.lineTo(x, y);
    }
    context.stroke();
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ctx.moveTo(100, 90);
    // drawLine(ctx, bez2x, bez2y, 300);
    // firsImg.draw(ctx);
    // firsImg.step(canvas.width, canvas.height);
}

setInterval(draw, 10);

animate({
    duration: 5000,
    timing: function (timeFraction) {
        return timeFraction;
    },
    draw: function(t) {
        firsImg.position.x = bez2x(t);
        firsImg.position.y = bez2y(t);

        var k = bez2xD(t) / bez2yD(t);
        firsImg.angle = (Math.atan(k) * - 180 / Math.PI);
        firsImg.draw(ctx);
    }
});