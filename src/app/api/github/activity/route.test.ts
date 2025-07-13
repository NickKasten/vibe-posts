import { GET } from './route';

// Mock fetch and supabaseClient
const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('../../../../lib/storage/supabase', () => ({
  supabaseClient: {
    from: jest.fn()
  },
  decrypt: (token: string) => token.replace('encrypted:', ''),
}));

import { supabaseClient } from '../../../../lib/storage/supabase';
const mockSupabaseClient = supabaseClient as jest.Mocked<typeof supabaseClient>;

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('GET /api/github/activity', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockSupabaseClient.from.mockReset();
  });

  describe('Input validation', () => {
    it('returns 400 if user_id is missing', async () => {
      const req = { url: 'http://localhost/api/github/activity' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/Missing user_id/);
    });

    it('returns 400 if user_id is empty string', async () => {
      const req = { url: 'http://localhost/api/github/activity?user_id=' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/Missing user_id/);
    });
  });

  describe('Token retrieval', () => {
    it('returns 404 if no token found for user', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: null })
            })
          })
        })
      });

      const req = { url: 'http://localhost/api/github/activity?user_id=123' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toMatch(/Token not found/);
    });

    it('returns 404 if Supabase query fails', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: null, 
                error: { message: 'Connection timeout' } 
              })
            })
          })
        })
      });

      const req = { url: 'http://localhost/api/github/activity?user_id=123' } as Request;
      const res = await GET(req);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toMatch(/Token not found/);
      expect(body.details).toBe('Connection timeout');
    });
  });

  describe('GitHub API interaction', () => {
    beforeEach(() => {
      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { encrypted_token: 'encrypted:gho_token123' }, 
                error: null 
              })
            })
          })
        })
      });
    });

    it('fetches user events from GitHub API', async () => {
      const mockEvents = [
        { type: 'PushEvent', created_at: '2023-01-01T00:00:00Z', repo: { name: 'user/repo' } }
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents
      });
      
      const req = { url: 'http://localhost/api/github/activity?user_id=112522991' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/user/events',
        { headers: { Authorization: 'Bearer gho_token123' } }
      );
      
      const body = await res.json();
      expect(body.activity).toEqual(mockEvents);
    });

    it('returns 502 if GitHub token is invalid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Bad credentials' })
      });
      
      const req = { url: 'http://localhost/api/github/activity?user_id=112522991' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toMatch(/Failed to fetch GitHub activity/);
    });

    it('returns 502 if GitHub API rate limit exceeded', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ 
          message: 'API rate limit exceeded',
          documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
        })
      });
      
      const req = { url: 'http://localhost/api/github/activity?user_id=112522991' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toMatch(/Failed to fetch GitHub activity/);
    });

    it('returns 502 for other GitHub API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' })
      });
      
      const req = { url: 'http://localhost/api/github/activity?user_id=112522991' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toMatch(/Failed to fetch GitHub activity/);
    });

    it('handles malformed JSON from GitHub API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Unexpected token in JSON'); }
      });
      
      const req = { url: 'http://localhost/api/github/activity?user_id=112522991' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/Internal server error/);
    });

    it('handles network errors to GitHub API', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const req = { url: 'http://localhost/api/github/activity?user_id=112522991' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/Internal server error/);
      expect(body.details).toMatch(/Network error/);
    });
  });

  describe('Response formatting', () => {
    beforeEach(() => {
      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { encrypted_token: 'encrypted:gho_token123' }, 
                error: null 
              })
            })
          })
        })
      });
    });

    it('returns empty array for user with no activity', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });
      
      const req = { url: 'http://localhost/api/github/activity?user_id=112522991' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.activity).toEqual([]);
    });

    it('handles large activity datasets', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        type: 'PushEvent',
        created_at: `2023-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
        repo: { name: `user/repo${i}` }
      }));
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => largeDataset
      });
      
      const req = { url: 'http://localhost/api/github/activity?user_id=112522991' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.activity).toHaveLength(100);
    });

    it('preserves event structure from GitHub API', async () => {
      const complexEvent = {
        id: '12345',
        type: 'PushEvent',
        actor: { id: 112522991, login: 'testuser' },
        repo: { id: 123, name: 'testuser/repo' },
        payload: {
          push_id: 12345,
          size: 1,
          distinct_size: 1,
          ref: 'refs/heads/main',
          head: 'abc123',
          before: 'def456',
          commits: [{ sha: 'abc123', message: 'Test commit' }]
        },
        public: true,
        created_at: '2023-01-01T00:00:00Z'
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [complexEvent]
      });
      
      const req = { url: 'http://localhost/api/github/activity?user_id=112522991' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.activity[0]).toEqual(complexEvent);
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { encrypted_token: 'encrypted:gho_token123' }, 
                error: null 
              })
            })
          })
        })
      });
    });

    it('handles special characters in user_id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });
      
      const req = { url: 'http://localhost/api/github/activity?user_id=test%2Buser' } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(200);
    });

    it('handles very large user IDs', async () => {
      const largeUserId = '999999999999999999';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });
      
      const req = { url: `http://localhost/api/github/activity?user_id=${largeUserId}` } as Request;
      const res = await GET(req);
      
      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/user/events',
        expect.any(Object)
      );
    });

    it('handles corrupted encrypted token', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { encrypted_token: 'corrupted_token' }, 
                error: null 
              })
            })
          })
        })
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });
      
      const req = { url: 'http://localhost/api/github/activity?user_id=112522991' } as Request;
      const res = await GET(req);
      
      // Should still work since decrypt function handles it
      expect(res.status).toBe(200);
    });
  });
});