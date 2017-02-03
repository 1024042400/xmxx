/**
 * Created by jingyuan on 2017/1/20.
 */
var CountDownTimeControl = cc.Class.extend({
    m_updateTime: 1, // 每次的更新时间
    m_allTime: 30, // 整体执行时间
    m_frameCallBack: null, // 每帧回调
    m_overCallBack: null, // 整体执行完毕回调

    ctor: function (updateTime, allTime, frameCallBack, overCallBack) {
        this.init(updateTime, allTime, frameCallBack, overCallBack);
    },

    init: function (updateTime, allTime, frameCallBack, overCallBack) {
        this.m_updateTime = updateTime || 1;
        this.m_allTime = allTime || 30;
        this.m_frameCallBack = frameCallBack || null;
        this.m_overCallBack = overCallBack || null;
    },
    startCountDownTime: function () {
        cc.director.getScheduler().schedule(this, this.updateCountDownTime, this.m_updateTime, cc.REPEAT_FOREVER, 0, false, "keyCountDownTime");
    },
    updateCountDownTime: function () {
        this.m_allTime -= this.m_updateTime;
        if(this.m_frameCallBack) this.m_frameCallBack(this.m_allTime);

        if(this.m_allTime == 0) {
            this.stopUpdateCountDownTime();
            if(this.m_overCallBack) {
                this.m_overCallBack();
            }
        }
    },
    stopUpdateCountDownTime: function () {
        cc.director.getScheduler().unschedule(this, this.updateCountDownTime);
    },
    cleanUp: function ( ) {
        this.stopUpdateCountDownTime();
        this.m_updateTime = null;
        this.m_allTime = null;
        this.m_frameCallBack = null;
        this.m_overCallBack = null;
    }
});
