<template>
<div>
  <div class="container is-fluid">
    <br>
    <div class="columns">
      <div class="column is-8">
      <b-tabs>
        <b-tab-item label="Dash">
          <template #header>
              <b-icon type="is-white" icon="information-outline"></b-icon>
              <span class="has-text-white">Dashboard</span>
          </template>
          <AssignmentsView :courses="courses" :server="server"/>
        </b-tab-item>
        <b-tab-item label="Announcements">
            <template #header>
                <b-icon type="is-white" icon="bullhorn-outline"></b-icon>
                <span class="has-text-white">Announcements</span>
            </template>
            <AnnouncementsView :courses="courses" :server="server" />
        </b-tab-item>
        <b-tab-item label="Calendar">
            <template #header>
                <b-icon type="is-white" icon="calendar"></b-icon>
                <span class="has-text-white">Calendar</span>
            </template>
            Sorry, not implemented.
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
            <!--<b-button type="is-info" icon-left="sync" disabled>Sync</b-button>-->
          </div>
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
import Clock from '@/components/Clock.vue'

export default {
  name: 'Home',
  props: ['courses','schedule', 'server'],
  components: {
    ScheduleViewer,
    AssignmentsView,
    AnnouncementsView,
    Clock
  },
  methods: {
    openCourseManager() {

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
