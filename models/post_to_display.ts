export default class PostToDisplay {
  id: string = '';
  userId: string = '';
  userName: string = '';
  userThumbnail?: string;
  createdAt: Date = new Date();
  text: string = '';

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
  text: string;
};