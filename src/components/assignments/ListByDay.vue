<template>
<div>
    <div v-for="day in days" :key="day" class="box">
        <h5 class="title is-5">
            {{getDateName(day, daysMap[day])}}
            <p class="subtitle is-inline is-pulled-right">{{day}}</p>
        </h5>
        <table class="table is-fullwidth" v-if="assignmentsByDay[day] && assignmentsByDay[day].length > 0">
            <thead>
                <tr>
                    <th width="80%">Assignment</th>
                    <th>Points</th>
                    <th>Due</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="assignment in assignmentsByDay[day]" :key="assignment.id">
                    <th class="has-text-left">
                        <b-tooltip type="is-success" label="Marks the assignment as complete" position="is-right">
                            <b-checkbox v-model="checkedAssignments[assignment.id]"/>
                        </b-tooltip>
                        
                        <b-tooltip type="is-dark" label="Assignment is locked" position="is-right">
                            <b-icon icon="lock" size="is-small" v-if="assignment.locked_for_user" />
                        </b-tooltip>
                        <a :href="assignment.html_url" :class="getAssignmentClass(assignment)">
                            <b-tooltip :label="assignment.courseTitle">
                                {{assignment.name}}
                            </b-tooltip>
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
    data() {
        return {
            todayDate: null,
            tomorrowDate: null,
            assignmentsByDay: {},
            daysMap: {}
        }
    },
    created() {
        const date = new Date()
        this.yesterdayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1).toLocaleDateString('sv')
        this.todayDate = date.toLocaleDateString('sv')
        this.tomorrowDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toLocaleDateString('sv')
    },
    mounted() {
        this.getAssignmentsByDay()
    },
    watch: {
        assignments() {
            this.getAssignmentsByDay()
        }
    },
    computed: {
        days() {
            return Object.keys(this.assignmentsByDay)
                .filter(key => key[0] != "T")
                .sort((a, b) => {
                    const [y1,m1,d1] = a.split('-')
                    const [y2,m2,d2] = b.split('-')
                    const timestampA = new Date(y1,m1 - 1,d1).valueOf()
                    const timestampB = new Date(y2,m2 - 1,d2).valueOf()
                    return timestampA - timestampB
                })
        }
    },
    methods: {
        getAssignmentsByDay() {
            //list of {'yy-mm-dd': 'Day Date, year'}
            let daysMap = {}
            //Object of <'yy-mm-dd': assignments:[]>
            let days = {}, undated = [];
            this.assignments.forEach(assignment => {
                const prefix = assignment.date.toLocaleDateString('sv')
                const course = this.courses.find(course => course.id === assignment.courseId)

                assignment.courseTitle = course ? course.name : null

                if(assignment.date.valueOf() > 0) {
                    if(!days[prefix]) {
                        days[prefix] = []
                        daysMap[prefix] = assignment.date.toLocaleDateString('en-us', {dateStyle: 'long'})
                    }
                    days[prefix].push(assignment)
                } else 
                    undated.push(assignment)
            })
            days['undated'] = undated
            daysMap['undated'] = "Undated"
            this.assignmentsByDay = days
            this.daysMap = daysMap
        },
        getDateName(id, name) {
            if(id === this.todayDate) return "Today"
            else if(id === this.tomorrowDate) return "Tomorrow"
            else if(id === this.yesterdayDate) return "Yesterday"
            else return name
        },
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