import { sql, type BunRequest } from "bun";

import getUserFromSession from "./getUserFromSession";

const postCreate = async (request: BunRequest) => {
  const postBody = await request.json();
  const hashtags = extractHashtags(postBody);
  const user = await getUserFromSession(request.cookies);

  if (user) {
    const postInsertResult = await sql`
      INSERT INTO posts (
        id, user_id, created_at, body, hashtags
      ) VALUES (
        gen_random_uuid(),
        ${user.id},
        now(),
        ${postBody},
        ARRAY[${hashtags}]
      ) RETURNING id;
    `;

    // ToDo: Handle error in postInsert SQL
    return Response.json({ id: postInsertResult[0].id }, { status: 201 });
  }

  // ToDo: Handle missing user
  return Response.json({ message: "User not found" }, { status: 404 });
  
};

const extractHashtags = (text: string): string[] => {
  const regex = /#([^\s#.,!?;:()'"`]+)(?=[\s.,!?;:()'"`]|$)/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) matches.push(match[1]);
  }

  return matches;
}

export default postCreate;