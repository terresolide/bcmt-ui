import moment from 'moment'

class BcmtReader {
    constructor(file) {
        var url = file
        this.file = file
        this.columns = []
        this.data = []
        this.series = {
            dates: [],
            X: [],
            Y: [],
            Z: []
        }
        this.dates = []
        this.file = 'https://catalog.formater/tam20250420vmin.min'
        
    }
    getSeries () {
        return this.series
    }
    async read () {
        try {
            let response = await fetch(this.file)
       
            let text = await response.text()
            let lines = text.split(/\r?\n/)
            let begin = false
            this.data = []
            var self = this
            var posDate = -1
            var posTime = -1
            var pos= {
                X: -1,
                Y: -1,
                Z: -1
            }
            var coords =  ['X', 'Y', 'Z']
            lines.forEach(function (line) {
                if (line.startsWith('DATE ')) {
                    self.columns = line.split(/\s+/)
                    posDate = self.columns.indexOf('DATE')
                    posTime = self.columns.indexOf('TIME')

                    coords.forEach(function (letter) {
                        var regex = new RegExp('^[A-Z]{3}' + letter + '$')
                        pos[letter]= self.columns.findIndex((x) => regex.test(x))
                    })
                    begin = true

                } else if (begin) {
                   var list = line.split(/\s+/)
                   self.series.dates.push(moment.utc(list[posDate] + 'T' + list[posTime] + 'Z').format('x'))
                   coords.forEach(function (letter) {
                    if (pos[letter] < -1) {
                        return Promise.reject('MISSING COLUMN ' + letter)
                    }
                    self.series[letter].push(parseFloat(list[pos[letter]]))
                   })
                }
            })
            return true
        } catch(error) {
            return Promise.reject(error)
        }
        // .then((resp) => resp.text())
        // .then((text) => {
        //     console.log(text)
        // })
    }

}
export default BcmtReader;