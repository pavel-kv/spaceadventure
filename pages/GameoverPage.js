const GameoverPage = {
	id: "gameover",
	title: "Space Shooter Adventure - Game Over",
	render: (className = "container") => {
		return `
					<section class="${className}">
						<h2 class="gameover-page__title">GAME OVER</h2>
						<p><span>Your score: </span><span id="resultGameScore"></span></p>			
						
						<p><span>Shots: </span><span id="resultGameShots"></span></p>
						<p><span>Hits: </span><span id="resultGameHits"></span></p>
						<p><span>Hit ratio: </span><span id="resultGameHitratio"></span></p>
						<p><span>Total destroyed: </span><span id="resultGameTotalDest"></span></p>
						<p><span>Enemies destroyed: </span><span id="resultGameEnemysDest"></span></p>
						<p><span>Asteroids destroyed: </span><span id="resultGameAsteroidsDest"></span></p>
					</section>
    			`;
	}
};

export default GameoverPage;