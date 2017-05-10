var PICTURES = ["fish13.png", "fish3.png"];

var MAX_FISH_COUNT = 10;

var FADE_DURATION = 1500;

var MIN_TRANSLATION_DURATION = 6000;
var MAX_TRANSLATION_DURATION =  10000;

var MIN_SCALE = 0.2;
var MAX_SCALE = 0.53;

var canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var MAX_X = canvas.width;
var MAX_Y = canvas.height;

var ctx = canvas.getContext("2d");

function linearInterpolator(t) {
    return t;
}

function animate(options) {

    if (options.before) {
        options.before();
    }

    var start = performance.now();

    requestAnimationFrame(function animate(time) {
        // timeFraction от 0 до 1
        var timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;

        if (!options.timing) {
            options.timing = linearInterpolator;
        }
        // текущее состояние анимации
        var progress = options.timing(timeFraction);

        options.draw(progress);

        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        } else {
             if (options.after) {
                 options.after();
             }
        }
    });
}

function randomInt(from, to)  {
    return Math.floor(Math.random() * (to - from + 1)) + from;
}

function randomBoolean() {
    return Math.random() < 0.5;
}

var percent = randomInt(0, 100);

function getPercentBetween(from, to, percent) {
    percent /= 100;
    var k = percent / (1 - percent);
    return (from + k * to) / (1 + k);
}

function randImg() {
    return new ImageObject(PICTURES[randomInt(0, PICTURES.length-1)],
                          getPercentBetween(MIN_SCALE,MAX_SCALE,percent),
                          new Bezier3(randomInt(0, MAX_X), randomInt(0, MAX_X), randomInt(0, MAX_X)),
                          new Bezier3(randomInt(0, MAX_Y), randomInt(0, MAX_Y), randomInt(0, MAX_Y))
    );

}


function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.add = function (v) {
    this.x += v.x;
    this.y += v.y;
};


function Bezier3(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
}

Bezier3.prototype.bezier = function (t) {
    return Math.pow((1 - t), 2) * this.p1 + 2 * (1 - t) * t * this.p2 + Math.pow(t, 2) * this.p3;
};

Bezier3.prototype.derivative = function (t) {
    return 2 * (1 - t) * (this.p2 - this.p1) + 2 * t * (this.p3 - this.p2);
};

function Bezier4(p1, p2, p3, p4) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.p4 = p4;
}

Bezier4.prototype.bezier = function (t) {
    return Math.pow((1 - t), 3) * this.p1 + 3 * Math.pow((1 - t), 2) * t * this.p2 + 3 * (1 - t) * Math.pow(t, 2) * this.p3 + Math.pow(t, 3) * this.p4;
};
Bezier4.prototype.derivative = function (t) {
    return 3 * Math.pow((1 - t), 2) * (this.p2 - this.p1) + 6 * (1 - t) * t * (this.p3 - this.p2) + 3 * Math.pow(t, 2) * (this.p4 - this.p3);
};

function ImageObject(src, scale, bezierX, bezierY) {
    var self = this;
    this.position = new Vector(0,0);

    this.img = new Image();
    this.img.src = src;
    this.img.onload = function () {
        self.imgWidth = this.width * scale;
        self.imgHeight = this.height * scale;
    };

    this.alpha = 1.0;
    this.angle = 0;
    this.bezierX = bezierX;
    this.bezierY = bezierY;

}

ImageObject.prototype.step = function (t) {
    this.position.x = this.bezierX.bezier(t);
    this.position.y = this.bezierY.bezier(t);

    var k = this.bezierY.derivative(t) / this.bezierX.derivative(t);
    this.angle = (Math.atan(k) * 180 / Math.PI);
};

ImageObject.prototype.draw = function (context) {
    context.save();
    context.beginPath();
    context.translate(this.position.x + this.imgWidth / 2, this.position.y + this.imgHeight / 2);
    context.rotate(this.angle * Math.PI / 180);
    context.globalAlpha = this.alpha;
    context.drawImage(this.img, -this.imgWidth / 2, -this.imgHeight / 2, this.imgWidth, this.imgHeight);
    context.closePath();
    context.restore();
};

// var secondImg = new ImageObject(
//     "fish13.png",
//     0.5,
//     new Bezier4(800, 640, 400, 380),
//     new Bezier4(400, 220, 100, 80)
// );

var secondImg = randImg();

function drawLine(context, bezierX, bezierY, numPoints) {
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

    drawLine(ctx, secondImg.bezierX.bezier, secondImg.bezierY.bezier, 100);
}

setInterval(draw, 10);

animate({
    before: function () {
        console.log("before");

        animate({
            duration: 2000,
            draw: function (t) {
                secondImg.alpha = t;
            }
        });

        setTimeout(function () {
            animate({
                duration: 2000,
                draw: function (t) {
                    secondImg.alpha = 1 - t;
                }
            })
        }, 8000);
    },
    duration: 10000,
    draw: function (t) {

        secondImg.step(t);
        secondImg.draw(ctx);
    },
    after: function () {
        console.log("after");
    }
});
