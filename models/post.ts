export default class Post {
  id: string = '';
  userId: string = '';
  createdAt: Date = new Date();
  text: string = '';

  constructor(post: PostInterface) {
    Object.assign(this, post);
  };
};

interface PostInterface {
  id: string;
  userId: string;
  createdAt: Date;
  text: string;
};