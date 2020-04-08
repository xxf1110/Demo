let url = {}
let host = 'http://192.168.81.40:9000' // 线上服务器地址
// let host = '' 


Object.defineProperties(url, {
    getWordsList: {
        value: '/nlp/participle/list'
    },
    addWords: {
        value: '/nlp/participle/add'
    },
    editWords: {
        value: '/nlp/participle/edit'
    },
    delWords: {
        value: '/nlp/participle/delete'
    },
    login: {
        value: '/nlp/participle/login'
    },
    exportData: {
        value: host + '/nlp/participle/export'
    }

})

export default url;
