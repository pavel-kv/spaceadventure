import { randomInt, randomFloat } from "./functions.js";
import {
	COLLISION_FLAG,
	MUTUAL_COLLISION_FLAG,
	GAME_ASSETS, 
	MOVEMENT,
	GAME_OPTIONS,
} from "./settings.js";
import Entity from "./Entity.js";

// класс вражеского босса
class BossEnemyShip extends Entity {
	constructor(options) {
		super(options);
		this.id = "bossEnemy";
		this.fireChance = options.fireChance ?? 0.009;
		this.countMovements = 0;

		this.deviationX = options.deviationX ?? 0;
		this.deviationY = options.deviationY ?? 0;
		this.deviationSpeedY = options.deviationSpeedY ?? 2;
		this.deviationSpeedX = options.deviationSpeedX ?? 2;
		this.typeMovement = options.typeMovement ?? "random";

	}

	// движение с анимацией
	move(coeff = 1, steps = 0) {

		this.update(coeff);
		this.sprite.animation(() => this.deleteAfterAnimation());
		
		if (this.inGame) {
			this.reboundEdgeX(this.deviationX);
			this.reboundEdgeY(this.mapHeight - this.deviationY);
		}

		switch (this.typeMovement) {
			case "bossEnemyMovement":
				this.bossEnemyMovement(steps);
				break;
		}

		if (Math.random() < this.fireChance) {
			this.fire();
		}

		if (this.inGame) {
			this.isDeleted = this.isOusideMap();
		}
	}

	// метод обратного вызова для предотвращения
	// удаления объекта после анимации 
	deleteAfterAnimation() {
		this.isDeleted = false;
	}

	// паттерн движения босса (при начале)
	bossEnemyMovement(steps) {
		if (this.isBottomTouch(this.mapHeight - this.deviationY / 2)) {
			if (this.countMovements === 0) {
				this.speedY /= 2;
				this.countMovements = 1;
			}
		}

		if (this.isTopTouch()) {
			if (this.countMovements === 1) {
				this.speedY = randomInt(1,3);
				this.speedX = randomInt(2,5);
				this.countMovements = 2;
			}
		}
	}

	// отправка сообщения для добавления выстрела
	fire() {
		if (!this.inGame) {
			return;
		}
		this.callback({
			code: "FireBoss",
			id: this.id,
			posX: this.posX,
			posY: this.posY,
			width: this.sprite.width,
			height: this.sprite.height,
			spriteFire: this.sprite.spriteFire,
		});
	}
}

export default BossEnemyShip;