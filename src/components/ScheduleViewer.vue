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
            <tr v-for="course in todayCourses" :key="course.id">
                <th class="has-text-left">
                    <a :href="course.url">{{course.cleanName || course.name}}</a>
                </th>
                <td class="has-text-right">{{course.starts}}</td>
                <td class="has-text-right">{{course.ends}}</td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
import classSchedules from '@/data/schedule.json'
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default {
  props: ['classes'],
  name: 'ScheduleViewer',
  classSchedules,
  data() {
      return {

      }
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
      courses() {
          return this.$options.classSchedules
          .map(entry => {
              if(!entry.id) return entry;
              const classData = this.classes.find(v => v.id === entry.id)
              if(!classData) {
                console.warn(`Schedule entry's id not found on canvas`, entry)
                return entry;
              }
              const cleanName = classData.name.split(" ").slice(0, 2).join(" ")
              return Object.assign(entry, classData, {cleanName, hasCanvasData: true})
          }).filter(v => v)
      },
      todayCourses() {
          return this.courses.filter(v => v.days.includes(this.today))
      }
  }
}
</script>