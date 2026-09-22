export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const name  = formData.get('name') || '';

    if (!email) {
      return Response.redirect(new URL('/merci.html', request.url).toString(), 302);
    }

    await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: {
        'X-AUTH-TOKEN': env.SYSTEME_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        firstName: name.trim(),
        tags: ['coffee-leads'],
      }),
    });

  } catch (_) {
    // silent â€” redirect regardless
  }

  return Response.redirect(new URL('/merci.html', request.url).toString(), 302);
}
