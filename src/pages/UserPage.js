const UserPage = {
	id: "user",
	title: "Space Shooter Adventure - User",
	render: (className = "container") => {
		return `
				<section class="${className}">
        <h2 class="user-page__title">Last game result</h2>
        <div class="user__result">
          <table class="user-page__table" id="userLastGameTable">
            <thead>
              <tr>
                <th>Game score</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody id="userResultList">
              <tr>
                <td>Date</td>
                <td id="userDateGame"></td>
              </tr>
              <tr>
                <td>Time</td>
                <td id="userTimeGame"></td>
              </tr>
              <tr>
                <td>Score</td>
                <td id="resultGameScore"></td>
              </tr>
              <tr>
                <td>Shots</td>
                <td id="resultGameShots"></td>
              </tr>
              <tr>
                <td>Hits</td>
                <td id="resultGameHits"></td>
              </tr>
              <tr>
                <td>Hit ratio</td>
                <td id="resultGameHitratio"></td>
              </tr>
              <tr>
                <td>Coins</td>
                <td id="resultGameCoins"></td>
              </tr>
              <tr>
                <td>Bonus lives</td>
                <td id="resultGameBonusLives"></td>
              </tr>
              <tr>
                <td colspan="2">Destroyed</td>             
              </tr>
              <tr>
                <td class="table-td-right">Total</td>
                <td id="resultGameTotalDest"></td>
              </tr>
              <tr>
                <td class="table-td-right">Enemies</td>
                <td id="resultGameEnemysDest"></td>
              </tr>
              <tr>
                <td class="table-td-right">Asteroids</td>
                <td id="resultGameAsteroidsDest"></td>
              </tr>
              <tr>
                <td class="table-td-right">Bosses</td>
                <td id="resultGameBossesDest"></td>
              </tr>
            </tbody>
          </table>
        </div>
					</section>
    			`;
	}
};

export default UserPage;