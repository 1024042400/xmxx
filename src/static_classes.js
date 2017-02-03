/**
 * Created by jingyuan on 2017/1/20.
 */
var xxEvents = new XXEvents();
var xxtea = new Xxtea("d253a9c4dea02b36c4f50db61838710f");
xxtea.encode = function (data) {
    return "y67mcyP5KO" + Base64.encode64(xxtea.xxtea_encrypt(data));
};
xxtea.decode  = function (data) {
    xxtea.xxtea_decrypt(data.substring(10,data.length));
};
