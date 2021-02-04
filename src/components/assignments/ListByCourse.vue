<template>
<div>
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
                    <td>{{getDueDifference(assignment.delta)}}</td>
                </tr>
            </tbody>
        </table>
        <p v-else class="has-text-centered">No assignments due!</p>
    </div>
</div>
</template>

<script>
export default {
    props: ['courses', 'assignments', 'checkedAssignments'],
    computed: {
        assignmentsByCourse() {
            let assignments = {}
            this.courses.forEach(course => assignments[course.id] = [])
            this.assignments.forEach(assn => assignments[assn.courseId].push(assn))
            return assignments
        },
        
    },
    methods: {
        getDueDifference(delta) {
            if(delta === false) return ""
            if(delta < 0) return "Late"
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
    }
}
</script>