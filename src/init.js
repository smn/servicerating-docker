go.init = function() {
    var vumigo = require('vumigo_v02');
    var InteractionMachine = vumigo.InteractionMachine;
    var JsBoxApp = go.app.JsBoxApp;


    return {
        im: new InteractionMachine(api, new JsBoxApp())
    };
}();
