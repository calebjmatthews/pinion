import User from "../../../models/user";

let user: User|null = null;

const formLogInClick = async (event: Event) => {
  event.preventDefault();
  const emailInput: HTMLInputElement|null = document.querySelector("#log-in-email");
  const passwordInput: HTMLInputElement|null = document.querySelector("#log-in-password");
  const submitLogin: HTMLButtonElement|null = document.querySelector("#log-in-submit");

  if (emailInput && passwordInput && submitLogin) {
    emailInput.disabled = true;
    passwordInput.disabled = true;
    submitLogin.disabled = true;
    submitLogin.textContent = "Sending";

    const loginBody = { email: emailInput.value, password: passwordInput.value };
    const response = await fetch("/log_in", {
      method: "POST",
      body: JSON.stringify(loginBody)
    });
    console.log(`response`, response);
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
  const noUserExplanation: HTMLParagraphElement|null = document.querySelector("#no-user-explanation");
  const logInHandleControl: HTMLDivElement|null =  document.querySelector("#log-in-handle-control");
  const logInHandleInput: HTMLInputElement|null = document.querySelector('#log-in-handle');
  const logInPasswordConfirmControl: HTMLDivElement|null =  document.querySelector("#log-in-password-confirm-control");
  const logInPasswordConfirmInput: HTMLInputElement|null = document.querySelector('#log-in-password-confirm');
  const logInFirstNameControl: HTMLDivElement|null =  document.querySelector("#log-in-first-name-control");
  const logInLastNameControl: HTMLDivElement|null =  document.querySelector("#log-in-last-name-control");

  if (formLogIn && noUserExplanation && logInHandleControl && logInHandleInput && logInPasswordConfirmControl && logInPasswordConfirmInput && logInFirstNameControl && logInLastNameControl) {
    formLogIn.classList = "responsive-container sign-up-container";
    emailInput.disabled = false;
    passwordInput.disabled = false;
    submitLogin.disabled = false;
    submitLogin.textContent = "Go";
    noUserExplanation.style = "display: revert";
    noUserExplanation.textContent = `We didn't find a user with an email or handle of "${emailInput.value}". You can create a new account below:`;
    logInHandleControl.style = "display: flex";
    logInHandleInput.required = true;
    logInHandleInput.value = emailInput.value.split('@')[0] || "";
    logInPasswordConfirmControl.style = "display: flex";
    logInPasswordConfirmInput.required = true;
    logInFirstNameControl.style = "display: flex";
    logInLastNameControl.style = "display: flex";
  };
};

const attach = () => {
  const formLogIn: HTMLFormElement|null = document.querySelector("#log-in");
  const userState: HTMLSpanElement|null = document.querySelector("#state-user");
  try {
    if (userState?.textContent) {
      user = new User(JSON.parse(userState.textContent));
    }
  } catch { };

  if (formLogIn && userState) {
    if (!user) formLogIn.style = "display: flex";
    formLogIn.addEventListener("submit", formLogInClick);
  }
  else { setTimeout(() => attach(), 10); }
};
attach();