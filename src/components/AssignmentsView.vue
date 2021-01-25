<template>
<div>
    <b-loading :active="loading" :is-full-page="false" />
    <h4 class="title is-4">Assignments</h4>
    <div v-for="course in classes" :key="course.id" class="box">
        <h5 class="title is-5">{{course.name}}</h5>
        <table class="table is-fullwidth" v-if="assignments[course.id].length > 0">
            <thead>
                <tr>
                    <th>Assignment</th>
                    <th>Status</th>
                    <th>Due Relative</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="assignment in assignments[course.id]" :key="assignment.id">
                    <th class="has-text-left">
                        <a :href="assignment.html_url">{{assignment.name}}</a>
                    </th>
                    <td></td>
                    <td>{{getDueDifference(assignment.timeTillDue)}}</td>
                </tr>
            </tbody>
        </table>
        <p v-else class="has-text-centered">No assignments due!</p>
    </div>
</div>
</template>

<script>
export default {
  props: ['classes'],
  data() {
      return {
          assignments: {},
          loading: true
      }
  },
  created() {
      this.classes.forEach(course => this.$set(this.assignments, course.id, []))
  },
  mounted() {
      this.refreshAssignments()
  },
  methods: {
      getDueDifference(delta) {
          if(delta == -1) return "Past due"
          const hours = Math.round(delta / 1000 / 60 / 60)
          if(hours > 24) return `${Math.round(hours / 24)} days`
          return `${hours} hours`
      },
      refreshAssignments() {
        const NOW = Date.now()
        this.loading = true;
        this.classes
        .forEach(course => {
                console.log(process.env.VUE_APP_URL)
                
                fetch(process.env.VUE_APP_URL + `/api/v1/courses/${course.id}/assignments?include[]=submission&order_by=due_at`, {
                    headers: {
                        'Authorization': "Bearer " + process.env.VUE_APP_CANVAS_APP_KEY
                    },
                    cache: "force-cache"
                })
                .then(r => r.json())
                .then(body => {
                    const assignments = body.map(assignment => {
                        const delta = new Date(assignment.due_at).valueOf() - NOW;
                        
                        return {
                            ...assignment, 
                            timeTillDue: delta > 0 ? delta : -1
                        }
                    })
                    this.$set(this.assignments, course.id, assignments);
                })
                .catch(err => {
                    console.error('err fetch', err)
                })
        })
        this.loading = false
      }
  }
}
</script>