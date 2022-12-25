const SettingsPage = {
	id: "settings",
	title: "Space Shooter Adventure - Settings",
	render: (className = "container", ...rest) => {
		return `
					<section class="${className}">
						<h1 class="settings-page__title">Settings</h1>
						<div class="settings">
							<div class="settings__box">
								<p class="settings__name">Music volume</p>
  								<input type="range" min="0" max="1" value="0.2" step="0.1" class="settings__slider" id="musicVolume">
							</div>
							<div class="settings__box">
								<p class="settings__name">Sound effects volume</p>
								
  								<input type="range" min="0" max="1" value="0.2" step="0.1" class="settings__slider" id="effectsVolume">
							</div>
						</div>
					</section>
    			`;
	}
};

export default SettingsPage;