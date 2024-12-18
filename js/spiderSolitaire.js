import ImplyOperationClass from './implyOperationClass.js'
import QuashOperationClass from './quashOperationClass.js'
import List from "./List.js"
import Card from "./card.js"

const spacing = 30          // 每一堆牌中的每张牌的间距
const dealerSpacing = 20    // 发牌器中每张牌的间距
const cardAppearanceNumber = 8    // 每种牌最多的出现次数
let initCount = 4           // 初始化时每一堆应有的卡牌
let arrList = new List()    // 存储生成的所有的牌(花色和数字)
let implyList = new List()  // 存储提示操作的结果
let quashList = new List()  // 存储上一步操作,用于撤销功能
let completedCount = 0      // 记录完成的组数
let moveCount = 0           // 记录移动次数
let recordScore = 500       // 记录得分
let recordedTime = 0        // 记录时间
let implyCount = 0          // 记录提示次数
let timer                   // 定时器(用于完成的时间)
let clickDealCardCount = 0  // 点击发牌的次数(最多7次)
let difficulty = 0          // 难度判断(0代表普通,1代表中等,2代表困难)

const cardList = document.querySelectorAll(".container .main .cardSlot")
const dealer = document.querySelector(".container .dealCardsAndRecord .dealCards")
const newGame = document.querySelector(".container .nav .controlGame .newGame")
const completedGroup = document.querySelectorAll(".container .dealCardsAndRecord .record .completedCardSlot")
const time = document.querySelector(".container .nav .otherControl .time span:nth-child(2)")
const move = document.querySelector(".container .nav .otherControl .moveCount span:nth-child(2)")
const imply = document.querySelector(".container .nav .controlGame .imply")
const quash = document.querySelector(".container .nav .controlGame .quash")
const difficultySelection = document.querySelector(".container .nav .controlGame .difficulty")
const score = document.querySelector(".container .nav .otherControl .score span:nth-child(2)")
const achievementButton = document.querySelector(".container .nav .controlGame .achievement")
const achievementPage = document.querySelector(".container .achievementPage")
const close = document.querySelector(".container .achievementPage img")

// 初始化成就到localStorage
let arr = [{
    level: '简单',
    name: '小试牛刀',
    description: '通关一次简单模式',
    isFinish: '未完成',
    difficulty: 0,
    score: 0,
    move: 0,
    time: 0
}, {
    level: '中等',
    name: '渐入佳境',
    description: '通关一次中等模式',
    isFinish: '未完成',
    difficulty: 1,
    score: 0,
    move: 0,
    time: 0
}, {
    level: '困难',
    name: '无敌之姿',
    description: '通关一次困难模式',
    isFinish: '未完成',
    difficulty: 2,
    score: 0,
    move: 0,
    time: 0
}, {
    level: '困难',
    name: '风驰电掣',
    description: '4分钟内通关任意一种模式',
    isFinish: '未完成',
    difficulty: -1,
    score: 0,
    move: 0,
    time: 240
}, {
    level: '中等',
    name: '得分之王',
    description: '通关任意一种模式且获取750分及以上',
    isFinish: '未完成',
    difficulty: -1,
    score: 750,
    move: 0,
    time: 0
}, {
    level: '中等',
    name: '最强大脑',
    description: '130步内通关任意一种模式',
    isFinish: '未完成',
    difficulty: -1,
    score: 0,
    move: 125,
    time: 0
}]

// localStorage.setItem('achievement', JSON.stringify(arr))

productAllCards()
initCards()

/** 点击新游戏重新开始游戏 */
newGame.addEventListener('click', replay)

/** 重新游戏 */
function replay() {
    otherClear()
    clearAllCards()
    clearCompletedGroup()
    productAllCards()
    initCards()
    showDealer()
}

/** 点击提示为用户提供一个可移动的操作(防抖) */
imply.addEventListener('click', debounce(clickImply, 400))

/** 防抖 */
function debounce(func, delay) {
    let timer
    return function () {
        clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(this)
        }, delay)
    }
}

function clickImply() {
    if (isWinGame()) {
        return
    }
    if (implyList.size() !== 0) {
        if (implyCount > implyList.size() - 1) {
            implyCount = 0
        }
        flash()
        implyCount++
        return
    } else if (implyList.size() === 0 && implyCount > 0) {
        return
    }
    implyDetail()
    if (implyList.size() === 0) {
        implyCount++
        return
    }
    flash()
    implyCount++
}

/** 撤回操作 */
quash.addEventListener('click', () => {
    if (isWinGame()) {
        return
    }
    if (quashList.size() === 0) {
        return
    }
    quashDetail()
    implyCount = 0
    implyList.removeAll()   // 重置提示
    move.innerHTML = (++moveCount).toString()
    score.innerHTML = (recordScore += 5).toString()
})

/** 难度选择 */
difficultySelection.addEventListener('change', () => {
    difficulty = difficultySelection.selectedIndex
    replay()  // 重新游戏
})


/** 撤回操作详情 */
function quashDetail() {
    const lastStep = quashList.get(quashList.size() - 1)   // 获取最后一步执行的操作        
    let prevParent = lastStep.prevParent
    let nextParent = lastStep.nextParent
    const moveCards = lastStep.moveCards
    if (lastStep.prevParentLastCardIsBack) {
        prevParent.lastElementChild.src = "imgs/back.png"
    }
    const initLength = prevParent.children.length
    for (let i = 0; i < moveCards.length; i++) {
        const img = document.createElement('img')
        img.style.position = 'absolute'
        img.style.top = (initLength + i) * spacing + 'px'
        img.style.zIndex = (initLength + i).toString()
        img.setAttribute('data-id', moveCards[i].getAttribute('data-id'))
        img.setAttribute('cardShape', moveCards[i].getAttribute('cardShape'))
        img.src = "imgs/" + moveCards[i].getAttribute('cardShape') + "-"
            + moveCards[i].getAttribute('data-id') + ".png"
        setMoveEvent(img)
        prevParent.appendChild(img)
    }
    for (let i = moveCards.length - 1; i >= 0; i--) {
        nextParent.removeChild(nextParent.lastElementChild)
    }
    quashList.remove(quashList.size() - 1)   // 移除最后一个元素
}

/** 是否赢得了游戏 */
function isWinGame() {
    let count = 0
    for (let i = 0; i < cardList.length; i++) {
        if (cardList[i].children.length === 0) {
            count++
        }
    }
    return count === cardList.length;
}

/** 提示操作产生动画 */
function flash() {
    const prevMoveIndex = implyList.get(implyCount).prevMoveIndex   // 可以移动的牌对应的牌堆的下标
    let moveCardLength = implyList.get(implyCount).moveCardLength   // 可以移动的牌的长度(从对应牌堆最后一个子元素往前算)
    const moveToIndex = implyList.get(implyCount).moveToIndex       // 将要移动到的牌堆的下标
    let moveCardsArr = new List() // 存放移动的牌
    for (let i = cardList[prevMoveIndex].children.length - 1; i >= 0; i--) {  // 倒序遍历
        if (--moveCardLength < 0) {
            break
        }
        moveCardsArr.add(cardList[prevMoveIndex].children[i])
    }
    // 提示的牌的边框颜色变化
    for (let i = 0; i < moveCardsArr.size(); i++) {
        moveCardsArr.get(i).style.borderColor = 'yellow'
        moveCardsArr.get(i).style.borderStyle = 'solid'
        moveCardsArr.get(i).style.borderWidth = '5px'
    }
    cardList[moveToIndex].lastElementChild.style.borderColor = 'yellow'
    cardList[moveToIndex].lastElementChild.style.borderStyle = 'solid'
    cardList[moveToIndex].lastElementChild.style.borderWidth = '5px'

    const flashTimer = setTimeout(() => {
        for (let i = 0; i < moveCardsArr.size(); i++) {
            moveCardsArr.get(i).style.border = 'none'
        }
        cardList[moveToIndex].lastElementChild.style.border = 'none'
        clearTimeout(flashTimer)
    }, 600)
}

/** 提示操作的详情 */
function implyDetail() {
    let implyArr = new List()     // 存储每堆牌可以提示的数据
    let compareArr = new List()   // 存储每堆牌的最后一张牌(花色和数字)
    for (let i = 0; i < cardList.length; i++) {
        if (cardList[i].children.length > 0) {
            implyArr.add(implyCards(cardList[i].lastElementChild))
            // 获取每堆牌中的最后一张牌
            let card = new Card()
            card.number = Number(cardList[i].lastElementChild.getAttribute('data-id'))
            card.cardShape = cardList[i].lastElementChild.getAttribute('cardShape')
            compareArr.add(card)
        } else {
            implyArr.add(null)
            compareArr.add(null)
        }
    }

    // 获取可以提示的牌
    for (let i = 0; i < implyArr.size(); i++) {
        if (implyArr.get(i) === null) {
            continue
        }
        for (let j = 0; j < implyArr.get(i).size(); j++) {
            for (let k = 0; k < compareArr.size(); k++) {
                if (k === i || compareArr.get(k) === null || implyArr.get(i).get(j) + 1
                    !== compareArr.get(k).number) {
                    continue
                }
                implyList.add(new ImplyOperationClass(i, j + 1, k))
            }
        }
    }
}

/** 每堆牌有哪些牌进行可以提示 */
function implyCards(img) {
    let imply = new List()
    imply.add(Number(img.getAttribute('data-id')))
    let last = img
    let prev = img.previousElementSibling
    while (prev !== null && (!prev.src.includes("imgs/back.png"))
        && Number(last.getAttribute('data-id')) + 1 === Number(prev.getAttribute('data-id'))
        && last.getAttribute('cardShape') === prev.getAttribute('cardShape')) {
        imply.add(Number(prev.getAttribute('data-id')))
        last = prev
        prev = last.previousElementSibling
    }
    return imply
}

/** 点击发牌器实现发牌 */
dealer.addEventListener('click', () => {
    if (++clickDealCardCount > 4) {
        dealer.removeChild(dealer.lastElementChild)
    }
    for (let i = 0; i < cardList.length; i++) {
        const img = document.createElement('img')
        img.style.position = 'absolute'
        img.style.top = (spacing * cardList[i].children.length) + 'px'
        img.style.zIndex = cardList[i].children.length.toString()
        spawnCards(img)  // 生成牌
        setMoveEvent(img)
        cardList[i].appendChild(img)
        if (isCompositionAToK(cardList[i])) {
            deleteAToK(cardList[i])
        }
    }
    quashList.removeAll()
    implyList.removeAll()
    implyCount = 0
    implyDetail()
})

/** 点击成就查看拥有的成就 */
achievementButton.addEventListener('click', () => {
    const trs = document.querySelectorAll('.container .achievementPage table tr:not(:first-child)')
    const achievement = JSON.parse(localStorage.getItem('achievement'))
    for (let i = 0; i < trs.length; i++) {
        trs[i].children[0].innerHTML = achievement[i].level
        trs[i].children[1].innerHTML = achievement[i].name
        trs[i].children[2].innerHTML = achievement[i].description
        trs[i].children[3].innerHTML = achievement[i].isFinish
    }
    achievementPage.classList.remove('hidden')
})

/** 关闭成就页面 */
close.addEventListener('click', () => {
    achievementPage.classList.add('hidden')
})

/** 根据难度初始化生成所有的牌 */
function productAllCards() {
    // 花色
    let designColor = 'spade'   // 默认黑桃
    for (let i = 0; i < cardAppearanceNumber; i++) {
        if (i >= 4 && difficulty === 1) {
            designColor = 'heart'
        } else if (i >= 2 && i < 4 && difficulty === 2) {
            designColor = 'heart'
        } else if (i >= 4 && i < 6 && difficulty === 2) {
            designColor = 'diamond'
        } else if (i >= 6 && i < cardAppearanceNumber && difficulty === 2) {
            designColor = 'plumBlossom'
        }
        for (let j = 0; j < 13; j++) {
            let card = new Card(designColor, (j + 1))
            arrList.add(card)
        }
    }
}

/** 生成牌堆 */
function initCards() {
    for (let i = 0; i < cardList.length; i++) {
        for (let j = 0; j < initCount; j++) {
            if (i > 3) {
                initCount = 3
            }
            const img = document.createElement('img')  // 创建一个img的对象
            img.style.position = 'absolute'
            img.style.top = spacing * j + 'px'
            img.style.zIndex = j.toString()
            spawnCards(img)   // 生成牌
            if (j !== initCount - 1) {
                img.src = "imgs/back.png"
            }
            setMoveEvent(img)
            cardList[i].appendChild(img)
        }
    }
    initCount = 4 // 重置
}

/** 恢复发牌器 */
function showDealer() {
    if (clickDealCardCount >= 5) {
        for (let i = clickDealCardCount - 4; i > 0; i--) {
            const count = 3 - i
            const img = document.createElement('img')
            img.style.position = 'absolute'
            img.style.left = (dealerSpacing * count) + 'px'
            img.style.width = 100 + 'px'
            img.style.height = 135 + 'px'
            img.src = 'imgs/back.png'
            dealer.appendChild(img)
        }
    }
    clickDealCardCount = 0
}

/** 记录时间 */
function gameTime() {
    recordedTime++
    const last = recordedTime % 10
    const third = Math.floor(recordedTime / 10) % 6
    const second = Math.floor((recordedTime - last - third * 10) / 60) % 10
    const first = Math.floor(Math.floor((recordedTime - last - third * 10) / 60) / 10)
    time.innerHTML = first + '' + second + ':' + third + '' + last
}

/** 其他的清除操作 */
function otherClear() {
    arrList.removeAll()
    quashList.removeAll()
    implyList.removeAll()
    implyCount = 0
    completedCount = 0
    moveCount = 0
    recordedTime = 0
    move.innerHTML = '0'
    time.innerHTML = '00:00'
    score.innerHTML = '500'
    clearInterval(timer)
}

/** 清除卡槽所有牌 */
function clearAllCards() {
    for (let i = 0; i < cardList.length; i++) {
        const children = cardList[i].children
        for (let j = children.length - 1; j >= 0; j--) {
            cardList[i].removeChild(children[j])
        }
    }
}

/** 清除已完成组中的牌(只会有一张牌用于记录) */
function clearCompletedGroup() {
    for (let i = 0; i < completedGroup.length; i++) {
        if (completedGroup[i].children.length !== 0) {
            completedGroup[i].removeChild(completedGroup[i].firstElementChild)
        }
    }
}

/** 生成每一张卡牌 */
function spawnCards(img) {
    const itemIndex = Math.floor(Math.random() * arrList.size()) + 1  // [1, arr.size()]
    const value = arrList.get(itemIndex - 1).number
    const cardShape = arrList.get(itemIndex - 1).cardShape
    img.setAttribute('data-id', value)  // 设置自定义属性
    img.setAttribute('cardShape', cardShape)
    img.src = "imgs/" + cardShape + "-" + value + ".png"  // 显示牌
    arrList.remove(itemIndex - 1)  // 移除已经生成的牌
}

/** 为每张牌设置可移动事件 */
function setMoveEvent(img) {
    img.addEventListener('dragstart', (e) => {  // 阻止图片拖动默认行为
        e.preventDefault()
    })
    if (img.src.includes("/imgs/back.png")) {   // 背面的牌不允许移动
        return
    }

    img.onmousedown = function (e) {
        if (!isBelowCardsMove(img)) {
            return
        }
        const moveCards = getMoveCards(img)
        for (let j = 0; j < moveCards.length; j++) {
            moveCards[j].style.zIndex = (999 + j).toString()   // 将要移动的牌设置最高图层
        }

        // 用于移动计算
        const firstX = e.clientX - img.offsetLeft
        const firstY = e.clientY - img.offsetTop

        // 记录该牌和原始的牌堆位置
        const childrenX = img.getBoundingClientRect().left
        const childrenY = img.getBoundingClientRect().top
        const parentX = img.parentElement.getBoundingClientRect().left
        const parentY = img.parentElement.getBoundingClientRect().top

        function moveTo(e1) {
            for (let j = 0; j < moveCards.length; j++) {  // 设置可移动的牌一起移动
                moveCards[j].style.left = e1.clientX - firstX + 'px'
                moveCards[j].style.top = e1.clientY - firstY + spacing * j + 'px'
            }
        }

        document.addEventListener('mousemove', moveTo)

        img.onmouseup = function () {
            let loop = false   // 判断是否将移动的牌添加到对应移到的牌组
            const curParentElement = img.parentElement    // 当前移动牌的父元素
            for (let j = 0; j < cardList.length; j++) {
                if (cardList[j] === curParentElement) {
                    continue
                }
                const lastElementChild = cardList[j].lastElementChild   // 每堆牌的最后一张牌
                if (!((cardList[j].children.length === 0 && Math.abs(cardList[j].getBoundingClientRect().left - img.getBoundingClientRect().left) < 60
                    && Math.abs(cardList[j].getBoundingClientRect().top - img.getBoundingClientRect().top) < 100) ||
                    (cardList[j].children.length !== 0 && Math.abs(lastElementChild.getBoundingClientRect().left - img.getBoundingClientRect().left) < 60
                        && Math.abs(lastElementChild.getBoundingClientRect().top - img.getBoundingClientRect().top) < 100
                        && Number(lastElementChild.getAttribute("data-id")) - 1 === Number(img.getAttribute('data-id'))))) {   // 判断是否正确放置牌
                    continue
                }
                const quashOperationClass = new QuashOperationClass(curParentElement, cardList[j], moveCards)
                quashList.add(quashOperationClass)  // 储存上一步操作                 
                const initLength = cardList[j].children.length
                for (let k = 0; k < moveCards.length; k++) {         // 将可移动的牌添加到对应移动的牌堆
                    const newImg = document.createElement('img')
                    newImg.style.position = 'absolute'
                    newImg.style.top = (initLength + k) * spacing + 'px'
                    newImg.style.zIndex = (initLength + k).toString()
                    newImg.setAttribute('data-id', moveCards[k].getAttribute('data-id'))
                    newImg.setAttribute('cardShape', moveCards[k].getAttribute('cardShape'))
                    newImg.src = "imgs/" + moveCards[k].getAttribute('cardShape')
                        + "-" + moveCards[k].getAttribute('data-id') + ".png"
                    setMoveEvent(newImg)
                    cardList[j].appendChild(newImg)
                }
                for (let k = moveCards.length - 1; k >= 0; k--) {    // 原来的牌堆倒序移除已移走的牌
                    curParentElement.removeChild(moveCards[k])
                }
                if (isCompositionAToK(cardList[j])) {   // 是否构成A-K
                    deleteAToK(cardList[j])
                }
                if (curParentElement.children.length !== 0) {
                    if (curParentElement.lastElementChild.src.includes("/imgs/back.png")) {  // 该牌堆移走牌后是否还有牌
                        const dataId = curParentElement.lastElementChild.getAttribute('data-id')
                        const cardShape = curParentElement.lastElementChild.getAttribute('cardShape')
                        curParentElement.lastElementChild.src = "imgs/" + cardShape + "-" + dataId + ".png"
                        setMoveEvent(curParentElement.lastElementChild)
                        quashOperationClass.setLastCardIsBack = true
                    } else {
                        quashOperationClass.setLastCardIsBack = false
                    }
                } else {
                    quashOperationClass.setLastCardIsBack = false
                }
                // 重置提示
                implyCount = 0
                implyList.removeAll()
                // 更新移动步数和分数
                move.innerHTML = (++moveCount).toString()
                score.innerHTML = (recordScore -= 5).toString()
                if (moveCount === 1) {
                    timer = setInterval(gameTime, 1000)
                }
                loop = true
                break
            }
            if (!loop) {
                // 没找到匹配的牌则回到原来的位置
                for (let j = 0; j < moveCards.length; j++) {
                    moveCards[j].style.left = childrenX - parentX + 'px'
                    moveCards[j].style.top = childrenY - parentY + spacing * j + 'px'
                    moveCards[j].style.zIndex = (moveCards[j].parentElement.children.length - (moveCards.length - j)).toString()   // 移动的牌回归原来的图层
                    moveCards[j].style.removeProperty('left')
                }
            }
            document.removeEventListener('mousemove', moveTo)
            img.onmouseup = null
        }
    }
}

/** 递归判断该牌是否可以移动 */
function isBelowCardsMove(img) {
    if (img.nextElementSibling === null) {  // 下一张牌
        return true
    }
    if (Number(img.getAttribute('data-id')) - 1 !== Number(img.nextElementSibling.getAttribute('data-id'))
        || img.getAttribute('cardShape') !== img.nextElementSibling.getAttribute('cardShape')) {
        return false
    }
    return isBelowCardsMove(img.nextElementSibling)
}

/** 获取该牌下的所有可以移动的牌 */
function getMoveCards(img) {
    let moveCards = []
    moveCards.push(img)
    while (img.nextElementSibling !== null) {
        moveCards.push(img.nextElementSibling)
        img = img.nextElementSibling
    }
    return moveCards
}

/** 新增牌后的该牌组是否能够构成A~K */
function isCompositionAToK(cardList) {
    let count = 1
    let last = cardList.lastElementChild    // 最后一个元素
    let prev = last.previousElementSibling  // 前一个元素
    if (last.getAttribute('data-id') !== '1' || cardList.children.length < 13) {
        return false
    }
    while (prev !== null && (!prev.src.includes("imgs/back.png"))) {
        if (Number(last.getAttribute('data-id')) + 1 === Number(prev.getAttribute('data-id')) &&
            last.getAttribute('cardShape') === prev.getAttribute('cardShape')) {
            last = last.previousElementSibling
            prev = last.previousElementSibling
            count++
        } else {
            break
        }
    }
    return count === 13
}

/** 删除该牌组有的A~K */
function deleteAToK(cardList) {
    const cardShape = cardList.lastElementChild.getAttribute('cardShape')
    let last = cardList.lastElementChild
    let prev = last.previousElementSibling
    for (let i = 13; i >= 1; i--) {
        cardList.removeChild(last)
        last = prev
        if (prev.previousElementSibling !== null) {
            prev = prev.previousElementSibling
        }
    }
    if (cardList.children.length > 0 && cardList.lastElementChild.src.includes("imgs/back.png")) {
        cardList.lastElementChild.src = "imgs/" + last.getAttribute('cardShape')
            + "-" + last.getAttribute('data-id') + ".png"
        setMoveEvent(cardList.lastElementChild)
    }
    recordCompleteGroup(cardShape)
    quashList.removeAll()
}

/** 完成的组数的界面变化(即完成一组A-K的收集) */
function recordCompleteGroup(cardShape) {
    const img = document.createElement('img')
    img.src = "imgs/" + cardShape + "-13.png"
    img.style.width = 100 + 'px'
    img.style.height = 135 + 'px'
    completedGroup[completedCount].appendChild(img)
    completedCount++
    score.innerHTML = (recordScore += 105).toString()
    if (completedCount === cardAppearanceNumber) {
        clearInterval(timer)
        isFinishAchievement()
        document.querySelector('.container .ending').classList.remove('hidden')
        ending()
    }
}

/** 是否某个完成成就 */
function isFinishAchievement() {
    const achievement = JSON.parse(localStorage.getItem('achievement'))
    for (let i = 0; i < achievement.length; i++) {
        if (achievement[i].difficulty === difficulty) {  // 对应前三个成就
            achievement[i].isFinish = '已完成'
        }
        if (achievement[i].difficulty === -1) {   // 对应后三个成就
            if (achievement[i].score <= recordScore && achievement[i].name === '得分之王') {
                achievement[i].isFinish = '已完成'
            } else if (achievement[i].move >= moveCount && achievement[i].name === '最强大脑') {
                achievement[i].isFinish = '已完成'
            } else if (achievement[i].time >= recordedTime && achievement[i].name === '风驰电掣') {
                achievement[i].isFinish = '已完成'
            }
        }
    }
    localStorage.setItem('achievement', JSON.stringify(achievement))
}

/** 结束界面的关闭按钮 */
document.querySelector('.container .ending .close').addEventListener('click', () => {
    document.querySelector('.container .ending').classList.add('hidden')
})

/** 结束界面 */
function ending() {
    document.querySelector('.container .ending .data .score span:nth-child(2)').innerHTML = (recordScore - 5).toString()
    document.querySelector('.container .ending .data .moveCount span:nth-child(2)').innerHTML = (moveCount + 1).toString()
    document.querySelector('.container .ending .data .time span:nth-child(2)').innerHTML = time.innerHTML
}