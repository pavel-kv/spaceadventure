import HomePage from "./pages/HomePage.js";
import GamePage from "./pages/GamePage.js";
import GameoverPage from "./pages/GameoverPage.js";
import ErrorPage from "./pages/ErrorPage.js";
import SigninPage from "./pages/SigninPage.js";
import SignupPage from "./pages/SignupPage.js";
import SettingsPage from "./pages/SettingsPage.js";
import RulesPage from "./pages/RulesPage.js";
import TopPage from "./pages/TopPage.js";
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
	error: ErrorPage,
	default: HomePage,
};


// ------------- Game init module -------------
const gameSPA = (function () {

	// ------------- View Module ------------- 
	function ModuleView() {
		let moduleContainer = null;
		let mainContentContainer = null;
		let routes = null;

		// ----------
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

		// -----------------------------------------
		// первоначальная инициализация представления
		this.init = function (_container, _routes) {
			moduleContainer = _container;
			routes = _routes;
			mainContentContainer = moduleContainer.querySelector("#mainContent");
		}

		this.updateLinks = function (_currentPage) {
			const menuLinks = moduleContainer.querySelectorAll(".menu-link");
			for (let link of menuLinks) {
				_currentPage === link.getAttribute("href").slice(1) ?
					link.classList.add("menu-link-active") :
					link.classList.remove("menu-link-active");
			}
		}

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

		this.userIsSignedIn = function (userName) {
			moduleContainer.querySelector("#signinUserName").innerHTML = userName;
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

		this.signInError = function (error) {
			let msgError = "";
			const emailIcon = moduleContainer.querySelector("#userEmail").parentElement;
			const passIcon = moduleContainer.querySelector("#userPass").parentElement;

			emailIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");
			passIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");

			if (error.message) {
				moduleContainer.querySelector("#formInfo").innerHTML = error.message.slice(10, error.message.indexOf("("));
				return;
			}

			if (error.email.error) {
				emailIcon.classList.add("icon-cross", "input-error");
				if (error.email.empty) {
					msgError = "The email address is empty. ";
				} else if (error.email.bad) {
					msgError = "The email address is badly formatted. ";
				}
			} else {
				emailIcon.classList.add("icon-checkmark", "input-ok");
			}

			if (error.pass.empty) {
				passIcon.classList.add("icon-cross", "input-error");
				msgError += "The password is empty.";
			} else {
				passIcon.classList.add("icon-checkmark", "input-ok");
			}

			moduleContainer.querySelector("#formInfo").innerHTML = msgError;
		}

		this.signUpError = function (error) {
			let msgError = "";
			const nameIcon = moduleContainer.querySelector("#userName").parentElement;
			const emailIcon = moduleContainer.querySelector("#userEmail").parentElement;
			const passIcon = moduleContainer.querySelector("#userPass").parentElement;
			const confirmPassIcon = moduleContainer.querySelector("#confirmUserPass").parentElement;

			nameIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");
			emailIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");
			passIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");
			confirmPassIcon.classList.remove("icon-cross", "icon-checkmark", "input-error", "input-ok");

			if (error.message) {
				moduleContainer.querySelector("#formInfo").innerHTML = error.message.slice(10, error.message.indexOf("("));
				return;
			}

			if (error.name.error) {
				nameIcon.classList.add("icon-cross", "input-error");
				if (error.name.empty) {
					msgError = "The name field is empty. ";
				} else if (error.name.bad) {
					msgError = "The name is badly formatted. ";
				}
			} else {
				nameIcon.classList.add("icon-checkmark", "input-ok");
			}

			if (error.email.error) {
				emailIcon.classList.add("icon-cross", "input-error");
				if (error.email.empty) {
					msgError += "The email address is empty. ";
				} else if (error.email.bad) {
					msgError += "The email address is badly formatted. ";
				}
			} else {
				emailIcon.classList.add("icon-checkmark", "input-ok");
			}

			if (error.pass.error) {
				passIcon.classList.add("icon-cross", "input-error");
				confirmPassIcon.classList.add("icon-cross", "input-error");
				if (error.pass.match) {
					msgError += "Passwords do not match.";
				} else if (error.pass.empty) {
					msgError += "The password is empty.";
				} else if (error.pass.length) {
					msgError += "Password should be at least 6 characters.";
				}
			} else {
				passIcon.classList.add("icon-checkmark", "input-ok");
				confirmPassIcon.classList.add("icon-checkmark", "input-ok");
			}

			moduleContainer.querySelector("#formInfo").innerHTML = msgError;
		}
		//
		this.printTopList = function (results) {
			const fragment = new DocumentFragment();
			for (let i = 0; i < results.length; i++) {
				const tableRow = document.createElement("tr");
				tableRow.innerHTML = `
				<td>${i + 1}</td>
				<td>${results[i].username}</td>
				<td>${results[i].gamescore.score}</td>
				<td>${results[i].gamescore.hitratio.toFixed(2)}</td>`;
				fragment.append(tableRow);
			}
			moduleContainer.querySelector("#topScoreList").append(fragment);
		}

		// tableRow.innerHTML = `
		// 		<td>${i + 1}</td>
		// 		<td>${results[i].username}</td>
		// 		<td>${results[i].gamescore.score}</td>
		// 		<td>${results[i].gamescore.totalDestr}</td>
		// 		<td>${results[i].gamescore.hitratio.toFixed(2)}</td>
		// 		<td>${this.readableTime(results[i].gamescore.gameTime)}</td>`;
		//
		this.readableTime = function (seconds) {
			const date = new Date(0, 0, 0, 0, 0, seconds);
			const hour = date.getHours().toString().padStart(2, "0");
			const min = date.getMinutes().toString().padStart(2, "0");
			const sec = date.getSeconds().toString().padStart(2, "0");
			return `${hour}:${min}:${sec}`;
		}

		//------------------------------------------

		// добавление наблюдателей за событиями клавиатуры
		this.addKeyObserver = function (observer) {
			keyObservers.push(observer);
		}

		// добавление наблюдателей за событиями мыши
		this.addMouseObserver = function (observer) {
			mouseObservers.push(observer);
		}
		// -----------------------------------------

		// передача событий клавиатуры в игровые объекты
		this.updateKeysAction = function (keys) {
			for (let observer of keyObservers) {
				observer.changeKeyState(keys);
			}
		}

		// передача событий мыши в игровые объекты
		this.updateMouseAction = function (mouse) {
			for (let observer of mouseObservers) {
				observer.changeMouseState(mouse);
			}
		}
		// -----------------------------------------


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

			//================

			gamePage = moduleContainer.querySelector("#gamePage");


			moduleContainer.querySelector("#signOut").classList.add("link_hide");
			moduleContainer.querySelector("#main").classList.add("link_hide");
			moduleContainer.querySelector("#menuGameOver").classList.remove("link_hide");

			health = mainContentContainer.querySelector("#health");
			lives = mainContentContainer.querySelector("#lives");
			score = mainContentContainer.querySelector("#score");

			// gameFullScreen = moduleContainer.querySelector("#gameFullScreen");
			// gameNotFullScreen = moduleContainer.querySelector("#gameNotFullScreen");
			// gamePlay = moduleContainer.querySelector("#gamePlay");
			// gamePause = moduleContainer.querySelector("#gamePause");
			// gameMute = moduleContainer.querySelector("#gameMute");
			// gameUnmute = moduleContainer.querySelector("#gameUnmute");


			game = new Game(bufferCtx);

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
			// game.start().then((result) => {
			// 	game.setVolumeMusic(musicVolume);
			// 	game.setVolumeAudioEffects(effectsVolume);

			// 	const playerShip = game.createPlayerShip();
			// 	game.addEntity(playerShip);
			// 	this.addKeyObserver(playerShip);
			// 	this.addMouseObserver(playerShip);
			// 	this.addKeyObserver(game);
			// });
		}

		this.pauseGame = function () {
			moduleContainer.querySelector("#gamePause").classList.add("link_hide");
			moduleContainer.querySelector("#gamePlay").classList.remove("link_hide");
			game.muteAudioEffects();
			game.muteMusic();
		}

		this.playGame = function () {
			moduleContainer.querySelector("#gamePlay").classList.add("link_hide");
			moduleContainer.querySelector("#gamePause").classList.remove("link_hide");
			game.unmuteAudioEffects();
			game.unmuteMusic();
		}

		this.stopGame = function (hash) {
			moduleContainer.querySelector("#signOut").classList.remove("link_hide");
			moduleContainer.querySelector("#main").classList.remove("link_hide");
			moduleContainer.querySelector("#menuGameOver").classList.add("link_hide");
			gameResult = game.getScores();
			this.printGameScore(hash);
			game.stopGame();
			keyObservers = [];
			mouseObservers = [];
		}

		this.printGameScore = function (hash) {
			if (hash !== "gameover") {
				return;
			}

			if (!gameResult) {
				return;
			}

			moduleContainer.querySelector("#resultGameScore").innerHTML = gameResult.score;
			moduleContainer.querySelector("#resultGameTotalDest").innerHTML = gameResult.totalDestr;
			moduleContainer.querySelector("#resultGameEnemysDest").innerHTML = gameResult.enemysDestr;
			moduleContainer.querySelector("#resultGameAsteroidsDest").innerHTML = gameResult.asteroidsDestr;
			moduleContainer.querySelector("#resultGameShots").innerHTML = gameResult.shots;
			moduleContainer.querySelector("#resultGameHits").innerHTML = gameResult.hits;
			moduleContainer.querySelector("#resultGameHitratio").innerHTML = gameResult.hitratio.toFixed(2);
		}

		this.muteSound = function () {
			moduleContainer.querySelector("#gameMute").classList.add("link_hide");
			moduleContainer.querySelector("#gameUnmute").classList.remove("link_hide");
			game.muteAudioEffects();
			game.muteMusic();
		}

		this.unmuteSound = function () {
			moduleContainer.querySelector("#gameUnmute").classList.add("link_hide");
			moduleContainer.querySelector("#gameMute").classList.remove("link_hide");
			game.unmuteAudioEffects();
			game.unmuteMusic();
		}

		this.setMusicVolume = function () {
			const musicVolumeInput = moduleContainer.querySelector("#musicVolume");
			musicVolume = musicVolumeInput.value;
		}

		this.setEffectsVolume = function () {
			const effectsVolumeInput = moduleContainer.querySelector("#effectsVolume");
			effectsVolume = effectsVolumeInput.value;
		}

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

		this.updateGameScores = function () {
			scores = game.getScores();
			health.innerHTML = scores.health;
			lives.innerHTML = scores.lives;
			score.innerHTML = scores.score;
		}

		this.getGameScore = function () {
			return game.getScores();
		}


		//================
		// обновление состояния игры
		this.updateGame = function (coeff, steps) {
			bufferCtx.clearRect(0, 0, widthGameField, heightGameField);

			game.entityProcessing(coeff, steps);

			this.updateGameScores();

			ctx.clearRect(0, 0, widthGameField, heightGameField);
			ctx.drawImage(bufferCanvas, 0, 0, widthGameField, heightGameField);
		}
		// -----------------------------------------
	}

	// ------------- end view -------------

	// ------------- begin model ------------- 
	function ModuleModel() {
		let moduleView = null;

		let pauseGame = false;
		let stopGame = false;
		let timer = null;
		let frameRate = 60;
		let gameTimerId = null;
		let keysState = null;

		let isUserSigningOut = false;
		let isRegistration = false
		let userSignedIn = false;
		let currentUserName = "";
		let currentUserEmail = "";
		let currentUserId = null;
		let gameResult = null;
		// -----------------------------------------
		// первоначальная инициализация модели
		this.init = function (view) {
			moduleView = view;
		};

		// обновление страниц приложения при переходе по ссылкам
		this.updateState = function (_pageName, param) {

			if (!userSignedIn) {
				this.getCurrentlySignedinUser(_pageName);
				return;
			}
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

		//---------------------
		this.nameValidate = function (name) {
			const error = {};
			const nameRegExp = /^[a-zа-я][a-zа-я0-9_-]+$/i;
			error.empty = name.trim() ? false : true;
			error.bad = name.trim().match(nameRegExp) ? false : true;
			error.error = error.empty || error.bad ? true : false;
			return error;
		}

		this.emailValidate = function (email) {
			const error = {};
			const emailRegExp = /^[a-z0-9-_.]+@[a-z0-9-_.]+\.[a-z]{2,6}$/i;
			error.empty = email.trim() ? false : true;
			error.bad = email.trim().match(emailRegExp) ? false : true;
			error.error = error.empty || error.bad ? true : false;
			return error;
		}

		this.passwordValidate = function (password, confirmPassword) {
			const error = {};

			if (confirmPassword === undefined) {
				error.empty = password ? false : true;
				error.match = false;
				error.length = false;
			} else {
				error.match = password === confirmPassword ? false : true;

				if (!error.match) {
					error.empty = password ? false : true;
					error.length = password.length > 5 ? false : true;
				}
			}
			error.error = error.empty || error.match || error.length ? true : false;
			return error;
		}

		// Sign in ----------------------------------
		this.signIn = function (userEmail, userPass) {
			const email = this.emailValidate(userEmail);
			const pass = this.passwordValidate(userPass);

			if (email.error || pass.error) {
				moduleView.signInError({ email, pass });
				return;
			}

			auth
				.signInWithEmailAndPassword(userEmail, userPass)
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

		// Sign up ----------------------------------
		this.signUp = function (userName, userEmail, userPass, confirmUserPass) {
			const name = this.nameValidate(userName);
			const email = this.emailValidate(userEmail);
			const pass = this.passwordValidate(userPass, confirmUserPass);

			if (name.error || email.error || pass.error) {
				moduleView.signUpError({ name, email, pass });
				return;
			}

			auth
				.createUserWithEmailAndPassword(userEmail, userPass)
				.then((userCredential) => {
					const user = userCredential.user;
					if (user) {
						userSignedIn = true;

						user.updateProfile({
							displayName: userName,
						}).then(() => {
							currentUserName = user.displayName;
							currentUserEmail = user.email;
							currentUserId = user.uid;
							moduleView.renderContent("main");
							moduleView.userIsSignedIn(currentUserName);
							this.addNewUserInDB(currentUserId, currentUserName, currentUserEmail);
						}).catch((error) => {

						});
					} else {

					}
				})
				.catch(function (error) {
					moduleView.signUpError({ message: error.message, code: error.code });
				});
		}

		// Sign out ----------------------------------
		this.signOut = function () {
			userSignedIn = false;
			firebase.auth().signOut().then(() => {
				// Sign-out successful.
				moduleView.renderContent("signin");
				moduleView.userIsSignedOut();
			}).catch((error) => {
				// An error happened.
			});
		}

		//-------------------

		this.promiseIsUserAuth = new Promise(function (resolve, reject) {
			auth.onAuthStateChanged((user) => {
				if (user) {
					resolve(user);
				} else {
					reject(false);
				}
			});
		});


		this.getCurrentlySignedinUser = function (_pageName) {
			this.promiseIsUserAuth
				.then((user) => {
					userSignedIn = true;
					currentUserName = user.displayName;
					currentUserEmail = user.email;
					currentUserId = user.uid;
					moduleView.renderContent(_pageName);
					moduleView.userIsSignedIn(currentUserName);
				})
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


		this.addNewUserInDB = function (userId, userName, userEmail) {
			gameAppDB
				.ref("users/" + userId)
				.set({
					username: userName,
					useremail: userEmail,
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


		this.addGameResultInDB = function (userName, userEmail, userId, result) {
			gameAppDB
				.ref(`games/`)
				.push({
					username: userName,
					userEmail: userEmail,
					userid: userId,
					gamescore: result,
				})
				.then(function () {
				})
				.catch(function (error) {
				});
		}

		this.addResultUserLastGameInDB = function (userId, result) {
			gameAppDB
				.ref(`users/${userId}/gamescore/`)
				.set(result)
				.then(function () {
				})
				.catch(function (error) {
				});
		}

		this.getResultUserLastGameFromDB = function (hash) {
			gameAppDB
				.ref(`users/${currentUserId}/gamescore/`)
				.once("value")
				.then(function (snapshot) {
					moduleView.printGameScore(hash, snapshot.val());
				})
				.catch(function (error) {
				});
		}

		this.getUserListFromDB = function () {
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

		this.printTopList = function () {
			this.getUserListFromDB();
		}

		this.printGameScore = function (hash) {
			moduleView.printGameScore(hash);
		}


		// -----------------------------------------
		// обновление нажатий кнопок в игре
		this.updateKeysState = function (keys) {
			if (keys.pause) {
				pauseGame = true;
				timer.suspend();
				moduleView.pauseGame();
			}

			if (keys.play && pauseGame) {
				pauseGame = false;
				timer.resume();
				moduleView.playGame();
			}

			if (pauseGame) {
				return;
			}
			moduleView.updateKeysAction(keys);
		}

		this.updateMouseState = function (mouse) {
			if (pauseGame) {
				return;
			}
			moduleView.updateMouseAction(mouse);
		}

		this.startGame = function () {
			pauseGame = false;
			stopGame = false
			moduleView.startGame().then((result) => {
				timer = this.gameTime(frameRate);
				this.gameLoop();
			});

		}

		this.stopGame = function (hash) {
			const timeInfo = timer.info();
			pauseGame = true;
			stopGame = true;
			timer.suspend();
			timer.stop();
			cancelAnimationFrame(gameTimerId);
			gameTimerId = null;

			gameResult = moduleView.getGameScore();
			gameResult.date = Date.now();
			gameResult.gameTime = timeInfo.gameTime;
			this.addGameResultInDB(currentUserName, currentUserEmail, currentUserId, gameResult);
			this.addResultUserLastGameInDB(currentUserId, gameResult)
			moduleView.stopGame(hash);
		}

		this.pauseGame = function () {
			pauseGame = true;
			timer.suspend();
			moduleView.pauseGame();
		}

		this.playGame = function () {
			pauseGame = false;
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



		this.gameLoop = function () {
			if (stopGame) {
				return;
			}
			if (!pauseGame) {
				const time = timer.info();
				moduleView.updateGame(time.coeff, time.steps);
			}

			gameTimerId = requestAnimationFrame(() => this.gameLoop());
		}

		// игровой таймер
		// для постановки игры на паузу,
		// подсчета отыгранного времени,
		// coeff - отклонение между желаемой частотой обновления и реальной,
		// для плавности анимации 
		// steps - количество пройденных итераций
		this.gameTime = function (fps) {
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
					const coeff = fps / FPS;
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

	// ------------- end model -------------

	// ------------- begin controller -------------
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
		const mouseAction = {};

		const self = this;

		// -----------------------------------------
		// первоначальная инициализация контроллера
		self.init = function (_root, _model) {
			moduleContainer = _root;
			moduleModel = _model;

			// Обработчик событий hashchange
			window.addEventListener("hashchange", self.updateState);

			window.addEventListener("resize", self.resizeWindow)
			// обработчики событий на клики мышки
			self.addEventListeners();

			self.updateState();
		}

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

		self.addEventListeners = function () {
			moduleContainer.addEventListener("click", function (event) {
				event.preventDefault();

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
			console.log("moduleModel.isUserSignedIn()", moduleModel.isUserSignedIn());
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
					.catch((error) => {
						console.log("moduleModel.promiseIsUserAuth: error ", error)
					});
			} else {
				self.runGame();
			}

			if (!moduleModel.isUserSignedIn()) {
				console.log("moduleModel.isUserSignedIn()", moduleModel.isUserSignedIn());
				window.location.hash = "#main";
			}

			if (moduleModel.isUserSignedIn()) {

				if (hashPageName === "toplist") {
					moduleModel.printTopList();
				}

				if (hashPageName === "settings") {
					moduleModel.updateVolumeSettings();
				}

				if (hashPageName === "gameover") {
					moduleModel.getResultUserLastGameFromDB(hashPageName);
					moduleModel.printGameScore(hashPageName);
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

		// -----------------------------------------
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
	// ------------- end controller -------------
}());

gameSPA.init("gameApp", routes, components);