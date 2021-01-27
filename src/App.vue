<template>
  <div id="app">
    <div v-if="isSetup">
      <router-view v-if="ready" :courses="classes" :ready="ready" :server="server" :schedule="schedule" />
      <div class="container" v-else>
        <br>
        <h1 class="has-text-white has-text-centered title is-1">Loading...</h1>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      classes: [],
      server: null,
      ready: false,
      isSetup: false,
      setupModal: null,
      schedule: null
    }
  },
  //TODO: Course pickler selection
  created() {
    document.addEventListener('swUpdated', this.updateAvailable, { once: true })
    if(window.localStorage.canvas_meta) {
        const metaJson = JSON.parse(window.localStorage.canvas_meta);
        const schedJson = window.localStorage.canvas_schedule ? JSON.parse(window.localStorage.canvas_schedule) : []
        this.server = metaJson.server,
        this.schedule = schedJson

        //migration
        if(!metaJson.server.api && metaJson.apiKey) {
          this.server.api = metaJson.apiKey
          delete metaJson.apiKey
          window.localStorage.canvas_meta = JSON.stringify(metaJson)
        } 

        this.isSetup = true;
        //TODO: Instead pull canvas_app_key from local storage, cache courses possibly?
        fetch(this.server.url + '/api/v1/courses?include[]=tabs&per_page=100', {
          headers: {
            'Authorization': "Bearer " + this.server.api
          }
        })
        .then(r => r.json())
        .then(courses => {
            this.classes = courses.filter(course => course)
            this.ready = true;
        })
        .catch(err => {
          console.error('err fetch', err)
        })
    }else{
      this.setupModal = this.$buefy.modal.open({
        parent: this,
        canCancel: false,
        autoFocus: true,
        events: {
          init: ({apiKey, server, schedule, courses}) => {
            server.api = apiKey
            this.server = server
            this.classes = courses.filter(course => course)
            window.localStorage.setItem('canvas_meta', JSON.stringify({server, announcements: [], shownCourses: [], assignments: []}))
            window.localStorage.setItem('canvas_schedule', JSON.stringify(schedule))
            this.ready = true;
            this.isSetup = true
          }
        },
        component: () => import('@/components/Setup.vue')
      })
    }
  },
  methods: {
    updateAvailable(event) {
      console.log(event)
    },
  },
  destroyed() {
    if(this.setupModal) this.setupModal.close()
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

html, body {
  background: #525252;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #3d72b4, #525252);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #3d72b4, #525252); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  height: 100%;
  width: 100%
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
