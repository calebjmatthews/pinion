export default class User {
  id: string = '';
  createdAt: Date = new Date();
  firstName: string = '';
  lastName: string = '';
  bio: string = '';
  imageId?: string;

  constructor(user?: UserInterface) {
    if (user) Object.assign(this, user);
  };

  fromDB(userFromDB: UserFromDBInterface) {
    const { created_at, first_name, last_name, image_id } = userFromDB;
    return new User({
      ...userFromDB,
      createdAt: created_at,
      firstName: first_name,
      lastName: last_name,
      imageId: image_id
    });
  }

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

export interface UserFromDBInterface {
  id: string ;
  created_at: Date;
  first_name: string;
  last_name: string;
  bio: string;
  image_id?: string;
}