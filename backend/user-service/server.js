import http from "http";
import index from "./index.js";
import dotenv from "dotenv";
import { connectToDB } from "./model/repository.js";

// Load environment variables from multiple .env files (priority order)
// Later files won't override variables already set by earlier files
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.prod" });
dotenv.config({ path: ".env.dev" });
dotenv.config({ path: ".env" });

console.log("Starting user service...");
console.log("Environment:", process.env.ENV);
console.log("Port:", process.env.PORT || 3001);

const port = process.env.PORT || 3001;
const server = http.createServer(index);

console.log("Attempting to connect to MongoDB...");

await connectToDB().then(() => {
  console.log("MongoDB Connected!");

  server.listen(port);
  console.log("User service server listening on http://localhost:" + port);
}).catch((err) => {
  console.error("Failed to connect to DB");
  console.error(err);
  process.exit(1);
});

