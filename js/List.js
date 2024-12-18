export default class List {
    #data
    #size

    constructor() {
        this.#data = []
        this.#size = 0
    }

    add(value) {
        this.#data.push(value)
        ++this.#size
    }

    get(index) {
        if (index < 0 || index > this.#size) {
            return Error('下标错误')
        }
        return this.#data[index]
    }

    remove(index) {
        if (index < 0 || index > this.#size) {
            return Error('下标错误')
        }
        this.#data.splice(index, 1)
        --this.#size
    }

    removeAll() {
        if (this.#size <= 0) {
            return Error('删除错误')
        }
        this.#data = []
        this.#size = 0
    }

    size() {
        return this.#size
    }
}