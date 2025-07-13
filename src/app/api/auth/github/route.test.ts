import { GET } from './route';

// Mock fetch and supabaseClient
const mockFetch = jest.fn();
global.fetch = mockFetch;
const mockUpsert = jest.fn();
jest.mock('../../../../lib/storage/supabase', () => ({
  supabaseClient: { from: () => ({ upsert: mockUpsert }) },
  encrypt: (token: string) => `encrypted:${token}`,
}));

// Mock console.log and console.error to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('GET /api/auth/github', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockUpsert.mockReset();
  });

  describe('Input validation', () => {
    it('returns 400 if code is missing', async () => {
      const req = { url: 'http://localhost/api/auth/github' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/Missing code/);
    });

    it('returns 400 if code is empty string', async () => {
      const req = { url: 'http://localhost/api/auth/github?code=' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/Missing code/);
    });
  });

  describe('GitHub token exchange', () => {
    it('returns 500 if token exchange fails with no access_token', async () => {
      mockFetch.mockResolvedValueOnce({ 
        json: async () => ({ error: 'invalid_grant' }), 
        ok: true,
        status: 200
      });
      const req = { url: 'http://localhost/api/auth/github?code=badcode' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/Failed to get access token/);
      expect(body.details).toEqual({ error: 'invalid_grant' });
    });

    it('returns 500 if token exchange throws network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const req = { url: 'http://localhost/api/auth/github?code=networkfail' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/Internal server error/);
      expect(body.details).toMatch(/Network error/);
    });

    it('includes debug information in token exchange failure', async () => {
      mockFetch.mockResolvedValueOnce({ 
        json: async () => ({ error: 'invalid_client' }), 
        ok: true,
        status: 401
      });
      const req = { url: 'http://localhost/api/auth/github?code=badcode' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.debug).toMatchObject({
        status: 401,
        clientIdPresent: expect.any(Boolean),
        clientSecretPresent: expect.any(Boolean),
        redirectUri: expect.any(String)
      });
    });
  });

  describe('GitHub user profile fetch', () => {
    it('returns 500 if user profile fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({ 
        json: async () => ({ access_token: 'gho_validtoken123' }), 
        ok: true 
      });
      mockFetch.mockResolvedValueOnce({ 
        ok: false,
        status: 401
      });
      const req = { url: 'http://localhost/api/auth/github?code=goodcode' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/Failed to fetch GitHub user profile/);
    });

    it('returns 500 if user profile has no ID', async () => {
      mockFetch.mockResolvedValueOnce({ 
        json: async () => ({ access_token: 'gho_validtoken123' }), 
        ok: true 
      });
      mockFetch.mockResolvedValueOnce({ 
        ok: true, 
        json: async () => ({ login: 'testuser' }) // Missing id field
      });
      const req = { url: 'http://localhost/api/auth/github?code=goodcode' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/GitHub user ID not found/);
    });

    it('handles user profile with zero ID', async () => {
      mockFetch.mockResolvedValueOnce({ 
        json: async () => ({ access_token: 'gho_validtoken123' }), 
        ok: true 
      });
      mockFetch.mockResolvedValueOnce({ 
        ok: true, 
        json: async () => ({ id: 0 }) // ID is 0 (falsy)
      });
      const req = { url: 'http://localhost/api/auth/github?code=goodcode' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/GitHub user ID not found/);
    });
  });

  describe('Database operations', () => {
    const setupSuccessfulMocks = () => {
      mockFetch.mockResolvedValueOnce({ 
        json: async () => ({ access_token: 'gho_validtoken123' }), 
        ok: true 
      });
      mockFetch.mockResolvedValueOnce({ 
        ok: true, 
        json: async () => ({ id: 112522991, login: 'testuser' }) 
      });
    };

    it('returns 500 if Supabase upsert fails with non-duplicate error', async () => {
      setupSuccessfulMocks();
      mockUpsert.mockResolvedValueOnce({ 
        error: { message: 'connection timeout' } 
      });
      const req = { url: 'http://localhost/api/auth/github?code=goodcode' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/Failed to store token/);
      expect(body.details).toBe('connection timeout');
    });

    it('handles duplicate key error gracefully', async () => {
      setupSuccessfulMocks();
      mockUpsert.mockResolvedValueOnce({ 
        error: { message: 'duplicate key value violates unique constraint "user_tokens_user_id_provider_key"' } 
      });
      const req = { url: 'http://localhost:3001/api/auth/github?code=goodcode' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(302); // Redirect
      expect(res.headers.get('location')).toContain('auth=success');
      expect(res.headers.get('location')).toContain('user=112522991');
    });

    it('calls upsert with correct parameters', async () => {
      setupSuccessfulMocks();
      mockUpsert.mockResolvedValueOnce({ error: null });
      const req = { url: 'http://localhost:3001/api/auth/github?code=goodcode' } as Request;
      await GET(req);
      
      expect(mockUpsert).toHaveBeenCalledWith({
        user_id: '112522991',
        provider: 'github',
        encrypted_token: 'encrypted:gho_validtoken123',
        github_user_id: 112522991
      });
    });
  });

  describe('Successful flow', () => {
    it('redirects to home page with auth success params', async () => {
      mockFetch.mockResolvedValueOnce({ 
        json: async () => ({ access_token: 'gho_validtoken123' }), 
        ok: true 
      });
      mockFetch.mockResolvedValueOnce({ 
        ok: true, 
        json: async () => ({ id: 112522991 }) 
      });
      mockUpsert.mockResolvedValueOnce({ error: null });
      
      const req = { url: 'http://localhost:3001/api/auth/github?code=goodcode' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(302);
      const location = res.headers.get('location');
      expect(location).toContain('http://localhost:3001/');
      expect(location).toContain('auth=success');
      expect(location).toContain('user=112522991');
    });

    it('handles large GitHub user IDs correctly', async () => {
      const largeUserId = 999999999999;
      mockFetch.mockResolvedValueOnce({ 
        json: async () => ({ access_token: 'gho_validtoken123' }), 
        ok: true 
      });
      mockFetch.mockResolvedValueOnce({ 
        ok: true, 
        json: async () => ({ id: largeUserId }) 
      });
      mockUpsert.mockResolvedValueOnce({ error: null });
      
      const req = { url: 'http://localhost:3001/api/auth/github?code=goodcode' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toContain(`user=${largeUserId}`);
      expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: largeUserId.toString(),
        github_user_id: largeUserId
      }));
    });
  });

  describe('Edge cases', () => {
    it('handles malformed JSON in token response', async () => {
      mockFetch.mockResolvedValueOnce({ 
        json: async () => { throw new Error('Unexpected token in JSON'); },
        ok: true 
      });
      const req = { url: 'http://localhost/api/auth/github?code=badjson' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/Internal server error/);
    });

    it('handles malformed JSON in user profile response', async () => {
      mockFetch.mockResolvedValueOnce({ 
        json: async () => ({ access_token: 'gho_validtoken123' }), 
        ok: true 
      });
      mockFetch.mockResolvedValueOnce({ 
        ok: true,
        json: async () => { throw new Error('Unexpected token in JSON'); }
      });
      const req = { url: 'http://localhost/api/auth/github?code=badjson2' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/Internal server error/);
    });

    it('handles GitHub API rate limiting', async () => {
      mockFetch.mockResolvedValueOnce({ 
        json: async () => ({ access_token: 'gho_validtoken123' }), 
        ok: true 
      });
      mockFetch.mockResolvedValueOnce({ 
        ok: false,
        status: 403,
        json: async () => ({ message: 'API rate limit exceeded' })
      });
      const req = { url: 'http://localhost/api/auth/github?code=ratelimited' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/Failed to fetch GitHub user profile/);
    });
  });
}); 