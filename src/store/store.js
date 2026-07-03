import { createStore } from 'vuex';
// eslint-disable-next-line no-unused-vars
import createPersistedState from 'vuex-persistedstate';
import user from './modules/user';
import auth from './modules/auth';
import * as access from './modules/accessSetings';
import { BPMAASURL } from '@/config/settings';
import {
  createConnectionProfile,
  loadConnectionState,
  normalizeConnectionUrl,
  saveConnectionState,
  upsertConnectionProfile
} from '@/connections/connectionStorage';

const debug = process.env.NODE_ENV !== 'production';
const initialConnections = loadConnectionState();
const initialAuth = initialConnections.activeProfile?.auth || {};

function getActiveConnection(state) {
  return state.connectionProfiles.find(profile => profile.id === state.activeConnectionId) || null;
}

function applyActiveConnection(state) {
  const profile = getActiveConnection(state);
  state.baseurl = profile ? profile.url : '';
  state.baseurlSetted = Boolean(profile && profile.url);
  state.restPasswordEnabled = Boolean(profile?.auth?.enabled);
  state.restUsername = profile?.auth?.username || null;
  state.restPassword = profile?.auth?.password || null;
  state.restBearerToken = profile?.auth?.token || null;
  state.restAuthType = profile?.auth?.enabled ? profile.auth.type : null;
  state.secureDate = profile?.auth?.enabled ? profile.updatedAt : null;
}

function persistConnectionState(state) {
  saveConnectionState({
    profiles: state.connectionProfiles,
    activeConnectionId: state.activeConnectionId
  });
}

export default createStore({
  modules: {
    user,
    auth
  },
  strict: debug,
  state: {
    baseurl: initialConnections.activeProfile?.url || '',
    connectionProfiles: initialConnections.profiles,
    activeConnectionId: initialConnections.activeConnectionId,
    connectionStatusMessage: '',
    role: '',
    bpmasserviceUrl: BPMAASURL,
    serverStatus: true,
    workOnBpmasservice: false,
    envortment: 'UNKNOWN',
    restPasswordEnabled: Boolean(initialAuth.enabled),
    restUsername: initialAuth.username || null,
    restPassword: initialAuth.password || null,
    restBearerToken: initialAuth.token || null,
    restAuthType: initialAuth.enabled ? initialAuth.type : null,
    expertMode: false,
    restAuthArray:  [],
    taskId: '',
    secureDate: initialAuth.enabled ? initialConnections.activeProfile?.updatedAt : null,
    baseurlSetted: Boolean(initialConnections.activeProfile?.url),
    metadataCountersEnabled: typeof localStorage === 'undefined' ? true : localStorage.getItem("metadataCountersEnabled") != "false"
  },
  mutations: {
    setBaseUrl(state, url) {
      const normalizedUrl = normalizeConnectionUrl(url);
      if (!normalizedUrl) {
        return;
      }
      const existing = state.connectionProfiles.find(profile => profile.url === normalizedUrl);
      const profile = existing || createConnectionProfile(normalizedUrl);
      state.connectionProfiles = upsertConnectionProfile(state.connectionProfiles, profile);
      state.activeConnectionId = profile.id;
      applyActiveConnection(state);
      persistConnectionState(state);
    },
    activateConnectionFromUrl(state, payload) {
      const url = typeof payload === 'string' ? payload : payload?.url;
      const normalizedUrl = normalizeConnectionUrl(url);
      if (!normalizedUrl) {
        return;
      }
      const existing = state.connectionProfiles.find(profile => profile.url === normalizedUrl);
      const profile = existing || createConnectionProfile(normalizedUrl, {
        temporary: Boolean(payload?.temporary)
      });
      state.connectionProfiles = upsertConnectionProfile(state.connectionProfiles, profile);
      state.activeConnectionId = profile.id;
      applyActiveConnection(state);
      persistConnectionState(state);
    },
    saveConnectionProfile(state, profile) {
      const normalized = createConnectionProfile(profile.url, profile);
      state.connectionProfiles = upsertConnectionProfile(state.connectionProfiles, normalized);
      state.activeConnectionId = normalized.id;
      applyActiveConnection(state);
      persistConnectionState(state);
    },
    activateConnection(state, profileId) {
      if (!state.connectionProfiles.some(profile => profile.id === profileId)) {
        return;
      }
      state.activeConnectionId = profileId;
      applyActiveConnection(state);
      persistConnectionState(state);
    },
    deleteConnectionProfile(state, profileId) {
      state.connectionProfiles = state.connectionProfiles.filter(profile => profile.id !== profileId);
      if (state.connectionProfiles.length === 0) {
        const profile = createConnectionProfile('');
        state.connectionProfiles = [profile];
        state.activeConnectionId = profile.id;
      } else if (state.activeConnectionId === profileId) {
        state.activeConnectionId = state.connectionProfiles[0].id;
      }
      applyActiveConnection(state);
      persistConnectionState(state);
    },
    clearConnectionProfiles(state) {
      state.connectionProfiles = [];
      state.activeConnectionId = null;
      state.baseurl = '';
      state.baseurlSetted = false;
      state.restPasswordEnabled = false;
      state.restUsername = null;
      state.restPassword = null;
      state.restBearerToken = null;
      state.restAuthType = null;
      state.secureDate = null;
      saveConnectionState({ profiles: [], activeConnectionId: null, clearAll: true });
    },
    setActiveConnectionAuth(state, authPayload) {
      const active = getActiveConnection(state);
      if (!active) {
        return;
      }
      const updatedProfile = {
        ...active,
        updatedAt: new Date().toISOString(),
        auth: {
          enabled: Boolean(authPayload.enabled),
          type: authPayload.type === 'Bearer' ? 'Bearer' : 'Basic',
          username: authPayload.username || '',
          password: authPayload.password || '',
          token: authPayload.token || '',
          remember: Boolean(authPayload.remember)
        }
      };
      state.connectionProfiles = upsertConnectionProfile(state.connectionProfiles, updatedProfile);
      applyActiveConnection(state);
      persistConnectionState(state);
    },
    setConnectionStatusMessage(state, message) {
      state.connectionStatusMessage = message;
    },
    setSecureDate(state ,date ) {
      state.secureDate = date;
    },
    setMoreJWT(state, element) {
      const profile = createConnectionProfile(element.url, {
        auth: {
          enabled: true,
          type: element.type === 'Bearer' ? 'Bearer' : 'Basic',
          username: element.login || '',
          password: element.password || '',
          token: element.JWT || '',
          remember: true
        },
        updatedAt: element.date || new Date().toISOString()
      });
      state.connectionProfiles = upsertConnectionProfile(state.connectionProfiles, profile);
      state.activeConnectionId = profile.id;
      applyActiveConnection(state);
      persistConnectionState(state);
    },
    removeJWT(state, url) {
      const normalizedUrl = normalizeConnectionUrl(url);
      const profile = state.connectionProfiles.find(item => item.url === normalizedUrl);
      if (!profile) {
        return;
      }
      state.connectionProfiles = upsertConnectionProfile(state.connectionProfiles, {
        ...profile,
        auth: {
          enabled: false,
          type: 'Basic',
          username: '',
          password: '',
          token: '',
          remember: false
        }
      });
      applyActiveConnection(state);
      persistConnectionState(state);
    },
    setRestPasswordEnabled(state, restPasswordEnabled) {
      state.restPasswordEnabled = restPasswordEnabled;
    
    },
    setRestsername(state, restUsername) {
      state.restUsername = restUsername;
    },
    setRestpassword(state, restPassword) {
      state.restPassword = restPassword;
    },
    setRestToken(state, restBearerToken) {
      state.restBearerToken = restBearerToken;
    },
    setRestAuthType(state, restAuthType) {
      state.restAuthType = restAuthType;
    },
    setBpmasserviceUrl(state, url) {
      state.bpmasserviceUrl = url;
    },
    setRole(state, role) {
      state.role = role;
    },
    changeServerStatus(state, status) {
      state.serverStatus = status;
    },
    changeExpertMode(state, expertMode) {
      state.expertMode = expertMode;
    },
    changeTaskId(state, taskId) {
      state.taskId = taskId;
    },
    changeEnvortment(state, envortment) {
      state.envortment = envortment;
    },
    changeworkOnBpmasservice(state, workOnBpmasservice) {
      state.workOnBpmasservice = workOnBpmasservice;
      if (workOnBpmasservice == true) {
        state.bpmasserviceUrl = state.baseurl;
      }
    },
    metadataCountersEnabled(state, metadataCountersEnabled) {
      state.metadataCountersEnabled = metadataCountersEnabled;
    }
  },
  actions: {}
});
