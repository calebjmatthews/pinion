import revealElements from "../../../utils/reveal_elements";

const EXISTING_REPLY_HIDE_ANIMATION_DURATION = 200;

export const hideExistingReplyNew = async (args: {
  lastPostClicked: ChildNode|null|undefined,
  replyNewForm: HTMLFormElement
}) => {
  const { lastPostClicked, replyNewForm } = args;
  if (lastPostClicked instanceof HTMLElement && replyNewForm.classList.contains('display-flex')) {
    replyNewForm.classList.remove('reply-new-grow');
    replyNewForm.classList.add('reply-new-shrink');

    return new Promise((resolve) => { setTimeout(() => {
      lastPostClicked.classList.remove('replied-to');
      resolve(true);
    }, EXISTING_REPLY_HIDE_ANIMATION_DURATION); });
  };
  return false;
};

export const revealReplyNew = (args: {
  replyNewForm: HTMLFormElement,
  postClicked: HTMLElement,
  postClickedWrapper: HTMLElement
}) => {
  const { replyNewForm, postClicked, postClickedWrapper } = args;

  revealElements([replyNewForm]);
  replyNewForm.classList.remove('reply-new-shrink');
  replyNewForm.classList.add('reply-new-grow');
  replyNewForm.addEventListener("submit", replySubmitOnClick);

  postClicked.classList.add('replied-to');
  postClickedWrapper.appendChild(replyNewForm);

  const replyNewInput: HTMLTextAreaElement|null = document.querySelector('#reply-new-input');
  if (replyNewInput) {
    replyNewInput.addEventListener("keydown", replyInputOnKeydown);
    replyNewInput.focus();
  }
};

const replySubmitOnClick = async (event: Event) => {
  event.preventDefault();
  const inputReplyNew: HTMLTextAreaElement|null = document.querySelector("#reply-new-input");
  const submitReplyNew: HTMLButtonElement|null = document.querySelector("#reply-new-submit");
  const wrapperReplyNew: HTMLElement|null = document.querySelector('#reply-new-wrapper');
  const rootPost = wrapperReplyNew?.previousElementSibling;
  const rootPostId = rootPost?.id ? rootPost.id.replace('post-', '') : undefined;

  if (inputReplyNew && submitReplyNew && rootPostId) {
    inputReplyNew.disabled = true;
    submitReplyNew.disabled = true;
    submitReplyNew.textContent = "Sending";

    const replyBody = {
      body: inputReplyNew.value,
      rootPostId
    };
    const response = await fetch("/api/reply_new", {
      method: "POST",
      body: JSON.stringify(replyBody)
    });
    if (response.status === 201) window.location.reload();
  };
};

const replyInputOnKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // Prevent newline
    const replyNewForm: HTMLFormElement|null = document.querySelector('#reply-new-form');
    if (replyNewForm) replyNewForm.requestSubmit();
  }
};