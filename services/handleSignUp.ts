import { sql, type BunRequest } from "bun";
import bcrypt from "bcrypt";

import User from "../models/user";
import sqlMiddleware from "../utils/sql_middleware";

const handleSignUp = async (request: BunRequest) => {
  const requestBody = await request.json();

  const user = new User(requestBody);
  const userToDB = user.toDB(requestBody);
  delete userToDB.id;
  userToDB.password = bcrypt.hashSync(userToDB.password, 11);

  const userInsertResult = await sqlMiddleware(sql`
    INSERT INTO users ${sql(userToDB)}
    RETURNING id;
  `, "userInsertResult", { userToDB });

  // ToDo: Handle user insertion failure

  user.id = userInsertResult[0].id;
  delete user.password;

  await sqlMiddleware(sql`
    DELETE FROM sessions WHERE user_id = ${user.id};
  `, "clearSessions", { "user.id": user.id });
  // ToDo: Handle error in deleting existing sessions

  const sessionId = crypto.randomUUID();
  const sessionIdHashed = bcrypt.hashSync(sessionId, 11);
  await sqlMiddleware(sql`
    INSERT INTO sessions (
      id, user_id
    ) VALUES (
      ${sessionIdHashed},
      ${user.id}
    ) RETURNING id;
  `, "insertSession", { sessionIdHashed, "user.id": user.id });
  // ToDo: Handle error in creating new session
  const cookieOptions = { httpOnly: true, secure: true, maxAge: 86400 };
  request.cookies.set("session_id", sessionId, cookieOptions);
  request.cookies.set("user_id", user.id, cookieOptions);

  return Response.json({ message: "User record created" }, { status: 202 });
};

export default handleSignUp;