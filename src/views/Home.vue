<template>
<div>
  <div class="container" v-if="ready">
    <br>
    <div class="columns">
      <div class="column is-8">
        <AssignmentsView :classes="classes" />
      </div>
      <div class="column is-4">
        <ScheduleViewer :classes="classes" />
        <Clock />
      </div>
    </div>
  </div>
  <div class="container" v-else>
    <br>
    <h1 class="has-text-white has-text-centered title is-1">Loading...</h1>
  </div>
</div>
</template>

<script>
// @ is an alias to /src
import ScheduleViewer from '@/components/ScheduleViewer.vue'
import AssignmentsView from '@/components/AssignmentsView.vue'
import Clock from '@/components/Clock.vue'

export default {
  name: 'Home',
  props: ['classes', 'ready'],
  components: {
    ScheduleViewer,
    AssignmentsView,
    Clock
  }
}
</script>
