sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel"
],function (Controller, JSONModel) { 
        "use strict";

        return Controller.extend("com.sap.demo.ui.reuse.controller.App", {

            onInit: function () {
                const oModel = this.getOwnerComponent().getModel();
                this.getView().setModel(new JSONModel(), 'userModel');

                oModel.attachMetadataLoaded(null, () => {
                    oModel.callFunction("/userInfo", { 
                        method: "GET", 
                        success: (result) => this.getView().getModel('userModel').setData(result.userInfo), 
                        error: (err) => console.log(err.message)
                    })
                }, null);
                
            },
        });
    }
);
