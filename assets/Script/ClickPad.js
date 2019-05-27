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
        slidingTrack: {
            default: null,
            type: cc.Node
        },


    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var winSize = cc.winSize;
        this.node.width = winSize.width;
        this.node.height = winSize.height;

        
    },

    start () {
        this.yangEye = this.slidingTrack.getChildByName("Yang");
        this.yinEye = this.slidingTrack.getChildByName("Yin");
        
        this.slidingTrackControl = this.slidingTrack.getComponent("SlidingTrack");

        this.touchPos = cc.v2();

        this.initEventListener();

        this.halos = new Array();

        this.tempoDetectOffset = 30;
    },

    // update (dt) {},

    initEventListener: function () {

        //响应触摸事件
        this.node.on ('touchstart', function (event) {
            if (!Global.gameStarted) {
                Global.gameStarted = true;
            }
        }, this);

        // this.node.on ('touchmove', function (event) {

        // }, this);

        this.node.on ('touchend', function (event) {
            this.clicked(event.getLocation());
        }, this);

        // this.node.on ('touchcancel', function (event) {

        // }, this);
    },

    clicked: function (location) {
        var winSize = cc.winSize;
        var x = location.x - winSize.width / 2;
        var y = location.y - winSize.height / 2;
        cc.log("clicked on " + location + " x: " + x+ " y: " + y);

        //todo:播放水波纹动画

        //清空halos中失效的halo
        var temp = new Array();
        for (var i = 0; i < this.halos.length; i++) {
            if (this.halos[i].active) {
                temp.push(this.halos[i]);
            }
        }
        this.halos = temp;

        //判断是否点击到光环
        var hittedHalos = new Array();
        var hitCount = 0;
        for (var i = 0; i < this.halos.length; i++) {
            var xDiff = Math.abs(this.halos[i].x - x);
            var yDiff = Math.abs(this.halos[i].y - y);
            if (xDiff < this.tempoDetectOffset && yDiff < this.tempoDetectOffset) {
                hittedHalos.push(this.halos[i]);
                hitCount++;
            }
        }
        if (hitCount > 0) {
            if (hitCount == 1) {
                hittedHalos[0].getComponent("Halo").checkHitByClick();
            } else {
                //处理多个光环重叠的情况
            }
        }

        //将左右两边的点击都移到左边
        if (x < 0) {
            x = -x;
            y = -y;
        }
        //然后让阴阳小球移动到这个点
        this.slidingTrackControl.addPathPoint(cc.v2(x, y));
    },

    addHalo (halo) {
        this.halos.push(halo);
    }
});
