const ErrorPage = {
	id: "error",
	title: "Space Shooter Adventure - Error",
	render: (className = "container", ...rest) => {
		return `
					<section class="${className}">
						<h1 class="error-page__title">Seems like error 404</h1>
						<p>
							Whoops! It looks like nothing was found at this location
						</p>
						<p>
							Back to homepage <a class="error-page__link" href="#main">homepage</a>
						</p>
					</section>
    			`;
	}
};

export default ErrorPage;