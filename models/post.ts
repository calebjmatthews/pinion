import Thread from "./thread";

export default class Post {
  id: string = '';
  userId: string = '';
  createdAt: Date = new Date();
  body: string = '';
  isRoot: boolean = false;
  isReply: boolean = false;
  thread?: Thread;

  constructor(post?: PostInterface) {
    if (post) Object.assign(this, post);
  };

  fromDB(postFromDB: PostFromDBInterface) {
    const { user_id, created_at, is_root, is_reply } = postFromDB;
    return new Post({
      ...postFromDB,
      userId: user_id,
      createdAt: created_at,
      isRoot: is_root,
      isReply: is_reply
    });
  };
};

interface PostInterface {
  id: string;
  userId: string;
  createdAt: Date;
  body: string;
  isRoot: boolean;
  isReply: boolean;
};

export interface PostFromDBInterface {
  id: string;
  user_id: string;
  created_at: Date;
  body: string;
  is_root: boolean;
  is_reply: boolean;
}