class BcmtReader {
    constructor(file) {
        var url = file
        this.file = file
        this.file = 'https://catalog.formater/clf20250420vsec.sec'
        
    }
    async read () {
        let response = await fetch(this.file)
        let text = await response.text()
        return text
        // .then((resp) => resp.text())
        // .then((text) => {
        //     console.log(text)
        // })
    }

}
export default BcmtReader;