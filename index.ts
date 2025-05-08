import Bun from "bun";
import { Eta } from "eta";
import path from "path";

import posts from "./test_db/posts";

const eta = new Eta({ views: path.join(__dirname, "templates") });

const server = Bun.serve({
  port: 3000,
  routes: {
    // Static routes
    "/api/status": new Response("OK"),
    "/*": () => new Response(
      eta.render("./index", { title: "Posts on Pinion", posts }), 
      { headers: { "Content-Type": "text/html" } }
    )
  }
});

console.log(`Listening on http://localhost:${server.port} ...`);