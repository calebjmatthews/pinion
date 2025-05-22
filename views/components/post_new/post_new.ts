import User from "../../../models/user";

let user: User|null = null;

const postNewSubmitOnClick = async (event: Event) => {
  event.preventDefault();
  const inputPostNew: HTMLTextAreaElement|null = document.querySelector("#post-new-input");
  const submitPostNew: HTMLButtonElement|null = document.querySelector("#post-new-submit");

  if (inputPostNew && submitPostNew) {
    inputPostNew.disabled = true;
    submitPostNew.disabled = true;
    submitPostNew.textContent = "Sending";

    const postBody = inputPostNew.value;
    const response = await fetch("/api/post_new", {
      method: "POST",
      body: JSON.stringify(postBody)
    });
    if (response.status === 201) window.location.reload();
  };
};

const attach = () => {
  const formPostNew: HTMLFormElement|null = document.querySelector("#post-new");
  const userState: HTMLSpanElement|null = document.querySelector("#state-user");
  try {
    if (userState?.textContent) {
      user = new User(JSON.parse(userState.textContent));
    }
  } catch { };

  if (formPostNew && userState) {
    if (user) formPostNew.style = "";
    formPostNew.addEventListener("submit", postNewSubmitOnClick);
  }
  else { setTimeout(() => attach(), 10); };
};
attach();