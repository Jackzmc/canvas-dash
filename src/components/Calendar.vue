<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'

export default {
  props: ['courses', 'server'],
  components: {
    FullCalendar // make the <FullCalendar> tag available
  },
  data() {
    return {
      calendarOptions: {
        plugins: [ dayGridPlugin,],
        initialView: 'dayGridMonth',
        events: []
      },
      ready: false
    }
  },
  created() {
      fetch(this.server.url + '/api/v1/users/self/upcoming_events', {headers: {Authorization: "Bearer " + this.server.api}})
      .then(response => response.json())
      .then(json => {
            this.calendarOptions.events = json.map(event => {
                return {
                    title: event.title,
                    start: event.start_at,
                    end: event.end_at,
                    url: event.html_url
                }
            })
            this.ready = true
            
      })
  },
}
</script>

<template>
<div class="box">
  <b-loading :is-full-page="false" :active="!ready" />
  <FullCalendar v-if="ready" ref="calendar" :options="calendarOptions" />
</div>
</template>