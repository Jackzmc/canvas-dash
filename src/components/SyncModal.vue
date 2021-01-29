<template>
<div class="modal-card" style="width: auto">
    <header class="modal-card-head">
        <p class="modal-card-title">Sync Modal</p>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
    </header>
    <section class="modal-card-body">
        <div class="columns">
            <div class="column">
                <b-field label="Export Code">
                    <b-input type="textarea" v-model="exportStr" />
                </b-field>
                <b-field label="Import Code">
                    <b-input type="textarea" v-model="importStr" />
                </b-field>
                <b-field>
                    <b-button type="is-danger" @click="doImport" :disabled="!importStr">Import</b-button>
                </b-field>
            </div>
            <div class="column is-5">
                <h4 class="title is-4">Sync</h4>
                <p class="subtitle is-6">Sync your settings online via {{$options.SYNC_SERVER}}. Only your export code is shared.</p>
                <hr>
                <b-field label="Sync Token">
                    <b-input :disabled="!$options.SYNC_SERVER" v-model="syncToken" />
                </b-field>
                <div class="buttons">
                    <!-- <b-button :disabled="syncDisabled" type="is-info" icon-left="sync">Auto Sync</b-button> -->
                    <b-button @click="syncUp" :disabled="syncDisabled" type="is-info" icon-left="upload">Upload</b-button>
                    <b-button @click="syncDown" :disabled="syncDisabled || !syncToken" type="is-info" icon-left="download">Download</b-button>
                </div>
                <p>Enter a sync token or generate a new one by uploading</p>

            </div>
        </div>
    </section>
    <footer class="modal-card-foot">
        <b-button
            label="Cancel"
            @click="$emit('close')" 
        />
    </footer>
</div>
</template>

<script>
export default {
    SYNC_SERVER: "https://api.jackz.me/canvas-dash-sync",
    data() {
        return {
            exportStr: null,
            importStr: null,
            syncToken: null
        }
    },
    created() {
        this.getExportStr()
    },
    computed: {
        syncDisabled() {
           return !this.$options.SYNC_SERVER || this.syncToken && this.syncToken.trim().length == 0
        }
    },
    methods: {
        syncUp() {
            const token = this.syncToken || ""
            const method = this.syncToken ? "PUT" : "POST"
            fetch(`${this.$options.SYNC_SERVER}/${token}`, {method, body: this.exportStr, headers: {'Content-Type': 'application/json'}})
            .then(r => r.json())
            .then(json => {
                this.syncToken = json.token
                this.$buefy.toast.open({
                    type: 'is-success',
                    message: 'Successfully synchronized your data'
                })
            })
            .catch(err => {
                this.$buefy.dialog.alert({
                    type: 'is-danger',
                    title: 'Server Error',
                    message: `<b>The server returned an error. </b><br>${err.message}`
                })
            })
        },
        syncDown() { 
            fetch(`${this.$options.SYNC_SERVER}/${this.syncToken}`, {method: 'GET'})
            .then(r => r.json())
            .then(json => {
                if(json) {
                    this.importStr = json.raw
                    this.$buefy.toast.open({
                        type: 'is-success',
                        message: 'Successfully synchronized your data'
                    })
                }else {
                    this.$buefy.toast.open({
                        type: 'is-danger',
                        message: 'Your sync token does not exist'
                    })
                }
            })
            .catch(() => {
                this.$buefy.toast.open({
                    type: 'is-danger',
                    message: 'Your sync token does not exist'
                })
            })
        },
        doImport() {
            try {
                //TODO: Implement version check
                const json = JSON.parse(this.importStr)
                if(!json.meta) throw new Error('Missing field meta');
                this.$buefy.dialog.confirm({
                    title: 'Confirm Input',
                    message: 'Are you sure you want to import this code? It will overwrite all your current data.<br>'
                        + `Import App Version: <b>${json.appVersion}</b><br>Your Version: <b>${this.$VERSION}</b>`,
                    confirmText: 'Import',
                    type: 'is-warning',
                    hasIcon: true,
                    onConfirm: () => {
                        window.localStorage.canvas_meta = JSON.stringify(json.meta)
                        window.localStorage.canvas_schedule = JSON.stringify(json.schedule)
                        window.location.reload()
                    }
                })
            }catch(err) {
                this.$buefy.dialog.alert({
                    type: 'is-danger',
                    title: 'Import Failure',
                    message: `The import code provided is invalid. Cannot import.`
                })
            }

        },
        getExportStr() {
            const exportStr = {
                date: new Date(),
                appVersion: this.$VERSION,
                meta: JSON.parse(window.localStorage.canvas_meta),
                schedule: window.localStorage.canvas_schedule ? JSON.parse(window.localStorage.canvas_schedule) : null
            }
            this.exportStr = JSON.stringify(exportStr)
        }
    }
}
</script>