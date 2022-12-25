const SigninPage = {
	id: "signin",
	title: "Space Adventure - Login",
	render: (className = "container", ...rest) => {
		return `
					<section class="${className}">
					<h1 class="signin-page__title">Sign in using your<br>registered account</h1>
					<form class="form">
						<div class="form__group">
							<label class="form__label" for="userEmail">Enter your email</label>
							<div class="form__icon icon-mail">
								<input class="form__input" id="userEmail" type="email" placeholder="example@email.com" autofocus>
							</div>
						</div>
	
						<div class="form__group">
							<label class="form__label" for="userPass">Enter your password</label>
							<div class="form__icon icon-lock">
								<input class="form__input" id="userPass" type="password" placeholder="password ">
							</div>
						</div>
						<div class=" form__group">
							<p class="form__info" id="formInfo">
							</p>
						</div>
						<div class="form__buttons">
							<button class="button button_register " id="btnRegister">Register</button>
							<button type="submit" class="button button_signin" id="btnSignin">Sign in</button>
						</div>
					</form>
					</section>
    			`;
	}
};

export default SigninPage;