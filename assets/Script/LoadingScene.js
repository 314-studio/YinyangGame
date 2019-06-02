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
        halo: {
            default: null,
            type: cc.Node
        },

        halo2: {
            default: null,
            type: cc.Node
        },

        camera: {
            default: null,
            type: cc.Camera
        },

        touch: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.touch.on ('touchstart', function (event) {
            if (this.halo.opacity > 0 || this.halo2.opacity > 0) {
                cc.tween(this.camera)
                    .to(0.1, {zoomRatio: 1.2})
                    .to(0.1, {zoomRatio: 1})
                    .start();
            }
        }, this);
    },

    start () {
       cc.director.loadScene("Game");
    },

    // update (dt) {},
});
