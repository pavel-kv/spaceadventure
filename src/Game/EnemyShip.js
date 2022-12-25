import { randomInt, randomFloat } from "./functions.js";
import {
	COLLISION_FLAG,
	MUTUAL_COLLISION_FLAG,
	GAME_ASSETS, 
	MOVEMENT,
	GAME_OPTIONS,
} from "./settings.js";
import Entity from "./Entity.js";

// интервалы времени для случайного изменения параметров ENEMY SHIP
const RAND_TIME_MIN = 60;
const RAND_TIME_MAX = 300;
// настройки скорости ENEMY SHIP
const SPEED_MIN_X = 0.5;
const SPEED_MAX_X = 4;
const SPEED_MIN_Y = 0.3;
const SPEED_MAX_Y = 3;
//вариации скорости
const SPEED_VAR_MIN = 0.5;
const SPEED_VAR_MAX = 1.5;
//соотношение скорости
const SPEED_RATIO = 3;

// класс вражеского корабля
class EnemyShip extends Entity {
	constructor(options) {
		super(options);
		this.id = "enemyShip";
		this.fireChance = options.fireChance ?? 0.005;
		this.countMovements = 0;

		this.deviationX = options.deviationX ?? 0;
		this.deviationY = options.deviationY ?? 0;
		this.deviationSpeedY = options.deviationSpeedY ?? 2;
		this.typeMovement = options.typeMovement ?? "random";

	}

	move(coeff = 1, steps = 0) {

		this.update(coeff);

		if (this.inGame) {
			this.reboundEdgeX();
			this.isDeleted = this.isOusideMap();
		}

		switch (this.typeMovement) {
			case "figureEightMovement":
				this.figureEightMovement();
				break;
			case "clockwiseMovement":
				this.clockwiseMovement();
				break;
			case "counterclockwiseMovement":
				this.counterclockwiseMovement();
				break;
			case "randomEnemyMovement":
				this.moveRandom(steps);
				break;
		}

		if (Math.random() < this.fireChance) {
			this.fire();
		}
	}

	figureEightMovement() {
		if (this.isLeftTouch(this.mapWidth - this.deviationX)) {

			if (this.countMovements === 0) {
				this.speedY = 0;
				this.countMovements = 1;
			}
		}

		if (this.isLeftTouch(this.deviationX)) {
			if (this.countMovements === 1) {
				this.speedY = this.deviationSpeedY;
				this.countMovements = 2;
			}
		}

		if (this.isLeftTouch()) {
			if (this.countMovements === 2) {
				this.speedY = this.deviationSpeedY / 2;
				this.countMovements = 3;
			}
		}

		if (this.isRightTouch()) {
			if (this.countMovements === 3) {
				this.speedY = this.deviationSpeedY;
				this.countMovements = 4;
			}
		}

		if (this.isLeftTouch(this.mapWidth - this.deviationX)) {
			if (this.countMovements === 4) {
				this.speedY = 0;
				this.countMovements = 5;
			}
		}

		if (this.isLeftTouch(this.deviationX)) {
			if (this.countMovements === 5) {
				this.speedY = -this.deviationSpeedY;
				this.countMovements = 6;
			}
		}

		if (this.isLeftTouch()) {
			if (this.countMovements === 6) {
				this.speedY = -this.deviationSpeedY / 2;
				this.countMovements = 7;
			}
		}

		if (this.isRightTouch()) {
			if (this.countMovements === 7) {
				this.speedY = -this.deviationSpeedY;
				this.countMovements = 0;
			}
		}
	}

	clockwiseMovement() {
		if (this.isRightTouch(this.deviationX)) {
			if (this.countMovements === 0) {
				this.speedY = this.deviationSpeedY;
				this.countMovements = 1;
			}
		}

		if (this.isRightTouch()) {
			if (this.countMovements === 1) {
				this.speedY = this.deviationSpeedY;
				this.countMovements = 2;
			}
		}

		if (this.isLeftTouch(this.mapWidth - this.deviationX)) {
			if (this.countMovements === 2) {
				this.speedY = 0;
				this.countMovements = 3;
			}
		}

		if (this.isLeftTouch(this.deviationX)) {
			if (this.countMovements === 3) {
				this.speedY = -this.deviationSpeedY;
				this.countMovements = 4;
			}
		}

		if (this.isLeftTouch()) {
			if (this.countMovements === 4) {
				this.speedY = -this.deviationSpeedY;
				this.countMovements = 5;
			}
		}

		if (this.isRightTouch(this.mapWidth - this.deviationX)) {
			if (this.countMovements === 5) {
				this.speedY = 0;
				this.countMovements = 0;
			}
		}
	}

	counterclockwiseMovement() {
		if (this.isLeftTouch(this.deviationX)) {
			if (this.countMovements === 0) {
				this.speedY = this.deviationSpeedY;
				this.countMovements = 1;
			}
		}

		if (this.isLeftTouch()) {
			if (this.countMovements === 1) {
				this.speedY = this.deviationSpeedY;
				this.countMovements = 2;
			}
		}

		if (this.isRightTouch(this.mapWidth - this.deviationX)) {
			if (this.countMovements === 2) {
				this.speedY = 0;
				this.countMovements = 3;
			}
		}

		if (this.isRightTouch(this.deviationX)) {
			if (this.countMovements === 3) {
				this.speedY = -this.deviationSpeedY;
				this.countMovements = 4;
			}
		}

		if (this.isRightTouch()) {
			if (this.countMovements === 4) {
				this.speedY = -this.deviationSpeedY;
				this.countMovements = 5;
			}
		}

		if (this.isLeftTouch(this.mapWidth - this.deviationX)) {
			if (this.countMovements === 5) {
				this.speedY = 0;
				this.countMovements = 0;
			}
		}
	}

	moveRandom(steps = 0) {
		if (!this.inGame) {
			this.reboundEdgeX();
			if (this.speedY < 0.01) {
				this.speedY = randomFloat(SPEED_MIN_Y, SPEED_MAX_Y);
			}
			return;
		}

		if (steps && !(steps % randomInt(RAND_TIME_MIN, RAND_TIME_MAX))) {
			this.randomizeSpeed(steps);
		}
		if (steps && !(steps % randomInt(RAND_TIME_MIN, RAND_TIME_MAX))) {
			this.changeSpeed();
			this.fireChance += 0.0005;
		}
	}

	randomizeSpeed() {
		this.speedX = randomFloat(this.speedX * SPEED_VAR_MIN, this.speedX * SPEED_VAR_MAX);
		if (this.speedX > -SPEED_MIN_X && this.speedX < 0) {
			this.speedX = -SPEED_MIN_X
		}

		if (this.speedX >= 0 && this.speedX < SPEED_MIN_X) {
			this.speedX = SPEED_MIN_X
		}

		if (this.speedX > SPEED_MAX_X) {
			this.speedX = SPEED_MAX_X
		}

		this.speedX *= randomInt(0, 1) ? -1 : 1;

		this.speedY = randomFloat(this.speedY * SPEED_VAR_MIN, this.speedY * SPEED_VAR_MAX);
		if (this.speedY < SPEED_MIN_Y) {
			this.speedY = SPEED_MIN_Y;
		}

		if (this.speedY > SPEED_MAX_Y) {
			this.speedY = SPEED_MAX_Y
		}


		if (this.speedX / this.speedY > SPEED_RATIO) {
			this.speedX = this.speedX / 2;
		}
	}

	changeSpeed() {
		this.speedY = this.speedY * randomFloat(0.8, 1.2);
	}

	fire() {
		if (!this.inGame) {
			return;
		}
		this.callback({
			code: `Fire`,
			id: this.id,
			posX: this.posX,
			posY: this.posY,
			width: this.sprite.width,
			height: this.sprite.height,
			spriteFire: this.sprite.spriteFire,
		});
	}
}

export default EnemyShip;