sap.ui.define([
        "./BaseController"
],function (Controller) {
        "use strict";

        return Controller.extend("com.sap.demo.ui.saas.controller.MainView", {
            onInit: function () {
                this.oView = this.getView();
            }
        });
    }
);

