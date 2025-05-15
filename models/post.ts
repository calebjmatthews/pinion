export default class Post {
  id: string = '';
  userId: string = '';
  createdAt: Date = new Date();
  body: string = '';

  constructor(post?: PostInterface) {
    if (post) Object.assign(this, post);
  };

  fromDB(postFromDB: PostFromDBInterface) {
    const { user_id, created_at } = postFromDB;
    return new Post({
      ...postFromDB,
      userId: user_id,
      createdAt: created_at
    });
  }
};

interface PostInterface {
  id: string;
  userId: string;
  createdAt: Date;
  body: string;
};

export interface PostFromDBInterface {
  id: string;
  user_id: string;
  created_at: Date;
  body: string;
}