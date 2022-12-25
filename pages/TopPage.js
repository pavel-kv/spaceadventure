const TopPage = {
	id: "toplist",
	title: "Space Shooter Adventure - Top",
	render: (className = "container") => {
		return `
					<section class="${className}">
						<h2 class="toplist-page__title">Top ten players</h2>
						<table class="toplist-page__table"  id="topScoreTable">
							<thead>
								<tr>
									<th>Place</th>
									<th>Name</th>
									<th>Score</th>
									<th>Hit ratio</th>
								</tr>
							</thead>
							<tbody id="topScoreList"></tbody>
						</table>
					</section>
    			`;
	}
};

export default TopPage;