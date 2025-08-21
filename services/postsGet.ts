import { sql } from "bun";

import Post, { type PostFromDBInterface } from "../models/post";
import PostToDisplay from "../models/post_to_display";
import User, { type UserFromDBInterface } from "../models/user";
import Thread, { type ThreadFromDBInterface } from '../models/thread';
import sqlMiddleware from '../utils/sql_middleware';

const postsGet: () => Promise<PostToDisplay[]> = async() => {
  const postsFromDB: PostFromDBInterface[] = await sqlMiddleware(sql`
    SELECT * FROM posts
    WHERE is_reply IS false
    ORDER BY created_at ASC;
  `, 'postsFromDB');
  let posts = postsFromDB.map((postFromDB) => new Post().fromDB(postFromDB));

  if (posts.length === 0) return [];

  const postIdsLiteral = `{${posts.map((post) => post.id).join()}}`;
  const threadsFromDB: ThreadFromDBInterface[] = await sqlMiddleware(sql`
    SELECT * FROM threads
    WHERE root_post_id = ANY(${postIdsLiteral});
  `, 'threadsFromDB', { postIdsLiteral });
  const threads = threadsFromDB.map((threadFromDB) => new Thread().fromDB(threadFromDB));

  const threadsDescendingIdsLiteral = `{${threads.map((thread) => thread.descendentThreadIds)
    .filter(t => t?.length > 0).join()}}`;
  const threadsDescending: ThreadFromDBInterface[] = await sqlMiddleware(sql`
    SELECT * FROM threads
    WHERE id = ANY(${threadsDescendingIdsLiteral});
  `, 'threadsDescending', { threadsDescendingIdsLiteral });
  threadsDescending.forEach((threadFromDB) => threads.push(new Thread().fromDB(threadFromDB)));

  const postReplyIds = threads.map((thread) => thread.postIds).flat();
  
  let postRepliesFromDB : PostFromDBInterface[] = [];
  if (postReplyIds.length > 0) {
    const postReplyIdsLiteral = `{${postReplyIds.join()}}`;
    postRepliesFromDB = await sqlMiddleware(sql`
      SELECT * FROM posts
      WHERE id = ANY(${postReplyIdsLiteral})
      ORDER BY created_at DESC;
    `, 'postRepliesFromDB', { postReplyIdsLiteral });
  };
  const postReplyMap: { [id: string] : Post } = {};
  postRepliesFromDB.forEach((postReplyFromDB) => {
    postReplyMap[postReplyFromDB.id] = new Post().fromDB(postReplyFromDB);
  });

  const threadsByPostId: { [id: string] : Thread } = {};
  threads.forEach((thread) => threadsByPostId[thread.rootPostId] = thread);
  posts = posts.map((post) => (
    addThreadToPost({ post, threadsByPostId, postReplyMap })
  ));

  const usersFromDB = await sqlMiddleware(sql`
    SELECT
      id, handle, first_name, last_name, custom_name, image_id
    FROM users;
  `, 'usersFromDB');
  const userMap: { [id: string] : User } = {};
  usersFromDB.forEach((userFromDB: UserFromDBInterface) => userMap[userFromDB.id || ''] = new User().fromDB(userFromDB) );

  return posts.map((post) => new PostToDisplay().fromPost({ post, userMap }))
  .filter((postToDisplay) => !!postToDisplay);
};

const addThreadToPost = (args: {
  post: Post,
  threadsByPostId: { [id: string] : Thread },
  postReplyMap: { [id: string] : Post }
}) => {
  const { post, threadsByPostId, postReplyMap } = args;

  const thread = threadsByPostId[post.id];
  if (thread) {
    const postReplies: Post[] = [];
    thread.postIds.forEach((postId) => {
      let postReply = postReplyMap[postId];
      if (postReply) {
        if (threadsByPostId[postId]) {
          postReply = addThreadToPost({ ...args, post: postReply });
        }
        postReplies.push(postReply);
      }
    });
    thread.posts = postReplies;
  }
  else { return post; };
  return new Post({ ...post, thread });
};

export default postsGet;