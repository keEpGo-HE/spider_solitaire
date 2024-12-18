export default class ImplyOperationClass {
    #moveCardLength
    #prevMoveIndex
    #MoveToIndex

    constructor(prevMoveIndex, moveCardLength, moveToIndex) {
        this.#MoveToIndex = moveToIndex
        this.#moveCardLength = moveCardLength
        this.#prevMoveIndex = prevMoveIndex
    }

    get prevMoveIndex() {
        return this.#prevMoveIndex
    }
    set prevMoveIndex(value) {
        this.#prevMoveIndex = value
    }
    get moveCardLength() {
        return this.#moveCardLength
    }
    set moveCardLength(value) {
        this.#moveCardLength = value
    }
    get moveToIndex() {
        return this.#MoveToIndex
    }
    set moveToIndex(value) {
        this.#MoveToIndex = value
    }
}