import { sql, type BunRequest } from "bun";

const handlePostReply = async (request: BunRequest) => {
  const requestBody = await request.json();

  console.log(`requestBody`, requestBody);
};

export default handlePostReply;