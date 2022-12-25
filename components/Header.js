const Header = {
	render: (className = "") => {
		return `
					<header class="header ${className}" id="header">
						<h1 class="header__title">
							SPACE ADVENTURE GAME
						</h1>
					</header>
    			`;
	}
};

export default Header;