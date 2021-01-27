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
                    <b-tooltip label="The current or next class" v-if="activeEntry == entry.id">
                        &nbsp;<b-icon type="is-success" icon="star" />
                    </b-tooltip>
                    <router-link v-if="entry.type === 'COURSE'" :to="'/course/' + entry.id" :class="{'has-text-success': activeEntry == entry.id}">
                        {{entry.cleanName || entry.name || "%3Cuntitled%3E"}}
                    </router-link>
                    <span v-else :class="{'has-text-success': activeEntry == entry.id}">{{entry.name || "%3Cuntitled%3E"}}</span>
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
          schedule: [],
          activeEntry: null
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
            const currentMS = Date.now()
            let smallestDifference = -1;
            return this.schedule.filter(v => v.days.includes(this.today))
            .map(entry => {
                const timestamp = new Date()
                const [time, period] = entry.starts.split(" ")
                const [hours, minutes] = time.split(":")
                if(period == "PM")
                    timestamp.setHours(hours + 12)
                else
                    timestamp.setHours(hours)
                if(minutes) timestamp.setMinutes(minutes)

                const difference = currentMS - timestamp.valueOf()
                if(difference > 0 && difference < smallestDifference || smallestDifference == -1) {
                    this.activeEntry = entry.id,
                    smallestDifference = difference
                }

                return {
                    ...entry,
                    isInPersonToday: entry.inPersonDays ? entry.inPersonDays.includes(this.today) : false,
                    timestamp: timestamp.valueOf()
                }
            })
          
      }
  }
}
</script>