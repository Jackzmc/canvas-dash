<template>
  <div id="app">
    <div v-if="isSetup">
      <router-view v-if="ready" :courses="classes" :server="server"/>
      <div class="container" v-else>
        <br>
        <div class="info has-text-white">Loading your dashboard...</div>
        <b-loading :active="!ready" />
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
    }
  },
  created() {
    document.addEventListener('swUpdated', this.updateAvailable, { once: true })
    if(window.localStorage.canvas_meta) {
        const metaJson = JSON.parse(window.localStorage.canvas_meta);
        this.server = metaJson.server
        //migration
        if(!metaJson.server.api && metaJson.apiKey) {
          this.server.api = metaJson.apiKey
          delete metaJson.apiKey
          window.localStorage.canvas_meta = JSON.stringify(metaJson)
        } 

        this.isSetup = true;
        fetch(this.server.url + '/api/v1/courses?include[]=tabs&per_page=100', {
          headers: {
            'Authorization': "Bearer " + this.server.api
          },
          cache: 'force-cache'
        })
        .then(r => r.json())
        .then(courses => {
            this.classes = courses.map(course => {
              if(metaJson.selectedCourses) {
                return {
                  ...course,
                  visible: metaJson.selectedCourses.includes(course.id)
                }
              }else{
                return {
                  ...course,
                  visible: true
                }
              }
            })
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
      this.$buefy.snackbar.open({
        type: 'is-danger',
        message: 'An update is available.',
        actionText: 'Reload',
        onAction() {
          window.location.reload()
        }
      })
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
  background: #383838;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #3d72b4, #525252);  /* Chrome 10-25, Safari 5.1-6 */
  width: 100%;
  height: 100%
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
.info {
  position: fixed;
  top: 40%;
  left: 50%;
  margin-top: -50px;
  margin-left: -100px;
  font-size: 20px
}
</style>
