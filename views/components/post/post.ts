import User from "../../../models/user";

let user: User|null = null;

const replyClick = async (event: Event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const postId = event.target.id.replace('post-reply-button-', '');

  const replyNew: HTMLFormElement|null = document.querySelector('#reply-new-wrapper');
  const lastPostClicked = replyNew?.previousElementSibling;
  const postClicked: HTMLElement|null = document.querySelector(`#post-${postId}`);
  const postClickedWrapper: HTMLElement|null|undefined = postClicked?.parentElement;
  if (!replyNew || !postClicked || !postClickedWrapper) return;

  await hideExistingReplyNew({ lastPostClicked, replyNew });

  replyNew.style = "display: flex";
  replyNew.className = replyNew.className.replace('reply-new-shrink', '').trim();
  replyNew.className = `${replyNew.className} reply-new-grow`;

  postClicked.className = `${postClicked.className} replied-to`;
  postClickedWrapper.appendChild(replyNew);
};

const hideExistingReplyNew = async (args: {
  lastPostClicked: ChildNode|null|undefined,
  replyNew: HTMLFormElement
}) => {
  const { lastPostClicked, replyNew } = args;
  if (lastPostClicked instanceof HTMLElement) {
    replyNew.className = replyNew.className.replace('reply-new-grow', '').trim();
    replyNew.className = `${replyNew.className} reply-new-shrink`;
    console.log(`replyNew.className 1`, replyNew.className);

    return new Promise((resolve) => { setTimeout(() => {
      lastPostClicked.className = lastPostClicked.className.replace(' replied-to', '');
      resolve(true);
    }, 200); });
  };
  return false;
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