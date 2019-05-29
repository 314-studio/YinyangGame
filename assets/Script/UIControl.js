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

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.restartGameBtn = this.node.getChildByName("Restart");
        this.restartGameBtn.on('click', this.onRestartClicked, this);
        this.pauseBtn = this.node.getChildByName("Pause");
        this.pauseBtn.on('click', this.onPauseClicked, this);
    },

    start () {
        this.restartGameBtn.active = false;
    },

    onRestartClicked: function (button) {
        cc.log("button clicked!");
        this.game.restartGame();
    },

    onPauseClicked: function (pauseBtn) {
        cc.log("button pause clicked!");
        this.game.pauseGame();
    },

    // update (dt) {},
});
