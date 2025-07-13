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

export const postInputOnKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // Prevent newline
    const formPostNew: HTMLFormElement|null = document.querySelector('#post-new');
    if (formPostNew) formPostNew.requestSubmit();
  }
};

const attach = () => {
  const formPostNew: HTMLFormElement|null = document.querySelector("#post-new");
  const inputPostNew: HTMLFormElement|null = document.querySelector("#post-new-input");
  const userState: HTMLSpanElement|null = document.querySelector("#state-user");
  try {
    if (userState?.textContent) {
      user = new User(JSON.parse(userState.textContent));
    }
  } catch { };

  if (formPostNew && userState && inputPostNew) {
    if (user) formPostNew.style = "display: flex";
    formPostNew.addEventListener("submit", postNewSubmitOnClick);
    inputPostNew.addEventListener("keydown", postInputOnKeydown);
  }
  else { setTimeout(() => attach(), 10); };
};
attach();