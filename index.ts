import Bun from "bun";
import { Eta } from "eta";
import path from "path";

import postsGet from "./connectors/postsGet";
import handleApiRequest from "./api/handleApiRequest";

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

    "/api/*": {
      POST: async (request) => handleApiRequest(request)
    },

    "/*": async () => {
      const posts = await postsGet();
      return new Response(
        eta.render("./pages/index", { title: "Posts on Pinion", posts }), 
        { headers: { "Content-Type": "text/html" } }
      );
    } 
  }
});

console.log(`Listening on http://localhost:${server.port} ...`);