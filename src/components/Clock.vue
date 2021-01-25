<template>
    <div class="box">
        <h4 class="title is-4">{{time}}</h4>
        <p class="subtitle is-5">{{date}}</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            timer: null,
            time: null,
            date: null,
        }
    },
    created() {
        this.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        this.date = new Date().toLocaleDateString()
        this.timer = setInterval(() => {
            this.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, 1000 * 60 )
    },
    destroyed() {
        clearInterval(this.timer)
    }
}
</script>