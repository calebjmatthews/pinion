import { sql } from "bun";

import Post, { type PostFromDBInterface } from "../models/post";
import PostToDisplay from "../models/post_to_display";
import User, { type UserFromDBInterface } from "../models/user";
import Thread, { type ThreadFromDBInterface } from '../models/thread';

const postsGet: () => Promise<PostToDisplay[]> = async() => {
  const postsFromDB: PostFromDBInterface[] = await sql`
    SELECT * FROM posts
    WHERE is_reply IS false
    ORDER BY created_at DESC;
  `;
  const posts = postsFromDB.map((postFromDB) => new Post().fromDB(postFromDB));

  if (posts.length === 0) return [];

  const postIds = posts.map((post) => post.id);
  const threadsFromDB: ThreadFromDBInterface[] = await sql`
    SELECT * FROM threads
    WHERE root_post_id = ANY(ARRAY[${sql`${postIds}::uuid`}]);
  `;
  console.log(`threadsFromDB`, threadsFromDB);
  const threads = threadsFromDB.map((threadFromDB) => new Thread().fromDB(threadFromDB));
  const postReplyIds = threads.map((thread) => thread.postIds).flat();
  
  let postRepliesFromDB : PostFromDBInterface[] = [];
  if (postReplyIds.length > 0) {
    postRepliesFromDB = await sql`
      SELECT * FROM posts
      WHERE id = ANY(ARRAY[${sql`${postReplyIds}::uuid`}])
      ORDER BY created_at DESC;
    `;
  };
  console.log(`postRepliesFromDB`, postRepliesFromDB);
  const postReplyMap: { [id: string] : Post } = {};
  postRepliesFromDB.forEach((postReplyFromDB) => {
    postReplyMap[postReplyFromDB.id] = new Post().fromDB(postReplyFromDB);
  });
  console.log(`postReplyMap`, postReplyMap);

  const threadsByPostId: { [id: string] : Thread } = {};
  threads.forEach((thread) => threadsByPostId[thread.rootPostId] = thread);
  posts.forEach((post) => {
    const thread = threadsByPostId[post.id];
    if (thread) {
      thread.posts = (thread.postIds || [])
        .map((postId) => postReplyMap[postId])
        .filter((post) => !!post);
      post.thread = threadsByPostId[post.id];
    }
  });
  console.log(`posts`, posts);

  const usersFromDB = await sql`
    SELECT
      id, handle, first_name, last_name, custom_name, image_id
    FROM users;
  `;
  const userMap: { [id: string] : User } = {};
  usersFromDB.forEach((userFromDB: UserFromDBInterface) => userMap[userFromDB.id || ''] = new User().fromDB(userFromDB) );

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