import { randomInt, randomFloat } from "./functions.js";

class Stars {
	constructor(ctx, width, height, amountStars) {
		this.ctx = ctx;
		this.width = width;
		this.height = height;
		this.amountStars = amountStars;
		this.stars = [];

		this.createStars();
	}

	createStars() {
		for (let i = 0; i < this.amountStars; i++) {
			const posX = randomInt(0, this.width);
			const posY = randomInt(0, this.height);
			const radius = randomInt(1, 3);
			const speedY = randomInt(radius * 0.5, radius * 1.5);
			const color = this.#colorRGBA(17, 109, 22, 40, 100, 200, 0.5, 0.8);

			this.stars.push({ posY, posX, radius, speedY, color });
		}
	}

	update() {
		for (let i = 0; i < this.amountStars; i++) {
			this.stars[i].posY += this.stars[i].speedY;
			if (this.stars[i].posY > this.height + 10) {
				this.stars[i].posY = -10;
				this.stars[i].posX = randomInt(0, this.width);
			}
		}
	}

	resize(size) {
		this.width = size.width;
		this.height = size.height;

		for (let i = 0; i < this.amountStars; i++) {
			this.stars[i].posX *= size.coeffX;
			this.stars[i].posY *= size.coeffY;
		}
	}

	draw() {
		for (let i = 0; i < this.amountStars; i++) {
			const gradientRadial = this.ctx.createRadialGradient(
				this.stars[i].posX,
				this.stars[i].posY,
				this.stars[i].radius * 0.2,
				this.stars[i].posX,
				this.stars[i].posY,
				this.stars[i].radius);
			gradientRadial.addColorStop(0, "rgb(255,255,255)");
			gradientRadial.addColorStop(0.8, this.stars[i].color);

			this.ctx.fillStyle = gradientRadial;

			this.ctx.beginPath();
			this.ctx.arc(this.stars[i].posX >> 0, this.stars[i].posY >> 0, this.stars[i].radius * 1, 0, 2 * Math.PI);
			this.ctx.closePath();
			this.ctx.fill();
		}
	}

	#colorRGBA(minR = 0, maxR = 255, minG = 0, maxG = 255, minB = 0, maxB = 255, alfaMin = 0, alfaMax = 1) {
		const red = randomInt(minR, maxR);
		const green = randomInt(minG, maxG);
		const blue = randomInt(minB, maxB);
		const alfa = randomFloat(alfaMin, alfaMax);
		return `rgba(${red},${green},${blue},${alfa})`;
	}
}

export default Stars;