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
                        &nbsp;<b-icon type="is-success" size="is-small" icon="star" />
                    </b-tooltip>
                    <router-link v-if="entry.type === 'COURSE'" :to="'/course/' + entry.course.id" :class="{'has-text-success': activeEntryID == entry.id}">
                        <b-tooltip :label="entry.course ? entry.course.name : entry.id">{{entry.cleanName || entry.name || "%3Cuntitled%3E"}}</b-tooltip>
                    </router-link>
                    <span v-else :class="{'has-text-success': activeEntryID == entry.id}">
                        {{entry.name || "%3Cuntitled%3E"}}
                    </span>
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
<!-- TFIXME: fix incorrect active entry -->


<script>
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default {
    props: ['courses', 'schedule'],
    name: 'ScheduleViewer',
    data() {
        return {
            activeEntryID: null,
            today: null
        }
    },
    created() {
        //update active entry every 10 min
        setInterval(() => {
            this.getTodaysSchedule()
        }, 1000 * 60 * 60 * 40);
        this.getTodaysSchedule()
    },
    computed: {
        todayName() {
            return DAY_NAMES[new Date().getDay()]
        },
    },
    methods: {
        //timestamps to test:
        /*
        1613577933578   10:05
        1613584372571   11:52
        1613586087820   12:16
        */
        getTodaysSchedule() {
            const TODAY_DATE = new Date();
            this.today = getDayLetter(TODAY_DATE);
            if(this.schedule.length == 0) return;
            this.todaysSchedule = this.schedule
            .filter(v => v.days.includes(this.today))
            .map(entry => {
                const startTimestamp = getTimestampFromTime(TODAY_DATE, entry.starts)
                const endTimestamp = getTimestampFromTime(TODAY_DATE, entry.ends)
                return {
                    ...entry,
                    isInPersonToday: entry.inPersonDays ? entry.inPersonDays.includes(this.today) : false,
                    startTimestamp,
                    endTimestamp,
                }
            })
            .sort((a,b) => a.startTimestamp - b.startTimestamp)

            const currentMS = Date.now()
            //Loop entries, first entry that is 
            const activeEntry = this.todaysSchedule.find(entry => {
                // startTimestamp < currentMS < endTimestamp
                if(entry.startTimestamp <= currentMS && currentMS <= entry.endTimestamp) {
                    return entry;
                }
            })
            if(activeEntry) {
                this.activeEntryID = activeEntry.id;
            }else if(this.todaysSchedule[0].endTimestamp >= currentMS) {
                this.activeEntryID = this.todaysSchedule[0].id
            }
        }
    }
}

function getDayLetter(date) {
    const part = date.toString().slice(0,2).toUpperCase()
    switch(part) {
        case "TU": 
            return "T"
        case "TH": 
            return "R"
        case "SU": 
        case "SA": 
            return "M"
        default: 
            return part[0]
    }
}
function getTimestampFromTime(TODAY_DATE, inputTime) {
    const timestamp = new Date(TODAY_DATE.valueOf())
    const [time, period] = inputTime.split(" ")
    const [hours, minutes] = time.split(":")
    if(period == "PM" && hours < 12 )
        timestamp.setHours(hours + 12)
    else if(period == "AM" && hours == 12) 
        timestamp.setHours(0)
    else
        timestamp.setHours(hours)
    if(minutes) timestamp.setMinutes(minutes)
    return timestamp.valueOf()
}
</script>