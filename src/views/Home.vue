<template>
<div>
  <div class="container is-fluid">
    <br>
    <div class="columns">
      <div class="column is-8">
      <b-tabs v-model="tabIndex">
        <b-tab-item label="Dash" value="dash">
          <template #header>
              <b-icon type="is-white" icon="information-outline"></b-icon>
              <span class="has-text-white">Dashboard</span>
          </template>
          <AssignmentsView :courses="courses" :server="server" :visibleCourses="visibleCourses"/>
        </b-tab-item>
        <b-tab-item label="Announcements" value="announcements">
            <template #header>
                <b-icon type="is-white" icon="bullhorn-outline"></b-icon>
                <span class="has-text-white">Announcements</span>
            </template>
            <AnnouncementsView  :courses="courses" :server="server" />
        </b-tab-item>
        <b-tab-item label="Calendar" value="calendar">
            <template #header>
                <b-icon type="is-white" icon="calendar"></b-icon>
                <span class="has-text-white">Calendar</span>
            </template>
            <Calendar  :courses="courses" :server="server" />
        </b-tab-item>
      </b-tabs>
      </div>
      <div class="column sticky">
        <ScheduleViewer :courses="courses" :schedule="schedule" />
        <Clock />
        <div class="box">
          <div class="buttons is-centered">
            <b-button @click="openScheduler" type="is-primary" icon-left="calendar">Manage Schedule</b-button>
            <b-button @click="openCourseManager" type="is-dark" icon-left="school">Manage Courses</b-button>
            <b-button @click="openSync" type="is-info" icon-left="export">Export / Import</b-button>
            <!--<b-button type="is-info" icon-left="sync" disabled>Sync</b-button>-->
          </div>
        </div>
        <div class="box">
          <h4 class="title is-4">Direct Canvas Links</h4>
          <ul>
            <li v-for="course in visibleCourses" :key="course.id"><a :href="'https://' + server.domain + '/courses/' + course.id">{{course.name}}</a></li> 
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
// @ is an alias to /src
import ScheduleViewer from '@/components/ScheduleViewer.vue'
import AssignmentsView from '@/components/AssignmentsView.vue'
import AnnouncementsView from '@/components/AnnouncementsView.vue'
import Calendar from '@/components/Calendar.vue'
import Clock from '@/components/Clock.vue'

export default {
  name: 'Home',
  props: ['courses','server'],
  components: {
    ScheduleViewer,
    AssignmentsView,
    AnnouncementsView,
    Calendar,
    Clock
  },
  data() {
    return {
      schedule: [],
      tabIndex: "dash"
    }
  },
  created() {
    if(window.localStorage.canvas_schedule) {
        this.schedule = JSON.parse(window.localStorage.canvas_schedule)
        .map(entry => {
            if(entry.course && entry.course !== "none") {
                const classData = this.courses.find(c => c.id == entry.course)
                if(!classData) {
                    console.warn(`Could not find a canvas course set for entry`, entry)
                    return entry;
                }
                const cleanName = classData.name.split(" ").slice(0, 2).join(" ")
                return {...entry, course: classData, cleanName, hasCanvasData: true, type: "COURSE"}
            } else
                return entry;
        })
    }
  },
  computed: {
    visibleCourses() {
        return this.courses.filter(course => course.visible)
    },
  },
  methods: {
    openSync() {
      this.$buefy.modal.open({
        parent: this,
        canCancel: false,
        autoFocus: true,
        component: () => import('@/components/SyncModal.vue')
      })
    },
    openCourseManager() {
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
    openScheduler() {
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
                  window.localStorage.canvas_schedule = JSON.stringify(schedule)
              }
          },
          component: () => import('@/components/ScheduleManager.vue')
      })
    },
  }
}
</script>
