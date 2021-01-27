<template>
    <div class="box">
        <h4 class="title is-2">Canvas Dashboard</h4>
        <p class="subtitle is-4">Initial Setup</p>
        <hr>
        <p>You need to get your canvas api key for this application to work. Go to your account -> settings and scroll down to the "Approved Integrations" category and click new access token. Enter any name for the purpose you want and copy the token.</p>
        <p>Sites must be proxied if they do not have a valid CORS configuration. Therefore most canvas sites do require manual setup.</p>
        <br>
        <form @submit.prevent="submitSetup">
            <b-field label="Canvas API Key">
                <b-input minlength="69" maxlength="69" required v-model="api" placeholder="Enter your canvas api key" />
            </b-field>
            <b-field label="Server">
                <b-select v-model="selectedServer" placeholder="Choose a server">
                    <option v-for="server in servers" :key="server.id" :value="server">
                        {{server.title}}
                        <span v-if="server.proxied">(Proxied via proxy.jackz.me)</span>
                    </option>
                </b-select>
            </b-field>
            <hr> 
            <h5 class="title is-5">Initial Schedule (optional)</h5>
            <p class="subtitle is-6">You can change and setup your schedule at any time later.</p>
            <b-button @click="openScheduler" type="is-primary" :disabled="schedulerDisabled" :loading="loadingCourses">Manage Schedule</b-button>
            <p v-if="schedulerDisabled" class="has-text-danger">Please enter an API Key & select a server to open the scheduler.</p>
            <hr>
            <b-field>
                <b-button native-type="submit" type="is-success" >Setup Dashboard</b-button>
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
            loadingCourses: false
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
        async openScheduler() {
            if(!this.courses) {
                await this.fetchCourses()
            }
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
            .catch(err => {
                console.error('err fetch', err)
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