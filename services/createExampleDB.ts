import { sql } from "bun";
import { v4 as uuid } from "uuid";

import shakespeareObj from "../example";
import User from "../models/user";
import Thread from "../models/thread";
import Post from "../models/post";
import sqlMiddleware from "../utils/sql_middleware";

const createExampleDB = async () => {
  const lines = shakespeareObj.filter((line) => !line.index);
  if (!lines[0]) return;

  const speakers = lines.map((line) => line.speaker).filter((value, index, self) => (
    self.indexOf(value) === index
  ));

  const users = speakers.map((name) => new User({
    id: name,
    createdAt: new Date(),
    lastLoggedIn: new Date(),
    handle: name,
    email: `${name}@shakespeare.bard`,
    password: name
  }));
  await Promise.all(users.map(async (user) => {
    const userToDb = new User().toDB(user);
    const insertResult = await sqlMiddleware(sql`
      INSERT INTO users ${sql(userToDb)}
      RETURNING id;
    `, "userInsert", { userToDb });
    return insertResult[0];
  }));
  
  const createdAt = new Date();
  createdAt.setUTCHours(new Date().getUTCHours() - 1);
  let currentPost = createPostFromLine({ line: lines[0], createdAt, isRoot: true, isReply: false });
  const posts: Post[] = [];
  let currentThread = createThreadFromPost({ post: currentPost, createdAt });
  createdAt.setUTCSeconds(new Date().getUTCSeconds() + lines[0].text_entry.length);
  let currentThreadGroup: Thread[] = [];
  const threadGroups: Thread[][] = [];
  let lastLine: Line  = lines[0];
  
  lines.slice(1).forEach((line) => {
    // If current speaker is different from last and current speaker is STAGE:
    // finish post, discard currrent thread, and add thread group to thread groups.
    if (line.speaker !== lastLine.speaker && line.speaker === "STAGE") {
      currentPost.isRoot = false;
      posts.push(currentPost);
      threadGroups.push([...currentThreadGroup]);
      currentThreadGroup = [];
      currentPost = createPostFromLine({ line, createdAt, isRoot: true, isReply: false });
      currentThread = createThreadFromPost({ post: currentPost, createdAt });
    }

    // If current speaker is different from last: finish post, create thread, and add to thread group.
    else if (line.speaker !== lastLine.speaker) {
      posts.push(currentPost);
      currentThread.postIds = [`${line.line_id}`];
      currentThreadGroup.push(currentThread);
      currentPost = createPostFromLine({ line, createdAt, isRoot: true, isReply: true });
      currentThread = createThreadFromPost({ post: currentPost, createdAt });
    }

    // Otherwise, if current speaker is the same as the last, simply add text to body
    else {
      currentPost.body = `${currentPost.body} \/ ${line.text_entry}`;
    };

    createdAt.setUTCSeconds(createdAt.getUTCSeconds() + line.text_entry.length);
    lastLine = line;
  });

  currentPost.isRoot = false;
  posts.push(currentPost);
  threadGroups.push([...currentThreadGroup]);

  const threads: Thread[] = [];
  threadGroups.forEach((threadGroup) => {
    const threadIds: string[] = threadGroup.map((thread) => thread.id);
    threadGroup.forEach((thread, depth) => {
      threads.push(new Thread({
        ...thread,
        ancestorThreadIds: threadIds.slice(0, depth),
        descendentThreadIds: threadIds.slice(depth+1),
        depth
      }));
    });
  });

  const postsToDB = posts.map((post) => new Post().toDB(post));
  await sqlMiddleware(sql`
    INSERT INTO posts ${sql(postsToDB)}
    RETURNING id;
  `, "postsInsert", { postsToDBLength: postsToDB.length });

  const threadsToDB = threads.map((thread) => new Thread().toDB(thread));
  await sqlMiddleware(sql`
    INSERT INTO threads ${sql(threadsToDB)}
    RETURNING id;
  `, "threadsInsert", { threadsToDBLength: threadsToDB.length });

  return new Response(`Inserted ${users.length} users, ${postsToDB.length} posts, and ${threadsToDB.length} threads.`);
};

const createThreadFromPost = (args: {
  post: Post,
  createdAt: Date
}) => {
  const { post, createdAt } = args;
  return new Thread({
    id: uuid(),
    rootPostId: post.id,
    postIds: [],
    ancestorThreadIds: [],
    descendentThreadIds: [],
    depth: 0,
    createdAt: new Date(createdAt),
    lastAddedTo: new Date()
  });
};

const createPostFromLine = (args: {
  line: Line,
  createdAt: Date,
  isRoot: boolean,
  isReply: boolean
}) => {
  const { line, createdAt, isRoot, isReply } = args;
  return new Post({
    id: `${line.line_id}`,
    userId: line.speaker,
    createdAt: new Date(createdAt),
    body: line.text_entry,
    isRoot,
    isReply
  });
};

interface Line {
  line_id: number,
  play_name: string,
  speech_number: number,
  line_number: string,
  speaker: string,
  text_entry: string
};

export default createExampleDB;