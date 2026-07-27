import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

test("AnimePreview renders voice actor images inside a scrollable character list", async () => {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });

  try {
    const { default: AnimePreview } = await server.ssrLoadModule("/src/components/AnimePreview.jsx");
    const html = renderToStaticMarkup(
      React.createElement(AnimePreview, {
        anime: {
          id: "52991",
          title_en: "Frieren",
          title_native: "葬送のフリーレン",
          title_romaji: "Sousou no Frieren",
          characters: [
            {
              name: "Frieren",
              photo: "https://example.test/character.jpg",
              role: "Main",
              voice_actors: [
                {
                  name: "Tanezaki, Atsumi",
                  photo: "https://example.test/voice-actor.jpg",
                  country: "Japan",
                },
              ],
            },
          ],
        },
      }),
    );

    assert.match(html, /character-preview-scroll/);
    assert.match(html, /Native Title/);
    assert.match(html, /葬送のフリーレン/);
    assert.match(html, /voice-actor-img/);
    assert.match(html, /https:\/\/example\.test\/voice-actor\.jpg/);
  } finally {
    await server.close();
  }
});
