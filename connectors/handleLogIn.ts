import { sql, type BunRequest } from "bun";
import bcrypt from "bcrypt";

import User from "../models/user";

const handleLogIn = async (request: BunRequest) => {
  const requestBody = await request.json();
  const usersRaw = await sql`
    SELECT
      id, created_at, last_logged_in, handle, email, password, first_name, last_name, custom_name, bio, image_id
    FROM users WHERE email = ${requestBody.email} OR handle = ${requestBody.handle};
  `;
  const user = usersRaw[0] && new User().fromDB(usersRaw[0]);
  if (user) {
    console.log(`user matched:`, user);
    const passwordMatches = bcrypt.compareSync(requestBody.password, user.password);
    console.log(`passwordMatches: `, passwordMatches);
    if (passwordMatches) {
      return await logInSuccess({ request, user });
    }
    else {
      // ToDo: Handle wrong password
    }
  }
  else {
    // ToDo: Handle no matching user found
  }

  return new Response("OK");
};

const logInSuccess = async (args: { request: BunRequest, user: User }) => {
  const { request, user } = args;
  delete user.password;

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
    ) RETURNING ID;
  `;
  console.log(`sessionResult`, sessionResult);
  const cookieOptions = { httpOnly: true, secure: true, maxAge: 86400 };
  request.cookies.set("session_id", sessionId, cookieOptions);
  request.cookies.set("user_id", user.id, cookieOptions);

  return new Response("Logged in");
};

export default handleLogIn;