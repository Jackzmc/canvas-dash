<template>
<div>
    <b-loading :active="loading" :is-full-page="false" />
    <h2 class="title is-2 has-text-danger">Upcoming Assignments</h2>
    <div class="columns is-multiline">
        <div class="column is-4" v-for="assignment in assignmentsDueSoon" :key="assignment.id"> 
            <article class="box" style="height: 100%">
                <h4 class="title is-4">
                    <a :class="{'has-text-danger': assignment.isLate, 'warning': !assignment.isLate}" :href="assignment.html_url">
                        {{assignment.name}}
                    </a>
                </h4>
                <p class="subtitle is-6">{{courseNames[assignment.course_id]}}</p>
                <span v-if="assignment.due_at">
                    <p>Due <b>{{getDueDate(assignment.due_at)}}</b></p>
                    <em>{{getDueDifference(assignment.delta)}}</em>
                </span>
            </article>
        </div>
    </div>
    <h2 class="title is-2 has-text-white">Assignments Grouped By 
        <b-select class="inline" v-model="groupBy">
            <option value="course">Course</option>
            <option value="day">Day</option>
        </b-select>
    </h2>
    <ListByCourse v-if="groupBy === 'course'" :courses="visibleCourses" :assignments="assignments" :checkedAssignments="checkedAssignments" />
    <ListByDay    v-else                      :courses="visibleCourses" :assignments="assignments" :checkedAssignments="checkedAssignments" />
</div>
</template>

<script>
//Currently 14 days. Used to clear any assignments that are this many milliseconds old
const CHECKED_ASSIGNMENT_DELTA = 1000 * 60 * 60 * 24 * 14;

import ListByCourse from '@/components/assignments/ListByCourse.vue'
import ListByDay from '@/components/assignments/ListByDay.vue'

export default {
  props: ['courses', 'server', 'visibleCourses'],
  components: {
      ListByCourse,
      ListByDay
  },
  data() {
      return {
          groupBy: "course",
          assignments: [],
          checkedAssignments: {},
          loading: true,
      }
  },
  created() {
        //TODO: Implement desktop notifications when assignment is near-due
        const meta = JSON.parse(window.localStorage.canvas_meta) || {assignments: [], groupAssignments: "course"}
        //Set group by. need to store this.
        if(meta.groupAssignments && meta.groupAssignments === "course" || meta.groupAssignments === "day")
            this.groupBy = meta.groupAssignments
        if(meta.assignments) meta.assignments.forEach(assignment => {
            //Only restore IF its not been 14 days. don't need to hold onto old visibilities
            if(Date.now() - assignment.due <= CHECKED_ASSIGNMENT_DELTA)
                this.$set(this.checkedAssignments, assignment.id, true)
        })
        window.onbeforeunload = () => {
            console.debug('Unloading, Saving meta information...')
            const preMeta = JSON.parse(window.localStorage.canvas_meta)
            window.localStorage.canvas_meta = JSON.stringify({
                ...preMeta,
                groupAssignments: this.groupBy,
                assignments: this.assignments
                    .filter(assignment => this.checkedAssignments[assignment.id]) //Only save checked
                    .map(assignment => {
                        return {
                            id: assignment.id,
                            due: assignment.due_at && assignment.due_at > 0 ? new Date(assignment.due_at).valueOf() : false
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

    //   assignmentsGrouped() {
    //       return this.groupBy === "course" ? this.assignmentsByCourse : this.assignmentsByDay
    //   }
      assignmentsDueSoon() {
          return this.assignments
          .filter(assignment => !this.checkedAssignments[assignment.id])
          .sort((a,b) => a.delta - b.delta )
          .slice(0, 6)
      }
  },
  methods: {
      getDueDifference(delta) {
            if(delta === false) return "n/a"
            if(delta <= 0) return "Late"
            const hours = Math.round(delta / 1000 / 60 / 60)

            if(hours > 24) return `${Math.round(hours / 24)} days`
            else if(hours == 0) return "< hour"
            return `${hours} hours`
      },
      getDueDate(timestamp) {
          if(!timestamp || timestamp == 0) return "No Due Date";
          const date = new Date(timestamp)
          return `${date.toLocaleDateString()} at ~${date.toLocaleTimeString()}`
      },
      refreshAssignments() {
        const NOW = Date.now()
        this.loading = true;
        this.visibleCourses
        .forEach(course => {
            fetch(this.server.url + `/api/v1/courses/${course.id}/assignments?include[]=submission`, {
                headers: {
                    'Authorization': "Bearer " + this.server.api
                },
                //cache: "force-cache"
            })
            .then(r => r.json())
            .then(body => {
                const assignments = body
                //Filter assignments that are not due, only get ones that are unsubmitted
                //.filter(assignment => assignment.due_at && assignment.submission.workflow_state === "unsubmitted")
                //Pre-compute assignment information
                .map(assignment => {
                    if(!(assignment.id in this.checkedAssignments))
                        this.$set(this.checkedAssignments, assignment.id, false)
                    if(assignment.submission.workflow_state === "graded" || assignment.submission.workflow_state === "submitted") {
                        this.$set(this.checkedAssignments, assignment.id, true)
                    }
                    const date = new Date(assignment.due_at)
                    const isAssignmentDue = assignment.due_at !== null
                    const delta = isAssignmentDue ? date.valueOf() - NOW : false;
                    const dayDelta = delta / 8.64e+7 //divide MS delta -> days
                    if(dayDelta <= -2) return null;

                    const obj = {
                        ...assignment, 
                        courseId: course.id,
                        delta,
                        date,
                        isLate: isAssignmentDue ? delta <= 0 : false
                    }
                    return obj;
                })
                //Filter out any null (past < 2 days)
                .filter(assignment => assignment)
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