import moment from 'moment'

class BcmtReader {
    constructor(file) {
        this.file = file
        this.columns = []
        this.data = []
        this.series = {
            dates: []
        }
        this.dates = []
        // this.file = 'https://catalog.formater/tam20250420vmin.min'
        
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
                Z: -1,
                H: -1,
                N: -1,
                E: -1,
                D: -1
            }
            moment().utc()
            var coords =  ['X', 'Y', 'Z', 'H', 'N', 'E', 'D']
            lines.forEach(function (line) {
                if (line.startsWith('DATE ')) {
                    self.columns = line.split(/\s+/)
                    posDate = self.columns.indexOf('DATE')
                    posTime = self.columns.indexOf('TIME')

                    coords.forEach(function (letter) {
                        var regex = new RegExp('^[A-Z]{3}' + letter + '$')
                        pos[letter]= self.columns.findIndex((x) => regex.test(x) && x !== 'DATE' && x !== 'TIME')
                    })
                    for (var letter in pos) {
                        if(pos[letter] === -1) {
                            delete pos[letter]
                        }
                    }
                    begin = true

                } else if (begin) {
                   var list = line.split(/\s+/)
                  
                   self.series.dates.push(parseInt(moment.utc(list[posDate] + 'T' + list[posTime] + 'Z').format('x')))
                   if (Object.keys(pos).length < 3) {
                        return Promise.reject('MISSING COLUMN ')
                    }
                    for (var letter in pos) {
                        if (!self.series[letter]) {
                            self.series[letter]= []
                        }
                        if (parseFloat(list[pos[letter]]) >= 99999 ) {
                            continue
                        } 
                        self.series[letter].push(parseFloat(list[pos[letter]]))
                    }
                   
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