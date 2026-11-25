import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';

/** The signed-in user, as returned by the login API. */
export type UserCredential = {
  id: number;
  userName: string;
  email: string;
  companyId: number;
  agentId: number;
  agentName: string | null;
  companyName: string | null;
  roles: string[];
};

/** Successful response from POST /user/login. */
export type LoginResponse = {
  token: string;
  refreshToken: string;
  expiration: number;
  credential: UserCredential;
  isChenvelStaff: boolean;
};

/** A login failure with a message that is safe to show the user. */
export class LoginError extends Error {}

export async function loginRequest(userName: string, password: string): Promise<LoginResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      // Location isn't used yet, so the API gets 0, 0.
      body: JSON.stringify({ userName, password, latitude: 0, longitude: 0 }),
      signal: controller.signal,
    });
  } catch {
    throw new LoginError(
      controller.signal.aborted
        ? 'The server took too long to respond. Please try again.'
        : 'Can’t reach the server. Check your internet connection and try again.',
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // Wrong password: 404 with a plain-text message such as "Username or Password is incorrect!".
    // An unknown username currently makes the server fail with a 500 and an internal error message,
    // which is not useful to show, so 5xx gets a general message instead.
    const text = readMessage(await response.text().catch(() => ''));
    if (response.status < 500 && text && text.length < 200) throw new LoginError(text);
    throw new LoginError(
      response.status >= 500
        ? 'Couldn’t log in. Check your username and password, or try again later.'
        : 'Username or Password is incorrect!',
    );
  }

  const data = (await response.json().catch(() => null)) as LoginResponse | null;
  if (!data?.token || !data.credential) throw new LoginError('Unexpected response from the server. Please try again.');
  return data;
}


/** Error bodies come as plain text or, when JSON is requested, as a quoted JSON string. */
function readMessage(body: string): string {
  const text = body.trim();
  if (text.startsWith('"')) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'string') return parsed.trim();
    } catch {}
  }
  return text;
}
