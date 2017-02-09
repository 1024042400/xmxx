/**
 * Created by jingyuan on 2017/2/8.
 */
var DialogLayer = cc.LayerColor.extend({
    ctor : function (msg,color) {
        if(color == null) { color = cc.color(0,0,0,127);}
        this._super(color);

        this.event_1 = function () {
            var callFunc = cc.callFunc(function () {
                this.removeFromParent();
            }.bind(this));
            this.runAction(cc.sequence(cc.delayTime(0.1),callFunc));
        };
        cc.eventManager.addListener(xxEvents.create_event(this, "event_1"), this);

        var ale = new cc.Sprite("#alert_bg.png");
        this.addChild(ale);
        ale.x = cc.winSize.width/2;
        ale.y = cc.winSize.height/2;

        var label = new cc.LabelTTF(msg,"Arial",30);
        label.setFontFillColor(cc.color(0,0,0));
        label.x = cc.winSize.width/2;
        label.y = cc.winSize.height/2 - 80;
        this.addChild(label,1002);
    }

});