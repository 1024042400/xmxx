/**
 * Created by jingyuan on 2017/1/16.
 * 大厅
 */
var HallLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        // 1.背景
        var bg = new cc.Sprite(res.PkBg);
        bg.setPosition(cc.winSize.width / 2,cc.winSize.height / 2);
        this.addChild(bg,-100);

        // 2.星星练习场
        this.xx_practice();

        // 3.星星pk赛
        this.xx_pk();
        //this.can_touch = true;
    },
    xx_practice : function () {
        // 1.图标
        var single = new cc.Sprite("#cover_1.png");
        single.setPosition(cc.winSize.width / 2,cc.winSize.height / 3 * 2 + 50);

        // 2.标题
        var singleLabel = new cc.LabelTTF('星星练习场',"Arial",38);
        singleLabel.x = cc.winSize.width / 2;
        singleLabel.y = cc.winSize.height / 3 * 2 - single.height / 2 + 20;

        // 3.添加事件
        cc.eventManager.addListener(xxEvents.create_event(this, "single_event"), single);
        cc.eventManager.addListener(xxEvents.create_event(this, "single_event"), singleLabel);

        // 4.添加到HallLayer
        this.addChild(single);
        this.addChild(singleLabel);
    },
    xx_pk : function () {
        var pk = new cc.Sprite("#cover_2.png");
        pk.setPosition(cc.winSize.width / 2,cc.winSize.height / 3);

        var pkLabel = new cc.LabelTTF('星星PK赛',"Arial",38);
        pkLabel.x = cc.winSize.width / 2;
        pkLabel.y = cc.winSize.height / 3 - pk.height / 2 - 30;

        cc.eventManager.addListener(xxEvents.create_event(this, "pk_event"), pk);
        cc.eventManager.addListener(xxEvents.create_event(this, "pk_event"), pkLabel);

        this.addChild(pk);
        this.addChild(pkLabel);
    },
    single_event : function () {
        if(this.can_touch == false) return false;
        cc.director.runScene(new cc.TransitionMoveInR(0.8, new MainScene()));//TransitionFade
    },
    pk_event : function () {
        if(this.can_touch == false) return false;
        cc.director.runScene(new cc.TransitionMoveInB(0.6,new PkScene()));
    }
});

var HallScene = cc.Scene.extend({
    dialogLayer : null,
    ctor : function (msg) {
        this._super();
        if(msg != undefined){

            this.dialogLayer = new cc.LayerColor(cc.color(0,0,0,127));
            this.addChild(this.dialogLayer,1001);
            this.dialogLayer.event_1 = function () {
                var delay = cc.delayTime(0.1);
                var callFunc = cc.callFunc(function () {
                    this.removeFromParent();
                }.bind(this));
                this.runAction(cc.sequence(delay,callFunc));
            };
            cc.eventManager.addListener(xxEvents.create_event(this.dialogLayer, "event_1"), this.dialogLayer);

            var ale = new cc.Sprite("#alert_bg.png");
            this.dialogLayer.addChild(ale);
            ale.x = cc.winSize.width/2;
            ale.y = cc.winSize.height/2;
        }

    },
    onEnter:function () {
        this._super();
        var layer = new HallLayer();
        this.addChild(layer);
    }
});