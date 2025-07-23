import { sql, type BunRequest } from "bun";

import Thread, { type ThreadFromDBInterface } from "../models/thread";
import getUserFromSession from "./getUserFromSession";
import postCreate from "./postCreate";

const handleReplyNew = async (request: BunRequest) => {
  const requestBody = await request.json();
  console.log(`requestBody`, requestBody);
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
  console.log(`thread`, thread);
  
  // ToDo: Handle error in postInsert SQL
  return Response.json({ id: thread?.id }, { status: 201 });
};

const getExistingThread = async (rootPostId: string) => {
  const existingThreads = await sql`
    SELECT * FROM threads
    WHERE root_post_id = ${sql`${rootPostId}::uuid`};
  `;
  return existingThreads[0];
};

const createThread = async (args: {
  rootPostId: string,
  postId: string
}): Promise<ThreadFromDBInterface> => {
  const { rootPostId, postId } = args;
  const threadInsertResult = await sql`
    INSERT INTO threads (
      root_post_id, depth, post_ids
    ) VALUES (
      ${sql`${rootPostId}::uuid`},
      1,
      ARRAY[${sql`${postId}::uuid`}]
    ) RETURNING *;
  `;
  console.log(`threadInsertResult`, threadInsertResult);
  return threadInsertResult[0];
};

const updatePostWithThreadData = async (args: {
  rootPostId: string,
  threadId: string
}) => {
  const { rootPostId } = args;
  const updatePostWithThreadDataResult = await sql`
    UPDATE posts
    SET is_root = true
    WHERE id = ${sql`${rootPostId}::uuid`};
  `;
  console.log(`updatePostWithThreadDataResult`, updatePostWithThreadDataResult);
  return updatePostWithThreadDataResult;
};

const updateThreadWithPostData = async (args: {
  threadId: string,
  postId: string
}) => {
  const { threadId, postId } = args;
  console.log(`Before updateThreadWithPostData`);
  const updateThreadWithPostDataResult = await sql`
    UPDATE threads
    SET post_ids = ARRAY_APPEND(post_ids, ${sql`${postId}::uuid`})
    WHERE id = ${sql`${threadId}::uuid`};
  `;
  console.log(`updateThreadWithPostDataResult`, updateThreadWithPostDataResult);
  return updateThreadWithPostDataResult;
}

// const getPostsFromThread = async (postIds: string[]) => {
  
// };

export default handleReplyNew;