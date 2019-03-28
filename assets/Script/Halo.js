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
        tempoDetectOffect: 5,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.animation = this.node.getComponent(cc.Animation);
        this.hitted = false;
        this.animation.on('finished',this.onFinished,this);

        this.defualtAnimDuration = this.animation.defaultClip.duration;
    },

    start () {

    },

    // update (dt) {},

    onFinished(type, state){
        var haloPos = this.node.getPosition();
        if (haloPos.x > 0) {
            var yangPos = this.yangEye.getPosition();
            if (Math.abs(haloPos.x - yangPos.x) < this.tempoDetectOffect &&
                Math.abs(haloPos.y - yangPos.y) < this.tempoDetectOffect) {
                this.hitted = true;
            }
        } else {
            var yinPos = this.yinEye.getPosition();
            if (Math.abs(haloPos.x - yinPos.x) < this.tempoDetectOffect &&
                Math.abs(haloPos.y - yinPos.y) < this.tempoDetectOffect) {
                this.hitted = true;
            }
        }


        if (this.hitted){
            this.game.gainScore();
            this.animation.play('Halo_Hit');
            this.animation.off('finished',this.onFinished,this);
        }
        else{
            this.animation.play('Halo_Miss');
            this.animation.off('finished',this.onFinished,this);
        }
    },

    setSlidingTrack (slidingTrack) {
        this.slidingTrack = slidingTrack;
        this.yinEye = slidingTrack.getChildByName("阴阳小球黑");
        this.yangEye = slidingTrack.getChildByName("阴阳小球白");
    }
});
