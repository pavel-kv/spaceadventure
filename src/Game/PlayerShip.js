import { randomInt, randomFloat } from "./functions.js";
import {
	COLLISION_FLAG,
	MUTUAL_COLLISION_FLAG,
	GAME_ASSETS, 
	MOVEMENT,
	GAME_OPTIONS,
} from "./settings.js";
import Entity from "./Entity.js";

//класс корабля игрока
class PlayerShip extends Entity {
	constructor(options) {
		super(options);
		this.isDeleted = false;
		this.incSpeedX = GAME_OPTIONS.playerShip.incSpeedX;
		this.incSpeedY = GAME_OPTIONS.playerShip.incSpeedY;
		this.maxSpeedX = GAME_OPTIONS.playerShip.maxSpeedX;
		this.maxSpeedY = GAME_OPTIONS.playerShip.maxSpeedY;
		this.pressedKeys = {}; 
		this.mouseState = {};
		this.prevShotTime = 0;
		this.id = "playerShip";
		this.health = options.health ?? GAME_OPTIONS.health;
		this.lives = options.lives ?? GAME_OPTIONS.lives;
		this.damage = options.damage ?? GAME_OPTIONS.damage;

		this.offsetMouseX = 0;
		this.offsetMouseY = 0;
		this.mouseLock = false;
	}

	// движение объекта при нажатии кнопок
	move(coeff = 1) {
		if (!this.mouseLock) {

			//плавное увеличение и уменьшение скорости по оси Y
			if (this.pressedKeys.up) {
				this.speedY -= this.incSpeedY;
			} else if (this.pressedKeys.down) {
				this.speedY += this.incSpeedY;
			} else if (this.speedY > 0) {
				this.speedY -= this.incSpeedY;
			} else if (this.speedY < 0) {
				this.speedY += this.incSpeedY;
			}

			//плавное увеличение и уменьшение скорости по оси X
			if (this.pressedKeys.left) {
				this.speedX -= this.incSpeedX;
			} else if (this.pressedKeys.right) {
				this.speedX += this.incSpeedX;
			} else if (this.speedX > 0) {
				this.speedX -= this.incSpeedX;
			} else if (this.speedX < 0) {
				this.speedX += this.incSpeedX;
			}

			//ограничение максимальной скорости по оси Y
			if (this.speedY > this.maxSpeedY) {
				this.speedY = this.maxSpeedY;
			} else if (this.speedY < -this.maxSpeedY) {
				this.speedY = -this.maxSpeedY;
			} else if (Math.abs(this.speedY) < 0.01) {
				this.speedY = 0;
			}

			//ограничение максимальной скорости по оси X
			if (this.speedX > this.maxSpeedX) {
				this.speedX = this.maxSpeedX;
			} else if (this.speedX < -this.maxSpeedX) {
				this.speedX = -this.maxSpeedX;
			} else if (Math.abs(this.speedX) < 0.01) {
				this.speedX = 0;
			}
		}

		//обновление положения объекта
		this.update(coeff);

		// проверки на соприкосновения с границей игровой зоны
		if (this.isTopTouch()) {
			this.posY = 0;
			this.speedY = 0;
		}

		if (this.isBottomTouch()) {
			this.posY = this.mapHeight - this.sprite.height;
			this.speedY = 0;
		}

		if (this.isLeftTouch()) {
			this.posX = 0;
			this.speedX = 0;
		}

		if (this.isRightTouch()) {
			this.posX = this.mapWidth - this.sprite.width;
			this.speedX = 0;
		}
	}

	// callback при событиях нажатии кнопок
	// вызывается из index.js
	changeKeyState(keys) {
		this.pressedKeys = keys;
		if (this.pressedKeys.fire && this.health > 0) {
			this.fire();
		}
	}

	// callback при событиях изменении мыши
	// вызывается из index.js
	changeMouseState(mouse) {
		this.mouseState = mouse;

		if (mouse.state === "pointerdown" && !this.mouseLock) {
			if ((mouse.x > this.posX && (mouse.x < this.posX + this.sprite.width))
				&& (mouse.y > this.posY && (mouse.y < this.posY + this.sprite.height))) {
				this.offsetMouseX = mouse.x - this.posX;
				this.offsetMouseY = mouse.y - this.posY;
				this.mouseLock = true;
			} else {
				this.mouseLock = false;
			}
		}

		if (mouse.state === "pointermove" && this.mouseLock) {
			this.posX = mouse.x - this.offsetMouseX;
			this.posY = mouse.y - this.offsetMouseY;
			this.centerX = this.posX + this.halfWidth;
			this.centerY = this.posY + this.halfHeight;
			if (this.health > 0) {
				this.fire();
			}
		}

		if (mouse.state === "click" && this.health > 0 && !this.mouseLock) {
			this.fire();
		}

		if (mouse.state === "pointerup") {
			this.mouseLock = false;
		}
	}

	// отправка сообщения для добавления выстрела
	fire() {
		const lastShotTime = Date.now();

		if (lastShotTime - this.prevShotTime < 300) {
			return;
		}
		this.prevShotTime = lastShotTime;

		this.callback({
			code: "Fire",
			id: this.id,
			posX: this.posX,
			posY: this.posY,
			width: this.sprite.width,
			height: this.sprite.height,
			spriteFire: this.sprite.spriteFire,
		});
	}
}

export default PlayerShip;