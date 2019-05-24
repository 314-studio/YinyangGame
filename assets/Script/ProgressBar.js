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

        redBlock: {
            default: null,
            type: cc.Prefab
        },

        blackTriangle: {
            default: null,
            type: cc.Prefab
        },

        whiteTriangle: {
            default: null,
            type: cc.Prefab
        },

        redTriangle: {
            default: null,
            type: cc.Prefab
        },

        topMargin: 20,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.PROGRESSBAR_CENTER_OFFSET = 1;
    },

    bulidProgressBar (blockAmount) {
        var winSize = cc.winSize;
        this.progressBarWidth = winSize.width;
        this.node.setPosition(cc.v2(0, winSize.height / 2 - this.topMargin));
        //cc.log(this.node.getPosition(), winSize, this.node.parent.y);
        var blockContainer = cc.instantiate(this.blockContainer);
        blockContainer.width = this.progressBarWidth;
        blockContainer.parent = this.node;

        this.blockAmount = blockAmount;
        this.blockUnitWidth = this.progressBarWidth / (blockAmount - 1) / 2;
        this.blockCount = 0;
    },

    getNextBlockPosition () {
        var y = this.node.y;
        if (this.blockCount == 1) {
            return cc.v2(-this.progressBarWidth / 2 + this.blockUnitWidth, y);
        } else if (this.blockCount == this.blockAmount) {
            return cc.v2(this.progressBarWidth / 2 - this.blockUnitWidth, y);
        } else {
            return cc.v2(-this.progressBarWidth / 2 + this.blockCount * 2 * this.blockUnitWidth, y);
        }
    },

    increaseBlockCount () {
        this.blockCount++;
        return this.blockCount;
    },

    //击中后在进度条上生成进度块
    hit (hitted, isWhite, position, blockCount) {
        var block = null;
        if (blockCount == 1 || blockCount == this.blockAmount) {
            if (hitted) {
                if (isWhite) {
                    block = cc.instantiate(this.whiteTriangle);
                } else {
                    block = cc.instantiate(this.blackTriangle);
                }
            } else {
                block = cc.instantiate(this.redTriangle);
            }
        } else {
            if (hitted) {
                if (isWhite) {
                    block = cc.instantiate(this.whiteBlock);
                } else {
                    block = cc.instantiate(this.blackBlock);
                }
            } else {
                block = cc.instantiate(this.redBlock);
            }
        }

        if (blockCount == this.blockAmount) {
            block.rotation = Math.PI;
        }
        block.width = this.blockUnitWidth * 2;
        block.parent = this.node;

        block.setPosition(position.x, this.PROGRESSBAR_CENTER_OFFSET);
    },

    // update (dt) {},
});
