const postNewSubmitOnClick = async (event: Event) => {
  event.preventDefault();
  const inputPostNew: HTMLTextAreaElement|null = document.querySelector("#post-new-input");
  const inputPostSubmit: HTMLButtonElement|null = document.querySelector("#post-new-submit");

  if (inputPostNew && inputPostSubmit) {
    inputPostNew.disabled = true;
    inputPostSubmit.disabled = true;
    inputPostSubmit.textContent = "Sending";

    const response = await fetch("/api/post_new", {
      method: "POST",
      body: JSON.stringify("Hello")
    });
    console.log(`response`, response);
  }
};

const attach = () => {
  const formPostNew = document.querySelector("#post-new");
  if (formPostNew) {
    formPostNew.addEventListener("submit", postNewSubmitOnClick);
  }
  else { setTimeout(() => attach(), 10); }
};
attach();