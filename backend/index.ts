import { serve } from "bun";
import { fileURLToPath } from "url";
import path from "path";
import {
  getLlama,
  LlamaChatSession,
  resolveModelFile,
} from "node-llama-cpp";

import index from "../frontend/index.html";

// Setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDir = path.join(__dirname, "..", "models");

// Url to download model, if not present in model folder
const modelUri = "hf:mradermacher/NileChat-3B-ft-base-GGUF:Q4_K_M";

console.log("Starting up Nile Chat");

const llama = await getLlama();
const model = await llama.loadModel({
  modelPath: await resolveModelFile(modelUri, modelsDir),
});
const context = await model.createContext();

const session = new LlamaChatSession({
  contextSequence: context.getSequence(),
});

// In-memory messages
const messages: Message[] = [];

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/messages": {
      async POST(req) {
        const { role, content } = (await req.json()) as Message;

        if (!role || !content) {
          return new Response("Missing role or content", { status: 400 });
        }

        // Add user message
        const userMessage: Message = {
          id: messages.length + 1,
          role: "user",
          content,
        };

        messages.push(userMessage);

        // Send to LLM
        const llmResponse = await session.prompt(content);

        const aiMessage: Message = {
          id: messages.length + 1,
          role: "assistant",
          content: llmResponse.trim(),
        };

        messages.push(aiMessage);

        return Response.json({
          success: true,
          messages,
        });
      },
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
