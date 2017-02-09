var res = {
    Select       : "res/music/Select.mp3",
    Pop          : "res/music/Pop.mp3",
    Passed       : "res/music/Passed.mp3",
    Plevel       : "res/music/Plevel.mp3",
    Praise       : "res/music/Praise.mp3",
    Bg           : "res/image/bg.png",
    NewActsPng   : "res/image/NewActs.png",
    NewActsPlist : "res/image/NewActs.plist",
    PkPng        : "res/image/pk.png",
    PkPlist      : "res/image/pk.plist",
    PkBg         : "res/image/pk_bg.png",
    Particle     : "res/image/particle_texture.plist",
    OverBg       : "res/image/over_bg.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}


var xx_global_config = {
    IsPlayMusic  : true
};