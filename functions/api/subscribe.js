const SYSTEME_TAG_ID = 2149789; // coffee-leads (Java Burn funnel)

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const email = (formData.get('email') || '').trim().toLowerCase();
    const name  = (formData.get('name')  || '').trim();

    if (!email) {
      return Response.redirect(new URL('/merci.html', request.url).toString(), 302);
    }

    const headers = {
      'X-API-KEY': env.SYSTEME_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    let contactId = null;

    // Step 1: create contact
    const createRes = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, firstName: name }),
    });

    if (createRes.ok) {
      const contact = await createRes.json();
      contactId = contact.id;
    } else {
      // Contact already exists (409) — look it up by email
      const lookupRes = await fetch(
        `https://api.systeme.io/api/contacts?email=${encodeURIComponent(email)}`,
        { method: 'GET', headers }
      );
      if (lookupRes.ok) {
        const data = await lookupRes.json();
        if (data.items && data.items.length > 0) {
          contactId = data.items[0].id;
        }
      }
    }

    // Step 2: add tag (always, even for existing contacts)
    if (contactId) {
      await fetch(`https://api.systeme.io/api/contacts/${contactId}/tags`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tagId: SYSTEME_TAG_ID }),
      });
    }

  } catch (_) {
    // silent — always redirect
  }

  return Response.redirect(new URL('/merci.html', request.url).toString(), 302);
}
