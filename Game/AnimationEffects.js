// Класс для анимированных эффектов
// Взрывы, попадания по противнику, прокручивающиеся фоновые изображения

class AnimationEffects {
	constructor(options) {
		this.sprite = options.sprite;
		this.ctx = options.ctx;
		this.posX = options.posX;
		this.posY = options.posY;
		this.speedX = options.speedX;
		this.speedY = options.speedY;
		this.id = options.id;
		this.isDeleted = false;
	}

	//обновление положения
	update(coeff = 1) {
		this.posX += this.speedX * coeff;
		this.posY += this.speedY * coeff;
	}

	// движение с анимацией
	move(coeff = 1) {
		this.update(coeff);
		this.sprite.animation(() => this.deleteAfterAnimation());
	}

	// отрисовка
	draw() {
		this.ctx.drawImage(this.sprite.image, this.sprite.offsetX, this.sprite.offsetY, this.sprite.offsetWidth, this.sprite.offsetHeight, this.posX >> 0, this.posY >> 0, this.sprite.width, this.sprite.height);
	}

	// метод обратного вызова для удаления объекта после анимации
	deleteAfterAnimation() {
		this.isDeleted = true;
	}

	// перерасчёт размеров и координат при изменении размеров окна
	resize(size) {
		this.sprite.width *= size.coeffX;
		this.sprite.height = this.sprite.width * (this.sprite.offsetHeight / this.sprite.offsetWidth);
		this.posY *= size.coeffX;
	}
}

export default AnimationEffects;