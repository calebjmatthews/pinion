import { sql, type CookieMap } from "bun";
import bcrypt from "bcrypt";

import User from "../models/user";
import sqlMiddleware from '../utils/sql_middleware';

const getUserFromSession = async (requestCookies: CookieMap) => {
  const user_id = requestCookies.get("user_id");
  const session_id = requestCookies.get("session_id");

  const sessions = await sqlMiddleware(sql`
    SELECT
      id, user_id, created_at, last_used_at, expires_at
    FROM sessions WHERE user_id=${user_id}
      AND expires_at > now()
      AND created_at + make_interval(secs => 31557600) > now();
  `, 'sessions', { user_id });

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
  const usersFromDB = await sqlMiddleware(sql`
    SELECT
      id, handle, first_name, last_name, custom_name, image_id
    FROM users WHERE id=${user_id};
  `, 'usersFromDB', { user_id });
  if (usersFromDB[0].id && session_id) {
    const sessionIdHashed = bcrypt.hashSync(session_id, 11);
    await sqlMiddleware(sql`
      UPDATE sessions 
      SET last_used_at = now(),
        expires_at = now() + make_interval(secs => 86400)
      WHERE id = ${sessionIdHashed};
    `, 'refreshSession', { sessionIdHashed });
    return new User().fromDB(usersFromDB[0]);
    // ToDo: Hanldle refresh session failure, set last_logged_in for user
  }
};

export default getUserFromSession;