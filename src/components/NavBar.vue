<template>
<header class="allNavbars">
    <b-navbar toggleable="md" type="light" class="app-navbar">
        <b-navbar-toggle target="nav_collapse" class="app-navbar-toggle"></b-navbar-toggle>

        <router-link to="/migration" class="app-brand-link">
            <b-navbar-brand class="app-brand">EXCAMAD</b-navbar-brand>
        </router-link>

        <b-collapse is-nav id="nav_collapse" class="app-navbar-collapse">
            <div class="app-navbar-body">
                <b-navbar-nav class="app-main-nav">
                    <b-nav-item-dropdown text="Processes">
                        <b-dropdown-item to="/migration">Stats and migration</b-dropdown-item>
                        <b-dropdown-item to="/history">History and search</b-dropdown-item>
                        <b-dropdown-item to="/oldactivity">Old processes</b-dropdown-item>
                        <b-dropdown-item to="/embedded">Embed and share</b-dropdown-item>
                        <b-dropdown-item to="/startdefinition">Start processes</b-dropdown-item>
                        <b-dropdown-item to="/complexmigration">Migration</b-dropdown-item>
                        <b-dropdown-item to="/variablebatch">Variables edit</b-dropdown-item>
                        <b-dropdown-item to="/modificationbatch">Modification</b-dropdown-item>
                    </b-nav-item-dropdown>
                    <b-nav-item-dropdown text="Decisions">
                        <b-dropdown-item to="/decisiondefinitions">Stats and definitions</b-dropdown-item>
                        <b-dropdown-item disabled to="/migration">History and search</b-dropdown-item>
                    </b-nav-item-dropdown>

                    <b-nav-item to="/incident">Incidents</b-nav-item>
                    <b-nav-item to="/stream">Live</b-nav-item>
                    <b-nav-item to="/tasklist">Task list</b-nav-item>

                    <b-nav-item-dropdown text="Misc">
                        <b-dropdown-item to="/deploytable">Deployments</b-dropdown-item>
                        <b-dropdown-item to="/batch">Batches</b-dropdown-item>
                        <b-dropdown-item to="/groups">Groups</b-dropdown-item>
                        <b-dropdown-item to="/users">Users</b-dropdown-item>
                        <b-dropdown-item to="/report">Report</b-dropdown-item>
                    </b-nav-item-dropdown>
                </b-navbar-nav>

                <div class="app-nav-tools">
                    <search class="app-search" v-on:setUrlFromSearch="setUrlFromEmit"></search>

                    <router-link to="/settings" class="nav-link app-tool-link">Connections</router-link>

                    <b-dropdown variant="link" toggle-class="connection-toggle" menu-class="connection-dropdown-menu">
                        <template #button-content>
                            <span class="connection-chip" :title="connectionToggleTitle">
                                <span class="connection-status-dot" :class="connectionStatusClass"></span>
                                <span class="connection-chip-main">{{connectionDisplayName}}</span>
                                <b-badge pill :variant="environmentVariant(activeEnvironment)">{{activeEnvironment}}</b-badge>
                            </span>
                        </template>

                        <b-dropdown-header>Connection</b-dropdown-header>
                        <b-dropdown-text class="connection-menu-summary">
                            <strong>{{serverStatusText}}</strong>
                            <span>{{connectionUrlText}}</span>
                            <span v-if="connectionAuthText">{{connectionAuthText}}</span>
                        </b-dropdown-text>
                        <b-dropdown-divider></b-dropdown-divider>
                        <b-dropdown-item to="/settings">Manage connections</b-dropdown-item>
                        <b-dropdown-item to="/systems">Legacy systems</b-dropdown-item>
                        <b-dropdown-divider v-if="profiles.length"></b-dropdown-divider>
                        <b-dropdown-item-button @click="activateConnection(profile.id)" :key="profile.id" v-for="profile in profiles">
                            <span class="connection-profile-row">
                                <span class="connection-profile-main">
                                    <span class="connection-active-mark" aria-hidden="true">{{profile.id == activeConnectionId ? '>' : ''}}</span>
                                    {{profile.name}}
                                </span>
                                <b-badge pill :variant="environmentVariant(profile.environment)">{{profile.environment}}</b-badge>
                            </span>
                        </b-dropdown-item-button>
                        <b-dropdown-divider></b-dropdown-divider>
                        <b-dropdown-item-button @click="clear()">Clear saved data</b-dropdown-item-button>
                    </b-dropdown>

                    <router-link v-b-tooltip.hover title="FAQ and manual" to="/help" class="nav-link app-help-link">
                        <font-awesome-icon icon="question-circle" />
                    </router-link>

                    <login></login>
                </div>
            </div>
        </b-collapse>
    </b-navbar>
</header>
</template>

<script>
import {
    library
} from '@fortawesome/fontawesome-svg-core'
import {
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons'
import {
    AUTH_REQUEST,
    AUTH_CAMUNDA_REQUEST
} from '@/store/actions/auth'

library.add(faQuestionCircle)

import {
    PRODSUBSTRING,
    TESTSUBSTRING
} from '@/config/settings'
import { normalizeConnectionUrl } from '@/connections/connectionStorage'
export default {
    components: {},
    data() {
        return {
            productionAlert: '',
            testAlert: '',
            status: '',
            substringForProduction: PRODSUBSTRING,
            substringForTest: TESTSUBSTRING,
            statusDate: '',
            envortment: ''
        }
    },
    mounted() {
        this.healthcheck()
        setTimeout(() => {
            this.healthcheck()
            this.checkEnvortment()
        }, 30)

        setInterval(
            function growUp() {
                this.healthcheck()
                this.checkEnvortment()
            }.bind(this),
            9000
        )
    },
    computed: {
        baseurl() {
            return this.$store.state.baseurl
        },
        profiles() {
            return this.$store.state.connectionProfiles
        },
        activeConnectionId() {
            return this.$store.state.activeConnectionId
        },
        activeProfile() {
            return this.profiles.find(profile => profile.id === this.activeConnectionId) || null
        },
        authType() {
            return this.$store.state.restAuthType
        },
        secureDate() {
            if (this.$store.state.secureDate) {
                return this.$momenttrue(this.$store.state.secureDate).fromNow()
            } else return null
        },
        activeEnvironment() {
            return this.activeProfile?.environment || this.envortment || 'Unknown'
        },
        serverStatusText() {
            return this.serverStatus ? 'Connected' : 'Unavailable'
        },
        serverStatus() {
            return this.$store.state.serverStatus
        },
        connectionStatusClass() {
            return this.serverStatus ? 'is-online' : 'is-offline'
        },
        connectionDisplayName() {
            if (this.activeProfile?.name) {
                return this.activeProfile.name
            }
            if (this.baseurl) {
                return this.compactUrl(this.baseurl)
            }
            return 'No connection'
        },
        connectionUrlText() {
            const url = this.activeProfile?.url || this.baseurl
            return url ? this.compactUrl(url) : 'No Camunda REST URL'
        },
        connectionAuthText() {
            if (this.authType && this.secureDate) {
                return `${this.authType} ${this.secureDate}`
            }
            if (this.authType) {
                return this.authType
            }
            if (this.secureDate) {
                return `Auth ${this.secureDate}`
            }
            return ''
        },
        connectionToggleTitle() {
            return `${this.serverStatusText}: ${this.connectionUrlText}`
        }
    },
    watch: {
        baseurl() {
            this.checkEnvortment()
        }
    },
    methods: {
        setUrlFromEmit: function (newUrl) {
            this.userSetBaserUrlFromBadge(newUrl)
            this.$router.push({
                name: 'migration'
            })
        },
        refresh() {
            this.$emit('refresh')
        },
        compactUrl(url) {
            return normalizeConnectionUrl(url).replace(/^https?:\/\//, '').replace(/\/$/, '')
        },
        environmentVariant(environment) {
            if (environment === 'Production') {
                return 'warning'
            }
            if (environment === 'Test') {
                return 'info'
            }
            if (environment === 'Local') {
                return 'success'
            }
            return 'secondary'
        },
        healthcheck() {
            this.$api()
                .get('/engine')
                .then(() => {
                    this.status = 'UP'
                    this.statusDate = Date()
                    this.$store.commit('changeServerStatus', true) //
                })
                .catch(() => {
                    this.status = 'DOWN'
                    this.statusDate = Date()
                    this.$store.commit('changeServerStatus', false) //
                })
        },
        checkEnvortment() {
            this.testAlert = this.baseurl.indexOf(this.substringForTest)
            this.productionAlert = this.baseurl.indexOf(this.substringForProduction)
            if (
                this.testAlert > 0 &&
                (this.productionAlert > 0 || this.productionAlert < 0)
            ) {
                this.envortment = 'TEST'
            }
            if (this.productionAlert > 0 && this.testAlert < 0) {
                this.envortment = 'PRODUCTION'
            }
            if (this.productionAlert < 0 && this.testAlert < 0) {
                this.envortment = 'UNKNOWN'
            }
            this.$store.commit('changeEnvortment', this.envortment) //
        },
        clear() {
            this.$store.commit('clearConnectionProfiles')
        },
        activateConnection(profileId) {
            this.$store.commit('activateConnection', profileId)
            this.checkEnvortment()
            this.refresh()
        },
        userSetBaserUrlFromBadge(item) {
            this.$notify({
                group: 'foo',
                title: 'Url setuped',
                text: item,
                type: 'success'
            })
            this.$store.commit('activateConnectionFromUrl', item)
            this.checkEnvortment()
            this.refresh()
            if (localStorage.usertoken != null) {
                var usertokenstring = atob(localStorage.usertoken).split(':')

                var userName = usertokenstring[0]
                var password = usertokenstring[1]
                this.$store
                    .dispatch(AUTH_REQUEST, {
                        userName,
                        password
                    })
                    .then(() => {})
                this.$store
                    .dispatch(AUTH_CAMUNDA_REQUEST, {
                        userName,
                        password
                    })
                    .then(() => {})
            }
        }
    }
}
</script>

<style>
.allNavbars {
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 1020;
    background-color: #fff;
    border-bottom: 1px solid #d8dde6;
}

.app-navbar {
    min-height: 3.5rem;
    padding: 0.35rem 0.75rem;
}

.app-brand-link {
    margin-right: 1rem;
    color: inherit;
    text-decoration: none;
}

.app-brand {
    margin-right: 0;
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0;
}

.app-navbar-collapse {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
}

.app-navbar-body {
    display: flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.app-main-nav {
    flex: 0 1 auto;
}

.app-nav-tools {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    min-width: 0;
}

.app-search {
    flex: 1 1 14rem;
    max-width: 28rem;
    min-width: 10rem;
}

.app-search .simple-suggest.designed,
.app-search .simple-suggest.designed * {
    width: 100%;
    max-width: 100%;
}

.app-tool-link,
.app-help-link {
    white-space: nowrap;
}

.connection-toggle {
    padding: 0;
    text-decoration: none;
}

.connection-toggle:hover,
.connection-toggle:focus {
    text-decoration: none;
}

.connection-chip {
    display: inline-flex;
    max-width: 15rem;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid #cfd6e4;
    border-radius: 999px;
    background-color: #f8fafc;
    color: #1f2937;
    font-size: 0.8125rem;
    line-height: 1.25;
}

.connection-chip-main {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.connection-status-dot {
    width: 0.55rem;
    height: 0.55rem;
    flex: 0 0 auto;
    border-radius: 50%;
    background-color: #dc3545;
}

.connection-status-dot.is-online {
    background-color: #198754;
}

.connection-status-dot.is-offline {
    background-color: #dc3545;
}

.connection-dropdown-menu {
    max-width: min(22rem, calc(100vw - 1rem));
}

.connection-menu-summary {
    display: grid;
    gap: 0.25rem;
    max-width: 20rem;
    color: #4b5563;
    font-size: 0.8125rem;
    overflow-wrap: anywhere;
}

.connection-profile-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.connection-profile-main {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.connection-active-mark {
    display: inline-block;
    width: 0.75rem;
    color: #198754;
    font-weight: 700;
}

@media (max-width: 767.98px) {
    .app-navbar {
        align-items: flex-start;
    }

    .app-brand-link {
        margin-right: 0;
        margin-left: auto;
    }

    .app-navbar-collapse {
        flex-basis: 100%;
    }

    .app-navbar-body,
    .app-main-nav,
    .app-nav-tools {
        width: 100%;
    }

    .app-navbar-body {
        display: block;
        padding-top: 0.5rem;
    }

    .app-main-nav,
    .app-nav-tools {
        align-items: stretch;
    }

    .app-nav-tools {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.5rem;
    }

    .app-search {
        flex: 0 0 auto;
        width: 100%;
        max-width: none;
        min-width: 0;
    }

    .app-tool-link,
    .app-help-link {
        padding-left: 0;
    }

    .connection-toggle {
        width: 100%;
        text-align: left;
    }

    .connection-chip {
        max-width: 100%;
    }
}
</style>
