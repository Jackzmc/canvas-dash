<template>
<div class="box">
    <h4 class="title is-4">{{todayName}}'s Classes</h4>
    <table class="table is-fullwidth">
        <thead>
            <tr>
                <th>Course</th>
                <th>Starts</th>
                <th>Ends</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="entry in todaysSchedule" :key="entry.id">
                <th class="has-text-left">
                    <router-link v-if="entry.type === 'COURSE'" :to="'/course/' + entry.id">{{entry.cleanName || entry.name || "%3Cuntitled%3E"}}</router-link>
                    <span v-else>{{entry.name || "%3Cuntitled%3E"}}</span>
                    <b-tooltip label="Class is in person today" v-if="entry.isInPersonToday">
                        &nbsp;<b-icon icon="account-group" />
                    </b-tooltip>
                </th>
                <td class="has-text-right">{{entry.starts}}</td>
                <td class="has-text-right">{{entry.ends}}</td>
            </tr>
        </tbody>
    </table>
</div>
</template>
<!-- TODO: Implement next class highlights in view -->


<script>

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default {
    //TODO: add schedule to props
  props: ['courses'],
  name: 'ScheduleViewer',
  data() {
      return {
          schedule: []
      }
  },
  created() {
      if(window.localStorage.canvas_schedule)
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
  },
  computed: {
      todayName() {
          return DAY_NAMES[new Date().getDay()]
      },
      today() {
          const day = new Date().toString().slice(0,1).toUpperCase();
          if(day == "S") return "M";
          return day;
      },
      todaysSchedule() {
          return this.schedule.filter(v => v.days.includes(this.today)).map(entry => {
              return {
                  ...entry,
                  isInPersonToday: entry.inPersonDays ? entry.inPersonDays.includes(this.today) : false
              }
          })
      }
  }
}
</script>