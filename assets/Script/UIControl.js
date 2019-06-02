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
        alertBox: {
            default: null,
            type: cc.Prefab
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.restartGameBtn = this.node.getChildByName("Restart");
        this.restartGameBtn.on('click', this.onRestartClicked, this);
        this.pauseBtn = this.node.getChildByName("Pause");
        this.pauseBtn.on('click', this.onPauseClicked, this);
    },

    start () {
        //this.restartGameBtn.active = false;
    },

    onRestartClicked: function (button) {
        cc.log("button clicked!");
        //this.game.restartGame();
        this.game.pauseGame(false);
        this.alert("确定要重新开始游戏吗？");
    },

    onPauseClicked: function (pauseBtn) {
        cc.log("button pause clicked!");
        this.game.pauseGame(true);
    },

    alert (message) {
        var emptyNode = new cc.Node();
        var alertBox = cc.instantiate(this.alertBox);
        alertBox.getChildByName("Message").getComponent(cc.Label).string = message;
        alertBox.getChildByName("Yes").on('click', ()=>{
            this.game.resumeGame(true);
            this.game.restartGame();
            emptyNode.destroy();
            alertBox.destroy();
        }, this);
        alertBox.getChildByName("No").on('click', ()=>{
            this.game.resumeGame(false);
            emptyNode.destroy();
            alertBox.destroy();
        }, this);

        emptyNode.width = cc.winSize.width;
        emptyNode.height = cc.winSize.height;

        emptyNode.parent = this.node;
        alertBox.parent = this.node;
    },

    // update (dt) {},
});
