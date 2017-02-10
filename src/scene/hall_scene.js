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

        //var arr = new Array(2);
        //arr[0] =   "{\"id\":5577664,\"pid\":5084,\"score\":1925,\"rank\":1,\"dami\":200,\"join_ts\":\"1486557119.578202\",\"add_star\":0,\"name\":\"游客5084\",\"logo\":null,\"star\":0,\"gold\":1900}";
        //arr[1] =   "{\"id\":5577664,\"pid\":5086,\"score\":19256,\"rank\":2,\"dami\":100,\"join_ts\":\"1486557119.578202\",\"add_star\":0,\"name\":\"游客5084\",\"logo\":null,\"star\":0,\"gold\":1900}";
        //cc.director.runScene(new cc.TransitionFade(1,new OverScene(arr)));
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
        cc.director.runScene(new cc.TransitionMoveInR(0.8, new MainScene()));//TransitionFade
    },
    pk_event : function () {
        cc.director.runScene(new cc.TransitionMoveInB(0.6,new PkScene()));
    }
});

var HallScene = cc.Scene.extend({
    ctor : function (msg) {
        this._super();

        if(msg != undefined){
            var layer = new DialogLayer(msg);
            this.addChild(layer,1001);
        }

    },
    onEnter:function () {
        this._super();
        var layer = new HallLayer();
        this.addChild(layer);
    }
});