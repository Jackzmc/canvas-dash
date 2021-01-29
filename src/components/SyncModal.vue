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
                <b-message type="is-danger">
                    The online sync feature is not implemented at this time.
                </b-message>
                <h4 class="title is-4">Sync</h4>
                <p class="subtitle is-6">Sync your settings online via {{$options.SYNC_SERVER}}. Only your export code is shared.</p>
                <hr>
                <b-field label="Sync Token">
                    <b-input :disabled="!$options.SYNC_SERVER" v-model="syncToken" />
                </b-field>
                <div class="buttons">
                    <b-button :disabled="syncDisabled" type="is-info" icon-left="sync">Sync</b-button>
                    <b-button @click="getSyncToken" type="is-dark" >Create Token</b-button>
                </div>
                <p>Enter a sync token or generate a new one.</p>

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
    SYNC_SERVER: null,
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
           return !this.$options.SYNC_SERVER || !this.syncToken || this.syncToken.trim().length == 0
        }
    },
    methods: {
        getSyncToken() {
            fetch(`https://api.jackz.me/canvas-dash/sync?mode=create_token`, {methods: 'POST'})
            .then(r => r.json())
            .then(json => {
                this.syncToken = json.token
            })
            .catch(err => {
                this.$buefy.dialog.alert({
                    type: 'is-danger',
                    title: 'Server Error',
                    message: `<b>The server returned an error. </b><br>${err.message}`
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
                        + `Code's App Version: ${json.appVersion}, current App Version: ${this.$VERSION}`,
                    confirmText: 'Import',
                    type: 'is-warning',
                    hasIcon: true,
                    onConfirm: () => {
                        window.localStorage.canvas_meta = JSON.stringify(json.meta)
                        window.localStorage.canvas_schedule = JSON.stringify(json.schedule)
                        window.reload()
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