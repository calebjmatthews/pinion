import Bun from 'bun';
import { Eta } from "eta";
import path from "path";

const eta = new Eta({ views: path.join(__dirname, "templates") });

const server = Bun.serve({
  port: 3000,
  routes: {
    // Static routes
    "/api/status": new Response("OK"),
    "/*": () => new Response(
      eta.render("./simple", { names: ["Carb", "Erm", "Haruki", "Mazel"] }), 
      { headers: { "Content-Type": "text/html" } }
    )
  }
});

console.log(`Listening on http://localhost:${server.port} ...`);