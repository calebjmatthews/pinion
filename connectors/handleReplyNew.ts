import { sql, type BunRequest } from "bun";

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

  let thread: any = await getExistingThread(rootPostId);

  if (!thread) {
    thread = await createThread({ rootPostId, postId });
    await updatePostWithThreadData({ rootPostId, threadId: thread.id });
  }

  console.log(`thread`, thread);
  
  // ToDo: Handle error in postInsert SQL
  return Response.json({ id: thread[0]?.id }, { status: 201 });
};

const getExistingThread = async (rootPostId: string) => {
  return null;
};

const createThread = async (args: {
  rootPostId: string,
  postId: string
}) => {
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
  return updatePostWithThreadDataResult[0];
};

// const getPostsFromThread = async (postIds: string[]) => {
  
// };

export default handleReplyNew;