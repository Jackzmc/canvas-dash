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
  props: ['courses', 'schedule'],
  name: 'ScheduleViewer',
  data() {
      return {
          activeEntry: null
      }
  },
  created() {
    //update active entry every 10 min
    setInterval(() => {
        const currentMS = Date.now()
        let smallestDifference = -1;
        this.schedule.forEach(({id,timestamp}) => {
            const difference = currentMS - timestamp.valueOf()
            if(difference < smallestDifference || smallestDifference == -1) {
                console.log(this.activeEntry, id, difference)
                this.activeEntry = id,
                smallestDifference = difference
            }
        })
    }, 1000 * 60 * 60 * 10);
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
                if(period == "PM" && hours < 12 )
                    timestamp.setHours(hours + 12)
                else if(period == "AM" && hours == 12) 
                    timestamp.setHours(0)
                else
                    timestamp.setHours(hours)
                if(minutes) timestamp.setMinutes(minutes)
                const difference = currentMS - timestamp.valueOf()
                console.log(entry.name, timestamp.valueOf(), currentMS, difference)
                if( difference < smallestDifference || smallestDifference == -1) {
                    this.activeEntry = entry.id,
                    smallestDifference = difference
                }

                return {
                    ...entry,
                    isInPersonToday: entry.inPersonDays ? entry.inPersonDays.includes(this.today) : false,
                    timestamp: timestamp.valueOf()
                }
            })
            .sort((a,b) => a.timestamp - b.timestamp)
          
      }
  }
}
</script>