import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ACTIVE_CONNECTION_KEY,
  CONNECTION_PROFILES_KEY,
  LEGACY_CONNECTION_KEYS,
  loadConnectionState,
  normalizeConnectionUrl,
  saveConnectionState
} from './connectionStorage.js';

function createStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    key(index) {
      return Array.from(store.keys())[index] || null;
    },
    get length() {
      return store.size;
    },
    snapshot() {
      return Object.fromEntries(store);
    }
  };
}

test('normalizes Camunda REST URLs for stable profile matching', () => {
  assert.equal(
    normalizeConnectionUrl('  http://localhost:8080/engine-rest  '),
    'http://localhost:8080/engine-rest/'
  );
  assert.equal(
    normalizeConnectionUrl('http://localhost:8080/engine-rest///'),
    'http://localhost:8080/engine-rest/'
  );
  assert.equal(normalizeConnectionUrl(''), '');
});

test('migrates legacy URL and auth keys into deduplicated profiles', () => {
  const localStorage = createStorage({
    lastUrl: 'http://localhost:8080/engine-rest',
    listOfUrl: JSON.stringify([
      'http://localhost:8080/engine-rest/',
      'http://camunda.example.com/engine-rest'
    ]),
    urllist: JSON.stringify([
      { name: 'http://camunda.example.com/engine-rest/' },
      { name: 'http://another.example.com/rest' }
    ]),
    restAuthArray: JSON.stringify([
      {
        url: 'http://camunda.example.com/engine-rest/',
        type: 'Bearer',
        JWT: 'saved-token',
        date: '2026-07-03T10:00:00.000Z'
      }
    ])
  });
  const sessionStorage = createStorage();

  const state = loadConnectionState({ localStorage, sessionStorage });

  assert.equal(state.activeProfile.url, 'http://localhost:8080/engine-rest/');
  assert.deepEqual(
    state.profiles.map(profile => profile.url).sort(),
    [
      'http://another.example.com/rest/',
      'http://camunda.example.com/engine-rest/',
      'http://localhost:8080/engine-rest/'
    ]
  );
  assert.equal(
    state.profiles.find(profile => profile.url === 'http://camunda.example.com/engine-rest/').auth.token,
    'saved-token'
  );
});

test('saves session auth outside local profile storage unless remember is enabled', () => {
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const state = loadConnectionState({ localStorage, sessionStorage });

  const [profile] = state.profiles;
  profile.auth = {
    enabled: true,
    type: 'Basic',
    username: 'demo',
    password: 'secret',
    token: '',
    remember: false
  };
  saveConnectionState({ ...state, profiles: [profile] }, { localStorage, sessionStorage });

  const stored = JSON.parse(localStorage.getItem(CONNECTION_PROFILES_KEY));
  assert.equal(stored.profiles[0].auth.password, '');
  assert.equal(sessionStorage.getItem(`excamad.connectionAuth.v1.${profile.id}`), JSON.stringify({
    username: 'demo',
    password: 'secret',
    token: ''
  }));

  profile.auth.remember = true;
  saveConnectionState({ ...state, profiles: [profile] }, { localStorage, sessionStorage });
  const remembered = JSON.parse(localStorage.getItem(CONNECTION_PROFILES_KEY));
  assert.equal(remembered.profiles[0].auth.password, 'secret');
});

test('clear removes new and legacy connection keys', () => {
  const localStorage = createStorage({
    [CONNECTION_PROFILES_KEY]: '{}',
    [ACTIVE_CONNECTION_KEY]: 'abc',
    lastUrl: 'http://legacy',
    listOfUrl: '[]',
    urllist: '[]',
    restAuthArray: '[]',
    restUsername: 'demo'
  });
  const sessionStorage = createStorage({
    'excamad.connectionAuth.v1.abc': '{}'
  });

  saveConnectionState({ profiles: [], activeConnectionId: null, clearAll: true }, { localStorage, sessionStorage });

  for (const key of [CONNECTION_PROFILES_KEY, ACTIVE_CONNECTION_KEY, ...LEGACY_CONNECTION_KEYS]) {
    assert.equal(localStorage.getItem(key), null);
  }
  assert.equal(sessionStorage.length, 0);
});
