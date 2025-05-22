import { sql } from "bun";
import bcrypt from "bcrypt";

import User from "../models/user";

const handleLogIn = async (request: Request) => {
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
      return await logInSuccess(user);
    }
    else {
      // Handle wrong password
    }
  }
  else {
    // Handle no matching user found
  }

  return new Response("OK");
};

const logInSuccess = async (user: User) => {
  delete user.password;

  const sessionId = crypto.randomUUID();
  const sessionResult = await sql`
    INSERT INTO sessions (
      id, user_id, created_at, last_used_at, expires_at
    ) VALUES (
      ${sessionId},
      ${user.id},
      now(),
      now(),
      now() + make_interval(secs => 86400)
    ) RETURNING ID;
  `;
  console.log(`sessionResult`, sessionResult);

  return new Response("Logged in", {
    headers: {
      "Set-Cookie": `session=${sessionId}; HttpOnly; Secure; Path=/; Max-Age=86400`
    }
  });
};

export default handleLogIn;