// Класс описывающий спрайт объекта

class Sprite {
	constructor(options) {
		this.image = options.image;
		this.imageWidth = options.imageWidth;
		this.offsetX = options.offsetX ?? 0;
		this.offsetY = options.offsetY ?? 0;
		this.offsetWidth = options.offsetWidth;
		this.offsetHeight = options.offsetHeight;
		this.width = options.width;
		this.height = options.height;
		this.firstFrame = options.firstFrame ?? 0;
		this.lastFrame = options.lastFrame ?? 0;
		this.startFrame = options.startFrame ?? 0;
		this.speedAnimation = options.speedAnimation ?? 30;
		this.animate = options.animate ?? false;
		this.once = options.once ?? true;
		this.indexFrame = this.startFrame;
		this.endTime = 0;
		this.spriteFire = options.spriteFire;
		this.explosion = options.explosion;
	}
	// смена изображения при анимации спрайта
	// рассчитывается смещение по осям X и Y по индексу фрейма
	changeImage(index) {
		const offsetWidth = index * this.offsetWidth;
		this.offsetY = Math.floor(offsetWidth / this.imageWidth) * this.offsetHeight;
		this.offsetX = offsetWidth % this.imageWidth;
	}

	// анимация спрайта
	// принимает метод обратного вызова, если требуется 
	// удалить объект после завершения анимации
	animation(callback) {
		if (!this.animate) {
			return;
		}
		const startTime = Date.now();
		if (startTime - this.endTime > this.speedAnimation) {
			this.changeImage(this.indexFrame++);

			if (this.indexFrame > this.lastFrame) {
				this.indexFrame = this.firstFrame;
			}

			if (this.once && this.indexFrame === this.startFrame) {
				this.animate = false;
				if (callback) {
					callback();
				}
				return false;
			}

			this.endTime = startTime;
		}
		return true;
	}
}

export default Sprite;