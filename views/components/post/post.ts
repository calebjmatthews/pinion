import User from "../../../models/user";
import revealElements from "../../../utils/reveal_elements";

let user: User|null = null;
const EXISTING_REPLY_HIDE_ANIMATION_DURATION = 200;

const replyClick = async (event: Event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const postId = event.target.id.replace('post-reply-button-', '');

  const replyNewForm: HTMLFormElement|null = document.querySelector('#reply-new-wrapper');
  const lastPostClicked = replyNewForm?.previousElementSibling;
  const postClicked: HTMLElement|null = document.querySelector(`#post-${postId}`);
  const postClickedWrapper: HTMLElement|null|undefined = postClicked?.parentElement;
  if (!replyNewForm || !postClicked || !postClickedWrapper) return;

  await hideExistingReplyNew({ lastPostClicked, replyNewForm });
  revealReplyNew({ replyNewForm, postClicked, postClickedWrapper });
};

const hideExistingReplyNew = async (args: {
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

const revealReplyNew = (args: {
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

const postsOnLoad = () => {
  const postReplyButtons: NodeListOf<HTMLElement> = document.querySelectorAll('.post-reply-button');
  const userState: HTMLSpanElement|null = document.querySelector("#state-user");

  try {
    if (userState?.textContent) {
      user = new User(JSON.parse(userState.textContent));
    }
  } catch { };

  if (postReplyButtons.length > 0 && userState) {
    if (!user) return;
    postReplyButtons.forEach((postReplyButton) => {
      revealElements([postReplyButton]);
      postReplyButton.addEventListener("click", replyClick);
    });
  }
  else { setTimeout(() => postsOnLoad(), 10); }
};
postsOnLoad();