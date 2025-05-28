import { sql, type BunRequest } from "bun";
import bcrypt from "bcrypt";

import User from "../models/user";

const handleSignUp = async (request: BunRequest) => {
  const requestBody = await request.json();

  const user = new User(requestBody);
  const userFromDB = user.toDB(requestBody);
  delete userFromDB.id;
  userFromDB.password = bcrypt.hashSync(userFromDB.password, 11);
  console.log(`userFromDB`, userFromDB);

  const userInsertResult = await sql`
    INSERT INTO users ${sql(userFromDB)}
    RETURNING id;
  `;
  console.log(`userInsertResult`, userInsertResult);

  // ToDo: Handle user insertion failure

  user.id = userInsertResult[0].id;
  delete user.password;

  const clearSessionsResult = await sql`
    DELETE FROM sessions WHERE user_id = ${user.id};
  `;
  // ToDo: Handle error in deleting existing sessions
  console.log(`clearSessionsResult`, clearSessionsResult);

  const sessionId = crypto.randomUUID();
  const sessionIdHashed = bcrypt.hashSync(sessionId, 11);
  const sessionResult = await sql`
    INSERT INTO sessions (
      id, user_id, created_at, last_used_at, expires_at
    ) VALUES (
      ${sessionIdHashed},
      ${user.id},
      now(),
      now(),
      now() + make_interval(secs => 86400)
    ) RETURNING id;
  `;
  console.log(`sessionResult`, sessionResult);
  // ToDo: Handle error in creating new session
  const cookieOptions = { httpOnly: true, secure: true, maxAge: 86400 };
  request.cookies.set("session_id", sessionId, cookieOptions);
  request.cookies.set("user_id", user.id, cookieOptions);

  return Response.json({ message: "User record created" }, { status: 202 });
};

export default handleSignUp;