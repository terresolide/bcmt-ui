import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import moment from 'moment'
const state = () => {
    zip: null
}
const getters = {
    files (state, getters) {
        if (!state.zip) {
            return []
        }
        var list = []
        state.zip.forEach(function (path) {
            list.push(path)
        })
        return list
    },
    in: (state, getters) => (filename) => {
        if (!state.zip) {
            return false
        }
        var into = false
        state.zip.forEach(function (path) {
            if (path === filename) {
                into = true
            }
        })
        return into
    }

}
const mutations = {
    async add (state, file) {
        if (!state.zip) {
           state.zip = new JSZip() 
        }
        const f = await fetch(file.properties.file).then(r => r.blob())
        state.zip.file(file.name, f)
    },
    remove (state, filename) {
        if (state.zip) {
            state.zip.remove(filename)
        }
    },
    download (state) {
        state.zip.generateAsync({type:"blob"}).then(function(content) {
            // see FileSaver.js
            var date = moment().format('YYYYMMDDHHmmss')
            saveAs(content, "bcmt-" + date + ".zip");
        });
        state.zip.forEach(function (path) {
            state.zip.remove(path)
        })
    }

}
const actions = {

}
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
