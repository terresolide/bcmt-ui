import JSZip from 'jszip'

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
        state.zip.forEach(function (path) {
            if (path === filename) {
                return true
            }
        })
        return false
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
    remove (filename) {
        if (state.zip) {
            state.zip.remove(filename)
        }
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
