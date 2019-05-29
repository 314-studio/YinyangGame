// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        blockContainer: {
            default: null,
            type: cc.Prefab
        },

        blackBlock: {
            default: null,
            type: cc.Prefab
        },

        whiteBlock: {
            default: null,
            type: cc.Prefab
        },

        grayBlock: {
            default: null,
            type: cc.Prefab
        },

        topMargin: 20,
        maxFailPercent: 0.2,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.PROGRESSBAR_CENTER_OFFSET = 1;
        this.failCount = 0;
        this.gameEnded = false;
    },

    bulidProgressBar (blockAmount) {
        this.gameEnded = false;

        var winSize = cc.winSize;
        this.progressBarWidth = winSize.width;
        this.node.setPosition(cc.v2(0, winSize.height / 2 - this.topMargin));
        //cc.log(this.node.getPosition(), winSize, this.node.parent.y);
        this.container = cc.instantiate(this.blockContainer);
        this.container.width = this.progressBarWidth;
        this.container.parent = this.node;

        this.blockAmount = blockAmount;
        this.blockUnitWidth = this.progressBarWidth / blockAmount;
        this.blockHeight = this.container.height - 10;
        this.blockCount = 0;
        this.offset = this.blockUnitWidth / 2 + 4;
    },

    getNextBlockPosition () {
        var y = this.node.y;
        return cc.v2(-this.progressBarWidth / 2 + this.offset + 
            this.blockCount * this.blockUnitWidth, y);
    },

    increaseBlockCount () {
        this.blockCount++;
        return this.blockCount;
    },

    checkFail () {
        if (!this.gameEnded) {
            this.failCount++;
            if (this.failCount / this.blockAmount > this.maxFailPercent) {
                this.game.endGame();
                this.gameEnded = true;
            }
        }
    },

    clear () {
        this.node.removeAllChildren();
        this.container.destroy();
        this.failCount = 0;
    },

    //击中后在进度条上生成进度块
    hit (hitted, isWhite, position, blockCount) {
        var block = null;

        if (hitted) {
            if (isWhite) {
                block = cc.instantiate(this.whiteBlock);
            } else {
                block = cc.instantiate(this.blackBlock);
            }
        } else {
            block = cc.instantiate(this.grayBlock);
        }

        block.width = this.blockUnitWidth;
        block.height = this.blockHeight;
        block.parent = this.node;

        block.setPosition(position.x, this.PROGRESSBAR_CENTER_OFFSET);
    },

    // update (dt) {},
});
