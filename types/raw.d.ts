// Files imported with ?raw arrive as their text (Vite does this natively in tests; next.config.mjs adds the same for the build).
declare module "*?raw" {
  const content: string;
  export default content;
}
