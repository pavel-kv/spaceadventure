import HomePage from "./pages/HomePage.js";
import GamePage from "./pages/GamePage.js";
import GameoverPage from "./pages/GameoverPage.js";
import ErrorPage from "./pages/ErrorPage.js";
import SigninPage from "./pages/SigninPage.js";
import SignupPage from "./pages/SignupPage.js";
import SettingsPage from "./pages/SettingsPage.js";
import RulesPage from "./pages/RulesPage.js";
import TopPage from "./pages/TopPage.js";
import UserPage from "./pages/UserPage.js";
import Header from "./components/Header.js";
import Content from "./components/Content.js";
import NavMenu from "./components/NavMenu.js";
import Footer from "./components/Footer.js";
import { auth, gameAppDB } from "./firebase.js";

import Game from "./Game/Game.js";

// Компоненты
const components = {
	header: Header,
	navmenu: NavMenu,
	content: Content,
	footer: Footer,
};

// Роуты
const routes = {
	signin: SigninPage,
	signup: SignupPage,
	main: HomePage,
	game: GamePage,
	gameover: GameoverPage,
	rules: RulesPage,
	toplist: TopPage,
	settings: SettingsPage,
	user: UserPage,
	error: ErrorPage,
	default: HomePage,
};


// ---------- Game init module ------------
const gameSPA = (function () {

	// ----------View Module ---------
	function ModuleView() {
		let moduleContainer = null;
		let mainContentContainer = null;
		let routes = null;

		let ctx = null;
		let bufferCanvas = null;
		let bufferCtx = null;

		// ширина и высота игрового поля
		let widthGameField = 0;
		let heightGameField = 0;

		let keyObservers = []; // наблюдатели за событиями клавиатуры
		let mouseObservers = []; // наблюдатели за событиями мыши

		let game = null;
		let scores = null;

		let gameResult = null;
		let health = null;
		let lives = null;
		let score = null;

		let gamePage = null;
		let musicVolume = 0.2;
		let effectsVolume = 0.2;

		// первоначальная инициализация представления
		this.init = function (_container, _routes) {
			moduleContainer = _container;
			routes = _routes;
			mainContentContainer = moduleContainer.querySelector("#mainContent");
		}

		// обновление страниц
		this.updateLinks = function (_currentPage) {
			const menuLinks = moduleContainer.querySelectorAll(".menu-link");
			for (let link of menuLinks) {
				_currentPage === link.getAttribute("href").slice(1) ?
					link.classList.add("menu-link-active") :
					link.classList.remove("menu-link-active");
			}
		}

		// отрисовка содержимого страниц
		this.renderContent = function (_hashPageName) {
			let routeName = "default";

			if (_hashPageName.length > 0) {
				routeName = _hashPageName in routes ? _hashPageName : "error";
			}

			window.document.title = routes[routeName].title;
			mainContentContainer.innerHTML = routes[routeName].render(`${routeName}-page`);
			this.updateLinks(routes[routeName].id);
		}

		this.resizeWindow = function () {
			const canvasElem = mainContentContainer.querySelector("#gameCanvas");
			const gameContainer = moduleContainer.querySelector("#gameContainer");
			canvasElem.width = 0;
			canvasElem.height = 0;
			const newCanvasWidth = gameContainer.clientWidth;
			const newCanvasHeight = gameContainer.clientHeight;
			canvasElem.width = newCanvasWidth;
			canvasElem.height = newCanvasHeight;

			if (newCanvasWidth === widthGameField && newCanvasHeight === heightGameField) {
				return;
			}

			const resizeCoeffX = newCanvasWidth / widthGameField;
			const resizeCoeffY = newCanvasHeight / heightGameField;
			widthGameField = newCanvasWidth;
			heightGameField = newCanvasHeight;
			ctx.canvas.width = newCanvasWidth;
			ctx.canvas.height = newCanvasHeight;
			bufferCtx.canvas.width = newCanvasWidth;
			bufferCtx.canvas.height = newCanvasHeight;

			game.resize({
				width: widthGameField,
				height: heightGameField,
				coeffX: resizeCoeffX,
				coeffY: resizeCoeffY,
			});
		}

		this.userIsSignedIn = function (_userName) {
			moduleContainer.querySelector("#signinUserName").innerHTML = _userName;
			moduleContainer.querySelector("#signinUserName").classList.remove("link_hide");
			moduleContainer.querySelector("#signOut").classList.remove("link_hide");
			moduleContainer.querySelector("#main").classList.remove("link_hide");
		}

		this.userIsSignedOut = function () {
			moduleContainer.querySelector("#signinUserName").classList.add("link_hide");
			moduleContainer.querySelector("#signOut").classList.add("link_hide");
			moduleContainer.querySelector("#main").classList.add("link_hide");
		}

		// -----------------------------------------

		this.signInError = function (_error) {
			let msgError = "";
			const emailIcon = moduleContainer.querySelector("#userEmail").parentElement;
			const passIcon = moduleContainer.querySelector("#userPass").parentElement;

			emailIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");
			passIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");

			if (_error.message) {
				moduleContainer.querySelector("#formInfo").innerHTML = _error.message.slice(10, _error.message.indexOf("("));
				return;
			}

			if (_error.email.error) {
				emailIcon.classList.add("icon-cross", "input-error");
				if (_error.email.empty) {
					msgError = "The email address is empty. ";
				} else if (_error.email.bad) {
					msgError = "The email address is badly formatted. ";
				}
			} else {
				emailIcon.classList.add("icon-checkmark", "input-ok");
			}

			if (_error.pass.empty) {
				passIcon.classList.add("icon-cross", "input-error");
				msgError += "The password is empty.";
			} else {
				passIcon.classList.add("icon-checkmark", "input-ok");
			}

			moduleContainer.querySelector("#formInfo").innerHTML = msgError;
		}

		this.signUpError = function (_error) {
			let msgError = "";
			const nameIcon = moduleContainer.querySelector("#userName").parentElement;
			const emailIcon = moduleContainer.querySelector("#userEmail").parentElement;
			const passIcon = moduleContainer.querySelector("#userPass").parentElement;
			const confirmPassIcon = moduleContainer.querySelector("#confirmUserPass").parentElement;

			nameIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");
			emailIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");
			passIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");
			confirmPassIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");

			if (_error.message) {
				moduleContainer.querySelector("#formInfo").innerHTML = _error.message.slice(10, _error.message.indexOf("("));
				return;
			}

			if (_error.name.error) {
				nameIcon.classList.add("icon-cross", "input-error");
				if (_error.name.empty) {
					msgError = "The name field is empty. ";
				} else if (_error.name.bad) {
					msgError = "The name is badly formatted. ";
				}
			} else {
				nameIcon.classList.add("icon-checkmark", "input-ok");
			}

			if (_error.email.error) {
				emailIcon.classList.add("icon-cross", "input-error");
				if (_error.email.empty) {
					msgError += "The email address is empty. ";
				} else if (_error.email.bad) {
					msgError += "The email address is badly formatted. ";
				}
			} else {
				emailIcon.classList.add("icon-checkmark", "input-ok");
			}

			if (_error.pass.error) {
				passIcon.classList.add("icon-cross", "input-error");
				confirmPassIcon.classList.add("icon-cross", "input-error");
				if (_error.pass.match) {
					msgError += "Passwords do not match.";
				} else if (_error.pass.empty) {
					msgError += "The password is empty.";
				} else if (_error.pass.length) {
					msgError += "Password should be at least 6 characters.";
				}
			} else {
				passIcon.classList.add("icon-checkmark", "input-ok");
				confirmPassIcon.classList.add("icon-checkmark", "input-ok");
			}

			moduleContainer.querySelector("#formInfo").innerHTML = msgError;
		}

		// печать десятки лучших игроков
		this.printTopList = function (_results) {
			const fragment = new DocumentFragment();
			for (let i = 0; i < _results.length; i++) {
				const tableRow = document.createElement("tr");
				tableRow.innerHTML = `
				<td>${i + 1}</td>
				<td>${_results[i].username}</td>
				<td>${_results[i].gamescore.score}</td>
				<td>${_results[i].gamescore.hitratio.toFixed(2)}</td>`;
				fragment.append(tableRow);
			}
			moduleContainer.querySelector("#topScoreList").append(fragment);
		}


		// добавление наблюдателей за событиями клавиатуры
		this.addKeyObserver = function (_observer) {
			keyObservers.push(_observer);
		}

		// добавление наблюдателей за событиями мыши
		this.addMouseObserver = function (_observer) {
			mouseObservers.push(_observer);
		}

		// передача событий клавиатуры в игровые объекты
		this.updateKeysAction = function (_keys) {
			for (let observer of keyObservers) {
				observer.changeKeyState(_keys);
			}
		}

		// передача событий мыши в игровые объекты
		this.updateMouseAction = function (_mouse) {
			for (let observer of mouseObservers) {
				observer.changeMouseState(_mouse);
			}
		}


		// старт игры
		this.startGame = function () {
			const canvasElem = mainContentContainer.querySelector("#gameCanvas");

			widthGameField = canvasElem.clientWidth;
			heightGameField = canvasElem.clientHeight;

			ctx = canvasElem.getContext("2d");
			ctx.canvas.width = widthGameField;
			ctx.canvas.height = heightGameField;

			bufferCanvas = document.createElement("canvas");
			bufferCtx = bufferCanvas.getContext("2d");
			bufferCtx.canvas.width = widthGameField;
			bufferCtx.canvas.height = heightGameField;

			gamePage = moduleContainer.querySelector("#gamePage");
			moduleContainer.querySelector("#signOut").classList.add("link_hide");
			moduleContainer.querySelector("#main").classList.add("link_hide");
			moduleContainer.querySelector("#menuGameOver").classList.remove("link_hide");

			health = mainContentContainer.querySelector("#health");
			lives = mainContentContainer.querySelector("#lives");
			score = mainContentContainer.querySelector("#score");

			game = new Game(bufferCtx);

			this.drawLoadig();

			return new Promise((resolve, reject) => {
				game.startGame().then((result) => {
					game.setVolumeMusic(musicVolume);
					game.setVolumeAudioEffects(effectsVolume);
					const playerShip = game.createPlayerShip();
					game.addEntity(playerShip);
					this.addKeyObserver(playerShip);
					this.addMouseObserver(playerShip);
					this.addKeyObserver(game);
					resolve(true);
				});
			});
		}

		this.drawLoadig = function () {
			ctx.font = "30px 'Russo One'";
			ctx.textAlign = 'center';
			ctx.fillStyle = "#0006ff";
			ctx.fillText("Loading...", widthGameField / 2, heightGameField / 2);
			ctx.fillStyle = "#ffffff";
			ctx.fillText("Loading...", widthGameField / 2 - 2, heightGameField / 2 - 2);
		}

		// постановка игры на паузу
		this.pauseGame = function () {
			moduleContainer.querySelector("#gamePause").classList.add("link_hide");
			moduleContainer.querySelector("#gamePlay").classList.remove("link_hide");
			game.muteAudioEffects();
			game.muteMusic();
		}

		// возовновление игры
		this.playGame = function () {
			moduleContainer.querySelector("#gamePlay").classList.add("link_hide");
			moduleContainer.querySelector("#gamePause").classList.remove("link_hide");
			game.unmuteAudioEffects();
			game.unmuteMusic();
		}

		// останов игры
		this.stopGame = function (_hashPage) {
			moduleContainer.querySelector("#signOut").classList.remove("link_hide");
			moduleContainer.querySelector("#main").classList.remove("link_hide");
			moduleContainer.querySelector("#menuGameOver").classList.add("link_hide");
			gameResult = game.getScores();
			gameResult.date = new Date();

			this.printGameScore(_hashPage);

			game.stopGame();
			keyObservers = [];
			mouseObservers = [];
		}

		// печать результатов игры
		this.printGameScore = function (_hashPage, _result) {
			if (_hashPage !== "gameover" && _hashPage !== "user") {
				return;
			}

			const result = gameResult ?? _result;

			if (!result) {
				return;
			}

			moduleContainer.querySelector("#resultGameScore").innerHTML = result.score ?? 0;
			moduleContainer.querySelector("#resultGameTotalDest").innerHTML = result.totalDestr ?? 0;
			moduleContainer.querySelector("#resultGameEnemysDest").innerHTML = result.enemysDestr ?? 0;
			moduleContainer.querySelector("#resultGameAsteroidsDest").innerHTML = result.asteroidsDestr ?? 0;
			moduleContainer.querySelector("#resultGameShots").innerHTML = result.shots ?? 0;
			moduleContainer.querySelector("#resultGameHits").innerHTML = result.hits ?? 0;
			moduleContainer.querySelector("#resultGameHitratio").innerHTML = result.hitratio.toFixed(2) ?? 0;

			if (_hashPage === "user") {
				moduleContainer.querySelector("#userDateGame").innerHTML = this.readableDate(result.date) ?? "";
				moduleContainer.querySelector("#userTimeGame").innerHTML = this.readableTime(result.gameTime) ?? "";
				moduleContainer.querySelector("#resultGameCoins").innerHTML = result.coins ?? 0;
				moduleContainer.querySelector("#resultGameBonusLives").innerHTML = result.hearts ?? 0;
				moduleContainer.querySelector("#resultGameBossesDest").innerHTML = result.bossDestr ?? 0;
			}
		}

		this.readableTime = function (_seconds) {
			const date = new Date(0, 0, 0, 0, 0, _seconds);
			const hour = date.getHours().toString().padStart(2, "0");
			const min = date.getMinutes().toString().padStart(2, "0");
			const sec = date.getSeconds().toString().padStart(2, "0");
			return `${hour}:${min}:${sec}`;
		}

		this.readableDate = function (_milliseconds) {
			const date = new Date(_milliseconds);
			const year = date.getFullYear().toString();
			const month = date.getMonth().toString().padStart(2, "0");
			const day = date.getDate().toString().padStart(2, "0");
			return `${day}.${month}.${year}`;
		}


		// выключение звука в игре
		this.muteSound = function () {
			moduleContainer.querySelector("#gameMute").classList.add("link_hide");
			moduleContainer.querySelector("#gameUnmute").classList.remove("link_hide");
			game.muteAudioEffects();
			game.muteMusic();
		}

		// включение звука в игре
		this.unmuteSound = function () {
			moduleContainer.querySelector("#gameUnmute").classList.add("link_hide");
			moduleContainer.querySelector("#gameMute").classList.remove("link_hide");
			game.unmuteAudioEffects();
			game.unmuteMusic();
		}

		// установка уровня музыки в игре
		this.setMusicVolume = function () {
			const musicVolumeInput = moduleContainer.querySelector("#musicVolume");
			musicVolume = musicVolumeInput.value;
		}

		// установка уровня звуковых эффектов в игре
		this.setEffectsVolume = function () {
			const effectsVolumeInput = moduleContainer.querySelector("#effectsVolume");
			effectsVolume = effectsVolumeInput.value;
		}

		// обновление уровней звука
		this.updateVolumeSettings = function () {
			const musicVolumeInput = moduleContainer.querySelector("#musicVolume");
			const effectsVolumeInput = moduleContainer.querySelector("#effectsVolume");

			if (musicVolumeInput) {
				musicVolumeInput.value = musicVolume;
			}

			if (effectsVolumeInput) {
				effectsVolumeInput.value = effectsVolume;
			}
		}

		// переключение между полноэкраным или оконным режимом
		this.toggleFullScreen = function () {
			if (!document.fullscreenElement) {
				gamePage.requestFullscreen()
					.then(() => {
						moduleContainer.querySelector("#gameFullScreen").classList.add("link_hide");
						moduleContainer.querySelector("#gameNotFullScreen").classList.remove("link_hide");
					})
					.catch((error) => {
						moduleContainer.querySelector("#gameFullScreen").classList.remove("link_hide");
						moduleContainer.querySelector("#gameNotFullScreen").classList.add("link_hide");
					});
			} else {
				document.exitFullscreen();
				moduleContainer.querySelector("#gameFullScreen").classList.remove("link_hide");
				moduleContainer.querySelector("#gameNotFullScreen").classList.add("link_hide");
			}
		}

		// обновление показателей во время игры
		this.updateGameScores = function () {
			scores = game.getScores();
			health.innerHTML = scores.health;
			lives.innerHTML = scores.lives;
			score.innerHTML = scores.score;
		}

		// возврат игровых результатов пользователя
		this.getGameScore = function () {
			return game.getScores();
		}

		// обновление состояния игры и отрисовка
		this.updateGame = function (_coeff, _steps) {
			bufferCtx.clearRect(0, 0, widthGameField, heightGameField);
			game.entityProcessing(_coeff, _steps);
			this.updateGameScores();
			ctx.clearRect(0, 0, widthGameField, heightGameField);
			ctx.drawImage(bufferCanvas, 0, 0, widthGameField, heightGameField);
		}

	}
	// ---------- End view -----------------


	// ---------- Begin model --------------
	function ModuleModel() {
		let moduleView = null;
		let isPauseGame = false;
		let isStopGame = false;
		let timer = null;
		let frameRate = 60;
		let gameTimerId = null;
		let isRegistration = false
		let userSignedIn = false;
		let currentUserName = "";
		let currentUserEmail = "";
		let currentUserId = null;
		let gameResult = null;

		// первоначальная инициализация модели
		this.init = function (_view) {
			moduleView = _view;
		};

		// обновление страниц приложения при переходе по ссылкам
		this.updateState = function (_pageName) {

			// проверка залогинился пользователь уже или нет
			if (!userSignedIn) {
				this.getCurrentlySignedinUser(_pageName);
				return;
			}
			// если залогинился отрисовываем страницу
			moduleView.renderContent(_pageName,);
		};

		this.isUserSignedIn = function () {
			return userSignedIn;
		};

		this.startRegistrationProcess = function () {
			isRegistration = true;
		}

		this.stopRegistrationProcess = function () {
			isRegistration = false;
		}

		this.resizeWindow = function () {
			moduleView.resizeWindow();
		}

		// проверка имени на коррекность ввода
		this.nameValidate = function (_name) {
			const error = {};
			const nameRegExp = /^[a-zа-я][a-zа-я0-9_-]+$/i;
			error.empty = _name.trim() ? false : true;
			error.bad = _name.trim().match(nameRegExp) ? false : true;
			error.error = error.empty || error.bad ? true : false;
			return error;
		}

		// проверка email'a на корректность ввода
		this.emailValidate = function (_email) {
			const error = {};
			const emailRegExp = /^[a-z0-9-_.]+@[a-z0-9-_.]+\.[a-z]{2,6}$/i;
			error.empty = _email.trim() ? false : true;
			error.bad = _email.trim().match(emailRegExp) ? false : true;
			error.error = error.empty || error.bad ? true : false;
			return error;
		}

		// проверка пароля на корректность ввода
		this.passwordValidate = function (_password, _confirmPassword) {
			const error = {};

			if (_confirmPassword === undefined) {
				error.empty = _password ? false : true;
				error.match = false;
				error.length = false;
			} else {
				error.match = _password === _confirmPassword ? false : true;

				if (!error.match) {
					error.empty = _password ? false : true;
					error.length = _password.length > 5 ? false : true;
				}
			}
			error.error = error.empty || error.match || error.length ? true : false;
			return error;
		}

		// Вход существующего пользователя
		this.signIn = function (_userEmail, _userPass) {
			const email = this.emailValidate(_userEmail);
			const pass = this.passwordValidate(_userPass);

			if (email.error || pass.error) {
				moduleView.signInError({ email, pass });
				return;
			}

			auth
				.signInWithEmailAndPassword(_userEmail, _userPass)
				.then((userCredential) => {
					const user = userCredential.user;
					if (user) {
						userSignedIn = true;
						currentUserName = user.displayName;
						currentUserEmail = user.email;
						currentUserId = user.uid;
						moduleView.renderContent("main");
						moduleView.userIsSignedIn(currentUserName);
					} else {

					}
				})
				.catch(function (error) {
					moduleView.signInError({ message: error.message });
				});
		}

		// Регистрация нового пользователя
		this.signUp = function (_userName, _userEmail, _userPass, _confirmUserPass) {
			const name = this.nameValidate(_userName);
			const email = this.emailValidate(_userEmail);
			const pass = this.passwordValidate(_userPass, _confirmUserPass);

			// если хотя бы одна ошибка то вывод ошибки
			if (name.error || email.error || pass.error) {
				moduleView.signUpError({ name, email, pass });
				return;
			}

			auth
				.createUserWithEmailAndPassword(_userEmail, _userPass)
				.then((userCredential) => {
					const user = userCredential.user;
					if (user) {
						userSignedIn = true;

						user.updateProfile({
							displayName: _userName,
						}).then(() => {
							currentUserName = user.displayName;
							currentUserEmail = user.email;
							currentUserId = user.uid;
							moduleView.renderContent("main");
							moduleView.userIsSignedIn(currentUserName);
							this.addNewUserInDB(currentUserId, currentUserName, currentUserEmail);
						}).catch((error) => { });
					} else {

					}
				})
				.catch(function (error) {
					moduleView.signUpError({ message: error.message, code: error.code });
				});
		}

		// Выход пользователя из аккаунта
		this.signOut = function () {
			userSignedIn = false;
			firebase.auth().signOut().then(() => {
				userSignedIn = false;
				moduleView.renderContent("signin");
				moduleView.userIsSignedOut();
			}).catch((error) => { });
		}

		// проверка залогинился пользователь ранее или нет
		this.promiseIsUserAuth = new Promise(function (resolve, reject) {
			auth.onAuthStateChanged((user) => {
				if (user) {
					resolve(user);
				} else {
					reject(false);
				}
			});
		});

		// получение имени и email'a пользователя если он ранее залогинился
		this.getCurrentlySignedinUser = function (_pageName) {
			this.promiseIsUserAuth
				.then((user) => {
					userSignedIn = true;
					currentUserName = user.displayName;
					currentUserEmail = user.email;
					currentUserId = user.uid;
					moduleView.renderContent(_pageName);
					moduleView.userIsSignedIn(currentUserName);
				}) //если нет, то отрисовываем форму логина или регистрации
				.catch((error) => {
					userSignedIn = false;
					currentUserName = "";
					currentUserEmail = "";
					currentUserId = null;
					if (isRegistration) {
						moduleView.renderContent("signup");
					} else {
						moduleView.renderContent("signin");
					}
					moduleView.userIsSignedOut();

				});
		}

		// добавление нового пользователя в базу данных
		this.addNewUserInDB = function (_userId, _userName, _userEmail) {
			gameAppDB
				.ref("users/" + _userId)
				.set({
					username: _userName,
					useremail: _userEmail,
					gamescore: {
						date: "",
						gametime: "",
						score: "",
						shots: "",
						hits: "",
						lives: "",
						coins: "",
						hearts: "",
						hitratio: "",
						totalDest: "",
						enemysDestr: "",
						asteroidsDestr: "",
					},
				})
				.then(function () {
				})
				.catch(function (error) {
				});
		}

		// запись результатв игры в базу данных
		this.addGameResultInDB = function (_userName, _userEmail, _userId, _result) {
			gameAppDB
				.ref(`games/`)
				.push({
					username: _userName,
					userEmail: _userEmail,
					userid: _userId,
					gamescore: _result,
				})
				.then(function () {
				})
				.catch(function (error) {
				});
		}

		// запись последнего результата игры в базу данных
		this.addResultUserLastGameInDB = function (_userId, _result) {
			gameAppDB
				.ref(`users/${_userId}/gamescore/`)
				.set(_result)
				.then(function () {
				})
				.catch(function (error) {
				});
		}

		// получение последнего результата игры
		this.getResultUserLastGameFromDB = function (_hashPage) {
			gameAppDB
				.ref(`users/${currentUserId}/gamescore/`)
				.once("value")
				.then(function (snapshot) {
					gameResult = snapshot.val();
					moduleView.printGameScore(_hashPage, gameResult);
				})
				.catch(function (error) {
				});
		}

		// печать 10 игроков с максимальным количеством очков
		this.printTopList = function () {
			gameAppDB
				.ref("games")
				.orderByChild("gamescore/score")
				.limitToLast(10)
				.once("value")
				.then(function (snapshot) {
					const topTenResults = Object.values(snapshot.val());
					topTenResults.sort((a, b) => {
						const diff = b.gamescore.score - a.gamescore.score;
						return diff ? diff : b.gamescore.hitratio - a.gamescore.hitratio;
					});
					moduleView.printTopList(topTenResults);
				})
				.catch(function (error) {
				});
		}

		// печать результата игры
		this.printGameScore = function (_hashPage) {
			moduleView.printGameScore(_hashPage);
		}

		this.printScoreUserLastGame = function (_hashPage) {
			this.getResultUserLastGameFromDB(_hashPage);
		}

		// обновление нажатий кнопок в игре
		this.updateKeysState = function (keys) {
			if (keys.pause) {
				isPauseGame = true;
				timer.suspend();
				moduleView.pauseGame();
			}

			if (keys.play && isPauseGame) {
				isPauseGame = false;
				timer.resume();
				moduleView.playGame();
			}

			if (isPauseGame) {
				return;
			}
			moduleView.updateKeysAction(keys);
		}

		// овновление состояний мыши
		this.updateMouseState = function (mouse) {
			if (isPauseGame) {
				return;
			}
			moduleView.updateMouseAction(mouse);
		}

		// запуск игры
		this.startGame = function () {
			isPauseGame = false;
			isStopGame = false
			moduleView.startGame().then((result) => {
				timer = this.gameTime(frameRate);
				this.gameLoop();
			});
		}

		// игровой цикл
		this.gameLoop = function () {
			if (isStopGame) {
				return;
			}
			if (!isPauseGame) {
				const time = timer.info();
				moduleView.updateGame(time.coeff, time.steps);
			}
			gameTimerId = requestAnimationFrame(() => this.gameLoop());
		}

		// останов игры
		this.stopGame = function (_hashPage) {
			const timeInfo = timer.info();
			isPauseGame = true;
			isStopGame = true;
			timer.suspend();
			timer.stop();
			cancelAnimationFrame(gameTimerId);
			gameTimerId = null;

			gameResult = moduleView.getGameScore();
			gameResult.date = Date.now();
			gameResult.gameTime = timeInfo.gameTime;
			this.addGameResultInDB(currentUserName, currentUserEmail, currentUserId, gameResult);
			this.addResultUserLastGameInDB(currentUserId, gameResult)
			moduleView.stopGame(_hashPage);
		}

		// постановка игры на паузу
		this.pauseGame = function () {
			isPauseGame = true;
			timer.suspend();
			moduleView.pauseGame();
		}

		// возобновление игры
		this.playGame = function () {
			isPauseGame = false;
			timer.resume();
			moduleView.playGame();
		}

		this.toggleFullScreen = function () {
			moduleView.toggleFullScreen();
		}
		this.muteSound = function () {
			moduleView.muteSound();
		}

		this.unmuteSound = function () {
			moduleView.unmuteSound();
		}

		this.toggleMusic = function () {
			moduleView.toggleMusic();
		}

		this.toggleEffects = function () {
			moduleView.toggleEffects();
		}


		this.musicVolume = function () {
			moduleView.setMusicVolume();
		}

		this.effectsVolume = function () {
			moduleView.setEffectsVolume();
		}

		this.updateVolumeSettings = function () {
			moduleView.updateVolumeSettings();
		}

		// игровой таймер
		// для постановки игры на паузу,
		// подсчета отыгранного времени,
		// coeff - отклонение между желаемой частотой обновления и реальной,
		// для плавности анимации 
		// steps - количество пройденных итераций
		this.gameTime = function (_fps) {
			let endTime;
			let pause = false;
			let stop = true;
			let steps = 0;
			let gameStartTime = 0;
			let gameTime = 0;

			return {
				suspend: function () {
					pause = true;
				},

				resume: function () {
					pause = false;
				},

				stop: function () {
					stop = true;
				},

				info: function () {
					if (stop) {
						stop = false;
						endTime = Date.now();
						gameStartTime = Date.now();
						return {
							coeff: 0,
							steps: steps,
						}
					}

					if (pause) {
						gameTime = Date.now() - gameStartTime;
						return {
							coeff: 0,
							gameTime: gameTime,
						}
					}

					const startTime = Date.now();
					let elapsted = startTime - endTime;
					elapsted = elapsted > 500 ? 500 : elapsted;
					endTime = startTime;
					const FPS = 1000 / elapsted;
					steps++;
					const coeff = _fps / FPS;
					gameTime += elapsted;

					return {
						coeff: coeff,
						steps: steps,
						gameTime: gameTime / 1000,
					}
				}
			};
		}
	}

	// ------End Model ----------------


	// ------Begin Controller ---------
	function ModuleController() {
		let moduleContainer = null;
		let moduleModel = null;
		let canvasElem = null;
		const canvasOptions = {};
		let hashPageName = "";
		let isGameStart = false;

		//кнопки управления в игре
		const gameKeys = {
			KeyW: "up",
			KeyS: "down",
			KeyA: "left",
			KeyD: "right",
			Space: "fire",
			Escape: "pause",
			Enter: "play",
		};

		// нажатые клавиши 
		const pressedKeys = {};
		// события мыши
		const mouseAction = {};

		const self = this;

		// первоначальная инициализация контроллера
		self.init = function (_root, _model) {
			moduleContainer = _root;
			moduleModel = _model;

			// добавление обработчика событий hashchange
			window.addEventListener("hashchange", self.updateState);

			// добавление обработчика событий на изменение размеров окна
			window.addEventListener("resize", self.resizeWindow)

			// добавление обработчика событий на клики мышки
			self.addEventListeners();

			//первое обновление состояния приложения
			self.updateState();
		}

		// обработчик событий изменения размеров окга
		self.resizeWindow = function () {
			if (hashPageName === "game") {
				if (!canvasElem) {
					return;
				}

				moduleModel.resizeWindow();

				canvasElem = moduleContainer.querySelector("#gameCanvas");
				canvasOptions.offsetLeft = canvasElem.offsetLeft;
				canvasOptions.offsetTop = canvasElem.offsetTop;
				canvasOptions.width = canvasElem.clientWidth;
				canvasOptions.height = canvasElem.clientHeight;
			}
		}

		// добавление обработчика событий кликов мышки
		self.addEventListeners = function () {
			moduleContainer.addEventListener("click", function (event) {
				event.preventDefault();
				event.stopPropagation();

				if (event.target.hash) {
					window.location.hash = event.target.getAttribute("href");
				}

				switch (event.target.id) {
					case "btnSignin":
						moduleModel.signIn(
							moduleContainer.querySelector("#userEmail").value,
							moduleContainer.querySelector("#userPass").value);
						break;
					case "btnRegister":
						window.location.hash = "";
						window.location.hash = "#signup";
						moduleModel.startRegistrationProcess();
						break;
					case "btnSignup":
						moduleModel.stopRegistrationProcess();
						moduleModel.signUp(
							moduleContainer.querySelector("#userName").value,
							moduleContainer.querySelector("#userEmail").value,
							moduleContainer.querySelector("#userPass").value,
							moduleContainer.querySelector("#confirmUserPass").value);
						break;
					case "btnCancel":
						window.location.hash = "";
						window.location.hash = "#signin";
						moduleModel.stopRegistrationProcess();
						break;
					case "signOut":
						moduleModel.signOut();
						break;
					case "gameNotFullScreen":
					case "gameFullScreen":
						moduleModel.toggleFullScreen();
						break;
					case "gamePause":
						moduleModel.pauseGame();
						break;
					case "gamePlay":
						moduleModel.playGame();
						break;
					case "gameMute":
						moduleModel.muteSound();
						break;
					case "gameUnmute":
						moduleModel.unmuteSound();
						break;
					case "musicVolume":
						moduleModel.musicVolume();
						break;
					case "effectsVolume":
						moduleModel.effectsVolume();
						break;
					case "toggleMusic":
						moduleModel.toggleMusic();
						break;
					case "toggleEffects":
						moduleModel.toggleEffects();
						break;
				}
			});
		}

		// обновление состояния приложения 
		self.updateState = function () {
			hashPageName = window.location.hash.slice(1).toLowerCase();
			moduleModel.updateState(hashPageName);

			// при смене страницы останавливаем игру если запущена
			if (isGameStart) {
				self.stopGame(hashPageName);
			}

			if (hashPageName === "game" && !moduleModel.isUserSignedIn() && !isGameStart) {
				moduleModel.promiseIsUserAuth
					.then((user) => {
						self.runGame();
					})
					.catch((error) => { });
			} else {
				self.runGame();
			}

			if (moduleModel.isUserSignedIn()) {
				if (hashPageName === "toplist") {
					moduleModel.printTopList();
				}

				if (hashPageName === "settings") {
					moduleModel.updateVolumeSettings();
				}

				if (hashPageName === "gameover") {
					moduleModel.printGameScore(hashPageName);
				}

				if (hashPageName === "user") {
					moduleModel.printScoreUserLastGame(hashPageName);
				}
			}
		}

		// запуск игры
		self.runGame = function () {
			if (hashPageName === "game") {
				canvasElem = moduleContainer.querySelector("#gameCanvas");

				if (!canvasElem) {
					return;
				}

				isGameStart = true;
				canvasOptions.offsetLeft = canvasElem.offsetLeft;
				canvasOptions.offsetTop = canvasElem.offsetTop;
				canvasOptions.width = canvasElem.clientWidth;
				canvasOptions.height = canvasElem.clientHeight;

				self.addKeysHandlers();
				self.addMouseHandlers();
				moduleModel.startGame();
			} else {
				self.removeKeysHandlers();
				self.removeMouseHandlers();
			}
		}

		// останов игры
		self.stopGame = function (hash) {
			self.removeKeysHandlers();
			self.removeMouseHandlers();
			isGameStart = false;
			moduleModel.stopGame(hash);
		}

		// добавление обработчиков событий на нажатие клавиши в игре
		self.addKeysHandlers = function () {
			window.addEventListener("keydown", self.updateKeyState);
			window.addEventListener("keyup", self.updateKeyState);
		}

		self.removeKeysHandlers = function () {
			window.removeEventListener("keydown", self.updateKeyState);
			window.removeEventListener("keyup", self.updateKeyState);
		}

		// обновление состояния игровых клавиш и передача в модель
		self.updateKeyState = function (event) {
			event.preventDefault();

			let key = event.code in gameKeys ? gameKeys[event.code] : null;

			if (key) {
				const keyState = event.type === "keydown" ? true : false;
				if (pressedKeys[key] !== keyState) {
					pressedKeys[key] = keyState;
					moduleModel.updateKeysState(pressedKeys);
				}
			}
		}

		// обработчики на события мыши
		self.addMouseHandlers = function () {
			moduleContainer.addEventListener("pointerdown", self.updateMouseState);
			moduleContainer.addEventListener("pointerup", self.updateMouseState);
			moduleContainer.addEventListener("pointermove", self.updateMouseState);
			moduleContainer.addEventListener("click", self.updateMouseState);
		}

		self.removeMouseHandlers = function () {
			moduleContainer.removeEventListener("pointerdown", self.updateMouseState);
			moduleContainer.removeEventListener("pointerup", self.updateMouseState);
			moduleContainer.removeEventListener("pointermove", self.updateMouseState);
			moduleContainer.removeEventListener("click", self.updateMouseState);
		}

		// обновление состояния мыши и передача в модель
		self.updateMouseState = function (event) {
			event.preventDefault();

			if (event.type === "pointerdown" && event.pointerType === "touch") {
				canvasElem.setPointerCapture(event.pointerId);
			}

			const relativeX = event.clientX - canvasOptions.offsetLeft;
			const relativeY = event.clientY - canvasOptions.offsetTop;

			mouseAction.x = relativeX;
			mouseAction.y = relativeY;
			mouseAction.state = event.type;

			if ((relativeX > 0 && relativeX < canvasOptions.width)
				&& (relativeY > 0 && relativeY < canvasOptions.height)) {
				moduleModel.updateMouseState(mouseAction);
			}
		}
	}

	return {
		init: function (root, routes, components) {
			this.renderComponents(root, components);

			const view = new ModuleView();
			const model = new ModuleModel();
			const controller = new ModuleController();

			view.init(document.getElementById(root), routes);
			model.init(view);
			controller.init(document.getElementById(root), model);
		},

		renderComponents: function (root, components) {
			const container = document.getElementById(root);
			const keysList = Object.keys(components);
			for (let key of keysList) {
				container.innerHTML += components[key].render();
			}
		},
	};
	// ------------- End controller ---------------
}());

gameSPA.init("gameApp", routes, components);