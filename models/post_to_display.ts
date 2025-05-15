export default class PostToDisplay {
  id: string = '';
  userId: string = '';
  userName: string = '';
  userThumbnail?: string;
  createdAt: Date = new Date();
  body: string = '';

  constructor(postToDisplay: PostToDisplayInterface) {
    Object.assign(this, postToDisplay);
  };
};

interface PostToDisplayInterface {
  id: string;
  userId: string;
  userName: string;
  userThumbnail?: string;
  createdAt: Date;
  body: string;
};