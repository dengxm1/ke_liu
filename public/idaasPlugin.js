function IDaaSLoginPlugin(config) {
  this.config = config;
  this.config.width = this.config.width ? this.config.width : 400;
  this.config.height = this.config.height ? this.config.height : 500;
  this.config.host = window.location.protocol +'//'+ window.location.host;
  this.init();
}

IDaaSLoginPlugin.prototype = {
  init: function () {
    this.appendFrame();
  },

  // 鎻掑叆鐧诲綍妗咺frame
  appendFrame: function () {
    var doc = document;
    var self = this;

    this.frame = doc.createElement('iframe');
    this.frame.setAttribute('src', this.config.portalUrl);
    this.frame.setAttribute('frameborder', '0');
    this.frame.setAttribute('width', this.config.width);
    this.frame.setAttribute('height', this.config.height);
    this.frame.id = 'idaasLoginPlugin';

    // Iframe鎻掑叆浣嶇疆
    if(this.config.box) {
      document.getElementById(this.config.box).appendChild(this.frame);
    } else {
      var getScripts = document.getElementsByTagName('script');
      for(var i = 0; i < getScripts.length; i++) {
        getScripts[i].src.indexOf('idaas-login-plugin.js') != -1 &&
        getScripts[i].parentNode.insertBefore(this.frame, getScripts[i]);
      }
    }

    // iframe鍔犺浇涔嬪悗鎵ц鎿嶄綔
    this.frame.onload = function () {
      self.appendParams();
    }
  },

  // 灏嗘牱寮忕瓑淇℃伅浼犻€掔粰鐧诲綍妯″潡
  appendParams: function () {
    document.getElementById('idaasLoginPlugin').contentWindow.postMessage(this.config, this.config.portalUrl);
  }

}
