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
    //delta 是过场动画已经播放的时间
    update (delta) {
        var remainTime = this.duration - delta;
        if (!this.stripped) {
            if (delta >= this.strippedTime) {
                this.stripped = true;
                this.playAction(remainTime);
            }
        } else {
            if (!this.previousKnot.stripped) {
                var pValue = Math.abs(this.x - this.previousKnot.x) +
                    Math.abs(this.y - this.previousKnot.y);
                if (pValue > this.minimumDisengageDistance) {
                    this.previousKnot.strippedTime = delta;
                }
            }

            if (!this.latterKnot.stripped) {
                var lValue = Math.abs(this.x - this.latterKnot.x) +
                    Math.abs(this.y - this.latterKnot.y);
                if (lValue > this.minimumDisengageDistance) {
                    this.latterKnot.strippedTime = delta;
                }
            }
        }
    },

    initiate (duration) {
        this.duration = duration;
        this.outOfBorder = false;
        this.delta = 0;
        this.stripped = false;
        this.minimumDisengageDistance = 50;

        var offset = 1;
        this.angle = Math.atan(this.y / this.x);
        if (this.x < 0) {
            offset = -1
        }
        this.destination = cc.v2(
            offset * Math.cos(this.angle) * Global.radius * 2,
            offset * Math.sin(this.angle) * Global.radius * 2
        );

        this.initialPosition = cc.v2(this.x, this.y);

        this.strippedTime = 2 +  Math.random() * (this.duration - 2);
    },

    playAction (duration) {
        cc.tween(this)
            .to(duration, {x: this.destination.x, y: this.destination.y}, { easing: 'quadInOut'})
            .start();
    },

    reset () {
        this.x = this.initialPosition.x;
        this.y = this.initialPosition.y;
    }
});
