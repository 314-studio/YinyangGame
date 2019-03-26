// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

//Game全局类，控制和调动整个游戏的行为
cc.Class({
    extends: cc.Component,

    properties: {
        debug: true,

        touchPad: {
            default: null,
            type: cc.Prefab
        },

        slidingTrack: {
            default: null,
            type: cc.Node
        },
<<<<<<< HEAD
        
        halo:{
            default: null,
            type: cc.Prefab
        },

        velocityMapping: true,

        distanceMappingCoef: 5
=======
>>>>>>> 9bd366a07217a77cac677e3d1b2fe06b7834aff1
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //初始化触摸节点
        var windowSize = cc.winSize;
        this.yinControlPad = cc.instantiate(this.touchPad);
        this.yangControlPad = cc.instantiate(this.touchPad);
        this.yinControlPad.parent = this.parent || this.node;
        this.yangControlPad.parent = this.parent || this.node;
        this.yinControlPad.setPosition(-windowSize.width / 4, 0);
        this.yangControlPad.setPosition(windowSize.width / 4, 0);
        cc.log("右触摸节点x位置：", this.yangControlPad.getPosition().x, this.yangControlPad.getPosition().y);
        cc.log("右触摸节点大小：", this.yangControlPad.width, this.yangControlPad.height);

        this.slidingTrackScript = this.slidingTrack.getComponent("SlidingTrack");
        this.yinControlPadScript = this.yinControlPad.getComponent("TouchPad");
        this.yangControlPadScript = this.yangControlPad.getComponent("TouchPad");
<<<<<<< HEAD
        this.yinControlPadScript.radius = this.slidingTrackScript.radius;
        this.yangControlPadScript.radius = this.slidingTrackScript.radius;
        this.yinControlPadScript.thisIsYinEye(3.14 / this.distanceMappingCoef);
        

=======
        this.yinControlPadScript.slidingTrack = this.slidingTrack;
        this.yangControlPadScript.slidingTrack = this.slidingTrack;
        this.yinControlPadScript.thisIsYinTouchPad();
>>>>>>> 9bd366a07217a77cac677e3d1b2fe06b7834aff1
    },

    start () {
        this.deltaTime = 0;
    },

    update (dt) {
<<<<<<< HEAD
        this.slidingTrackScript.moveYinyangEye(
            this.yinControlPadScript.angle, 
            this.yangControlPadScript.angle, 
            this.distanceMappingCoef);


        this.deltaTime += dt;
        if (this.deltaTime >= 5) {
            var halo = cc.instantiate(this.halo);
            halo.parent = this.node;
            halo.setPosition(this.slidingTrackScript.generateRamdomHaloPositon());
            this.deltaTime = 0;
        }
=======
>>>>>>> 9bd366a07217a77cac677e3d1b2fe06b7834aff1
    },
});
