import { sql } from "bun";

const extractHashtags = (text: string): string[] => {
  const regex = /#([^\s#.,!?;:()'"`]+)(?=[\s.,!?;:()'"`]|$)/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) matches.push(match[1]);
  }

  return matches;
}

const postCreate = async (postBody: string) => {
  const hashtags = extractHashtags(postBody);

  const postInsertResult = await sql`
    INSERT INTO posts (
      id, user_id, created_at, body, hashtags
    ) VALUES (
      gen_random_uuid(),
      '3ffbb9f4-dc69-4617-b576-a271e45bc4b6',
      now(),
      ${postBody},
      ARRAY[${hashtags}]
    ) RETURNING id;
  `;
  return Response.json({ id: postInsertResult[0].id }, { status: 201 });
};

export default postCreate;