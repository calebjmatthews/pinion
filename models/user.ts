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
  bio?: string = '';
  imageId?: string;

  constructor(user?: UserInterface) {
    if (user) Object.assign(this, user);
  };

  fromDB(userFromDB: UserFromDBInterface) {
    const { handle, email, password, first_name, last_name, custom_name, bio, image_id } = userFromDB;
    const user = new User({
      id: userFromDB.id || '',
      createdAt: userFromDB.created_at || new Date(),
      lastLoggedIn: userFromDB.last_logged_in || new Date(),
      handle,
      email
    });
    
    if (password) user.password = password;
    if (first_name) user.firstName = first_name;
    if (last_name) user.lastName = last_name;
    if (custom_name) user.customName = custom_name;
    if (bio) user.bio = bio;
    if (image_id) user.imageId = image_id;
    
    return user;
  };

  toDB(user: User) {
    const { id, createdAt, lastLoggedIn, handle, email, password, firstName, lastName, customName, bio, imageId } = user;
    const userFromDB: UserFromDBInterface = { handle, email, password: password || '' };

    if (id) userFromDB.id = id;
    if (createdAt) userFromDB.created_at = createdAt;
    if (lastLoggedIn) userFromDB.last_logged_in = lastLoggedIn;
    if (firstName) userFromDB.first_name = firstName;
    if (lastName) userFromDB.last_name = lastName;
    if (customName) userFromDB.custom_name = customName;
    if (bio) userFromDB.bio = bio;
    if (imageId) userFromDB.image_id = imageId;
    
    return userFromDB;
  }

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
  bio?: string;
  imageId?: string;
};

export interface UserFromDBInterface {
  id?: string ;
  created_at?: Date;
  last_logged_in?: Date;
  handle: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  custom_name?: string;
  bio?: string;
  image_id?: string;
};