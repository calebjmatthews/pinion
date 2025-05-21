import postCreate from "./connectors/postCreate";

const handleApiRequest = async (request: Request) => {
  const requestBody = await request.json();

  const path = (request.url || '').split('/api/')[1];
  switch(path) {
    case 'post_new':
      return postCreate(requestBody);

    default:
      return Response.json({ message: "Not found" }, { status: 404 });
  }
};

export default handleApiRequest;