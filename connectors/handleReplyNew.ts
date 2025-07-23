import { sql, type BunRequest } from "bun";

import Thread, { type ThreadFromDBInterface } from "../models/thread";
import getUserFromSession from "./getUserFromSession";
import postCreate from "./postCreate";
import sqlMiddleware from "../utils/sql_middleware";

const handleReplyNew = async (request: BunRequest) => {
  const requestBody = await request.json();
  const { body, rootPostId } = requestBody;
  const user = await getUserFromSession(request.cookies);

  // ToDo: Handle missing user
  if (!user) return Response.json({ message: "User not found" }, { status: 404 });

  const postCreateResult = await postCreate(request, { body, isReply: true });
  const postCreated = await postCreateResult.json();
  const postId = postCreated.id;

  let threadFromDb: ThreadFromDBInterface|null = await getExistingThread(rootPostId);

  if (!threadFromDb) {
    threadFromDb = await createThread({ rootPostId, postId });
    await updatePostWithThreadData({ rootPostId, threadId: threadFromDb.id });
  }
  else {
    await updateThreadWithPostData({ threadId: threadFromDb.id, postId })
  };

  const thread = new Thread().fromDB(threadFromDb);
  
  // ToDo: Handle error in postInsert SQL
  return Response.json({ id: thread?.id }, { status: 201 });
};

const getExistingThread = async (rootPostId: string) => {
  const existingThreads = await sqlMiddleware(sql`
    SELECT * FROM threads
    WHERE root_post_id = ${sql`${rootPostId}::uuid`};
  `, "existingThreads", { rootPostId });
  return existingThreads[0];
};

const createThread = async (args: {
  rootPostId: string,
  postId: string
}): Promise<ThreadFromDBInterface> => {
  const { rootPostId, postId } = args;
  const threadInsertResult = await sqlMiddleware(sql`
    INSERT INTO threads (
      root_post_id, depth, post_ids
    ) VALUES (
      ${sql`${rootPostId}::uuid`},
      1,
      ARRAY[${sql`${postId}::uuid`}]
    ) RETURNING *;
  `, "threadInsert", { rootPostId, postId });
  return threadInsertResult[0];
};

const updatePostWithThreadData = async (args: {
  rootPostId: string,
  threadId: string
}) => {
  const { rootPostId } = args;
  const updatePostWithThreadDataResult = await sqlMiddleware(sql`
    UPDATE posts
    SET is_root = true
    WHERE id = ${sql`${rootPostId}::uuid`};
  `, "updatePostWithThreadData", { rootPostId });
  return updatePostWithThreadDataResult;
};

const updateThreadWithPostData = async (args: {
  threadId: string,
  postId: string
}) => {
  const { threadId, postId } = args;
  const updateThreadWithPostDataResult = await sqlMiddleware(sql`
    UPDATE threads
    SET post_ids = ARRAY_APPEND(post_ids, ${sql`${postId}::uuid`})
    WHERE id = ${sql`${threadId}::uuid`};
  `, "updateThreadWithPost", { postId, threadId });
  return updateThreadWithPostDataResult;
}

// const getPostsFromThread = async (postIds: string[]) => {
  
// };

export default handleReplyNew;