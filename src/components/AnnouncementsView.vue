<template>
<div class="container">
    <h4 class="title is-4 has-text-white">announces</h4>
    <div class="columns is-mobile is-multiline">
    <div class="column is-12" v-for="announcement in announcements" :key="announcement.id">
        <div class="card">
            <header class="card-header">
                <p class="card-header-title">
                    <a :href="announcement.url">{{announcement.title}}</a>
                </p>
                <a @click="toggleVisibility(announcement.id)" class="card-header-icon" aria-label="more options">
                    <b-icon icon="chevron-down" />
                </a>
            </header>
            <div class="card-content" v-if="visible[announcement.id]">
                <div class="content">
                    <span v-html="announcement.message" />
                </div>
            </div>
            <footer class="card-footer" v-if="visible[announcement.id]">
                <div class="card-footer-item">
                    <p><router-link :to="'/course/' + announcement.course.id">{{announcement.course.name}}</router-link> • Posted {{getDate(announcement.posted_at)}} by {{announcement.author.display_name}}</p>
                </div>
            </footer>
        </div>
    </div>
    </div>
</div>
</template>

<script>
export default {
    props: ['server', 'courses'],
    data() {
        return {
            announcements: [],
            visible: {}
        }
    },
    created() {
        const announcements = JSON.parse(window.localStorage.canvas_meta).announcements || []
        announcements.forEach(announcement => {
            //Only restore IF its not been 14 days. don't need to hold onto old visibilities
            if(Date.now() - announcement.posted <= 1000 * 60 * 60 * 24 * 14)
                this.$set(this.visible, announcement.id, false)
        })
        this.refreshAnnouncements()

        window.onbeforeunload = () => {
            const preMeta = JSON.parse(window.localStorage.canvas_meta)
            window.localStorage.canvas_meta = JSON.stringify({
                ...preMeta,
                announcements: this.announcements
                    .filter(announcement => !this.visible[announcement.id])
                    .map(announcement => {
                        return {
                            id: announcement.id,
                            posted: new Date(announcement.posted_at).valueOf()
                        }
                    })
            })
        }
    },
    methods: {
        refreshAnnouncements() {
            fetch(this.server.url + `/api/v1/announcements${getContextQueryParam(this.courses)}`, {
                headers: {
                    'Authorization': "Bearer " + this.server.api
                }
            })
            .then(r => r.json())
            .then(body => {
                this.announcements = body.map(announcement => {
                    if(!(announcement.id in this.visible))
                        this.$set(this.visible, announcement.id, true);
                    const course = this.courses.find(course => course.id == announcement.context_code.slice(7))
                    if(course) {
                        announcement.course = course
                    }
                    return announcement
                })
            })
            .catch(err => {
                console.error('Failed to fetch announcements', err)
            })
        },
        getDate(time) {
            const date = new Date(time)
            return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
        },
        toggleVisibility(announcementID) {
            this.$set(this.visible, announcementID, !this.visible[announcementID])
            
        },
    },
}

function getContextQueryParam(courses) {
    const text = `?context_codes[]=course_${courses[0].id}`
    if(courses.length == 1) return text
    else {
        return text + courses.slice(1).map(course => {
            return `&context_codes[]=course_${course.id}`
        }).join("")
        
    }
}
</script>