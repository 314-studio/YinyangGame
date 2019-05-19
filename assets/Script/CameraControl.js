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
        maxZoomRatio: 1.4
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.actionZoomIned = false;
        this.camera = this.node.getComponent(cc.Camera);
    },

    start () {

    },

    update (dt) {
        if (Global.gameStarted && !this.actionZoomIned) {
            this.zoomIn();
        }
    },

    zoomIn () {
        cc.tween(this.camera)
            .to(1, {zoomRatio: this.maxZoomRatio}, { easing: 'quadInOut'})
            .start();
        this.actionZoomIned = true;
    },

    shake () {
        cc.tween(this.camera)
            .to(0.1, {zoomRatio: this.maxZoomRatio + 0.1})
            .to(0.1, {zoomRatio: this.maxZoomRatio})
            .start();
    },

    zoomOut () {
        cc.tween(this.camera)
            .to(1, {zoomRatio: 1.0}, { easing: 'quadInOut'})
            .start();
        //this.actionZoomIned = false;
    },

    playCutsceneAnim (duration) {
        cc.tween(this.node)
            .to(duration, {angle: 720}, { easing: 'quadInOut'})
            .start();
    },

    shakeLong () {
        var points = new Array(3);
        var shakeOffset = 10;
        for (var i = 0; i < 3; i++) {
            var x = Math.random() * shakeOffset;
            var y = Math.random() * shakeOffset;
            points[i] = [x, y];
        }
        var shakeDuration = 0.2;
        cc.tween(this.node)
            .repeat(2, cc.tween()
            .to(shakeDuration, {x: points[0][0], y: points[0][1]})
            .to(shakeDuration, {x: points[1][0], y: points[1][1]})
            .to(shakeDuration, {x: points[2][0], y: points[2][1]})
            .to(shakeDuration, {x: 0, y: 0}))
            .start();
    },
});
