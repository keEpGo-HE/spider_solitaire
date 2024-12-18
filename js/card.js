export default class Card {
    _number
    _cardShape

    constructor(cardShape, number) {
        this._number = number
        this._cardShape = cardShape
    }

    get cardShape() {
        return this._cardShape
    }
    set cardShape(value) {
        this._cardShape = value
    }

    get number() {
        return this._number
    }
    set number(value) {
        this._number = value
    }
}