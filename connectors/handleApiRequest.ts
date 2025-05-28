import { type BunRequest } from 'bun';
import postCreate from "./postCreate";

const handleApiRequest = async (request: BunRequest) => {
  const path = (request.url || '').split('/api/')[1];
  
  switch(path) {
    case 'post_new':
      return await postCreate(request);

    default:
      return Response.json({ message: "Not found" }, { status: 404 });
  }
};

export default handleApiRequest;