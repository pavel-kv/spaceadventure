const SignupPage = {
	id: "signup",
	title: "Space Adventure - Sign up",
	render: (className = "container") => {
		return `
					<section class="${className}">
					<h1 class="signup-page__title">Register a new account</h1>
					<form class="form">
						<div class="form__group">
							<label class="form__label" for="userName">Name</label>
							<div class="form__icon icon-user">
								<input class="form__input" id="userName" type="text"
									placeholder="Your name" autofocus>
							</div>
						</div>

						<div class="form__group">
							<label class="form__label" for="userEmail">Email</label>
							<div class="form__icon icon-mail">
								<input class="form__input" id="userEmail" type="email"
									placeholder="example@email.com">
							</div>
						</div>

						<div class="form__group">
							<label class="form__label" for="userPass">Password</label>
							<div class="form__icon icon-lock">
								<input class="form__input" id="userPass" type="password"
									placeholder="Create password ">
							</div>
						</div>

						<div class="form__group">
							<label class="form__label" for="confirmUserPass">Confirm password</label>
							<div class="form__icon icon-lock">
								<input class="form__input" id="confirmUserPass" type="password"
									placeholder="Confirm password">
							</div>
						</div>
						<div class=" form__group">
							<p class="form__info" id="formInfo"></p>
						</div>
						<div class="form__buttons">
							<button class="button button_cancel" id="btnCancel">Cancel</button>
							<button type="submit" class="button button_register" id="btnSignup">Sign up</button>
						</div>			
					</form>
					</section>
    			`;
	}
};

export default SignupPage;