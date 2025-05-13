import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import moment from 'moment'
const state = () => {
    return {
        zip: null,
        limit: 30,
        progress: null,
        generating: false
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
    // add (state, obj) {
    //      state.zip.file(obj.name, obj.f)
    //     return
    //     return new Promise((resolve, reject) => {
    //         if (!state.zip) {
    //         state.zip = new JSZip() 
    //         }
    //         if (Object.keys(state.zip.files).length >= state.limit) {
    //             if (reject) {
    //                 reject(file.name)
    //             }
    //             return
    //         }
    //         fetch(file.properties.file).then(r => r.blob())
    //         .then((f) => {
    //             state.zip.file(file.name, f)
    //             if (resolve) {
    //                 resolve(file.name)
    //             }
    //             return true
    //         })
    //     })
    // },
    clean (state) {
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
        state.generating = true
        state.zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
            console.log("progression: " + metadata.percent.toFixed(2) + " %");
            state.progress = metadata.percent.toFixed(2)
            if(metadata.currentFile) {
                console.log("current file = " + metadata.currentFile);
            }
        }).then(function(content) {
            state.progress = 0
            state.generating = false
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
    add ({ state, commit, rootState }, file) {
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
            .then((blb) => {
                state.zip.file(file.name, blb)
                // commit('add', {name: file.name, file: blb} )
               
                if (resolve) {
                    resolve(file.name)
                }
                return true
            })
        })
    }

}
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
