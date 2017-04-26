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
        var progress = options.timing(timeFraction)

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
}

function MoveableObject(position,speed) {
    this.position = position;
    this.speed = speed;
}

MoveableObject.prototype.draw = function(context) {
    throw "Method draw is not implemented";
}

MoveableObject.prototype.step = function(width, height) {
    throw "Method step is not implemented";
}


function ImageObject (position, speed, src, scale) {
    var self = this;
    MoveableObject.apply(this, arguments);
    this.img = new Image();
    this.img.src = src;

    this.img.onload = function () {
        self.imgWidth = this.width*scale;
        self.imgHeight = this.height*scale;
    }

    console.log("imgHeight :" + this.imgHeight)
}

ImageObject.prototype = Object.create(MoveableObject.prototype);
ImageObject.prototype.constructor = ImageObject;

ImageObject.prototype.draw = function(context) {

    context.drawImage(this.img, this.position.x, this.position.y, this.imgWidth, this.imgHeight);

}

ImageObject.prototype.step = function(width, height) {
    if(this.position.x + this.speed.x > width || this.position.x + this.speed.x < 0) {
        this.speed.x = -this.speed.x;
    }
    if(this.position.y + this.speed.y > height  || this.position.y + this.speed.y < 0) {
        this.speed.y = -this.speed.y;
    }

    this.position.add(this.speed);
}




var firsImg = new ImageObject(
    new Vector (canvas.width/2, canvas.height/2),
    new Vector (1, -2),
    "fish13.png",
    1
);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    firsImg.draw(ctx);
    firsImg.step(canvas.width, canvas.height);



}

setInterval(draw, 10);