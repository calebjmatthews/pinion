const handleApiRequest = (request: Request) => {
  console.log(`Received request:`, request);
  return new Response("OK");
};

export default handleApiRequest;