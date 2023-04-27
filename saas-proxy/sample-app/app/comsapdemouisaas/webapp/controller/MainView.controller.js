sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
],function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("com.sap.demo.ui.saas.controller.MainView", {
            onInit: function () {
                this.oView = this.getView();

                this.setModel(new JSONModel(), 'viewModel');

                this.getModel('viewModel').setData({
                    "selectedKey": "ABCD",
                    "items": [{
                        "Key": "ABCD",
                        "Name": "ABCD"
                    },
                    {
                        "Key": "EFGH",
                        "Name": "EFGH"
                    }]
                })
            }
        });
    }
);

