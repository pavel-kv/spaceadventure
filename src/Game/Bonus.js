import Entity from "./Entity.js";

//Класс бонусов
class Bonus extends Entity {
	constructor(options) {
		super(options);
		this.id = options.id ?? "bonus";
		this.bonusLives = options.bonusLives ?? 0;
	}

	move(coeff = 1) {
		this.sprite.animation();
		this.update(coeff);

		if (this.inGame) {
			this.isDeleted = this.isOutsideTop() || this.isOutsideBottom() || this.isOutsideLeft() || this.isOutsideRight();
		}
	}
}

export default Bonus;