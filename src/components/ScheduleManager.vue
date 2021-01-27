<template>
<div class="modal-card" style="width: auto">
    <header class="modal-card-head">
        <p class="modal-card-title">Manage Schedule</p>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
    </header>
    <section class="modal-card-body">
        <h5 class="title is-5">Current Schedule</h5>
        <table class="table is-fullwidth">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Days</th>
                    <th>Starts</th>
                    <th>Ends</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="entry in schedule" :key="entry.id">
                    <td>{{entry.name}}</td>
                    <td>{{entry.course || 'None'}}</td>
                    <td>{{entry.days.join(", ")}}</td>
                    <td>{{entry.starts}}</td>
                    <td>{{entry.ends}}</td>
                    <td><b-button @click="deleteEntry(entry.id)" type="is-danger" icon-left="delete"></b-button></td>
                </tr>
            </tbody>
        </table>
        <hr>
        <h5 class="title is-5">Add New Schedule Entry</h5>
        <form @submit.prevent="submitEntry">
            <b-field label="Name">
                <b-input v-model="addEntry.name" placeholder="Lunch" required />
            </b-field>
            <b-field label="Course">
                <b-select v-model="addEntry.course" placeholder="Select a course (optional)">
                    <option value="none" selected>None</option>
                    <option v-for="course in courses" :key="course.id" :value="course.id">{{course.name}}</option>
                </b-select>
            </b-field>
            <b-field label="Days">
                <div class="block">
                    <b-checkbox v-model="addEntry.days"
                        native-value="M">
                        Monday
                    </b-checkbox>
                    <b-checkbox v-model="addEntry.days"
                        native-value="T">
                        Tuesday
                    </b-checkbox>
                    <b-checkbox v-model="addEntry.days"
                        native-value="W">
                        Wednesday
                    </b-checkbox>
                    <b-checkbox v-model="addEntry.days"
                        native-value="R">
                        Thursday
                    </b-checkbox>
                    <b-checkbox v-model="addEntry.days"
                        native-value="F">
                        Friday
                    </b-checkbox>
                </div>
            </b-field>
            <b-field label="Days In Person">
                <div class="block">
                    <b-checkbox v-model="addEntry.inPersonDays"
                        native-value="M">
                        Monday
                    </b-checkbox>
                    <b-checkbox v-model="addEntry.inPersonDays"
                        native-value="T">
                        Tuesday
                    </b-checkbox>
                    <b-checkbox v-model="addEntry.inPersonDays"
                        native-value="W">
                        Wednesday
                    </b-checkbox>
                    <b-checkbox v-model="addEntry.inPersonDays"
                        native-value="R">
                        Thursday
                    </b-checkbox>
                    <b-checkbox v-model="addEntry.inPersonDays"
                        native-value="F">
                        Friday
                    </b-checkbox>
                </div>
            </b-field>
            <b-field grouped>
                <b-field label="Starts">
                    <b-timepicker v-model="addEntry.starts" inline required :increment-minutes="5" :default-minutes="0"></b-timepicker>
                </b-field>
                <b-field label="Ends">
                    <b-timepicker v-model="addEntry.ends" inline required :increment-minutes="5" :default-minutes="0"></b-timepicker>
                </b-field>
            </b-field>
            <b-field>
                <b-button :disabled="cantSubmit" native-type="submit" type="is-primary">Add Entry</b-button>
            </b-field>
            <br>
        </form>
    </section>
    <footer class="modal-card-foot">
        <b-button
            label="Save Schedule"
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
    props: ['courses', 'preSchedule'],
    data() {
        return {
            addEntry: {
                name: null,
                course: "none",
                days: [],
                inPersonDays: [],
                starts: null,
                ends: null
            },
            schedule: []
        }   
    },
    computed: {
        cantSubmit() {
            return !this.addEntry.name
                || !this.addEntry.days
                || !this.addEntry.starts
                || !this.addEntry.ends
                || this.addEntry.days.length == 0
        }
    },
    methods: {
        submitEntry() {
            this.schedule.push({
                name: this.addEntry.name,
                course: this.addEntry.course === "none" ? null : this.addEntry.course,
                days: this.addEntry.days,
                starts: this.addEntry.starts.toLocaleString([], { hour: '2-digit', minute: '2-digit' }),
                ends: this.addEntry.ends.toLocaleString([], { hour: '2-digit', minute: '2-digit' }),
                id: this.addEntry.name + this.addEntry.days.toString()
            })
            this.addEntry.name = null;
            this.addEntry.course = "none"
            this.addEntry.days = []
            this.addEntry.starts = null
            this.addEntry.ends = null
        },
        submit() {
            this.$emit('submit', this.schedule)
            this.$emit('close')
        },
        deleteEntry(id) {
            for(let i = 0; i < this.schedule.length; i++) {
                if(this.schedule[i].id === id) {
                    this.schedule.splice(i, 1);
                    break;
                }
            }
            console.warn('Could not delete entry as it does not exist:', id)
        }
    },
    created() {
        if(this.preSchedule && Array.isArray(this.preSchedule)) {
            this.schedule = this.preSchedule.filter(a => a)
        }
    }
}
</script>
