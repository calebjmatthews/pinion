import User from "../../../models/user";
import revealElements from "../../../utils/reveal_elements";

let user: User|null = null;

const formClick = async (event: Event) => {
  event.preventDefault();
  const formLogIn: HTMLFormElement|null = document.querySelector("#log-in");
  let isSignUpForm = ((formLogIn?.className || '').includes('log-in--sign-up'));
  if (isSignUpForm) { signUpClick(); }
  else { logInClick(); }
};

const logInClick = async () => {
  const emailInput: HTMLInputElement|null = document.querySelector("#log-in__email");
  const passwordInput: HTMLInputElement|null = document.querySelector("#log-in__password");
  const submitLogin: HTMLButtonElement|null = document.querySelector("#log-in__submit");

  if (emailInput && passwordInput && submitLogin) {
    emailInput.disabled = true;
    passwordInput.disabled = true;
    submitLogin.disabled = true;
    submitLogin.textContent = "Sending";

    const logInBody = { email: emailInput.value, password: passwordInput.value };
    const response = await fetch("/log_in", {
      method: "POST",
      body: JSON.stringify(logInBody)
    });
    if (response.status === 202) window.location.reload();
    else if (response.status === 204) revealSignUp({ emailInput, passwordInput, submitLogin });
  };

  // ToDo: Handle rejected log in request
};

const revealSignUp = (args: {
  emailInput: HTMLInputElement,
  passwordInput: HTMLInputElement,
  submitLogin: HTMLButtonElement
}) => {
  const { emailInput, passwordInput, submitLogin } = args;
  const formLogIn: HTMLFormElement|null = document.querySelector("#log-in");
  const noUserExplanation: HTMLParagraphElement|null = document.querySelector("#log-in__no-user-explanation");
  const handleControl: HTMLDivElement|null =  document.querySelector("#log-in__handle-control");
  const handleInput: HTMLInputElement|null = document.querySelector('#log-in__handle');
  const passwordConfirmControl: HTMLDivElement|null =  document.querySelector("#log-in__password-confirm-control");
  const passwordConfirmInput: HTMLInputElement|null = document.querySelector('#log-in__password-confirm');
  const firstNameControl: HTMLDivElement|null =  document.querySelector("#log-in__first-name-control");
  const lastNameControl: HTMLDivElement|null =  document.querySelector("#log-in__last-name-control");

  if (formLogIn && noUserExplanation && handleControl && handleInput && passwordConfirmControl && passwordConfirmInput && firstNameControl && lastNameControl) {
    formLogIn.classList = "responsive-container log-in--sign-up";
    emailInput.disabled = false;
    passwordInput.disabled = false;
    submitLogin.disabled = false;
    submitLogin.textContent = "Log in or Sign up";

    revealElements([noUserExplanation, handleControl, passwordConfirmControl, firstNameControl, lastNameControl]);
    
    noUserExplanation.textContent = `We didn't find a user with an email or handle of "${emailInput.value}". You can create a new account below:`;
    handleInput.required = true;
    handleInput.value = emailInput.value.split('@')[0] || "";
    passwordConfirmInput.required = true;
    passwordConfirmInput.addEventListener("input", passwordConfirmInputChange);
  };
};

const passwordConfirmInputChange = () => {
  const passwordInput: HTMLInputElement|null = document.querySelector("#log-in__password");
  const passwordConfirmInput: HTMLInputElement|null = document.querySelector('#log-in__password-confirm');

  if (passwordInput && passwordConfirmInput) {
    passwordConfirmInput.setCustomValidity("");

    if (passwordInput.value !== passwordConfirmInput.value) {
      passwordConfirmInput.setCustomValidity("Passwords do not match");
    };
  };
};

const signUpClick = async () => {
  const emailInput: HTMLInputElement|null = document.querySelector("#log-in__email");
  const passwordInput: HTMLInputElement|null = document.querySelector("#log-in__password");
  const submitLogin: HTMLButtonElement|null = document.querySelector("#log-in__submit");
  const handleInput: HTMLInputElement|null = document.querySelector('#log-in__handle');
  const passwordConfirmInput: HTMLInputElement|null = document.querySelector('#log-in__password-confirm');
  const firstNameHandleInput: HTMLInputElement|null = document.querySelector('#log-in__first-name');
  const lastNameHandleInput: HTMLInputElement|null = document.querySelector('#log-in__last-name');
  if (emailInput && passwordInput && submitLogin && handleInput && passwordConfirmInput && firstNameHandleInput && lastNameHandleInput) {
    emailInput.disabled = true;
    passwordInput.disabled = true;
    submitLogin.disabled = true;
    handleInput.disabled = true;
    passwordConfirmInput.disabled = true;
    firstNameHandleInput.disabled = true;
    lastNameHandleInput.disabled = true;
    submitLogin.textContent = "Sending";

    const signUpBody = {
      email: emailInput.value,
      password: passwordInput.value,
      handle: handleInput.value,
      firstName: firstNameHandleInput.value,
      lastName: lastNameHandleInput.value
    };
    const response = await fetch("/sign_up", {
      method: "POST",
      body: JSON.stringify(signUpBody)
    });
    if (response.status === 202) window.location.reload();
  };
};

const logInOnLoad = () => {
  const formLogIn: HTMLFormElement|null = document.querySelector("#log-in");
  const userState: HTMLSpanElement|null = document.querySelector("#state__user");
  try {
    if (userState?.textContent) {
      user = new User(JSON.parse(userState.textContent));
    }
  } catch { };

  if (formLogIn && userState) {
    if (!user) revealElements([formLogIn]);
    formLogIn.addEventListener("submit", formClick);
  }
  else { setTimeout(() => logInOnLoad(), 10); }
};
logInOnLoad();