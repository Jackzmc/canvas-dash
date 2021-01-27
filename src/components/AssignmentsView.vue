<template>
<div>
    <b-loading :active="loading" :is-full-page="false" />
    <h2 class="title is-2 has-text-danger">Upcoming Assignments</h2>
    <div class="columns is-multiline">
        <div class="column is-4" v-for="assignment in dueSoonAssignments" :key="assignment.id"> 
            <div class="box">
                <h4 class="title is-4">
                    <a class="has-text-danger" :href="assignment.html_url">{{assignment.name}}</a>
                </h4>
                <p class="subtitle is-6">{{courseNames[assignment.course_id]}}</p>
                <p>Due <b>{{getDueDate(assignment.due_at)}}</b></p>
                <em>{{getDueDifference(assignment.timeTillDue)}}</em>
            </div>
        </div>
    </div>
    <!-- TODO: HAve an option to list by day -->
    <h2 class="title is-2 has-text-white">Assignments</h2>
    <div v-for="course in courses" :key="course.id" class="box">
        <h5 class="title is-5">{{course.name}}</h5>
        <table class="table is-fullwidth" v-if="assignmentsByCourse[course.id] && assignmentsByCourse[course.id].length > 0">
            <thead>
                <tr>
                    <th width="80%">Assignment</th>
                    <th>Points</th>
                    <th>Due</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="assignment in assignmentsByCourse[course.id]" :key="assignment.id">
                    <th class="has-text-left">
                        <b-tooltip type="is-success" label="Marks the assignment as complete" position="is-right">
                            <b-checkbox v-model="checkedAssignments[assignment.id]"/>
                        </b-tooltip>
                        
                        <b-tooltip type="is-dark" label="Assignment is locked" position="is-right">
                            <b-icon icon="lock" size="is-small" v-if="assignment.locked_for_user" />
                        </b-tooltip>
                        <a :href="assignment.html_url" :class="getAssignmentClass(assignment)">
                            {{assignment.name}}
                            <b-icon icon="star" v-if="assignment.dueSoon" />
                        </a>
                    </th>
                    <td>{{assignment.points_possible}} </td>
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
  props: ['courses', 'server'],
  data() {
      return {
          assignments: [],
          dueSoonAssignments: [],
          checkedAssignments: {},
          loading: true,
      }
  },
  created() {
        //TODO: Implement course-selection
        //TODO: Implement desktop notifications when assignment is near-due
        const assignments = JSON.parse(window.localStorage.canvas_meta).assignments || []
        assignments.forEach(assignments => {
            //Only restore IF its not been 14 days. don't need to hold onto old visibilities
            if(Date.now() - assignments.posted <= 1000 * 60 * 60 * 24 * 14)
                this.$set(this.checkedAssignments, assignments.id, true)
        })
        window.onbeforeunload = () => {
            const preMeta = JSON.parse(window.localStorage.canvas_meta)
            window.localStorage.canvas_meta = JSON.stringify({
                ...preMeta,
                assignments: this.assignments
                    .filter(assignment => this.checkedAssignments[assignment.id]) //Only save checked
                    .map(assignment => {
                        return {
                            id: assignment.id,
                            posted: new Date(assignment.posted_at).valueOf()
                        }
                    })
            })
        }
  },
  mounted() {
      this.refreshAssignments()
  },
  computed: {
      courseNames() {
          let obj = {};
          this.courses.forEach(course => {
              obj[course.id] = course.name.split(" ").slice(0, 2).join(" ")
          })
          return obj;
      },
      assignmentsByCourse() {
          let assignments = {}
          this.courses.forEach(course => assignments[course.id] = [])
          this.assignments.forEach(assn => assignments[assn.courseId].push(assn))
          return assignments
      }
  },
  methods: {
      getDueDifference(delta) {
          if(delta == -1) return "Late"
          const hours = Math.round(delta / 1000 / 60 / 60)
          if(hours > 24) return `${Math.round(hours / 24)} days`
          else if(hours == 0) return "< hour"
          return `${hours} hours`
      },
      getAssignmentClass({isLate, dueSoon}) {
          if(isLate) {
              return 'has-text-danger'
          } else if(dueSoon) {
              return 'warning'
          }else{
              return ''
          }
      },
      getDueDate(timestamp) {
          const date = new Date(timestamp)
          return `${date.toLocaleDateString()} at ~${date.toLocaleTimeString()}`
      },
      refreshAssignments() {
        const NOW = Date.now()
        this.loading = true;
        this.courses
        .forEach(course => {
            fetch(this.server.url + `/api/v1/courses/${course.id}/assignments?include[]=submission&order_by=due_at`, {
                headers: {
                    'Authorization': "Bearer " + this.server.api
                },
                cache: "force-cache"
            })
            .then(r => r.json())
            .then(body => {
                const assignments = body
                //Filter assignments that are not due, only get ones that are unsubmitted
                .filter(assignment => assignment.due_at && assignment.submission.workflow_state === "unsubmitted")
                //Pre-compute assignment information
                .map(assignment => {
                    if(!(assignment.id in this.checkedAssignments))
                        this.$set(this.checkedAssignments, assignment.id, false)
                    const delta = new Date(assignment.due_at).valueOf() - NOW;
                    
                    const obj = {
                        ...assignment, 
                        courseId: course.id,
                        timeTillDue: delta > 0 ? delta : -1,
                        dueSoon: delta <= 86400000,
                        isLate: delta <= 0
                    }
                    if(delta <= 1000 * 60 * 60 * 48 && assignment.submission.workflow_state === "unsubmitted" && this.dueSoonAssignments.length < 9 && !this.checkedAssignments[assignment.id]) {
                        this.dueSoonAssignments.push(obj)
                    }
                    return obj;
                })
                this.assignments = this.assignments.concat(assignments)
                // this.$set(this.assignments, course.id, assignments);
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

<style>
.warning {
    color: #e89a09
}
</style>