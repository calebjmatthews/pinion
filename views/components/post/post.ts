import User from "../../../models/user";

let user: User|null = null;

const replyClick = (event: Event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const postId = event.target.id.replace('post-reply-button-', '');

  const postList: HTMLElement|null = document.querySelector('.post-list');
  const replyNew: HTMLFormElement|null = document.querySelector('#reply-new-wrapper');
  const lastPostClicked = replyNew?.previousSibling;
  const postClicked: HTMLElement|null = document.querySelector(`#post-${postId}`);
  if (!postList || !replyNew || !postClicked) return;

  // Reveal new reply form component
  replyNew.style = "display: flex";

  postClicked.className = `${postClicked.className} replied-to`;
  if (lastPostClicked instanceof HTMLElement) {
    lastPostClicked.className = lastPostClicked.className.replace(' replied-to', '');
  };
  postList.insertBefore(replyNew, postClicked.nextSibling);
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
      postReplyButton.style = "display: flex";
      postReplyButton.addEventListener("click", replyClick);
    });
  }
  else { setTimeout(() => postsOnLoad(), 10); }
};
postsOnLoad();