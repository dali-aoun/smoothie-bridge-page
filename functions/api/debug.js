export async function onRequestPost(context) {
  const { request, env } = context;
  const formData = await request.formData();
  const email = (formData.get('email') || 'debug@test.com').trim().toLowerCase();
  const apiKey = env.SYSTEME_API_KEY;
  const log = { email, keyLen: apiKey ? apiKey.length : 0, steps: [] };

  const headers = {
    'X-API-KEY': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    // Step 1: create
    const r1 = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST', headers,
      body: JSON.stringify({ email, firstName: 'dbg' }),
    });
    const t1 = await r1.text();
    log.steps.push({ step: 'create', status: r1.status, body: t1.substring(0, 150) });

    let contactId = null;
    if (r1.ok) {
      contactId = JSON.parse(t1).id;
    } else {
      // lookup
      const r2 = await fetch(`https://api.systeme.io/api/contacts?email=${encodeURIComponent(email)}`, { method: 'GET', headers });
      const t2 = await r2.text();
      log.steps.push({ step: 'lookup', status: r2.status, body: t2.substring(0, 150) });
      const d2 = JSON.parse(t2);
      if (d2.items && d2.items.length > 0) contactId = d2.items[0].id;
    }

    log.contactId = contactId;

    // Step 2: tag
    if (contactId) {
      const r3 = await fetch(`https://api.systeme.io/api/contacts/${contactId}/tags`, {
        method: 'POST', headers,
        body: JSON.stringify({ tagId: 2149789 }),
      });
      const t3 = await r3.text();
      log.steps.push({ step: 'tag', status: r3.status, body: t3.substring(0, 100) });
    }
  } catch (e) {
    log.error = e.message;
  }

  return new Response(JSON.stringify(log, null, 2), { headers: { 'Content-Type': 'application/json' } });
}
