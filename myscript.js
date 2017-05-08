var canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth;
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

Vector.prototype.add = function (v) {
    this.x += v.x;
    this.y += v.y;
};


function Bezier3(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
}

Bezier3.prototype.bezier = function(t) {
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

function ImageObject(position, src, scale, bezierX, bezierY) {
    var self = this;
    this.position = position;

    this.img = new Image();
    this.img.src = src;
    this.img.onload = function () {
        self.imgWidth = this.width * scale;
        self.imgHeight = this.height * scale;
    };

    this.angle = 0;
    this.bezierX = bezierX;
    this.bezierY = bezierY;
}

ImageObject.prototype.step = function (t) {
    this.position.x = this.bezierX.bezier(t);
    this.position.y = this.bezierY.bezier(t);

    var k = this.bezierY.derivative(t) / this.bezierX.derivative(t);
    this.angle = (Math.atan(k) * 180 / Math.PI);
    console.log(this.angle);
};

ImageObject.prototype.draw = function (context) {
    context.save();
    context.beginPath();
    context.translate(this.position.x + this.imgWidth / 2, this.position.y + this.imgHeight / 2);
    context.rotate(this.angle * Math.PI / 180);
    context.drawImage(this.img, -this.imgWidth / 2, -this.imgHeight / 2, this.imgWidth, this.imgHeight);
    context.closePath();
    context.restore();
};

var firstImg = new ImageObject(
    new Vector(canvas.width / 2, canvas.height / 2),
    "fish13.png",
    1,
    new Bezier3(800, 400, 200),
    new Bezier3(400, 0, 400)
);

var secondImg = new ImageObject(
    new Vector(canvas.width / 3, canvas.height / 3),
    "fish13.png",
    0.5,
    new Bezier4(800, 640, 400, 380),
    new Bezier4(400, 220, 100, 80)
);

function drawLine(context, bezierX, bezierY, numPoints) {
    var step = 1 / numPoints;
    var t = 0;
    context.fill();
    while (t <= 1) {
        var x = bezierX.bezier(t);
        var y = bezierY.bezier(t);
        t += step;
        context.lineTo(x, y);
    }
    context.stroke();
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

setInterval(draw, 10);

animate({
    duration: 15000,
    timing: function (timeFraction) {
        return timeFraction;
    },
    draw: function (t) {
        firstImg.step(t);
        firstImg.draw(ctx);
    }
});


animate({
    duration: 10000,
    timing: function (timeFraction) {
        return timeFraction;
    },
    draw: function (t) {
        secondImg.step(t);
        secondImg.draw(ctx);
    }
});
