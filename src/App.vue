<template>
<div id="app">
    <app-shell v-if="!dashboard" @refresh="refreshRoute">
        <transition name="fade">
            <router-view :key="$route.fullPath + key" class="oc-route-view" />
        </transition>
    </app-shell>
    <div v-else id="containerOverRouter" :class="containerClass">
        <transition name="fade">
            <router-view :key="$route.fullPath + key" class="oc-route-view" />
        </transition>
    </div>
    <notifications group="foo" />
</div>
</template>

<script>
import AppShell from "@/components/layout/AppShell.vue";
import {
    AUTH_REQUEST,
    AUTH_CAMUNDA_REQUEST
} from "@/store/actions/auth";

export default {
    name: "home",
    components: {
        AppShell
    },
    data() {
        return {
            containerClass: "",
            key: 1,
            dashboard: false
        };
    },
    computed: {
        baseurl() {
            return this.$store.state.baseurl
        },
    },
    watch: {
        "$route.query.baseurl": {
            immediate: true,
            handler(newValue) {
                this.syncBaseUrlFromRoute(newValue);
            }
        },
        baseurl(newValue) {
            const baseurl = Array.isArray(newValue) ? newValue[0] : String(newValue || "");
            if (!baseurl || this.$route.query.baseurl === baseurl) {
                return;
            }
            this.$router.replace({
                path: this.$route.path,
                query: {
                    ...this.$route.query,
                    baseurl
                }
            })
        }
    },
    mounted() {
        if (this.$route.query.dashboard == "true") {
            this.dashboard = true;
            this.containerClass = "container width content";
        } else this.dashboard = false;

        setTimeout(() => {
            this.ContainerOrNot();
        }, 50);

        if (localStorage.usertoken != null) {
            var usertokenstring = atob(localStorage.usertoken).split(":");

            var userName = usertokenstring[0];
            var password = usertokenstring[1];
            this.$store.dispatch(AUTH_REQUEST, {
                userName,
                password
            }).then(() => {});
            this.$store
                .dispatch(AUTH_CAMUNDA_REQUEST, {
                    userName,
                    password
                })
                .then(() => {});
        }

    },
    methods: {
        syncBaseUrlFromRoute(value) {
            const baseurl = Array.isArray(value) ? value[0] : value;
            if (baseurl && this.$store.state.baseurl !== baseurl) {
                this.$store.commit("activateConnectionFromUrl", {
                    url: baseurl,
                    temporary: true
                });
            }
        },
        refreshRoute() {
            this.key = this.key + 1;
        },
        ContainerOrNot: function () {
            this.containerClass = "container content";
            if (this.dashboard == true) {
                this.containerClass = "";
            }
        }
    }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

#containerOverRouter {
    max-width: 1400px;
    padding: 1rem;
    margin: 0 auto;
}

.content {
    min-height: calc(100vh - 20px);
}

.footer {
    height: 50px;
}
</style>
