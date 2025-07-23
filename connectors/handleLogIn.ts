import { sql, type BunRequest } from "bun";
import bcrypt from "bcrypt";

import User from "../models/user";
import sqlMiddleware from "../utils/sql_middleware";

const handleLogIn = async (request: BunRequest) => {
  const requestBody = await request.json();
  const { email, handle } = requestBody;
  const usersRaw = await sqlMiddleware(sql`
    SELECT
      id, created_at, last_logged_in, handle, email, password, first_name, last_name, custom_name, bio, image_id
    FROM users WHERE email = ${requestBody.email} OR handle = ${requestBody.handle};
  `, "usersRaw", { email, handle });
  const user = usersRaw[0] && new User().fromDB(usersRaw[0]);
  if (user) {
    const passwordMatches = bcrypt.compareSync(requestBody.password, user.password);
    if (passwordMatches) {
      return await logInSuccess({ request, user });
    }
    else {
      // ToDo: Handle wrong password
    }
  }
  else {
    return Response.json({ message: "No matching user" }, { status: 204 });
  }

  return new Response("OK");
};

const logInSuccess = async (args: { request: BunRequest, user: User }) => {
  const { request, user } = args;
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

  return Response.json({ message: "Logged in" }, { status: 202 });
};

export default handleLogIn;