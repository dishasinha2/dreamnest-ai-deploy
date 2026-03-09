export async function openaiResponse({ input }) {
  const apiKey = process.env.GROQ_API_KEY;
  const textModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const visionModel = process.env.GROQ_VISION_MODEL || "llama-3.2-90b-vision-preview";
  const fallback = (message) => ({ output_text: message });

  if (!apiKey) {
    return fallback("GROQ_API_KEY not set. Please add it in backend/.env.");
  }

  // Convert OpenAI Responses-style input to chat.completions format
  const hasImage = Array.isArray(input) && input.some(m =>
    Array.isArray(m.content) && m.content.some(c => c.type === "input_image")
  );

  let messages = [];
  if (Array.isArray(input)) {
    messages = input.map(m => {
      if (Array.isArray(m.content)) {
        return {
          role: m.role,
          content: m.content.map(c => {
            if (c.type === "input_text") return { type: "text", text: c.text };
            if (c.type === "input_image") return { type: "image_url", image_url: { url: c.image_url } };
            return { type: "text", text: String(c.text || "") };
          })
        };
      }
      return { role: m.role, content: m.content };
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22000);

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: hasImage ? visionModel : textModel,
        messages
      })
    });

    if (!r.ok) {
      const t = await r.text();
      return fallback(
        `AI temporarily unavailable (model issue). ${t.slice(0, 120)}`
      );
    }
    const data = await r.json();
    const output_text = data?.choices?.[0]?.message?.content || "";
    return { output_text };
  } catch {
    return fallback(
      "AI request timed out or failed. Please try again."
    );
  } finally {
    clearTimeout(timer);
  }
}
