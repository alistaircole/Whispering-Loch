// GET /api/entries
// Requires header: x-admin-password matching the ADMIN_PASSWORD environment variable
// (set this in Cloudflare Pages > Settings > Environment variables).

export async function onRequestGet(context) {
  const { request, env } = context;

  const providedPassword = request.headers.get("x-admin-password") || "";
  if (!env.ADMIN_PASSWORD || providedPassword !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, name, email, country, group_size, season_pref, genre_pref, marketing_consent, created_at
       FROM registrations ORDER BY created_at DESC`
    ).all();

    return new Response(JSON.stringify({ entries: results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Could not load entries." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
