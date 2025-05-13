import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import moment from 'moment'
const state = () => {
    return {
        zip: null,
        limit: 30
    }
}
const getters = {
    files (state, getters) {
        if (!state.zip) {
            return []
        }
        return Object.keys(state.zip.files) 
    },
    in: (state, getters) => (filename) => {
        console.log(filename)
        if (!state.zip) {
            return false
        }
        if (state.zip.files[filename]) {
            return true
        }
        return false
    },
    limit (state, getters) {
        return state.limit
    },
    size (state, getters) {
        if (!state.zip) {
            return 0
        }
        return Object.keys(state.zip.files).length
    }

}
const mutations = {
    add (state, file) {
        return new Promise((resolve, reject) => {
            if (!state.zip) {
            state.zip = new JSZip() 
            }
            if (Object.keys(state.zip.files).length >= state.limit) {
                if (reject) {
                    reject(file.name)
                }
                return
            }
            fetch(file.properties.file).then(r => r.blob())
            .then((f) => {
                state.zip.file(file.name, f)
                if (resolve) {
                    resolve(file.name)
                }
                return true
            })
        })
    },
    clear (state) {
        state.zip.forEach(function (path) {
            state.zip.remove(path)
        })
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
