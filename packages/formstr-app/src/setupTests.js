require("@testing-library/jest-dom");

if (typeof global.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  global.crypto = webcrypto;
}

if (typeof global.WebSocket === 'undefined') {
  try {
    global.WebSocket = require('ws');
  } catch (e) {
    console.warn('ws package not installed. Install it with "npm install --save-dev ws" for WebSocket support in tests.');
  }
}

if (typeof global.MessageChannel === 'undefined') {
  try {
    global.MessageChannel = require('worker_threads').MessageChannel;
  } catch (e) {
    console.warn('worker_threads.MessageChannel not available. Some packages may not work as expected.');
  }
}

const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}