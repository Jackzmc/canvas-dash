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
                    <b-tooltip label="The current or next class" v-if="activeEntryID == entry.id">
                        &nbsp;<b-icon type="is-success" icon="star" />
                    </b-tooltip>
                    <router-link v-if="entry.type === 'COURSE'" :to="'/course/' + entry.id" :class="{'has-text-success': activeEntryID == entry.id}">
                        {{entry.cleanName || entry.name || "%3Cuntitled%3E"}}
                    </router-link>
                    <span v-else :class="{'has-text-success': activeEntryID == entry.id}">{{entry.name || "%3Cuntitled%3E"}}</span>
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
          activeEntryID: null
      }
  },
  created() {
    //update active entry every 10 min
    setInterval(() => {
        const currentMS = Date.now()
        let smallestDifference = -1;
        this.todaysSchedule = this.schedule.forEach(({id,timestamp}) => {
            const difference = currentMS - timestamp.valueOf()
            if(difference < smallestDifference || smallestDifference == -1) {
                this.activeEntryID = id,
                smallestDifference = difference
            }
        })
                    
        //Check if active entry is over
        this.checkForEndedActive()
    }, 1000 * 60 * 60 * 10);

    this.getTodaysSchedule()
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
  },
  methods: {
       getTodaysSchedule() {
            const currentMS = Date.now()
            let smallestDifference = -1;
            this.todaysSchedule = this.schedule.filter(v => v.days.includes(this.today))
            .map(entry => {
                const timestamp = getTimestampFromTime(entry.starts)
                const difference = currentMS - timestamp
                if( difference < smallestDifference || smallestDifference == -1) {
                    this.activeEntryID = entry.id,
                    smallestDifference = difference
                }

                return {
                    ...entry,
                    isInPersonToday: entry.inPersonDays ? entry.inPersonDays.includes(this.today) : false,
                    timestamp
                }
            })
            .sort((a,b) => b.timestamp - a.timestamp)
          
            //Check if active entry is over
            this.checkForEndedActive()
      },
      checkForEndedActive() {
            const activeEntry = this.schedule.find(entry => entry.id === this.activeEntryID)
            if(activeEntry) {
                const startTimestamp = getTimestampFromTime(activeEntry.starts)
                const endTimestamp = getTimestampFromTime(activeEntry.ends)
                //If the start timestamp is bigger (aka over) the end timestamp, remove it
                if(startTimestamp > endTimestamp) {
                    this.activeEntryID = null;
                }
            }
      }
  }
}
function getTimestampFromTime(inputTime) {
    const timestamp = new Date();
    const [time, period] = inputTime.split(" ")
    const [hours, minutes] = time.split(":")
    if(period == "PM" && hours < 12 )
        timestamp.setHours(hours + 12)
    else if(period == "AM" && hours == 12) 
        timestamp.setHours(0)
    else
        timestamp.setHours(hours)
    if(minutes) timestamp.setMinutes(minutes)
    return Date.now() - timestamp.valueOf()
}
</script>