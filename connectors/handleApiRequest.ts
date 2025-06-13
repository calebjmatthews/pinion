import { type BunRequest } from 'bun';
import postCreate from "./postCreate";
import handleReplyNew from "./handleReplyNew";

const handleApiRequest = async (request: BunRequest) => {
  const path = (request.url || '').split('/api/')[1];
  
  switch(path) {
    case 'post_new':
      return await postCreate(request);

    case 'reply_new':
      return await handleReplyNew(request);

    default:
      return Response.json({ message: "Not found" }, { status: 404 });
  }
};

export default handleApiRequest;