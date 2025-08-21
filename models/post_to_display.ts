import Post from "./post";
import User from "./user";

export default class PostToDisplay {
  id: string = '';
  userId: string = '';
  userName: string = '';
  userThumbnail?: string;
  createdAt: Date = new Date();
  createdAtLabel: string = '';
  body: string = '';
  thread?: ThreadToDisplay;

  constructor(postToDisplay?: PostToDisplayInterface, options?: { locale?: string }) {
    if (postToDisplay) {
      Object.assign(this, postToDisplay);

      this.createdAtLabel = getCreatedAtLabel({ date: this.createdAt, locale: options?.locale });
    };
  };

  fromPost(args: { post: Post, userMap: { [userId: string] : User } }): PostToDisplay|undefined {
    const { post, userMap } = args;
    const { id, userId, createdAt, body, thread } = post;
    const user = userMap[userId];
    if (!user) return;

    let threadToDisplay: ThreadToDisplay|undefined = undefined;
    if (thread?.posts) {
      threadToDisplay = { replyCount: thread.replyCount, posts: 
        thread.posts.map((threadPost) => (
          new PostToDisplay().fromPost({ post: threadPost, userMap }))
        ).filter((threadPost) => !!threadPost)
      };
    };
  
    return new PostToDisplay({
      id,
      userId,
      userName: user.getName(),
      userThumbnail: user.imageId,
      createdAt,
      body,
      thread: threadToDisplay
    });
  };
};

const getCreatedAtLabel = (args: { date: Date, locale?: string }) => {
  const { date, locale } = args;
  const day = date.toLocaleDateString(locale, { day: "numeric" });
  const month = date.toLocaleDateString(locale, { month: "short" });
  const year = date.toLocaleDateString(locale, { year: "numeric" });
  const [time, ampm, timezone] = date.toLocaleTimeString(locale, { hour: "numeric", minute: "numeric", timeZoneName: "short" }).split(" ");
  return `${day} ${month} ${year} ${time} ${ampm} (${timezone})`;
};

interface PostToDisplayInterface {
  id: string;
  userId: string;
  userName: string;
  userThumbnail?: string;
  createdAt: Date;
  createdAtLabel?: string;
  body: string;
  thread?: ThreadToDisplay;
};

interface ThreadToDisplay {
  replyCount?: number;
  posts: PostToDisplay[];
}