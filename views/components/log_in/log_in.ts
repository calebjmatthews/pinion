const formLogInClick = async (event: Event) => {
  event.preventDefault();
  const emailLogin: HTMLInputElement|null = document.querySelector("#log-in-email");
  const passwordLogin: HTMLInputElement|null = document.querySelector("#log-in-password");
  const submitLogin: HTMLButtonElement|null = document.querySelector("#log-in-submit");

  if (emailLogin && passwordLogin && submitLogin) {
    emailLogin.disabled = true;
    passwordLogin.disabled = true;
    submitLogin.disabled = true;
    submitLogin.textContent = "Sending";

    const loginBody = { email: emailLogin.value, password: passwordLogin.value };
    const response = await fetch("/log_in", {
      method: "POST",
      body: JSON.stringify(loginBody)
    });
    console.log(`response`, response);
  };
};

const attach = () => {
  const formLogIn: HTMLFormElement|null = document.querySelector("#log-in");
  const userState: HTMLSpanElement|null = document.querySelector("#state-user");
  let user = null;
  try {
    if (userState?.textContent) {
      user = JSON.parse(userState.textContent);
    }
  }
  catch {
    // ToDo: Log JSON parsing errors
  };
  console.log(`user`, user);

  if (formLogIn && userState) {
    formLogIn.style = "";
    formLogIn.addEventListener("submit", formLogInClick);
  }
  else { setTimeout(() => attach(), 10); }
};
attach();