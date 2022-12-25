const GamePage = {
	id: "game",
	title: "Space Shooter Adventure - Game",
	render: (className = "container") => {
		return `
					<section class="${className}" id="gamePage">
						<ul class="game-page__info">
							<li class="game-page__item">
								<p>Health:</p>
								<p id="health"></p>
							</li>
							<li class="game-page__item">
								<p>Lives:</p>
								<p id="lives"></p>
							</li>
							<li class="game-page__item">
								<p>Score:</p>
								<p id="score"></p>
							</li>
							<li class="game-page__item">
								<a class="game-page__link menu-link game-page__icon icon-stop2" href="#gameover" id="gameStop" title="stop game"></a>
								<span class="game-page__link game-page__icon icon-display link_hide" id="gameNotFullScreen" title="not full screen"></span>
								<span class="game-page__link game-page__icon icon-mobile2" id="gameFullScreen" title="full screen"></span>
								<span class="game-page__link game-page__icon icon-play3 link_hide" id="gamePlay" title="play game"></span>
								<span class="game-page__link game-page__icon icon-pause2" id="gamePause" title="pause game"></span>
								<span class="game-page__link game-page__icon icon-volume-mute2  link_hide" id="gameUnmute" title="unmute sound"></span>
							<span class="game-page__link game-page__icon icon-volume-medium" id="gameMute" title="mute sound"></span>
							</li>
						</ul>
						<div class="game-page__container" id="gameContainer">
							<canvas class="game-page__canvas" id="gameCanvas"></canvas>
						</div>
				</section>
    		`;
	}
};

export default GamePage;