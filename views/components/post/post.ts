import User from "../../../models/user";
import revealElements from "../../../utils/reveal_elements";
import { hideExistingReplyNew, revealReplyNew } from "../reply_new/reply_new";

let user: User|null = null;

const replyClick = async (event: Event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const postId = event.target.id.replace('post-reply-button-', '');

  const replyNewForm: HTMLFormElement|null = document.querySelector('#reply-new-wrapper');
  const lastPostClicked = replyNewForm?.previousElementSibling;
  const postClicked: HTMLElement|null = document.querySelector(`#post-${postId}`);
  const postClickedWrapper: HTMLElement|null|undefined = postClicked?.parentElement;
  if (!replyNewForm || !postClicked || !postClickedWrapper) return;

  await hideExistingReplyNew({ lastPostClicked, replyNewForm });
  revealReplyNew({ replyNewForm, postClicked });
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