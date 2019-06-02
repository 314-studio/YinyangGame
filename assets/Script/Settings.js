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
        vibrationToggle: {
            default: null,
            type: cc.Toggle
        },

        musicOffsetSlider: {
            default: null,
            type: cc.Slider
        },

        musicOffsetLabel: {
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {},

    start () {
    },

    onToggleChanged: function (toggle) {
        if (toggle.isChecked) {
            this.game.vibrationEnabled = true;
        } else {
            this.game.vibrationEnabled = false;
        }
    },

    onSliderChanged: function (slider) {
        //暂且不调整音乐时间偏差
        var offset = slider.progress - 0.5;
        offset = offset.toFixed(1);
        // this.game.setMusicPlayOffset(offset);

        if (offset > 0) {
            this.musicOffsetLabel.string = "+" + offset + "s";
        } else {
            this.musicOffsetLabel.string = offset + "s";
        }
        
    },

    // update (dt) {},
});
