import Entity from "./Entity.js";

// класс выстрела
class FireShot extends Entity {
	constructor(options) {
		super(options);
		this.id = `${options.id}Fire`;
	}

	// движение с анимацией
	move(coeff = 1) {
		this.update(coeff);
		this.sprite.animation(() => this.deleteAfterAnimation());
		if (this.inGame) {
			this.isDeleted = this.isOusideMap();
		}
	}

	// метод обратного вызова для предотвращения
	// удаления объекта после анимации 
	deleteAfterAnimation() {
		this.isDeleted = false;
	}
}

export default FireShot;