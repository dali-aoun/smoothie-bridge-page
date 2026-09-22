export async function onRequestPost(context) {
  const { request, env } = context;
  const formData = await request.formData();
  const email = (formData.get('email') || '').trim().toLowerCase();
  const apiKey = env.SYSTEME_API_KEY;
  const log = { email, hasKey: !!apiKey, keyLen: apiKey ? apiKey.length : 0 };

  try {
    const res = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, firstName: 'debugtest' }),
    });
    const text = await res.text();
    log.status = res.status;
    log.body = text.substring(0, 200);
  } catch (e) {
    log.error = e.message;
  }

  return new Response(JSON.stringify(log, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
