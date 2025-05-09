import Bun from "bun";
import { Eta } from "eta";
import path from "path";

import postsGet from "./connectors/postsGet";

const eta = new Eta({ views: path.join(__dirname, "views") });

const server = Bun.serve({
  port: 3000,
  routes: {
    "/api/status": new Response("OK"),
    "/*": () => {
      const posts = postsGet();
      return new Response(
        eta.render("./pages/index", { title: "Posts on Pinion", posts }), 
        { headers: { "Content-Type": "text/html" } }
      );
    } 
  }
});

console.log(`Listening on http://localhost:${server.port} ...`);