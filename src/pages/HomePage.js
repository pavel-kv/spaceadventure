const HomePage = {
	id: "main",
	title: "Space Shooter Adventure - Home",
	render: (className = "container") => {
		return `
					<section class="${className}">
						<div class="main-page__logo">
							<img class="main-page__image" src="images/spaceadv.png" alt="">
						</div>
						<ul class="main-page__list">
							<li><a class="main-page__link menu-link" href="#game">START</a></li>
							<li><a class="main-page__link menu-link" href="#settings">SETTINGS</a></li>
							<li><a class="main-page__link menu-link" href="#rules">RULES</a></li>
							<li><a class="main-page__link menu-link" href="#toplist">TOP</a></li>
						</ul>
					</section>
    			`;
	}
};

export default HomePage;