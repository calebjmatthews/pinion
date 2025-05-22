export default class User {
  id: string = '';
  createdAt: Date = new Date();
  lastLoggedIn: Date = new Date();
  handle: string = '';
  email: string = '';
  password?: string;
  firstName?: string;
  lastName?: string;
  customName?: string;
  bio: string = '';
  imageId?: string;

  constructor(user?: UserInterface) {
    if (user) Object.assign(this, user);
  };

  fromDB(userFromDB: UserFromDBInterface) {
    const { id, created_at, last_logged_in, handle, email, first_name, last_name, custom_name, bio, image_id } = userFromDB;
    const user = new User({
      id,
      createdAt: created_at,
      lastLoggedIn: last_logged_in,
      handle,
      email,
      bio
    });
    if (first_name) user.firstName = first_name;
    if (last_name) user.lastName = last_name;
    if (custom_name) user.customName = custom_name;
    if (image_id) user.imageId = image_id;
    
    return user;
  };

  getName() {
    if (this.customName) return this.customName;
    if (this.firstName && this.lastName) return `${this.firstName} ${this.lastName}`;
    return this.handle;
  };
};

interface UserInterface {
  id: string ;
  createdAt: Date;
  lastLoggedIn: Date;
  handle: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  customName?: string;
  bio: string;
  imageId?: string;
};

export interface UserFromDBInterface {
  id: string ;
  created_at: Date;
  last_logged_in: Date;
  handle: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  custom_name?: string;
  bio: string;
  image_id?: string;
};