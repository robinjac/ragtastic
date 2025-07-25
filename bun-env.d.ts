// Generated by `bun init`

declare module "*.svg" {
  /**
   * A path to the SVG file
   */
  const path: `${string}.svg`;
  export = path;
}

interface Message {
  id: number,
  role: "user" | "assistant";
  content: string;
}
