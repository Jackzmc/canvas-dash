<template>
<div class="modal-card" style="width: auto">
    <header class="modal-card-head">
        <p class="modal-card-title">Data Sync</p>
        <button
            type="button"
            class="delete"
            @click="$emit('close')"/>
    </header>
    <section class="modal-card-body">
        <div class="columns">
            <div class="column">
                <b-field v-if="!isFromSetup" label="Export Code">
                    <b-input type="textarea" v-model="exportStr" />
                </b-field>
                <b-field label="Import Code">
                    <b-input type="textarea" v-model="importStr" />
                </b-field>
                <b-field>
                    <b-button type="is-danger" @click="doImport" :disabled="!importStr">Import</b-button>
                </b-field>
            </div>
            <div class="column is-6">
                <h4 class="title is-4">Online Sync</h4>
                <p class="subtitle is-6">Sync your settings online via {{$options.SYNC_SERVER}}. Only your export code is shared.</p>
                <hr>
                <b-field label="Sync Token">
                    <b-input :disabled="!$options.SYNC_SERVER" v-model="syncToken" />
                </b-field>
                <b-field v-if="!syncToken&&!isFromSetup">
                    <b-checkbox v-model="saveToken">
                        Save Token
                    </b-checkbox>
                </b-field>
                <div class="buttons">
                    <!-- <b-button :disabled="syncDisabled" type="is-info" icon-left="sync">Auto Sync</b-button> -->
                    <b-button v-if="!isFromSetup" @click="syncUp" :disabled="!this.$options.SYNC_SERVER" type="is-info" icon-left="upload">
                        <span v-if="syncToken">Upload</span>
                        <span v-else>Generate Token</span>
                    </b-button>
                    <b-button @click="syncDown" :disabled="syncDisabled || !syncToken" type="is-info" icon-left="download">Download</b-button>
                </div>
                <p v-if="isFromSetup">Enter your online sync token to download your data</p>
                <p v-else>Enter a sync token or generate a new one by uploading your current data</p>

            </div>
        </div>
    </section>
    <footer class="modal-card-foot">
        <b-button
            label="Close"
            @click="$emit('close')" 
        />
    </footer>
</div>
</template>

<script>
export default {
    props: ['isFromSetup'],
    SYNC_SERVER: "https://api.jackz.me/canvas-dash-sync",
    data() {
        return {
            exportStr: null,
            importStr: null,
            syncToken: null,
            saveToken: true,
        }
    },
    created() {
        if(window.localStorage.canvas_sync_token && this.saveToken && !this.isFromSetup) {
            this.syncToken = window.localStorage.canvas_sync_token
        }
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
            .then(r => {
                if(!r.ok) {
                    this.$buefy.dialog.alert({
                        type: 'is-danger',
                        title: 'Server Error',
                        message: `<b>The server returned an error. </b><br>${r.status} ${r.statusText}`
                    })
                    return null;
                }
                if(r.status == 204) {
                    this.$buefy.toast.open({
                       type: 'is-success',
                        message: 'Successfully synchronized your data'
                    })
                    return null;
                }
                return r.json()
            })
            .then(json => {
                if(!json) return;
                if(json.token && this.saveToken) 
                    window.localStorage.canvas_sync_token = json.token
                
                this.syncToken = json.token
                this.$buefy.toast.open({
                    type: 'is-success',
                    message: 'Successfully synchronized your data'
                })
            })
            .catch(err => {
                this.$buefy.dialog.alert({
                    type: 'is-danger',
                    title: 'Request Failed',
                    message: err.message
                })
                console.error('Sync UP error', err)
            })
        },
        syncDown() { 
            fetch(`${this.$options.SYNC_SERVER}/${this.syncToken}`, {method: 'GET'})
            .then(r => r.json())
            .then(json => {
                if(json) {
                    this.importStr = json.raw
                    this.doImport()
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
                        window.localStorage.canvas_course_info = JSON.stringify(json.course_info);
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
                schedule: window.localStorage.canvas_schedule ? JSON.parse(window.localStorage.canvas_schedule) : null,
                course_info: window.localStorage.canvas_course_info ? JSON.parse(window.localStorage.canvas_course_info) : null
            }
            this.exportStr = JSON.stringify(exportStr)
        }
    }
}
</script>