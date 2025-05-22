import Bun, { type BunRequest } from "bun";
import { Eta } from "eta";
import path from "path";

import postsGet from "./connectors/postsGet";
import handleApiRequest from "./connectors/handleApiRequest";
import handleLogIn from "./connectors/handleLogIn";
import getUserFromSession from "./connectors/getUserFromSession";

await Bun.build({
  entrypoints: ['./styles.ts', './scripts.ts'],
  outdir: './out',
});

const eta = new Eta({ views: path.join(__dirname, "views") });

const server = Bun.serve({
  port: 3000,
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

    "/api/*": {
      POST: async (request) => handleApiRequest(request)
    },

    "/": async (request: BunRequest) => {
      console.log(`request headers:`, request.headers);
      const authenticatedUser = await getUserFromSession(request.cookies);
      console.log(`authenticatedUser`, authenticatedUser);
      const posts = await postsGet();
      return new Response(
        eta.render("./pages/index", { title: "Posts on Pinion", posts, user: authenticatedUser }), 
        { headers: { "Content-Type": "text/html" } }
      );
    },

    "/*": () => {
      return Response.json({ message: "Not found" }, { status: 404 });
    } 
  }
});

console.log(`Listening on http://localhost:${server.port} ...`);