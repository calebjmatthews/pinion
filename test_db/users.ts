import User from "../models/user";

const users: { [userId: string] : User } = {
  'carb': new User({
    id: 'carb',
    createdAt: new Date(),
    firstName: 'Caleb',
    lastName: 'Matthews',
    bio: 'Creator of Pinion. Loves cocktails, canoes, and cats.'
  })
};

export default users;