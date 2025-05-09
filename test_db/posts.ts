import { v4 as uuidv4 } from "uuid";
import Post from "../models/post";

const posts = [
  new Post({
    id: uuidv4(),
    userId: 'carb',
    createdAt: new Date(),
    text: "This is the first post on Pinion (working title) #OpenSource #Pinion"
  }),
  new Post({
    id: uuidv4(),
    userId: 'carb',
    createdAt: new Date(),
    text: "Pinion has no AI, no ads, no monetization, and your data is in your control. #Pinion"
  }),
];

export default posts;