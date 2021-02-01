<template>
<div>
    <p class="title is-4 has-text-white">Current version of canvas dashboard is <em>v{{$VERSION}}</em></p>
    <div class="box content has-text-left">
        <VueMarkdown :source="markdown" />
    </div>
</div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
export default {
    components: {
        VueMarkdown
    },
    data() {
        return {
            markdown: null
        }
    },
    created() {
        fetch('https://raw.githubusercontent.com/Jackzmc/canvas-dash/master/public/Changelog.md')
        .then(response => response.text())
        .then(text => this.markdown = text)
    }
}
</script>