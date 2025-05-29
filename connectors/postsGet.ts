import { sql } from "bun";

import Post, { type PostFromDBInterface } from "../models/post";
import PostToDisplay from "../models/post_to_display";
import User, { type UserFromDBInterface } from "../models/user";

const postsGet: () => Promise<PostToDisplay[]> = async() => {
  const postsRaw: PostFromDBInterface[] = await sql`
    SELECT * FROM posts;
  `;
  const posts = postsRaw.map((postRaw) => new Post().fromDB(postRaw));

  const usersRaw = await sql`
    SELECT
      id, handle, first_name, last_name, custom_name, image_id
    FROM users;
  `;
  const userMap: { [id: string] : User } = {};
  usersRaw.forEach((userRaw: UserFromDBInterface) => userMap[userRaw.id || ''] = new User().fromDB(userRaw) );

  return posts.map((post: Post) => {
    const { id, userId, createdAt, body } = post;
    const user = userMap[userId];
    if (!user) return;
  
    return new PostToDisplay({
      id,
      userId,
      userName: user.getName(),
      userThumbnail: user.imageId,
      createdAt,
      body
    });
  }).filter((post) => post !== undefined);
};

export default postsGet;