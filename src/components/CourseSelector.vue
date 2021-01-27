<template>
<div class="modal-card" style="width: auto">
    <header class="modal-card-head">
        <p class="modal-card-title">Manage Courses</p>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
    </header>
    <section class="modal-card-body">
        <p class="subtitle is-4">Select all the courses you want to view</p>
        <b-field>
            <b-select
                multiple
                native-size="8"
                v-model="shownClasses"
                size="is-large"
                expanded
            >
                <option v-for="course in courses" :value="course.id" :key="course.id">
                    {{course.name}}    
                </option>
            </b-select>
        </b-field>
    </section>
    <footer class="modal-card-foot">
        <b-button
            label="Save Courses"
            type="is-success"
            @click="submit()"
        />
        <b-button
            label="Cancel"
            @click="$emit('close')" 
        />
    </footer>
</div>
</template>

<script>
export default {
    props: ['courses'],
    created() {
        this.courses.filter(course => course.visible).forEach(course => this.shownClasses.push(course.id))
    },
    data() {
        return {
            shownClasses: []
        }
    },
    methods: {
        submit() {
            this.$emit('submit', this.shownClasses)
            this.$emit('close')
        }
    }
}
</script>