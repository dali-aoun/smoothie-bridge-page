const TAG_ID = 2149789; // smoothie-leads
const REDIRECT_URL = 'https://smoothie.thehappy-healthy-life.com/merci';

async function addTag(apiKey, contactId) {
  await fetch(`https://api.systeme.io/api/contacts/${contactId}/tags`, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId: TAG_ID }),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.SYSTEME_API_KEY;

  try {
    const formData = await request.formData();
    const email = (formData.get('email') || '').trim().toLowerCase();
    const name  = (formData.get('name')  || '').trim();

    if (!email || !email.includes('@')) {
      return Response.redirect(REDIRECT_URL, 303);
    }

    // 1. Create contact
    const body = { email };
    if (name) body.firstName = name;

    const createRes = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (createRes.ok) {
      const contact = await createRes.json();
      await addTag(apiKey, contact.id);
    } else if (createRes.status === 409) {
      // Contact exists — find by email and tag
      const searchRes = await fetch(
        `https://api.systeme.io/api/contacts?email=${encodeURIComponent(email)}`,
        { headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' } }
      );
      if (searchRes.ok) {
        const data = await searchRes.json();
        const contactId = data?.items?.[0]?.id;
        if (contactId) await addTag(apiKey, contactId);
      }
    }

  } catch (err) {
    console.error('subscribe error:', err);
  }

  return Response.redirect(REDIRECT_URL, 303);
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
