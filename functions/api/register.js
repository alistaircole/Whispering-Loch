// POST /api/register
// Expects JSON body: { name, email, country, season, genre, consent }
// Requires a D1 binding named DB (set up in Cloudflare Pages settings).

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const name = (body.name || "").trim().slice(0, 200);
  const email = (body.email || "").trim().slice(0, 200);
  const country = (body.country || "").trim().slice(0, 200);
  const season = (body.season || "").trim().slice(0, 50);
  const genre = (body.genre || "").trim().slice(0, 50);
  const consent = body.consent ? 1 : 0;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return json({ error: "A valid email address is required." }, 400);
  }
  if (!season || !genre) {
    return json({ error: "Please choose a season and genre preference." }, 400);
  }
  if (!consent) {
    return json({ error: "Please confirm you're happy to be contacted." }, 400);
  }

  try {
    await env.DB.prepare(
      `INSERT INTO registrations (name, email, country, season_pref, genre_pref, marketing_consent)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(name, email, country, season, genre, consent)
      .run();
  } catch (err) {
    return json({ error: "Something went wrong saving your details. Please try again." }, 500);
  }

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
