import { sql, type CookieMap } from "bun";
import bcrypt from "bcrypt";

import User from "../models/user";

const getUserFromSession = async (requestCookies: CookieMap) => {
  console.log(`requestCookies`, requestCookies);
  const user_id = requestCookies.get("user_id");
  const session_id = requestCookies.get("session_id");

  const sessions = await sql`
    SELECT
      id, user_id, created_at, last_used_at, expires_at
    FROM sessions WHERE user_id=${user_id}
      AND expires_at > now()
      AND created_at + make_interval(secs => 31557600) > now();
  `;

  if (sessions[0]?.id && user_id && session_id) {
    const sessionMatches = bcrypt.compareSync(session_id, sessions[0].id);
    if (sessionMatches) {
      return await handleSessionMatchSuccess({ user_id, session_id });
    };
  };
  
  // ToDo: Handle invalid cookie
};

const handleSessionMatchSuccess = async (args: { user_id: string, session_id: string }) => {
  const { user_id, session_id } = args;
  const usersRaw = await sql`
    SELECT
      id, handle, first_name, last_name, custom_name, image_id
    FROM users WHERE id=${user_id};
  `;
  if (usersRaw[0].id && session_id) {
    const sessionIdHashed = bcrypt.hashSync(session_id, 11);
    const refreshSessionResult = await sql`
      UPDATE sessions 
      SET last_used_at = now(),
        expires_at = now() + make_interval(secs => 86400)
      WHERE id = ${sessionIdHashed};
    `;
    console.log(`refreshSessionResult`, refreshSessionResult);
    return new User().fromDB(usersRaw[0]);
    // ToDo: Hanldle refresh session failure, set last_logged_in for user
  }
};

export default getUserFromSession;