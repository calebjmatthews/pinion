import { sql, type BunRequest } from "bun";

import Thread, { type ThreadFromDBInterface } from "../models/thread";
import getUserFromSession from "./getUserFromSession";
import postCreate from "./postCreate";
import sqlMiddleware from "../utils/sql_middleware";
import toUuidArrayLiteral from "../utils/to_uuid_array_literal";

const handleReplyNew = async (request: BunRequest) => {
  const requestBody = await request.json();
  const { body, rootPostId } = requestBody;
  const user = await getUserFromSession(request.cookies);

  // ToDo: Handle missing user
  if (!user) return Response.json({ message: "User not found" }, { status: 404 });

  const postCreateResult = await postCreate(request, { body, isReply: true });
  const postCreated = await postCreateResult.json();
  const postId = postCreated.id;

  let { threadFromDb, origin } = await getExistingThread(rootPostId);
  let thread: Thread|null = null;
  if (threadFromDb) { thread = new Thread().fromDB(threadFromDb) }

  // If no thread exists, create a new one and update the post's `is_root` field
  if (!threadFromDb) {
    thread = await createThread({ rootPostId, postId });
    if (thread) {
      await updatePostAsRoot(rootPostId);
    };
  }
  // If a thread exists and the post being responded to is its root, update the thread with the posts data
  else if (thread && origin === "fromRoot") {
    await updateThreadWithPostData({ threadId: thread.id, postId });
  }
  // If a parent thread exists, but not one for the post being responded to, do the following: fetch all ancestor threads, create a new thread, update the post's `is_root` field, and update ancestor threads with new thread id.
  else if (thread && origin === "fromReply") {
    const parentThread = new Thread(thread);
    const parentAncestorThreads = await getAncestorThreads(thread);
    const ancestorThreads = [parentThread, ...(parentAncestorThreads || [])];
    thread = await createThread({ rootPostId, postId, parentThread });
    if (thread) {
      await Promise.all([
        updatePostAsRoot(rootPostId),
        updateAncestorThreadsWithThreadData({ ancestorThreads, thread })
      ]);
    };
  }
  else {
    console.log(`Unexpected origin and thread combination, origin: ${origin}, thread: `, thread);
  }
  
  // ToDo: Handle error in postInsert SQL
  return Response.json({ id: thread?.id }, { status: 201 });
};

const getExistingThread = async (postId: string):
  Promise<{ threadFromDb: ThreadFromDBInterface|null, origin: "fromRoot"|"fromReply"|null }> => (
  Promise.all([
    getExistingThreadFromRoot(postId),
    getExistingThreadFromReply(postId)
  ]).then(([existingThreadFromRoot, existingThreadFromReply]) => {
    if (existingThreadFromRoot) return { threadFromDb: existingThreadFromRoot, origin: "fromRoot" };
    if (existingThreadFromReply) return { threadFromDb: existingThreadFromReply, origin: "fromReply" };
    return { threadFromDb: null, origin: null };
  })
);

const getExistingThreadFromRoot = async (rootPostId: string) => {
  const existingThreads = await sqlMiddleware(sql`
    SELECT * FROM threads
    WHERE root_post_id = ${sql`${rootPostId}::uuid`};
  `, "existingThreadFromRoot", { rootPostId });
  return existingThreads[0];
};

const getExistingThreadFromReply = async (postId: string) => {
  const existingThreads = await sqlMiddleware(sql`
    SELECT * FROM threads
    WHERE ${sql`${postId}::uuid`} = ANY(post_ids);
  `, "existingThreadFromReply", { postId });
  return existingThreads[0];
};

const getAncestorThreads = async (thread: Thread) => {
  if ((thread.ancestorThreadIds || []).length === 0) return [];
  const ancestorThreads = await sqlMiddleware(sql`
    SELECT * FROM threads
    WHERE id = ANY(${toUuidArrayLiteral(thread.ancestorThreadIds)});
  `, "ancestorThreads", { ancestorThreadIds: thread.ancestorThreadIds });
  return ancestorThreads;
};

const createThread = async (args: {
  rootPostId: string,
  postId: string,
  parentThread?: Thread
}): Promise<Thread|null> => {
  const { rootPostId, postId, parentThread } = args;
  
  
  const ancestorThreadIds = parentThread
    ? [...(parentThread.ancestorThreadIds || []), parentThread.id]
    : null;
  
  const threadInsertResult = await sqlMiddleware(sql`
    INSERT INTO threads (
      root_post_id, post_ids, depth, ancestor_thread_ids
    ) VALUES (
      ${sql`${rootPostId}::uuid`},
      ${toUuidArrayLiteral([postId])},
      ${(parentThread?.depth || 0) + 1},
      ${ancestorThreadIds
        ? toUuidArrayLiteral(ancestorThreadIds)
        : "NULL"}
    )
    RETURNING *;
  `, "threadInsert", { rootPostId, postId, parentThread });
  if (threadInsertResult[0]) return new Thread().fromDB(threadInsertResult[0])
  return null;
};

const updatePostAsRoot = async (rootPostId: string) => {
  const updatePostAsRootResult = await sqlMiddleware(sql`
    UPDATE posts
    SET is_root = true
    WHERE id = ${sql`${rootPostId}::uuid`};
  `, "updatePostAsRoot", { rootPostId });
  return updatePostAsRootResult;
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
};

const updateAncestorThreadsWithThreadData = async (args: {
  ancestorThreads: Thread[],
  thread: Thread
}) => {
  const { ancestorThreads, thread } = args;
  if ((ancestorThreads || []).length === 0) return null;
  
  const updateAncestorThreadsWithThreadDataResult = await sqlMiddleware(sql`
    UPDATE threads
    SET descendent_thread_ids = ARRAY_APPEND(descendent_thread_ids, ${sql`${thread.id}::uuid`})
    WHERE id = ANY(${toUuidArrayLiteral(ancestorThreads.map((at) => at.id))});
  `, "updateAncestorThreadsWithThreadData", { ancestorThreads, thread });

  return updateAncestorThreadsWithThreadDataResult
};

export default handleReplyNew;