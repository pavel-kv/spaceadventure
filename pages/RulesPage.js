const RulesPage = {
	id: "rules",
	title: "Space Shooter Adventure - Rules",
	render: (className = "container") => {
		return `
					<section class="${className}">
						<h2 class="rules-page__title">Rules of the game</h2>
						<div>
							<p>Use english buttons 'W' 'A' 'S' 'D' to direct spaceship in any one of the four cardinal directions.</p>
							<p>Press the 'SPACE' button to fire.</p>
							<p></p>
						</div>
					</section>
    			`;
	}
};

export default RulesPage;