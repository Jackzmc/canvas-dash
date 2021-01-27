<template>
  <div class="container has-text-white">
  <br>
    <h4 class="title is-4 has-text-white">Course Details</h4>
    <p class="subtitle is-6 has-text-white">{{course.name}}</p>
    <div class="columns">
      <div class="column">

      </div>
      <div class="column is-4">
        <div class="box">
          <h4 class="title is-4">Links</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['classes'],
  data() {
    return {

    }
  },
  computed: {
    course() {
      return this.classes.find(course => course.id == this.$route.params.course)
    }
  }
}
</script>