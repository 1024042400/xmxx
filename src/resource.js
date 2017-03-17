var res = {
    Select       : "res/music/Select.mp3",
    Pop          : "res/music/Pop.mp3",
    Bg           : "res/image/moon_bg.png",
    SharePng     : "res/image/share.png",
    SharePlist   : "res/image/share.plist",
    NewActsPng   : "res/image/NewActs.png",
    NewActsPlist : "res/image/NewActs.plist"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}

var xx_global_config = {
    IsPlayMusic  : true,
    IsBoom : false
};