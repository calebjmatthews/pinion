import Bun, { type BunRequest } from "bun";
import { Eta } from "eta";
import path from "path";

import postsGet from "./connectors/postsGet";
import handleApiRequest from "./connectors/handleApiRequest";
import handleLogIn from "./connectors/handleLogIn";
import handleSignUp from "./connectors/handleSignUp";
import getUserFromSession from "./connectors/getUserFromSession";

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