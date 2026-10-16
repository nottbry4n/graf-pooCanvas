const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Ball {
    constructor(x, y, radius, speedX, speedY, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.speedY = Math.abs(this.speedY);
        }

        if (this.y + this.radius >= canvas.height) {
            this.y = canvas.height - this.radius;
            this.speedY = -Math.abs(this.speedY);
        }
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = Math.random() * (canvas.height - 2 * this.radius)
            + this.radius;

        this.speedX = -this.speedX;
    }
}

class Paddle {
    constructor(x, y, width, height, color, isPlayerControlled = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isPlayerControlled = isPlayerControlled;
        this.speed = 5;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === 'up') {
            this.y = Math.max(0, this.y - this.speed);
        } else if (direction === 'down') {
            this.y = Math.min(
                canvas.height - this.height,
                this.y + this.speed
            );
        }
    }

    autoMove(ball) {
        if (!ball) return;

        const center = this.y + this.height / 2;

        if (ball.y < center) {
            this.y -= this.speed;
        } else if (ball.y > center) {
            this.y += this.speed;
        }

        this.y = Math.max(
            0,
            Math.min(canvas.height - this.height, this.y)
        );
    }

    collides(ball) {
        const closestX = Math.max(
            this.x,
            Math.min(ball.x, this.x + this.width)
        );

        const closestY = Math.max(
            this.y,
            Math.min(ball.y, this.y + this.height)
        );

        const dx = ball.x - closestX;
        const dy = ball.y - closestY;

        return dx * dx + dy * dy <= ball.radius * ball.radius;
    }
}

class Game {
    constructor() {
        this.balls = [
            new Ball(250, 100, 8, 4, 3, '#FF5252'),
            new Ball(300, 180, 12, -5, 4, '#FFD740'),
            new Ball(350, 260, 15, 6, -3, '#40C4FF'),
            new Ball(400, 340, 10, -3, -5, '#69F0AE'),
            new Ball(450, 420, 18, 5, 6, '#E040FB')
        ];

        this.paddle1 = new Paddle(
            10,
            canvas.height / 2 - 100,
            12,
            200,
            '#2196F3',
            true
        );

        this.paddle2 = new Paddle(
            canvas.width - 22,
            canvas.height / 2 - 50,
            12,
            100,
            '#FF5722'
        );

        this.keys = {};
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.setLineDash([8, 8]);
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.strokeStyle = '#777777';
        ctx.stroke();
        ctx.setLineDash([]);

        this.balls.forEach(ball => ball.draw());

        this.paddle1.draw();
        this.paddle2.draw();
    }

    update() {
        if (this.keys['ArrowUp']) {
            this.paddle1.move('up');
        }

        if (this.keys['ArrowDown']) {
            this.paddle1.move('down');
        }

        this.balls.forEach(ball => {
            ball.move();

            if (
                ball.speedX < 0 &&
                this.paddle1.collides(ball)
            ) {
                ball.speedX = Math.abs(ball.speedX);

                ball.x = this.paddle1.x
                    + this.paddle1.width + ball.radius;
            }

            if (
                ball.speedX > 0 &&
                this.paddle2.collides(ball)
            ) {
                ball.speedX = -Math.abs(ball.speedX);

                ball.x = this.paddle2.x - ball.radius;
            }

            if (
                ball.x + ball.radius < 0 ||
                ball.x - ball.radius > canvas.width
            ) {
                ball.reset();
            }
        });

        const targetBall = this.balls.find(
            ball => ball.speedX > 0
        ) || this.balls[0];

        this.paddle2.autoMove(targetBall);
    }

    handleInput() {
        window.addEventListener('keydown', event => {
            if (
                event.key === 'ArrowUp' ||
                event.key === 'ArrowDown'
            ) {
                event.preventDefault();
            }

            this.keys[event.key] = true;
        });

        window.addEventListener('keyup', event => {
            this.keys[event.key] = false;
        });
    }

    run() {
        this.handleInput();

        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }
}

const game = new Game();
game.run();