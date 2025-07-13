require('@testing-library/jest-dom');

// Only add polyfills if they don't exist (for jsdom environment)
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Add Request and Response for API tests in Node environment
if (typeof global.Request === 'undefined') {
  // Simple Request/Response polyfill for tests
  global.Request = class MockRequest {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || 'GET';
      this.headers = options.headers || {};
      this._body = options.body;
    }
    
    async json() {
      if (this._body) {
        return JSON.parse(this._body);
      }
      throw new Error('Invalid JSON');
    }
  };
  
  global.Response = class MockResponse {
    constructor(body, options = {}) {
      this._body = body;
      this.status = options.status || 200;
      this.headers = options.headers || {};
    }
    
    async json() {
      return JSON.parse(this._body);
    }
  };
} 