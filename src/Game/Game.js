import { randomInt, randomFloat } from "./functions.js";
import {
	COLLISION_FLAG,
	MUTUAL_COLLISION_FLAG,
	GAME_ASSETS,
	MOVEMENT,
	GAME_OPTIONS,
} from "./settings.js";

import Sprite from "./Sprite.js";
import AnimationEffects from "./AnimationEffects.js";
import Entity from "./Entity.js";
import Asteroid from "./Asteroid.js";
import EnemyShip from "./EnemyShip.js";
import BossEnemyShip from "./BossEnemyShip.js";
import PlayerShip from "./PlayerShip.js";
import FireShot from "./FireShot.js";
import Bonus from "./Bonus.js";
import Stars from "./Stars.js";

// создание игровых объектов и управление ими
class Game {
	constructor(bufferCtx) {
		this.bufferCtx = bufferCtx;
		this.sprites = {};
		this.audio = {};
		this.musicList = [];
		this.music = new Audio;
		this.backgroundImages = [];
		this.backgroundList = [];
		this.entityList = [];
		this.addedEntities = [];
		this.gameTimerId = 0;
		this.pressedKeys = {};
		this.pauseGame = false;
		this.isStopGame = false;
		this.isMusicGameoverPlayed = false;
		this.isResize = false;
		this.size = {
			width: bufferCtx.canvas.width,
			height: bufferCtx.canvas.height,
		};
		this.volumeAudioEffects = 0.2;
		this.volumeMusic = 0.2;
		this.isMuteAudioEffects = false;
		this.isMuteMusic = false;

		this.enemyShipSprite = "enemyShip1";
		this.bossEnemySprite = "bossEnemy1"
		this.countAddedEnemy = 0;
		this.addedEnemys = 0;
		this.currentPattern = 1;
		this.round = 0;
		this.maxLives = GAME_OPTIONS.playerShip.lives;
		this.fireChanceEnemy = GAME_OPTIONS.enemyShip.fireCnance;
		this.fireChanceBoss = GAME_OPTIONS.bossEnemy.fireCnance;

		this.entityInGame = {
			playerShip: 0,
			enemyShip: 0,
			bossEnemy: 0,
			asteroid: 0,
		}

		this.gameScore = {
			score: 0,
			totalDestr: 0,
			enemysDestr: 0,
			asteroidsDestr: 0,
			bossDestr: 0,
			health: 0,
			lives: 0,
			shots: 0,
			hits: 0,
			hitratio: 0,
			coins: 0,
			hearts: 0,
		}

		this.arrayOfPromise = [];

		this.maxEnemyShipsInGame = 5;
		this.maxAsteroidsInGame = 5;

		bufferCtx.fillRect(0, 0, this.size.width, this.size.height);
		this.stars = new Stars(this.bufferCtx, this.size.width, this.size.height, 100);

		this.loadGameResources();
	}

	//загрузка ресурсов
	loadGameResources() {
		Object.entries(GAME_ASSETS.sprites).forEach(([key, obj]) => {
			this.sprites[key] = { ...obj };
			this.arrayOfPromise.push(
				new Promise((resolve, reject) => {
					const img = new Image();
					img.src = obj.url;
					this.sprites[key].image = img;
					delete this.sprites[key].url;
					img.addEventListener("load", () => {
						if (!this.sprites[key].animate) {
							this.sprites[key].offsetWidth = img.width;
							this.sprites[key].offsetHeight = img.height;
						}
						this.sprites[key].imageWidth = img.width;
						this.sprites[key].imageHeight = img.height;
						resolve(true);
					});
				})
			);
		});

		Object.entries(GAME_ASSETS.backgrounds).forEach(([key, url]) => {
			const bgImage = {};
			this.arrayOfPromise.push(
				new Promise((resolve, reject) => {
					const img = new Image();
					img.src = url;
					bgImage.image = img;
					img.addEventListener("load", () => {
						bgImage.width = img.width;
						bgImage.height = img.height;
						this.backgroundImages.push(bgImage);
						resolve(true);
					});
				})
			);
		});

		Object.entries(GAME_ASSETS.audioEffects).forEach(([key, url]) => {
			this.arrayOfPromise.push(
				new Promise((resolve, reject) => {
					const audio = new Audio(url);
					this.audio[key] = audio;
					audio.addEventListener("canplaythrough", () => {
						resolve(true);
					});
				})
			);
		});
	}

	// слушатель на окончание воспроизведения музыки
	// для включения следующего трека
	addMusicEventListener() {
		this.music.addEventListener("pause", (event) => {
			this.playMusic(GAME_ASSETS.music[`music${randomInt(1, 4)}`])
		});
	}

	// запуск игры
	startGame() {
		return new Promise((resolve, reject) => {
			Promise.all(this.arrayOfPromise).then((result) => {
				this.playMusic(GAME_ASSETS.music[`music${randomInt(1, 4)}`]);
				this.addMusicEventListener();
				resolve(true);
			});
		});
	}

	// при окончании игры включение трека окончания игры
	stopGame() {
		if (!this.isMusicGameoverPlayed) {
			this.isMusicGameoverPlayed = true;
			this.playMusic(GAME_ASSETS.music["gameover"]);
		}
		this.isStopGame = true;
	}

	// вывод надписи GameOver при завершении игры
	printGameOver() {
		this.bufferCtx.drawImage(
			this.sprites["gameover"].image, 0, 0,
			this.sprites["gameover"].offsetWidth,
			this.sprites["gameover"].offsetHeight,
			this.size.width / 2 - 125,
			this.size.height / 2 - 56,
			this.sprites["gameover"].width,
			this.sprites["gameover"].height
		);
	}

	// выключение и включение аудиоэффектов и музыки
	// установка уровня звуков и музыки
	muteAudioEffects() {
		this.isMuteAudioEffects = true;
	}

	unmuteAudioEffects() {
		this.isMuteAudioEffects = false;
	}

	muteMusic() {
		this.isMuteMusic = true;
		this.music.pause();
		this.music.volume = 0;
	}

	unmuteMusic() {
		this.isMuteMusic = false;
		this.music.play();
		this.music.volume = this.volumeMusic;
	}

	setVolumeAudioEffects(volume) {
		if (volume < 0) {
			this.volumeAudioEffects = 0;
		} else if (volume > 1) {
			this.volumeAudioEffects = 1;
		} else {
			this.volumeAudioEffects = volume;
		}
	}

	setVolumeMusic(volume) {
		if (volume < 0) {
			this.volumeMusic = 0;
		} else if (volume > 1) {
			this.volumeMusic = 1;
		} else {
			this.volumeMusic = volume;
		}
	}

	// проигрывание музыки
	playMusic(source) {
		if (!this.isMuteMusic && !this.isStopGame) {
			this.music.src = "";
			this.music.src = source;
			this.music.addEventListener("canplaythrough", () => {
				this.music.play();
				this.music.volume = this.volumeMusic;
			});
		}
	}

	// проигрывание звукового эффекта при игровом событии
	playAudioEffect(source) {
		if (!this.isMuteAudioEffects && this.audio[source]) {
			const audio = this.audio[source].cloneNode(false);
			audio.volume = this.volumeAudioEffects;
			audio.currentTime = 0;
			audio.play();
		}
	}

	// изменение размеров игрового поля
	resize(size) {
		this.size.width = size.width;
		this.isResize = true;
		this.size = size;
	}

	// изменение размеров игровых объектов
	resizeEntity() {
		if (!this.size) {
			return;
		}
		for (let entity of this.entityList) {
			if (entity.resize) {
				entity.resize(this.size);
			}
		}
	}

	// изменение размеров фона
	resizeBackgroundImage() {
		if (!this.size) {
			return;
		}
		for (let bgImage of this.backgroundList) {
			if (bgImage.resize) {
				bgImage.resize(this.size);
			}
		}
	}

	// подсчёт очков игрока
	updateScores(message) {
		switch (message.code) {
			case "Fire":
				this.gameScore.shots += message.id === "playerShip" ? 1 : 0;
				if (this.gameScore.shots !== 0) {
					this.gameScore.hitratio = this.gameScore.hits / this.gameScore.shots;
				}
				break;
			case "playerShipFireDestroyed":
				this.gameScore.hits++;
				if (this.gameScore.shots !== 0) {
					this.gameScore.hitratio = this.gameScore.hits / this.gameScore.shots;
				}
				break;
			case "playerShipDestroyed":
			case "playerShipHit":
				this.gameScore.health = message.health;
				this.gameScore.lives = message.lives;
				if (this.gameScore.lives <= 0) {
					this.stopGame();
				}
				break;
			case "enemyShipDestroyed":
				if (message.target.id === "playerShipFire") {
					this.gameScore.enemysDestr++;
					this.gameScore.totalDestr++;
					this.gameScore.score += GAME_OPTIONS[message.id].score;
				}
				break;
			case "bossEnemyDestroyed":
				if (message.target.id === "playerShipFire") {
					this.gameScore.bossDestr++;
					this.gameScore.enemysDestr++;
					this.gameScore.totalDestr++;
					this.gameScore.score += GAME_OPTIONS[message.id].score;
					this.playMusic(GAME_ASSETS.music["victory"]);
				}
				break;
			case "asteroidDestroyed":
				if (message.target.id === "playerShipFire") {
					this.gameScore.asteroidsDestr++;
					this.gameScore.totalDestr++;
					this.gameScore.score += GAME_OPTIONS[message.id].score;
				}
				break;
			case "coinDestroyed":
				if (message.target.id === "playerShip") {
					this.gameScore.coins++;
					this.gameScore.score += GAME_OPTIONS[message.id].score;
				}
				break;
			case "heartDestroyed":
				if (message.target.id === "playerShip") {
					this.gameScore.hearts++;
				}
				break;
		}
	}

	getScores() {
		return this.gameScore;
	}

	// метод обратного вызова при изменении состояния кнопок клавиатуры
	changeKeyState(action) {
		this.pressedKeys = action.keys;
	}

	//добавляет объект в массив для последующего добавления в игру 
	// после очередного игрового цикла
	addEntity(entity) {
		entity.callback = this.eventsCallback.bind(this);
		this.addedEntities.push(entity);
		if (entity.id in this.entityInGame) {
			this.entityInGame[entity.id] += 1;
		}
	}

	// удаляет объект из списка активных объектов находящихся в игре
	removeEntityFromGame(id) {
		if (id in this.entityInGame) {
			this.entityInGame[id] -= 1;
		}
	}

	//обработка всех игровых объектов - основной цикл игры
	entityProcessing(coeff = 1, steps = 0) {

		// проверка на изменение размеров игрового поля
		if (this.isResize) {
			this.resizeBackgroundImage();
			this.stars.resize(this.size);
			this.resizeEntity();
			this.isResize = false;
		}

		// прорисовка фона
		this.backgroundProcessing(coeff, steps);
		this.stars.update();
		this.stars.draw();

		// если игра завершена вывод надписи
		if (this.isStopGame) {
			this.printGameOver();
			return;
		}

		const newEntityList = [];

		this.addRandomAsteroids(steps);
		this.managingAdditionEnemies(steps);

		for (let entity of this.entityList) {
			// если объект не помечен для удаления из игры,
			// то перемещаем, прорисовываем, проверяем на столкновение
			// и добавляем в массив игровых объектов для следующей итерации
			if (!entity.isDeleted) {
				entity.move(coeff, steps);
				entity.draw();
				this.checkColissions(entity);
				newEntityList.push(entity);
			} else {
				// если объект помечен для удаления из игры,
				// то не добавляем в массив игровых объектов для следующей итерации
				// и удаляем из списка активных объектов находящихся в игре
				this.removeEntityFromGame(entity.id);
			}
		}
		// формируем новый массив объектов находящихся в игре
		// для обработки на следующей итерации цикла
		this.entityList = [...newEntityList, ...this.addedEntities];
		this.addedEntities = [];
	}

	// проверка объектов на столкновения
	checkColissions(entity) {
		for (let obj of this.entityList) {
			// если объект равен самому себе то пропускаем
			if (entity === obj) {
				continue;
			}

			// если объекты нужно проверять на столкновения
			if (entity.mutualCollisionFlag & obj.collisionFlag) {
				// проверка двух объектов на столкновение
				const collide = entity.isCollision(obj);
				// если объекты столкнулись
				if (collide) {
					// для астероидов отскок
					if ((entity.id === "asteroid" && obj.id === "asteroid")) {
						entity.mutualRebound(obj);
						continue;
					}

					// для остальных объектов обработка столкновения
					entity.isCollideEntity({
						id: obj.id,
						speedX: obj.speedX,
						speedY: obj.speedY,
						centerX: obj.centerX,
						centerY: obj.centerY,
						damage: obj.damage,
						bonusLives: obj.bonusLives,
						inGame: obj.inGame,
					});

					obj.isCollideEntity({
						id: entity.id,
						speedX: entity.speedX,
						speedY: entity.speedY,
						centerX: entity.centerX,
						centerY: entity.centerY,
						damage: entity.damage,
						bonusLives: entity.bonusLives,
						inGame: entity.inGame,
					});
				}
			}
		}
	}

	// добавление фона
	addBackgroundImage() {
		this.backgroundList.push(this.createBackgroundEffect(this.backgroundImages[randomInt(0, this.backgroundImages.length - 1)]));
	}

	// сдвиг и прорисовка фона
	backgroundProcessing(coeff = 1, steps = 0) {

		if (this.backgroundList.length <= 0) {
			this.addBackgroundImage();
		}

		if (this.backgroundList[this.backgroundList.length - 1].posY >= 0) {
			this.addBackgroundImage();
		}

		if (this.backgroundList[0].posY > this.height) {
			this.backgroundList.shift();
		}

		for (let image of this.backgroundList) {
			image.move();
			image.draw();
		}
	}

	// управление добавлением кораблей проитвника в игру
	managingAdditionEnemies(steps) {
		if (!(steps % (107 + this.round * 5))
			&& this.countAddedEnemy < MOVEMENT[this.currentPattern].enemyStart) {

			switch (this.currentPattern) {
				case 1:
				case 3:
				case 5:
					this.addEnemyBackAndForthMovement(this.countAddedEnemy);
					break;
				case 2:
					this.addEnemyRectMovement("clockwise");
					break;
				case 4:
					this.addEnemyRectMovement("counterclockwise");
					break;
				case 6:
					this.maxBonusLives++;
					this.addEnemyFigureEightMovement();
					break;
				case 7:
					this.bossEnemySprite = `bossEnemy${randomInt(1, GAME_ASSETS.enemyBosses)}`;
					this.addBossEnemyMovement();
					this.playMusic(GAME_ASSETS.music["boss"]);
					break;
				case 8:
					this.addRandomEnemyShips();
					break;
			}
			this.countAddedEnemy++;
		}

		if ((this.entityInGame.enemyShip + this.entityInGame.bossEnemy) <= 0 && this.countAddedEnemy !== 0) {
			this.countAddedEnemy = 0;
			this.addedEnemys = 0;
			this.currentPattern++;
			this.enemyShipSprite = `enemyShip${randomInt(1, GAME_ASSETS.enemyShips)}`;

			if (this.currentPattern > MOVEMENT.patterns) {
				this.currentPattern = 1;
				this.round++;
				this.fireChanceEnemy += GAME_OPTIONS.enemyShip.incrementFireCnance;
				this.fireChanceBoss += GAME_OPTIONS.bossEnemy.incrementFireCnance;
				this.maxLives++;
				if (this.maxLives > GAME_OPTIONS.playerShip.maxLives) {
					this.maxLives = GAME_OPTIONS.playerShip.maxLives;
				}
			}
		}
	}

	// добавление корабля противника для движения по заданному паттерну
	addEnemyShip(message) {
		if (this.addedEnemys >= MOVEMENT[this.currentPattern].enemyMax + this.round * MOVEMENT.increaseEnemys) {
			return;
		}
		const options = {};
		switch (message.typeMovement) {
			case MOVEMENT[1].pattern:
			case MOVEMENT[3].pattern:
			case MOVEMENT[5].pattern:
				options.posY = message.posY;
				options.speedX = message.speedX;
				options.speedY = 0;
				options.typeMovement = MOVEMENT[this.currentPattern].pattern;
				if (message.speedX < 0) {
					options.posX = this.size.width;
				} else {
					options.posX = -message.width;
				}
				this.addEntity(this.createEnemyShip(options));
				this.addedEnemys++;
				break;
			case MOVEMENT[2].pattern:
				this.addEnemyRectMovement("clockwise");
				this.addedEnemys++;
				break;
			case MOVEMENT[4].pattern:
				this.addEnemyRectMovement("counterclockwise");
				this.addedEnemys++;
				break;
			case MOVEMENT[6].pattern:
				this.addEnemyFigureEightMovement();
				this.addedEnemys++;
				break;
			case MOVEMENT[8].pattern:
				this.addRandomEnemyShips();
				this.addedEnemys++;
				break;
		}
	}

	// добавление корабля противника в случайном порядке
	addRandomEnemyShips() {
		this.enemyShipSprite = `enemyShip${randomInt(1, GAME_ASSETS.enemyShips)}`;
		const options = {
			posX: randomInt(100, this.size.width - 200),
			posY: randomInt(-300, -100),
			speedX: randomFloat(-MOVEMENT[this.currentPattern].deviationSpeedX, MOVEMENT[this.currentPattern].deviationSpeedX),
			speedY: randomFloat(0.5, MOVEMENT[this.currentPattern].deviationSpeedY),
			typeMovement: MOVEMENT[this.currentPattern].pattern,
		};
		this.addEntity(this.createEnemyShip(options));
	}

	// добавление астероидов
	addRandomAsteroids(steps) {
		if (!(steps % 1511)) {
			this.maxAsteroidsInGame++;
		}
		if (!(steps % 97)) {

			if (this.entityInGame.asteroid < this.maxAsteroidsInGame) {
				for (let i = 0; i < GAME_OPTIONS.startPos.asteroid.maxCount; i++) {
					if (Math.random() > 0.5) {
						this.addEntity(this.createAsteroid());
					}
				}
			}
		}
	}

	// создание и добавление корабля противника 
	// с движением вперёд и назад по горизонтали
	addEnemyBackAndForthMovement(lines) {
		const options = {
			speedY: 0,
			typeMovement: MOVEMENT[this.currentPattern].pattern,
		};

		options.posY = lines * MOVEMENT[this.currentPattern].posY + 20;
		if (lines % 2) {
			options.posX = -MOVEMENT[this.currentPattern].posX;
			options.speedX = MOVEMENT[this.currentPattern].speedX + MOVEMENT.increaseSpeed * this.round;
		} else {
			options.posX = this.size.width + MOVEMENT[this.currentPattern].posX;
			options.speedX = -(MOVEMENT[this.currentPattern].speedX + MOVEMENT.increaseSpeed * this.round);
		}
		this.addEntity(this.createEnemyShip(options));
	}

	// создание и добавление корабля противника 
	// с движением восьмёркой
	addEnemyFigureEightMovement() {
		const options = {
			posX: this.size.width,
			posY: MOVEMENT[this.currentPattern].posY,
			speedX: MOVEMENT[this.currentPattern].speedX - MOVEMENT.increaseSpeed * this.round,
			speedY: MOVEMENT[this.currentPattern].speedY,
			deviationX: MOVEMENT[this.currentPattern].deviationX,
			deviationY: MOVEMENT[this.currentPattern].deviationY,
			deviationSpeedY: MOVEMENT[this.currentPattern].deviationSpeedY + MOVEMENT.increaseSpeed * this.round,
			typeMovement: MOVEMENT[this.currentPattern].pattern,
		};
		this.addEntity(this.createEnemyShip(options));
	}

	// создание и добавление корабля противника 
	// с движением по или против часовой стрелке
	addEnemyRectMovement(direction = "counterclockwise") {
		const options = {
			speedY: MOVEMENT[this.currentPattern].speedY,
			posY: MOVEMENT[this.currentPattern].posY,
			deviationX: MOVEMENT[this.currentPattern].deviationX,
			deviationY: MOVEMENT[this.currentPattern].deviationY,
			deviationSpeedY: MOVEMENT[this.currentPattern].deviationSpeedY + MOVEMENT.increaseSpeed * this.round,
			typeMovement: MOVEMENT[this.currentPattern].pattern,
		};

		if (direction === "clockwise") {
			options.posX = -MOVEMENT[this.currentPattern].posX;
			options.speedX = MOVEMENT[this.currentPattern].speedX + MOVEMENT.increaseSpeed * this.round;
		} else {
			options.posX = this.size.width + MOVEMENT[this.currentPattern].posX;
			options.speedX = MOVEMENT[this.currentPattern].speedX - MOVEMENT.increaseSpeed * this.round;
		}
		this.addEntity(this.createEnemyShip(options));
	}

	// создание и добавление босса противника 
	addBossEnemyMovement() {
		const options = {
			posX: this.size.width / 2,
			posY: MOVEMENT[this.currentPattern].posY,
			speedX: MOVEMENT[this.currentPattern].speedX,
			speedY: MOVEMENT[this.currentPattern].speedY,
			deviationX: MOVEMENT[this.currentPattern].deviationX,
			deviationY: MOVEMENT[this.currentPattern].deviationY,
			deviationSpeedY: MOVEMENT[this.currentPattern].deviationSpeedY,
			deviationSpeedX: MOVEMENT[this.currentPattern].deviationSpeedX,
			typeMovement: MOVEMENT[this.currentPattern].pattern,
		};
		this.addEntity(this.createBossEnemy(options));
	}

	//создание корабля игрока
	createPlayerShip() {
		this.gameScore.health = GAME_OPTIONS.playerShip.health;
		this.gameScore.lives = GAME_OPTIONS.playerShip.lives;

		const playerShipSprite = new Sprite(this.sprites.playerShip);

		return new PlayerShip({
			ctx: this.bufferCtx,
			sprite: playerShipSprite,
			posX: this.size.width / 2 - playerShipSprite.width / 2,
			posY: this.size.height - playerShipSprite.height - 20,
			speedX: 0,
			speedY: 0,
			health: GAME_OPTIONS.playerShip.health,
			lives: GAME_OPTIONS.playerShip.lives,
			damage: GAME_OPTIONS.playerShip.damage,
			collisionFlag: COLLISION_FLAG.playerShip,
			mutualCollisionFlag: MUTUAL_COLLISION_FLAG.playerShip,
			spriteFire: this.sprites.playerShip.spriteFire,
			inGame: true,
		});
	}

	//создание корабля противника
	createEnemyShip(options) {
		const sprite = new Sprite(this.sprites[this.enemyShipSprite]);

		return new EnemyShip({
			ctx: this.bufferCtx,
			sprite: sprite,
			posX: options.posX,
			posY: options.posY,
			deviationX: options.deviationX,
			deviationY: options.deviationY,
			deviationSpeedY: options.deviationSpeedY,
			typeMovement: options.typeMovement,
			speedX: options.speedX,
			speedY: options.speedY,
			health: GAME_OPTIONS.enemyShip.health,
			damage: GAME_OPTIONS.enemyShip.damage,
			collisionFlag: COLLISION_FLAG.enemyShip,
			mutualCollisionFlag: MUTUAL_COLLISION_FLAG.enemyShip,
			inGame: false,
			isBonus: Math.random() < GAME_OPTIONS.enemyShip.bonusChance ? true : false,
			fireCnance: this.fireChanceEnemy,
		});
	}

	//создание босса противника
	createBossEnemy(options) {
		const sprite = new Sprite(this.sprites[this.bossEnemySprite]);

		return new BossEnemyShip({
			ctx: this.bufferCtx,
			sprite: sprite,
			posX: options.posX - sprite.width / 2,
			posY: options.posY,
			deviationX: options.deviationX,
			deviationY: options.deviationY,
			deviationSpeedX: options.deviationSpeedX,
			deviationSpeedY: options.deviationSpeedY,
			typeMovement: options.typeMovement,
			speedX: options.speedX,
			speedY: options.speedY,
			health: GAME_OPTIONS.bossEnemy.health,
			damage: GAME_OPTIONS.bossEnemy.damage,
			collisionFlag: COLLISION_FLAG.bossEnemy,
			mutualCollisionFlag: MUTUAL_COLLISION_FLAG.bossEnemy,
			inGame: false,
			isBonus: Math.random() < GAME_OPTIONS.enemyShip.bonusChance ? true : false,
			fireCnance: this.fireChanceBoss,
		});
	}

	//создание астероида
	createAsteroid() {
		const asteroid = `asteroid${randomInt(1, 2)}`;
		const size = randomInt(30, 50);
		const firstFrame = randomInt(0, 1) ? 0 : 32;
		const lastFrame = firstFrame + 31;

		const spriteOptions = this.sprites[asteroid];

		spriteOptions.width = size;
		spriteOptions.height = size;
		spriteOptions.firstFrame = firstFrame;
		spriteOptions.lastFrame = lastFrame;
		spriteOptions.startFrame = randomInt(firstFrame, lastFrame);
		spriteOptions.speedAnimation = randomInt(60, 120);

		const asteroidSprite = new Sprite(spriteOptions);

		const { posX, posY, speedX, speedY } = this.randomStart(GAME_OPTIONS.startPos.asteroid);

		return new Asteroid({
			ctx: this.bufferCtx,
			sprite: asteroidSprite,
			posX,
			posY,
			speedX,
			speedY,
			health: GAME_OPTIONS.asteroid.health,
			damage: GAME_OPTIONS.asteroid.damage,
			collisionFlag: COLLISION_FLAG.asteroid,
			mutualCollisionFlag: MUTUAL_COLLISION_FLAG.asteroid,
			inGame: false,
		});
	}

	// случайная позиция при добавлении в игру
	randomStart(entity) {
		const posX = randomInt(0, this.size.width - 100);
		const posY = randomInt(-400, -100);

		let speedX;
		if (posX < this.size.width * 0.5) {
			speedX = randomFloat(entity.minSpeedX, entity.maxSpeedX)
		} else if (posX > this.size.width * 0.8) {
			speedX = randomFloat(-entity.maxSpeedX, -entity.minSpeedX);
		} else {
			speedX = randomFloat(-entity.maxSpeedX, entity.maxSpeedX)
		}
		// const speedX = posX < width / 2 ? randomFloat(entity.minSpeedX, entity.maxSpeedX) : randomFloat(-entity.maxSpeedX, -entity.minSpeedX);
		const speedY = randomFloat(entity.minSpeedY, entity.maxSpeedY);
		return { posX, posY, speedX, speedY };
	}

	// выстрел
	addFireShot(param) {
		let times = 1;
		if (this.sprites[param.spriteFire].times) {
			times = this.sprites[param.spriteFire].times;
		}

		for (let i = 0; i < times; i++) {

			const fireSprite = new Sprite(this.sprites[param.spriteFire]);
			const positionX = param.code === "playerShip"
				? param.posY + i * fireSprite.height
				: param.posY + param.height - fireSprite.height + i * fireSprite.height;

			const fireOptions = {
				ctx: this.bufferCtx,
				sprite: fireSprite,
				posX: (param.posX + param.width / 2 - fireSprite.width / 2),
				posY: positionX,
				speedX: GAME_OPTIONS[param.id + param.code].speedX,
				speedY: GAME_OPTIONS[param.id + param.code].speedY,
				damage: GAME_OPTIONS[param.id + param.code].damage,
				id: param.id,
				collisionFlag: COLLISION_FLAG[param.id + param.code],
				mutualCollisionFlag: MUTUAL_COLLISION_FLAG[param.id + param.code],
			}
			this.addEntity(new FireShot(fireOptions));
		}
		this.playAudioEffect(param.id + param.code);
	}

	// выстрел босса
	addBossEnemyFire(param) {
		let count = 1;

		if (this.sprites[param.spriteFire].count) {
			count = this.sprites[param.spriteFire].count;
		}

		let speedFireBossX = 0;

		for (let i = 0; i < count; i++) {
			if (i === 1) {
				speedFireBossX = -2;
			} else if (i === 2) {
				speedFireBossX = 2;
			}

			const fireSprite = new Sprite(this.sprites[param.spriteFire]);
			const fireOptions = {
				ctx: this.bufferCtx,
				sprite: fireSprite,
				posX: (param.posX + param.width / 2 - fireSprite.width / 2),
				posY: param.code === "playerShip" ? param.posY : param.posY + param.height - fireSprite.height,
				speedX: speedFireBossX,
				speedY: GAME_OPTIONS[param.id + param.code].speedY,
				damage: GAME_OPTIONS[param.id + param.code].damage,
				id: param.id,
				collisionFlag: COLLISION_FLAG[param.id + param.code],
				mutualCollisionFlag: MUTUAL_COLLISION_FLAG[param.id + param.code],
			}
			this.addEntity(new FireShot(fireOptions));
		}
	}

	// взрыв корабля
	addExplosionShip(param) {

		const spriteOptions = this.sprites[param.explosion];
		spriteOptions.width = (param.height > param.width ? param.height : param.width) * 1.5;
		spriteOptions.height = (param.height > param.width ? param.height : param.width) * 1.5;
		const explosionSprite = new Sprite(spriteOptions);
		const explosionOptions = {
			ctx: this.bufferCtx,
			sprite: explosionSprite,
			posX: (param.centerX - explosionSprite.width / 2),
			posY: (param.centerY - explosionSprite.height / 2),
			speedX: param.speedX,
			speedY: param.speedY,
			id: "explosionShip",
			hide: false,
			collisionFlag: 0,
			mutualCollisionFlag: 0,
		}
		this.addEntity(new AnimationEffects(explosionOptions));
		this.playAudioEffect("explosionShip");
	}

	// прокручивающиеся фоновые изображения
	createBackgroundEffect(image) {
		const spaceSprite = new Sprite({
			width: this.size.width,
			height: this.size.width * (image.height / image.width),
			offsetX: 0,
			offsetY: 0,
			offsetWidth: image.width,
			offsetHeight: image.height,
			image: image.image,
			imageWidth: image.width,
		});

		return new AnimationEffects({
			ctx: this.bufferCtx,
			sprite: spaceSprite,
			posX: 0,
			posY: -spaceSprite.height,
			speedX: 0,
			speedY: 0.3,
			id: "space",
			collisionFlag: 0,
			mutualCollisionFlag: 0,
		});
	}

	// бонус - монеты (дополнительные очки)
	addCoin(param) {
		const coinSprite = new Sprite(this.sprites.coin);
		const coinOptions = {
			ctx: this.bufferCtx,
			sprite: coinSprite,
			posX: (param.centerX - coinSprite.width / 2),
			posY: (param.centerY - coinSprite.height / 2),
			speedX: param.speedX / 4,
			speedY: Math.abs(param.speedY) + 2,
			id: "coin",
			hide: false,
			damage: GAME_OPTIONS.coin.damage,
			collisionFlag: COLLISION_FLAG.bonus,
			mutualCollisionFlag: MUTUAL_COLLISION_FLAG.bonus,
		}
		this.addEntity(new Bonus(coinOptions));
	}

	// бонус - дополнительная жизнь
	addHeart(param) {
		const heartSprite = new Sprite(this.sprites.heart);
		const heartOptions = {
			ctx: this.bufferCtx,
			sprite: heartSprite,
			posX: (param.centerX - heartSprite.width / 2),
			posY: (param.centerY - heartSprite.height / 2),
			speedX: param.speedX / 4,
			speedY: Math.abs(param.speedY) + 2,
			id: "heart",
			hide: false,
			damage: GAME_OPTIONS.heart.damage,
			bonusLives: GAME_OPTIONS.heart.bonusLives,
			collisionFlag: COLLISION_FLAG.bonus,
			mutualCollisionFlag: MUTUAL_COLLISION_FLAG.bonus,
		}
		this.addEntity(new Bonus(heartOptions));
	}

	// взрыв астероида
	addExplosionAsteroid(param) {
		const SpriteOptions = this.sprites["explosionAsteroid"];
		SpriteOptions.width = (param.height > param.width ? param.height : param.width) * 2;
		SpriteOptions.height = (param.height > param.width ? param.height : param.width) * 2;
		const explosionAsteroidSprite = new Sprite(SpriteOptions);
		const explosionOptions = {
			ctx: this.bufferCtx,
			sprite: explosionAsteroidSprite,
			posX: (param.centerX - explosionAsteroidSprite.width / 2),
			posY: (param.centerY - explosionAsteroidSprite.height / 2),
			speedX: param.speedX,
			speedY: param.speedY,
			id: "explosionAsteroid",
			hide: false,
			collisionFlag: 0,
			mutualCollisionFlag: 0,
		}
		this.addEntity(new AnimationEffects(explosionOptions));
	}

	// взрыв выстрела при попадании по противнику
	addExplosionFireShot(param) {
		const explosionFireShotSprite = new Sprite(this.sprites[param.explosion]);
		const explosioBlueLaserShot = {
			ctx: this.bufferCtx,
			sprite: explosionFireShotSprite,
			posX: (param.centerX - explosionFireShotSprite.width / 2),
			posY: (param.target.centerY - explosionFireShotSprite.height / 2),
			speedX: param.target.speedX,
			speedY: param.target.speedY,
			id: `explosion${param.id}`,
			collisionFlag: 0,
			mutualCollisionFlag: 0,
		}
		this.addEntity(new AnimationEffects(explosioBlueLaserShot));
	}

	// обратный вызов для приёма сообщений от игровых объектов
	eventsCallback(message) {
		switch (message.code) {
			case "Fire":
				this.updateScores(message);
				this.addFireShot(message);
				break;
			case "FireBoss":
				this.updateScores(message);
				this.addBossEnemyFire(message);
				break;
			case "playerShipFireDestroyed":
				this.updateScores(message);
				this.addExplosionFireShot(message);
				break;
			case "enemyShipFireDestroyed":
				this.addExplosionFireShot(message);
				break;
			case "asteroidDestroyed":
				this.updateScores(message);
				this.addExplosionAsteroid(message);
				break;
			case "coinDestroyed":
				this.playAudioEffect("coin");
				this.updateScores(message);
				break;
			case "heartDestroyed":
				this.playAudioEffect("heart");
				this.updateScores(message);
				break;
			case "enemyShipDestroyed":
				this.updateScores(message);
				if (message.isBonus) {
					if (this.gameScore.lives < this.maxLives) {
						if (Math.random() < GAME_OPTIONS.heart.chance) {
							this.addHeart(message);
						} else {
							this.addCoin(message);
						}
					} else {
						this.addCoin(message);
					}
				}
				this.addExplosionShip(message);
				this.addEnemyShip(message);
				break;
			case "bossEnemyDestroyed":
				this.updateScores(message);
				this.addExplosionShip(message);
				break;
			case "playerShipDestroyed":
				this.updateScores(message);
				this.addExplosionShip(message);
				break;
			case "playerShipHit":
				this.updateScores(message);
				break;
			default:
				break;
		}
	}
}

export default Game;