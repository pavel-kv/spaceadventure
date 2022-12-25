import {
	COLLISION_FLAG,
	MUTUAL_COLLISION_FLAG,
	GAME_ASSETS, 
	MOVEMENT,
	GAME_OPTIONS,
} from "./settings.js";

// Базовый класс для игровых объектов

class Entity {
	constructor(options) {
		this.sprite = options.sprite;
		this.ctx = options.ctx;
		this.posX = options.posX;
		this.posY = options.posY;
		this.speedX = options.speedX;
		this.speedY = options.speedY;

		// метод callback'a при изменении состоянии объекта
		// столкновение, ничтожение, открытие огня
		this.callback = options.callback; 

		this.isReboundEdge = options.isReboundEdge ?? false;
		this.isReboundEntity = options.isReboundEntity ?? false;
		this.mapWidth = options.ctx.canvas.width;
		this.mapHeight = options.ctx.canvas.height;
		this.collisionFlag = options.collisionFlag;
		this.mutualCollisionFlag = options.mutualCollisionFlag;
		this.inGame = options.inGame ?? true;

		this.halfWidth = this.sprite.width / 2;
		this.halfHeight = this.sprite.height / 2;
		this.centerX = options.posX + this.halfWidth;
		this.centerY = options.posY + this.halfHeight;

		this.isDeleted = false;
		this.id = null;

		this.health = options.health ?? 1;
		this.lives = options.lives ?? 1;
		this.damage = options.damage ?? 1;

		this.lastTimeRebound = 0;

		this.collisionObjects = false;
		this.isReboundEdgeX = false;
		this.isReboundEdgeY = false;

		this.isBonus = options.isBonus ?? false;
	}

	// перерасчёт размеров и координат при изменении размеров окна
	resize(size) {
		this.mapWidth = size.width;
		this.mapHeight = size.height;
		this.posX *= size.coeffX;
		this.posY *= size.coeffY;
	}

	// обновление положения объекта
	update(coeff = 1) {
		this.posX += this.speedX * coeff;
		this.posY += this.speedY * coeff;
		this.centerX = this.posX + this.halfWidth;
		this.centerY = this.posY + this.halfHeight;
		if (this.posY >= 0 
			&& this.posY < this.mapHeight
			&& this.posX >= 0 
			&& this.posX + this.sprite.width <= this.mapWidth) {
			this.inGame = true;
		}
	}

	// отрисовка объекта
	draw() {
		this.ctx.drawImage(this.sprite.image, this.sprite.offsetX, this.sprite.offsetY, this.sprite.offsetWidth, this.sprite.offsetHeight, this.posX >> 0, this.posY >> 0, this.sprite.width, this.sprite.height);
	}

	// получение текущих координат и размеров объекта
	getParams() {
		return {
			posX: this.posX,
			posY: this.posY,
			width: this.width,
			height: this.height,
		};
	}

	//проверки на касание границ игрового поля
	isTopTouch(limit = 0) {
		return this.posY <= 0 + limit;
	}

	isBottomTouch(limit = 0) {
		return this.posY + this.sprite.height >= this.mapHeight - limit;
	}

	isLeftTouch(limit = 0) {
		return this.posX <= 0 + limit;
	}

	isRightTouch(limit = 0) {
		return this.posX + this.sprite.width >= this.mapWidth - limit;
	}

	//проверки на выход за границы игрового поля
	isOutsideTop() {
		return this.posY + this.sprite.height < 0;
	}

	isOutsideBottom() {
		return this.posY > this.mapHeight;
	}

	isOutsideLeft() {
		return this.posX + this.sprite.width < 0;
	}

	isOutsideRight() {
		return this.posX > this.mapWidth;
	}

	isOusideMap() {
		if ((this.posY + this.sprite.height < 0
			|| this.posY > this.mapHeight
			|| this.posX + this.sprite.width < 0
			|| this.posX > this.mapWidth)
			|| ((Math.abs(this.speedX) < 0.01)
				&& (this.posX < 0 || this.posX + this.sprite.width > this.mapWidth))) {
			return true;
		}
		return false;
	}


	// Проверка на столкновение c другим объектом
	isCollision(obj) {
		if (Math.abs(this.centerX - obj.centerX) > (this.halfWidth + obj.halfWidth)) {
			return false;
		}

		if (Math.abs(this.centerY - obj.centerY) > (this.halfHeight + obj.halfHeight)) {
			return false;
		}
		this.collisionObjects = true;
		setTimeout(() => this.collisionObjects = false, 15);
		return true;
	}

	// Взаимный отскок от другого объекта
	mutualRebound(entity) {
		[this.speedX, entity.speedX] = [entity.speedX, this.speedX];
		[this.speedY, entity.speedY] = [entity.speedY, this.speedY];
		this.update();
		entity.update();
	}

	// Отскок от границ экрана
	reboundEdge() {
		if (this.isTopTouch() || this.isBottomTouch()) {
			this.speedY *= (-1);
		}

		if (this.isLeftTouch() || this.isRightTouch()) {
			this.speedX *= (-1);
		}
	}

	// Отскок от вертикальных границ экрана 
	reboundEdgeY(limit = 0) {
		if ((this.isTopTouch() || this.isBottomTouch(limit))) {
			this.speedY *= (-1);
			return true;
		}
	}

	// Отскок от горизонтальных границ экрана 
	reboundEdgeX(limit = 0) {
		if ((this.isLeftTouch(limit) || this.isRightTouch(limit)) ) {
			this.speedX *= (-1);
			return true;
		}
	}

	//если произошло столкновение, то обратный вызов с передачей информации о событии
	// target - объект с которым столкнуля данный объект
	isCollideEntity(target) {
		// проверка если данный объект "в игре" и объект с которым столкнулить тоже "в игре".
		// "в игре" - значит что объекты полностью в видимой части экрана, а не за его границами
		if (!this.inGame || !target.inGame) {
			return; 
		}

		// при попадании по объекту отнимаем здоровье 
		// на величину ущерба наносимого столкнувшимся объектом
		let status = "Hit";
		this.health -= target.damage;
		if (this.health < 0) {
			this.health = 0;
		}

		// если в объекте с которым столкнулись был бонус дополнительной жизни,
		// то увеличиваем количество жизней
		if (target.bonusLives) {
			this.lives += target.bonusLives;
		}

		// проверка на уровень здоровья и количества жизней
		if (this.health === 0) {
			status = "Destroyed";
			if (--this.lives <= 0) {
				this.lives = 0;
				this.isDeleted = true;
			} else {
				this.health = GAME_OPTIONS[this.id].health;
			}
		}

		// обратный вызов с информацией о событии
		this.callback({
			id: this.id,
			code: this.id + status,
			health: this.health,
			lives: this.lives,
			posX: this.posX,
			posY: this.posY,
			width: this.sprite.width,
			height: this.sprite.height,
			speedX: this.speedX,
			speedY: this.speedY,
			centerX: this.centerX,
			centerY: this.centerY,
			typeMovement: this.typeMovement,
			explosion: this.sprite.explosion,
			isBonus: this.isBonus,
			target: target,
		});
	}
}

export default Entity;