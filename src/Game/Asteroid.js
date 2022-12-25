import Entity from "./Entity.js";

//Класс астероида
class Asteroid extends Entity {
	constructor(options) {
		super(options);
		this.id = "asteroid";
	}

	move(coeff = 1) {
		this.sprite.animation();
		this.update(coeff);

		if (this.inGame) {
			this.isDeleted = this.isOusideMap();
		}
	}
}

export default Asteroid;