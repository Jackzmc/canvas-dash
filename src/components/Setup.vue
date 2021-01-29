<template>
    <div class="box">
        <h4 class="title is-2">Canvas Dashboard Initial Setup</h4>
        <hr>
        <p>You need to get your canvas api key for this application to work. Go to your account -> settings and scroll down to the "Approved Integrations" category and click new access token. Enter any name for the purpose you want and copy the token.</p>
        <p>Sites must be proxied if they do not have a valid CORS configuration. Therefore most canvas sites do require manual setup.</p>
        <br>
        <form @submit.prevent="submitSetup">
            <b-field label="Canvas API Key">
                <b-input minlength="60" maxlength="70" required v-model="api" placeholder="Enter your canvas api key" />
            </b-field>
            <b-field label="Server">
                <b-select v-model="selectedServer" placeholder="Choose a supported server">
                    <option v-for="server in servers" :key="server.id" :value="server">
                        {{server.title}}
                        <span v-if="server.proxied">(Proxied via proxy.jackz.me)</span>
                    </option>
                </b-select>
            </b-field>
            <hr> 
            <h5 class="title is-5">Optional Setup</h5>
            <p class="subtitle is-6">You can change these items any time</p>
            <div class="buttons">
                <b-button @click="openScheduler" type="is-primary" :disabled="schedulerDisabled" :loading="loadingCourses">Manage Schedule</b-button>
                <b-button @click="openCourseManager" type="is-dark" :disabled="schedulerDisabled" :loading="loadingCourses">Manage Courses</b-button>
            </div>
            <p v-if="schedulerDisabled" class="has-text-danger">Please enter an API Key & select a server to open the scheduler or course manager.</p>
            <hr>
            <b-field>
                <div class="buttons">
                    <b-button native-type="submit" type="is-success" :disabled="api == null || selectedServer == null">Setup Dashboard</b-button>
                    <b-button @click="openSync" type="is-info" icon-left="download">Import</b-button>
                    <b-tag>App v{{$VERSION}}</b-tag>
                </div>
            </b-field>
        </form>
    </div>
</template>

<!-- TODO: Do a test run for 401 on api key inputted, or before submit. -->
<script>
import SERVERS from '@/data/servers.json'
export default {
    data() {
        return {
            api: null,
            selectedServer: null,
            servers: null,
            schedule: null,
            courses: null,
            loadingCourses: false,
            failure: false
        }
    },
    created() {
        this.servers = SERVERS.map(server => {
            if(server.proxied) server.url = `https://proxy.jackz.me/${server.domain}` 
            else server.url = `https://${server.domain}`
            return server;
        })
    },
    computed: {
        schedulerDisabled() {
            return !this.api || !this.selectedServer 
        }
    },
    methods: {
        openSync() {
            this.$buefy.modal.open({
                parent: this,
                canCancel: false,
                autoFocus: true,
                props: {
                    isFromSetup: true
                },
                component: () => import('@/components/SyncModal.vue')
            })
        },
        async openCourseManager() {
            if(!this.courses) {
                await this.fetchCourses()
            }
            if(!this.failure || this.courses == null) return;
            this.$buefy.modal.open({
                parent: this,
                canCancel: false,
                autoFocus: true,
                props: {
                    courses: this.courses
                },
                events: {
                    submit: (courses) => {
                        const preMeta = JSON.parse(window.localStorage.canvas_meta)
                        window.localStorage.canvas_meta = JSON.stringify({
                            ...preMeta,
                            selectedCourses: courses
                        })
                    }
                },
                component: () => import('@/components/CourseSelector.vue')
            })
        },
        async openScheduler() {
            if(!this.courses) {
                await this.fetchCourses()
            }
            if(!this.failure || this.courses == null) return;
            this.$buefy.modal.open({
                parent: this,
                canCancel: false,
                autoFocus: true,
                props: {
                    courses: this.courses,
                    preSchedule: this.schedule
                },
                events: {
                    submit: (schedule) => {
                        this.schedule = schedule
                    }
                },
                component: () => import('@/components/ScheduleManager.vue')
            })
        },
        fetchCourses() {
            this.loadingCourses = true;
            return fetch(this.selectedServer.url + '/api/v1/courses?include[]=tabs&per_page=100', {
                headers: {
                    'Authorization': "Bearer " + this.api
                }
            })
            .then(r => r.json())
            .then(courses => {
                const currentYear = new Date().getFullYear();
                if(!courses) {
                    return alert('Failed to fetch courses due to unknown reason.')
                }
                this.courses = courses.filter(course => {
                    const startAt = new Date(course.start_at)
                    return startAt.getFullYear() >= currentYear
                })
            })
            .catch(() => {
                this.$buefy.dialog.alert({
                    type: 'is-danger',
                    title: 'Invalid API Key',
                    message: 'Sorry but the API key you provided is invalid. Cannot access your courses.'
                })
                this.failure = true
            })
            .finally(() => this.loadingCourses = false)
        },
        async submitSetup() {
            if(!this.courses) {
                await this.fetchCourses()
            }
            this.$emit('init', {
                apiKey: this.api.trim(),
                server: this.selectedServer,
                courses: this.courses,
                schedule: this.schedule
            })
            this.$emit('close')
            
        }
    }
}
</script>