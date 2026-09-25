export async function onRequestGet(context) {
  const { env } = context;
  const apiKey = env.SYSTEME_API_KEY;

  try {
    const res = await fetch('https://api.systeme.io/api/tags?limit=50', {
      headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' },
    });
    const data = await res.json();
    return new Response(JSON.stringify(data, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
