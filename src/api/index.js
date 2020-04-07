let url = {}

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
    }

})

export default url;
