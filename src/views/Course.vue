<template>
  <div class="container has-text-white">
  <br>
    <div class="columns">
      <div class="column">
        <h4 class="title is-4 has-text-white">Course Details</h4>
        <p class="subtitle is-6 has-text-white">{{course.name}}</p>
      </div>
      <div class="column is-4">
        <div class="box">
          <h4 class="title is-4">Links</h4>
          <aside class="menu">
            <ul class="menu-list">
              <li><a :href="'https://' + server.domain + '/courses/' + course.id">Canvas Link</a></li>
              <li v-for="(name, link) in links" :key="link"><a :href="link">{{name}}</a></li>
            </ul>
          </aside>
          <hr>
          <form @submit.prevent="addLink">
            <b-field horizontal  label="Name">
              <b-input required v-model="formAddLink.name" placeholder="My Link" />
            </b-field>
            <b-field horizontal label="URL">
              <b-input required v-model="formAddLink.url" placeholder="https://google.com" />
            </b-field>
            <b-field>
              <b-button native-type="submit" type="is-success" expanded :disabled="!formAddLink.name || !formAddLink.url">Add Link</b-button>
            </b-field>
          </form>
          <hr>
          <h5 class="title is-5">Utilities</h5>
          <div class="buttons">
            <b-button type="is-info" :loading="zoomFinderLoading" icon-left="video" @click="findZoomLink">Find Zoom Link</b-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['courses', 'server'],
  created() {
    const courseInfo = window.localStorage.canvas_course_info ? JSON.parse(window.localStorage.canvas_course_info) : {}
    if(courseInfo[this.course.id]) {
      this.links = courseInfo[this.course.id].links
    }
  },
  data() {
    return {
      links: {}, //Map of <URL, Name>
      formAddLink: {
        url: null,
        name: null
      },
      zoomFinderLoading: false
    }
  },
  computed: {
    course() {
      return this.courses.find(course => course.id == this.$route.params.course)
    }
  },
  methods: {
    addLink() {
      this.$set(this.links, this.formAddLink.url, this.formAddLink.name)
      this.formAddLink.url = null;
      this.formAddLink.name = null
    },
    async findZoomLink() {
      this.zoomFinderLoading = true;
      try {
        const link = await searchZoomLink(this.course.id, this.server)
        this.zoomFinderLoading = false
        if(link) {
          if(!this.links[link])
            this.$set(this.links, link, "Zoom Link")
        }else {
          alert('Sorry, no zoom links could be found')
        }
      }catch(err) {
        alert('Sorry, no zoom links could be found due to an error.')
        console.error('Could not find a zoom link', err)
        this.zoomFinderLoading = false
      }
    },
  }
}
const ZOOM_LINK_REGEX = new RegExp(/https?:\/\/.*?\.?zoom.us\/(j|my)\/([a-z0-9-_]+)/im)
const PAGE_TITLE_REGEX = new RegExp(/(zoom)|(link)/i)

async function searchZoomLink(courseID, server) {
  const options = {headers: {'Authorization': "Bearer " + server.api}}

  let response, json;

  //Search via TABS
  response = await fetch(server.url + `/api/v1/courses/${courseID}/tabs`, options)
  json = (await response.json()).find(tab => ZOOM_LINK_REGEX.test(tab))
  if(json) return json;

  //Search via PAGES (Needs to view each page.)
  response = await fetch(server.url + `/api/v1/courses/${courseID}/pages`, options)
  json = (await response.json()).filter(page => PAGE_TITLE_REGEX.test(page.title))
  //Find a valid page:
  for(const page of json) {
    const response = await fetch(server.url + `/api/v1/courses/${courseID}/pages/${page.url}`, options)
    const json = await response.json()

    const match = json.body.match(ZOOM_LINK_REGEX)
    if(match && match.length === 3) {
      return match[0]
    }
  }
  
  //Search via MODULES
  response = await fetch(server.url + `/api/v1/courses/${courseID}/modules?include[]=items`, options)
  json = (await response.json())
  for(const module of json) {
    for(const item of module.items) {
      const match = ZOOM_LINK_REGEX.test(item.external_url)
      if(match) return item.external_url
    }
  }

  //Find via syllabus
  response = await fetch(server.url + `/api/v1/courses/${courseID}?include[]=syllabus_body`, options)
  json = (await response.json())
  
  const match = json.syllabus_body.match(ZOOM_LINK_REGEX)
  if(match && match.length === 3) {
    return match[0]
  }
}

</script>