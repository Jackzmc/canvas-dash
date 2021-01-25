<template>
  <div id="app">
    <router-view :classes="classes" :ready="ready" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      classes: [],
      ready: false
    }
  },
  created() {
    //TODO: Instead pull canvas_app_key from local storage, cache courses possibly?
    fetch(process.env.VUE_APP_URL + '/api/v1/courses', {
      headers: {
        'Authorization': "Bearer " + process.env.VUE_APP_CANVAS_APP_KEY
      }
    })
    .then(r => r.json())
    .then(courses => {
        const currentYear = new Date().getFullYear();
        this.classes = courses.filter(course => {
          //Filter out any old classes (ex: 2020 classes)
          const startAt = new Date(course.start_at)
          return startAt.getFullYear() >= currentYear
        }).map(course => {
          return {
            ...course,
            url: `${this.$DISPLAYURL}/courses/${course.id}`
          }
        })
        this.ready = true;
    })
    .catch(err => {
      console.error('err fetch', err)
    })
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
