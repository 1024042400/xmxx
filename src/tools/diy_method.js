/**
 * Created by jingyuan on 2017/1/20.
 */
// 自定义事件
var XXEvents = cc.Class.extend({
    create_event : function(_clazz,name){ // 调用_clazz的name方法
        return cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,//MOUSE,
            swallowTouches: true,
            target : this,
            onTouchBegan: function(touch, event){
                var _target = event.getCurrentTarget();
                var size = _target.getContentSize();
                var posInNode = _target.convertToNodeSpace(touch.getLocation());
                var rect = cc.rect(0,0,size.width,size.height);
                if(!(cc.rectContainsPoint(rect,posInNode))){
                    return false;
                }
                _clazz[name]();
                return true;
            }
        });
    }
});
var xxEvents = new XXEvents();
