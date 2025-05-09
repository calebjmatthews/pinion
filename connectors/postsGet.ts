import PostToDisplay from "../models/post_to_display";
import users from "../test_db/users";
import posts from "../test_db/posts";

const postsGet: () => PostToDisplay[] = () => posts.map((post) => {
  const { id, userId, createdAt, text } = post;
  const user = users[userId];
  if (!user) return;

  return new PostToDisplay({
    id,
    userId: user.id,
    userName: user.getName(),
    userThumbnail: user.imageId,
    createdAt,
    text
  });
}).filter((post) => post !== undefined);

export default postsGet;