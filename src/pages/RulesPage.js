const RulesPage = {
	id: "rules",
	title: "Space Shooter Adventure - Rules",
	render: (className = "container") => {
		return `
					<section class="${className}">
						<h2 class="rules-page__title">Rules of the game</h2>
						<div>
						<p>- Captain! We are in danger!</p>
						<p>- We need your help! Our galaxy is attacked by alien shooter.</p>
						<p>Please command ship to protect the galaxy.</p>
						<p>Use english buttons 'W' 'A' 'S' 'D' to direct spaceship in any one of the four cardinal directions. Or you can control the ship with the mouse.</p>
						<p>Press the 'SPACE' button to fire.</p>
						<p>Press the 'ESC' button to pause the game. Pressing 'ENTER' continues the game.</p>
						<p>- Jump on ship! NOW!</p>
						</div>
					</section>
    			`;
	}
};

export default RulesPage;