const NavMenu = {
	render: (className = "") => {
		return `
					<nav class="navmenu ${className}" id="navmenu">
						<ul class="navmenu__menu">
							<li>
								<ul class="navmenu__list menu_game">
									<li><a class="navmenu__link menu-link" id="main" href="#main">HOME</a></li>
									<li><a class="navmenu__link menu-link link_hide" id="menuGameOver" href="#gameover">EXIT GAME</a></li>
								</ul>
							</li>
							<li>
								<ul class="navmenu__list menu_user">
									<li><a class="navmenu__link link_hide" id="signinUserName" href="#user"></a></li>
									<li><a class="navmenu__link link_hide" id="signOut">SignOut</a></li>
								</ul>
							</li>
						</ul>
  				</nav>
    			`;
	}
};

export default NavMenu;
