export default class User {
  id: string = '';
  createdAt: Date = new Date();
  firstName: string = '';
  lastName: string = '';
  bio: string = '';
  imageId?: string;

  constructor(user: UserInterface) {
    Object.assign(this, user);
  };

  getName() {
    return `${this.firstName} ${this.lastName}`;
  };
};

interface UserInterface {
  id: string ;
  createdAt: Date;
  firstName: string;
  lastName: string;
  bio: string;
  imageId?: string;
}