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
        drips: {
            default: null,
            type: cc.Prefab
        },
        tempoDetectOffect: 5,

        force: 180,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.halfWinWidth = cc.winSize.width / 2;
        this.halfWinHeight = cc.winSize.height / 2;

        this.animation = this.node.getComponent(cc.Animation);
        this.hitted = false;
        this.animation.on('finished',this.onAnimEnd,this);
        this.isWhite = false;
        this.actionPlaying = false;

        // this.minimumDripMoveX = 50;
        // this.maxDripMoveY = Global.radius;
        this.dripAnimPlaying = false;

        this.defualtAnimDuration = this.animation.defaultClip.duration;

        this.ANGLE90 = Math.PI * 90 / 180;
        this.ANGLE45 = Math.PI * 45 / 180;
    },

    start () {
        this.progressBarScript = this.game.progressBar.getComponent("ProgressBar");
        this.blockCount = 0;
        this.force = 0;
        this.resistance = 0.8;
    },

    update (dt) {
        //如果在水滴移动的时候，游戏结束，就自毁
        if (!this.game.gameStarted && this.drip != null) {
            this.drip.destroy();
            this.node.destroy();
        }

        //依据水滴受力控制水滴移动
        if (this.dripAnimPlaying) {
            if (this.force >= 0) {
                var x = this.drip.x;
                var y = this.drip.y;
                if (x > this.halfWinWidth - this.dripRadius || 
                    x < -this.halfWinWidth + this.dripRadius) {
                    //this.drip.x = this.halfWinWidth - this.dripRadius;
                    this.direction.x = -this.direction.x;
                    cc.log(this.halfWinWidth, this.halfWinHeight, this.dripRadius);
                }
                if (y > this.halfWinHeight - this.dripRadius|| 
                    y < - this.halfWinHeight + this.dripRadius) {
                    this.direction.y = -this.direction.y;
                }

                this.drip.x += this.force * dt * this.direction.x;
                this.drip.y += this.force * dt * this.direction.y;

                //阻力
                this.force -= this.resistance;
            } else {
                //不受力时停止移动
                this.force = 0;
                this.dripAnimPlaying = false;

                //然后执行飞向计分条的动作
                this.action = cc.moveTo(0.6, this.hitPosition);
                this.action.easing(cc.easeQuadraticActionInOut());
                this.drip.runAction(this.action);
                this.actionPlaying = true;
            }
        }

        //飞向进度条的动作做完之后摧毁水滴与光环
        if (this.actionPlaying) {
            if (this.action.isDone()) {
                this.progressBarScript.hit(true, this.isWhite, this.hitPosition, this.blockCount);

                this.drip.destroy();
                this.node.destroy();
            }
        }
    },

    onAnimEnd (type, state) {
        if (!this.hitted) {
            this.node.destroy();
        }
    },

    checkHit (eyePos, haloPos) {
        var xDiff = Math.abs(haloPos.x - eyePos.x);
        var yDiff = Math.abs(haloPos.y - eyePos.y);
        var unitTempoDT = this.tempoDetectOffect / 3;

        if (xDiff <= unitTempoDT && yDiff <= unitTempoDT) {
            this.hitted = true;
            this.force += 200;
            this.resistance = 2.0;
            this.game.gainScore(3);
        } else if (xDiff <= unitTempoDT * 2 && yDiff <= unitTempoDT * 2) {
            this.hitted = true;
            this.force += 100;
            this.resistance = 1.6;
            this.game.gainScore(2);
        } else if (xDiff <= this.tempoDetectOffect && this.yDiff < this.tempoDetectOffect) {
            this.hitted = true;
            this.game.gainScore(1);
        }
    },

    //todo: 改事件的名字
    onFinished(type, state){
        //依据光环与阴阳小球的距离来判断是否击中
        var haloPos = this.node.getPosition();
        // if (haloPos.x > 0) {
        //     var yangPos = this.yangEye.getPosition();
        //     if (Math.abs(haloPos.x - yangPos.x) < this.tempoDetectOffect &&
        //         Math.abs(haloPos.y - yangPos.y) < this.tempoDetectOffect) {
        //         this.hitted = true;
        //         this.force += 50;
        //     }
        // } else {
        //     var yinPos = this.yinEye.getPosition();
        //     if (Math.abs(haloPos.x - yinPos.x) < this.tempoDetectOffect &&
        //         Math.abs(haloPos.y - yinPos.y) < this.tempoDetectOffect) {
        //         this.hitted = true;
        //     }
        // }

        if (this.isWhite) {
            var yangPos = this.yangEye.getPosition();
            this.checkHit(yangPos, haloPos);
        } else {
            var yinPos = this.yinEye.getPosition();
            this.checkHit(yinPos, haloPos);
        }


        if (this.hitted){
            //如果击中，生成水滴
            this.drip = cc.instantiate(this.drips);
            this.drip.parent = this.game.node;
            this.drip.setPosition(this.node.getPosition());
            var dripWhite = this.drip.getChildByName("dripW");
            var dripBlack = this.drip.getChildByName("dripB");
            this.dripRadius = dripWhite.width * dripWhite.scale / 2;

            //水滴下有两个节点，只使用一个
            if (this.isWhite) {
                dripBlack.destroy();
            } else {
                dripWhite.destroy();
            }

            //赋予水滴的力和方向
            //this.force = Math.random() * (this.force - this.force / 2) + this.force / 2;
            this.force += 180;
            this.direction = this.getRandomDirection();
            // cc.tween(drip)
            // .to(2, {position: this.getRandomDriptoPosition()}, { easing: 'quadInOut'})
            // .start();

            //处理击中光环后的效果，加分，增加进度
            this.dripAnimPlaying = true;
            this.hitPosition = this.progressBarScript.getNextBlockPosition();
            this.blockCount = this.progressBarScript.increaseBlockCount();
            this.animation.off('finished',this.onFinished,this);
        }
        else{
            //未击中时的处理
            var position = this.progressBarScript.getNextBlockPosition();
            this.blockCount = this.progressBarScript.increaseBlockCount();
            this.progressBarScript.hit(false, this.isWhite, position, this.blockCount);
            this.progressBarScript.checkFail();
            this.animation.off('finished',this.onFinished,this);
        }
    },

    //播放光环出现动画
    play (isWhite) {
        if (isWhite) {
            this.isWhite = true;
            this.animState = this.animation.play("halo_emerge_white");
        } else {
            this.animState = this.animation.play("halo_emerge_black");
        }
    },

    setSlidingTrack (slidingTrack) {
        this.slidingTrack = slidingTrack;
        this.yinEye = slidingTrack.getChildByName("Yin");
        this.yangEye = slidingTrack.getChildByName("Yang");
    },

    //获取一个随机的方向让水滴发射出去，白球向左，黑球向右
    getRandomDirection () {
        var angle = Math.random() * this.ANGLE90 - this.ANGLE45;
        var x = Math.cos(angle);
        var y = Math.sin(angle);
        if (!this.isWhite) {
            x = -x;
            y = -y;
        }

        return cc.v2(x, y);
    },

    // getRandomDriptoPosition () {
    //     var x = this.node.x;
    //     var y = this.node.y;
    //     if (this.isWhite) {
    //         var offsetX = Math.random() * (cc.winSize.width / 2 - x - this.minimumDripMoveX);
    //         x = x + offsetX;
    //     } else {
    //         var offsetX = Math.random() * (cc.winSize.width / 2 - x - this.minimumDripMoveX);
    //         x = x - offsetX;
    //     }
    //     var offsetY = (Math.random() - 0.5) * 2 * this.maxDripMoveY;
    //     if (y > 0) {
    //         y = y + offsetY;
    //     } else {
    //         y = y - offsetY;
    //     }
        
    //     return cc.v2(x, y);
    // },
});
