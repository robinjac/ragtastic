import { pipeline } from "@huggingface/transformers";

let generator;

async function initializeGenerator() {
  try {
    generator = await pipeline("text-generation", "gpt-neox-20b");
  } catch (error) {
    console.error("Failed to initialize pipeline:", error);
    throw error;
  }
}

async function brainstormCompanyNames(prompt, count=5) {
  if (!generator) {
    throw new Error("Generator not initialized");
  }
  
  const resp = await generator(`${prompt}\nCompany name ideas:\n`, {
    max_new_tokens: 50
  });

  const lines = resp[0].generated_text
    .split("\n")
    .map(x => x.trim())
    .filter(x => x && x.length < 40);

  return lines.slice(0, count);
}

// main execution
async function main() {
  try {
    await initializeGenerator();
    const ideas = await brainstormCompanyNames(
      "Tech startup in eco-friendly logistics"
    );
    console.log("Ideas:", ideas);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
