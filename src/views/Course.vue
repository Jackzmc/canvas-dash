<template>
  <div class="container has-text-white">
  <br>
    <div class="columns">
      <div class="column">
        <div class="columns">
          <div class="column is-1">
             <b-button tag="router-link" to="/" type="is-info" size="is-large" icon-left="arrow-left-circle" />
          </div>
          <div class="column">
            <h2 class="title is-2 has-text-white">{{course.name}}</h2>
          </div>
        </div>

        <div class="box has-text-left">
          <b-tabs v-model="tabIndex">
            <!-- <b-tab-item label="Announcements">

            </b-tab-item> -->
            <b-tab-item label="Notes Preview" :disabled="!notes||notes.length == 0" value="preview">
              <div class="content">
                <VueMarkdown v-if="notes" :source="notes" />
              </div>
            </b-tab-item>
            <b-tab-item label="Edit Notes" value="edit">
              <div class="columns">
                <div class="column is-7">
                  <b-field label="Markdown Editor">
                    <b-input rows=20 style="height: 100%" v-model="notes" type="textarea" />
                  </b-field>
                </div>
                <div class="column content">
                  <VueMarkdown v-if="notes" :source="notes" />
                </div>
              </div>
            </b-tab-item>
          </b-tabs>
        </div>
      </div>
      <div class="column is-4">
        <div class="box has-text-left">
          <aside class="menu">
            <p class="menu-label">
              Main Links
            </p>
            <ul class="menu-list">
              <li><a target="_blank" :href="'https://' + server.domain + '/courses/' + course.id">Canvas Link</a></li>
              <li v-for="(name, link) in autoLinks" :key="link"><a :href="link" target="_blank">{{name}}</a></li>
            </ul>
            <p class="menu-label">
              User Created Links
            </p>
            <ul class="menu-list">
              <li v-for="(name, link) in links" :key="link"><a :href="link" target="_blank" >{{name}}</a></li>
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
            <b-button style="background-color: #7289da; color: white" :loading="discordFinderLoading" icon-left="discord" @click="findDiscordLink">Find Discord Link</b-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
export default {
  props: ['courses', 'server'],
  components: {
      VueMarkdown
  },
  created() {
    const courseInfo = window.localStorage.canvas_course_info ? JSON.parse(window.localStorage.canvas_course_info) : {}
    if(courseInfo && courseInfo[this.course.id]) {
      this.hadExisting = true
      this.links = courseInfo[this.course.id].links
      this.autoLinks = courseInfo[this.course.id].autoLinks || {}
      this.notes = courseInfo[this.course.id].notes || null
    }
    this.tabIndex = this.notes ? "preview" : "edit"
    this.debounceSave = debounce(this, this.save, 5000)
  },
  data() {
    return {
      links: {}, //Map of <URL, Name>,
      autoLinks: {}, //Any links generated automatically (zoom, discord, etc)
      formAddLink: {
        url: null,
        name: null
      },
      hadExisting: false,
      notes: null,
      zoomFinderLoading: false,
      discordFinderLoading: false,
      debounceSave: null,
      tabIndex: null
    }
  },
  computed: {
    course() {
      return this.courses.find(course => course.id == this.$route.params.course)
    },
    notesPreview() {
      return null
    },
  },
  watch: {
    notes() {
      if(this.debounceSave) this.debounceSave()
    }
  },
  methods: {
    addLink() {
      this.$set(this.links, this.formAddLink.url, this.formAddLink.name)
      this.formAddLink.url = null;
      this.formAddLink.name = null,
      this.save()
    },
    save() {
      //Do not save on load
      if(this.hadExisting) {
        this.hadExisting = false
        return;
      }

      this.$buefy.snackbar.open({
        message: 'Successfully saved course info',
        duration: 2500,
        queue: false,
        actionText: null
      })
      let courseInfo = window.localStorage.canvas_course_info ? JSON.parse(window.localStorage.canvas_course_info) : {}
      courseInfo[this.course.id] = {
        links: this.links,
        notes: this.notes,
        autoLinks: this.autoLinks,
      }
      window.localStorage.canvas_course_info = JSON.stringify(courseInfo)
    },
    async findZoomLink() {
      this.zoomFinderLoading = true;
      try {
        const [link, id] = await searchForLink(this.course.id, this.server, ZOOM_LINK_REGEX, 2)
        this.zoomFinderLoading = false
        if(link && id) {
          if(!this.links[link]) {
            this.$set(this.autoLinks, link, `Zoom Link (${id})`)
            this.save()
          }
        }else {
          alert('Sorry, no zoom links could be found')
        }
      }catch(err) {
        console.error('Could not find a zoom link', err)
        alert('Sorry, no zoom links could be found due to an error.')
        this.zoomFinderLoading = false
      }
    },
    async findDiscordLink() {
      this.discordFinderLoading = true;
      try {
        const [link, id] = await searchForLink(this.course.id, this.server, DISCORD_LINK_REGEX, 1)
        this.discordFinderLoading = false
        if(link) {
          if(!this.links[link]) {
            this.$set(this.autoLinks, link, `Discord Link (${id})`)
            this.save()
          }
        }else {
          alert('Sorry, no discord links could be found')
        }
      }catch(err) {
        console.error('Could not find a discord link', err)
        alert('Sorry, no discord links could be found due to an error.')
        this.discordFinderLoading = false
      }
    },
  }
}
const ZOOM_LINK_REGEX = new RegExp(/https?:\/\/.*?\.?zoom.us\/(j|my)\/([a-z0-9-_]+)/im)
const DISCORD_LINK_REGEX = new RegExp(/discord(?:\.com|app\.com|\.gg)\/(?:invite\/)?([a-zA-Z0-9\\-]{2,32})/);
const PAGE_TITLE_REGEX = new RegExp(/(zoom)|(link)|(discord)/i)

async function searchForLink(courseID, server, URL_REGEX, regexIDIndex) {
  const options = {headers: {'Authorization': "Bearer " + server.api}}

  let response, json;
  console.debug('Scanning for URL', URL_REGEX, regexIDIndex, 'on', server.domain, 'for course', courseID)
  console.debug('Scanning tabs')
  //Search via TABS
  response = await fetch(server.url + `/api/v1/courses/${courseID}/tabs`, options)
  json = (await response.json()).find(tab => tab.type === "external" && URL_REGEX.test(tab.url))
  if(json) {
    const match = json.url.match(URL_REGEX)
    return [ match[0], match[regexIDIndex] ]
  }

  console.debug('Scanning pages')
  //Search via PAGES (Needs to view each page.)
  response = await fetch(server.url + `/api/v1/courses/${courseID}/pages`, options)
  if(response.status == 200) {
    json = (await response.json()).filter(page => PAGE_TITLE_REGEX.test(page.title))
    //Find a valid page:
    for(const page of json) {
      console.debug('Searching page', page.title)
      const response = await fetch(server.url + `/api/v1/courses/${courseID}/pages/${page.url}`, options)
      const json = await response.json()

      const match = json.body.match(URL_REGEX)
      if(match) {
        return [ match[0], match[regexIDIndex] ]
      }
    }
  }
  
  console.debug('Scanning modules')
  //Search via MODULES
  response = await fetch(server.url + `/api/v1/courses/${courseID}/modules?include[]=items`, options)
  if(response.status == 200) {
    json = await response.json()
    for(const module of json) {
      for(const item of module.items) {
        if(item.external_url) {
          const match = item.external_url.match(URL_REGEX)
          if(match) return [ item.external_url, match[regexIDIndex] ]
        }
      }
    }
  }

  console.debug('Scanning syllabus')
  //Find via syllabus
  response = await fetch(server.url + `/api/v1/courses/${courseID}?include[]=syllabus_body`, options)
  if(response.status == 200) {
    json = await response.json()
    
    const match = json.syllabus_body.match(URL_REGEX)
    if(match) {
      return [ match[0], match[regexIDIndex] ]
    }
  }

  console.debug('Scanning announcements')
  //find via announcements
  response = await fetch(server.url + `/api/v1/announcements?context_codes[]=course_${courseID}`, options)
  if(response.status == 200) {
    json = await response.json()
    for(const announcement of json) {
        const match = announcement.message.match(URL_REGEX)
        if(match) return [ match[0], match[regexIDIndex] ]
    }
  }

  return [null]
}
function debounce(context, func, delay) {
  let inDebounce
  return function() {
    const args = arguments
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() => func.apply(context, args), delay)
  }
}
</script>