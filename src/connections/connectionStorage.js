export const CONNECTION_PROFILES_KEY = 'excamad.connectionProfiles.v1';
export const ACTIVE_CONNECTION_KEY = 'excamad.activeConnectionId';
export const SESSION_AUTH_PREFIX = 'excamad.connectionAuth.v1.';
export const DEFAULT_CONNECTION_URL = 'http://localhost:8080/engine-rest/';

export const LEGACY_CONNECTION_KEYS = [
  'lastUrl',
  'listOfUrl',
  'urllist',
  'restAuthArray',
  'enableRestPassword',
  'restBearerToken',
  'restPassword',
  'restUsername',
  'selectedRestType'
];

function browserLocalStorage() {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

function browserSessionStorage() {
  return typeof sessionStorage === 'undefined' ? null : sessionStorage;
}

function readJson(storage, key, fallback) {
  if (!storage) {
    return fallback;
  }
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(storage, key, value) {
  if (storage) {
    storage.setItem(key, JSON.stringify(value));
  }
}

function nowIso() {
  return new Date().toISOString();
}

export function normalizeConnectionUrl(value) {
  const withoutSpaces = String(value || '').replace(/\s+/g, '').trim();
  if (!withoutSpaces) {
    return '';
  }
  return withoutSpaces.replace(/\/+$/, '') + '/';
}

function profileIdFromUrl(url) {
  const normalized = normalizeConnectionUrl(url) || DEFAULT_CONNECTION_URL;
  const slug = normalized
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `profile-${slug || 'default'}`;
}

export function inferConnectionEnvironment(url) {
  const normalized = normalizeConnectionUrl(url).toLowerCase();
  if (!normalized) {
    return 'Unknown';
  }
  if (normalized.includes('localhost') || normalized.includes('127.0.0.1')) {
    return 'Local';
  }
  if (normalized.includes('test') || normalized.includes('dev')) {
    return 'Test';
  }
  if (normalized.includes('prod') || normalized.includes('bpm-cloud')) {
    return 'Production';
  }
  return 'Unknown';
}

export function createConnectionProfile(url, overrides = {}) {
  const normalizedUrl = normalizeConnectionUrl(url) || DEFAULT_CONNECTION_URL;
  let displayName = normalizedUrl;
  try {
    const parsed = new URL(normalizedUrl);
    displayName = `${parsed.host}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    displayName = normalizedUrl.replace(/\/$/, '');
  }

  const currentTime = nowIso();
  return {
    id: overrides.id || profileIdFromUrl(normalizedUrl),
    name: overrides.name || displayName,
    url: normalizedUrl,
    environment: overrides.environment || inferConnectionEnvironment(normalizedUrl),
    createdAt: overrides.createdAt || currentTime,
    updatedAt: overrides.updatedAt || currentTime,
    temporary: Boolean(overrides.temporary),
    auth: normalizeAuth(overrides.auth)
  };
}

function normalizeAuth(auth = {}) {
  return {
    enabled: Boolean(auth.enabled),
    type: auth.type === 'Bearer' ? 'Bearer' : 'Basic',
    username: auth.username || auth.login || '',
    password: auth.password || '',
    token: auth.token || auth.JWT || '',
    remember: Boolean(auth.remember)
  };
}

function sanitizeProfileForStorage(profile) {
  const normalized = createConnectionProfile(profile.url, profile);
  if (!normalized.auth.remember) {
    normalized.auth = {
      ...normalized.auth,
      username: '',
      password: '',
      token: ''
    };
  }
  return normalized;
}

function readSessionAuth(profile, sessionStorage) {
  const sessionAuth = readJson(sessionStorage, `${SESSION_AUTH_PREFIX}${profile.id}`, null);
  if (!sessionAuth) {
    return profile;
  }
  return {
    ...profile,
    auth: {
      ...profile.auth,
      username: sessionAuth.username || '',
      password: sessionAuth.password || '',
      token: sessionAuth.token || ''
    }
  };
}

function collectLegacyUrls(localStorage) {
  const urls = [];
  const lastUrl = localStorage?.getItem('lastUrl');
  if (lastUrl) {
    urls.push(lastUrl);
  }

  const listOfUrl = readJson(localStorage, 'listOfUrl', []);
  if (Array.isArray(listOfUrl)) {
    listOfUrl.forEach(item => urls.push(typeof item === 'string' ? item : item?.name));
  }

  const urlList = readJson(localStorage, 'urllist', []);
  if (Array.isArray(urlList)) {
    urlList.forEach(item => urls.push(typeof item === 'string' ? item : item?.name));
  }

  return urls.map(normalizeConnectionUrl).filter(Boolean);
}

function collectLegacyProfiles(localStorage) {
  const profiles = collectLegacyUrls(localStorage).map(url => createConnectionProfile(url));
  const authItems = readJson(localStorage, 'restAuthArray', []);
  if (Array.isArray(authItems)) {
    authItems.forEach(item => {
      const url = normalizeConnectionUrl(item?.url);
      if (!url) {
        return;
      }
      profiles.push(createConnectionProfile(url, {
        auth: {
          enabled: true,
          type: item.type === 'Bearer' ? 'Bearer' : 'Basic',
          username: item.login || '',
          password: item.password || '',
          token: item.JWT || '',
          remember: true
        },
        updatedAt: item.date || undefined
      }));
    });
  }

  const lastUrl = normalizeConnectionUrl(localStorage?.getItem('lastUrl'));
  const enableRestPassword = localStorage?.getItem('enableRestPassword') === 'true';
  if (lastUrl && enableRestPassword) {
    profiles.push(createConnectionProfile(lastUrl, {
      auth: {
        enabled: true,
        type: localStorage?.getItem('selectedRestType') === 'Bearer' ? 'Bearer' : 'Basic',
        username: localStorage?.getItem('restUsername') || '',
        password: localStorage?.getItem('restPassword') || '',
        token: localStorage?.getItem('restBearerToken') || '',
        remember: true
      }
    }));
  }

  return profiles;
}

function mergeProfiles(...groups) {
  const byUrl = new Map();
  groups.flat().forEach(profile => {
    const normalized = createConnectionProfile(profile.url, profile);
    const existing = byUrl.get(normalized.url);
    if (!existing) {
      byUrl.set(normalized.url, normalized);
      return;
    }
    byUrl.set(normalized.url, {
      ...existing,
      ...normalized,
      id: existing.id,
      createdAt: existing.createdAt,
      auth: normalized.auth.enabled ? normalized.auth : existing.auth
    });
  });
  return Array.from(byUrl.values());
}

export function loadConnectionState(options = {}) {
  const localStorage = options.localStorage === undefined ? browserLocalStorage() : options.localStorage;
  const sessionStorage = options.sessionStorage === undefined ? browserSessionStorage() : options.sessionStorage;
  const stored = readJson(localStorage, CONNECTION_PROFILES_KEY, {});
  const storedProfiles = Array.isArray(stored.profiles) ? stored.profiles.map(profile => createConnectionProfile(profile.url, profile)) : [];
  let profiles = mergeProfiles(storedProfiles, collectLegacyProfiles(localStorage));

  if (profiles.length === 0) {
    profiles = [createConnectionProfile(DEFAULT_CONNECTION_URL)];
  }

  profiles = profiles.map(profile => readSessionAuth(profile, sessionStorage));

  const storedActiveId = localStorage?.getItem(ACTIVE_CONNECTION_KEY);
  const legacyActiveUrl = normalizeConnectionUrl(localStorage?.getItem('lastUrl'));
  let activeConnectionId = profiles.find(profile => profile.id === storedActiveId)?.id || null;

  if (!activeConnectionId && legacyActiveUrl) {
    activeConnectionId = profiles.find(profile => profile.url === legacyActiveUrl)?.id || null;
  }
  if (!activeConnectionId) {
    activeConnectionId = profiles[0].id;
  }

  return {
    profiles,
    activeConnectionId,
    activeProfile: profiles.find(profile => profile.id === activeConnectionId) || profiles[0] || null
  };
}

function clearSessionAuth(sessionStorage) {
  if (!sessionStorage) {
    return;
  }
  const keys = [];
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith(SESSION_AUTH_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(key => sessionStorage.removeItem(key));
}

export function saveConnectionState(state, options = {}) {
  const localStorage = options.localStorage === undefined ? browserLocalStorage() : options.localStorage;
  const sessionStorage = options.sessionStorage === undefined ? browserSessionStorage() : options.sessionStorage;

  if (state.clearAll) {
    [CONNECTION_PROFILES_KEY, ACTIVE_CONNECTION_KEY, ...LEGACY_CONNECTION_KEYS].forEach(key => {
      localStorage?.removeItem(key);
    });
    clearSessionAuth(sessionStorage);
    return;
  }

  const profiles = (state.profiles || []).map(profile => createConnectionProfile(profile.url, profile));
  profiles.forEach(profile => {
    const sessionKey = `${SESSION_AUTH_PREFIX}${profile.id}`;
    if (profile.auth.enabled && !profile.auth.remember) {
      writeJson(sessionStorage, sessionKey, {
        username: profile.auth.username || '',
        password: profile.auth.password || '',
        token: profile.auth.token || ''
      });
    } else {
      sessionStorage?.removeItem(sessionKey);
    }
  });

  writeJson(localStorage, CONNECTION_PROFILES_KEY, {
    version: 1,
    profiles: profiles.map(sanitizeProfileForStorage)
  });

  if (state.activeConnectionId) {
    localStorage?.setItem(ACTIVE_CONNECTION_KEY, state.activeConnectionId);
  } else {
    localStorage?.removeItem(ACTIVE_CONNECTION_KEY);
  }
}

export function upsertConnectionProfile(profiles, profile) {
  const normalized = createConnectionProfile(profile.url, profile);
  const existingIndex = profiles.findIndex(item => item.url === normalized.url || item.id === normalized.id);
  if (existingIndex === -1) {
    return [...profiles, normalized];
  }
  return profiles.map((item, index) => index === existingIndex ? {
    ...item,
    ...normalized,
    id: item.id,
    createdAt: item.createdAt
  } : item);
}
