const postNewSubmitOnClick = (event: Event) => {
  event.preventDefault();
  console.log(`event`, event);
};

const attach = () => {
  const formPostNew = document.querySelector("#post-new");
  if (formPostNew) {
    formPostNew.addEventListener("submit", postNewSubmitOnClick);
  }
  else { setTimeout(() => attach(), 10); }
};
attach();