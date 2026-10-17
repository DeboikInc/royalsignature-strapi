export function isSameOriginRequest(request) {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).origin !== request.nextUrl.origin) return false;
    } catch {
      return false;
    }
  }
  return request.headers.get('sec-fetch-site') !== 'cross-site';
}

export async function readJsonObject(request, maximumBytes = 16384) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return { error: 'Content-Type must be application/json', status: 415 };
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).length > maximumBytes) {
    return { error: 'Request body is too large', status: 413 };
  }

  let value;
  try {
    value = JSON.parse(body);
  } catch {
    return { error: 'Invalid JSON request body', status: 400 };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { error: 'Request body must be a JSON object', status: 400 };
  }
  return { value };
}
