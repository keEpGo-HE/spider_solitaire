export default class QuashOperationClass {
    #prevParent
    #nextParent
    #moveCards
    #prevParentLastCardIsBack

    constructor(prevParent, nextParent, moveCards) {
        this.#prevParent = prevParent
        this.#nextParent = nextParent
        this.#moveCards = moveCards
        // 获取移动后的之前父元素的最后一张牌
        const lastChildIndex = prevParent.children.length - moveCards.length - 1
        if (lastChildIndex < 0) {
            this.#prevParentLastCardIsBack = false
            return
        }
        this.#prevParentLastCardIsBack = prevParent.children[lastChildIndex].src.includes("imgs/back.png")
    }

    get prevParent() {
        return this.#prevParent
    }
    set prevParent(value) {
        this.#prevParent = value
    }
    get nextParent() {
        return this.#nextParent
    }
    set nextParent(value) {
        this.#nextParent = value
    }
    get moveCards() {
        return this.#moveCards
    }
    set moveCards(value) {
        this.#moveCards = value
    }
    get prevParentLastCardIsBack() {
        return this.#prevParentLastCardIsBack
    }
}