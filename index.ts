import Bun, { type BunRequest } from "bun";
import { Eta } from "eta";
import path from "path";

import postsGet from "./services/postsGet";
import handleApiRequest from "./services/handleApiRequest";
import handleLogIn from "./services/handleLogIn";
import handleSignUp from "./services/handleSignUp";
import getUserFromSession from "./services/getUserFromSession";

await Bun.build({
  entrypoints: ['./styles.ts', './scripts.ts'],
  outdir: './out',
});

const eta = new Eta({ views: path.join(__dirname, "views") });

const server = Bun.serve({
  port: 3000,
  websocket: { message: () => {} },
  routes: {
    "/api/status": new Response("OK"),

    "/styles.css": new Response(
      await Bun.file("./out/styles.css").bytes(),
      { headers: { "Content-Type": "text/css" } }
    ),

    "/scripts.js": new Response(
      await Bun.file("./out/scripts.js").bytes(),
      { headers: { "Content-Type": "text/javascript" } }
    ),

    "/log_in": {
      POST: async (request) => handleLogIn(request)
    },

    "/sign_up": {
      POST: async (request) => handleSignUp(request)
    },

    "/api/*": {
      POST: async (request) => handleApiRequest(request)
    },

    "/": async (request: BunRequest) => {
      const user = await getUserFromSession(request.cookies);
      const posts = await postsGet();
      return new Response(
        eta.render("./pages/index", { title: "Pinion", posts, user }), 
        { headers: { "Content-Type": "text/html" } }
      );
    },

    "/*": () => {
      return Response.json({ message: "Not found" }, { status: 404 });
    } 
  }
});

console.log(`Listening on http://localhost:${server.port} ...`);