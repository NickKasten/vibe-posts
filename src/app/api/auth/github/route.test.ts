import { GET } from './route';

// Mock fetch and supabaseClient
const mockFetch = jest.fn();
global.fetch = mockFetch;
const mockUpsert = jest.fn();
jest.mock('../../../../lib/storage/supabase', () => ({
  supabaseClient: { from: () => ({ upsert: mockUpsert }) },
  encrypt: (token: string) => `encrypted:${token}`,
}));

describe('GET /api/auth/github', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockUpsert.mockReset();
  });

  it('returns 400 if code is missing', async () => {
    const req = { url: 'http://localhost/api/auth/github' } as Request;
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Missing code/);
  });

  it('returns 500 if token exchange fails', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({}), ok: true });
    const req = { url: 'http://localhost/api/auth/github?code=badcode' } as Request;
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/Failed to get access token/);
  });

  it('returns 500 if user profile fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ access_token: 'token' }), ok: true });
    mockFetch.mockResolvedValueOnce({ ok: false });
    const req = { url: 'http://localhost/api/auth/github?code=goodcode' } as Request;
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/Failed to fetch GitHub user profile/);
  });

  it('returns 500 if githubUserId is missing', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ access_token: 'token' }), ok: true });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const req = { url: 'http://localhost/api/auth/github?code=goodcode' } as Request;
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/GitHub user ID not found/);
  });

  it('returns 500 if Supabase upsert fails', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ access_token: 'token' }), ok: true });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 123 }) });
    mockUpsert.mockResolvedValueOnce({ error: { message: 'fail' } });
    const req = { url: 'http://localhost/api/auth/github?code=goodcode' } as Request;
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/Failed to store token/);
  });

  it('returns 200 and githubUserId on success', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ access_token: 'token' }), ok: true });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 123 }) });
    mockUpsert.mockResolvedValueOnce({});
    const req = { url: 'http://localhost/api/auth/github?code=goodcode' } as Request;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.githubUserId).toBe(123);
  });
}); 