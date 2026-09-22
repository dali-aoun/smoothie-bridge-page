const SYSTEME_TAG_ID = 2149789; // smoothie-leads â†’ Java Burn Email Sequence

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

    // Step 1: create or update contact
    const res = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, firstName: name }),
    });

    if (res.ok) {
      const contact = await res.json();
      // Step 2: add smoothie-leads tag (triggers Java Burn Email Sequence)
      await fetch(`https://api.systeme.io/api/contacts/${contact.id}/tags`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tagId: SYSTEME_TAG_ID }),
      });
    }

  } catch (_) {
    // silent â€” always redirect
  }

  return Response.redirect(new URL('/merci.html', request.url).toString(), 302);
}
