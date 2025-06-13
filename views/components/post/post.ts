import User from "../../../models/user";
import revealElements from "../../../utils/reveal_elements";

let user: User|null = null;
const EXISTING_REPLY_HIDE_ANIMATION_DURATION = 200;

const replyClick = async (event: Event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const postId = event.target.id.replace('post-reply-button-', '');

  const replyNew: HTMLFormElement|null = document.querySelector('#reply-new-wrapper');
  const lastPostClicked = replyNew?.previousElementSibling;
  const postClicked: HTMLElement|null = document.querySelector(`#post-${postId}`);
  const postClickedWrapper: HTMLElement|null|undefined = postClicked?.parentElement;
  if (!replyNew || !postClicked || !postClickedWrapper) return;

  await hideExistingReplyNew({ lastPostClicked, replyNew });
  revealReplyNew({ replyNew, postClicked, postClickedWrapper });
};

const hideExistingReplyNew = async (args: {
  lastPostClicked: ChildNode|null|undefined,
  replyNew: HTMLFormElement
}) => {
  const { lastPostClicked, replyNew } = args;
  if (lastPostClicked instanceof HTMLElement && replyNew.classList.contains('display-flex')) {
    replyNew.classList.remove('reply-new-grow');
    replyNew.classList.add('reply-new-shrink');

    return new Promise((resolve) => { setTimeout(() => {
      lastPostClicked.classList.remove('replied-to');
      resolve(true);
    }, EXISTING_REPLY_HIDE_ANIMATION_DURATION); });
  };
  return false;
};

const revealReplyNew = (args: {
  replyNew: HTMLFormElement,
  postClicked: HTMLElement,
  postClickedWrapper: HTMLElement
}) => {
  const { replyNew, postClicked, postClickedWrapper } = args;

  revealElements([replyNew]);
  replyNew.classList.remove('reply-new-shrink');
  replyNew.classList.add('reply-new-grow');

  postClicked.classList.add('replied-to');
  postClickedWrapper.appendChild(replyNew);
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