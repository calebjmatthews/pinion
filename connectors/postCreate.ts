import { sql, type BunRequest } from "bun";

import getUserFromSession from "./getUserFromSession";

const postCreate = async (request: BunRequest, options?: { body: string, isReply: boolean }) => {
  const postBody = options?.body || await request.json();
  // const hashtags = extractHashtags(postBody);
  const user = await getUserFromSession(request.cookies);

  // ToDo: Handle missing user
  if (!user) return Response.json({ message: "User not found" }, { status: 404 });

  const postInsertResult = await sql`
    INSERT INTO posts (
      user_id, body, is_reply
    ) VALUES (
      ${user.id},
      ${postBody},
      ${!!options?.isReply}
    ) RETURNING id;
  `;

  // ToDo: Handle error in postInsert SQL
  return Response.json({ id: postInsertResult[0].id }, { status: 201 });
};

// const extractHashtags = (text: string): string[] => {
//   const regex = /#([^\s#.,!?;:()'"`]+)(?=[\s.,!?;:()'"`]|$)/g;
//   const matches: string[] = [];
//   let match: RegExpExecArray | null;

//   while ((match = regex.exec(text)) !== null) {
//     if (match[1]) matches.push(match[1]);
//   }

//   return matches;
// }

export default postCreate;