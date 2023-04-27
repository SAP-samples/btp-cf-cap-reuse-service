sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox"
],function (Controller, JSONModel, MessageBox) { 
        "use strict";
        return Controller.extend("com.sap.demo.ui.reuse.controller.App", {

            onInit: function () {
                const oModel = this.getOwnerComponent().getModel();
                this.getView().setModel(new JSONModel(), 'tenantModel');

                oModel.attachMetadataLoaded(null, () => {
                    oModel.callFunction("/tenantInfo", { 
                        method: "GET", 
                        success: (result) => this.getView().getModel('tenantModel').setData(result.tenantInfo), 
                        error: (err) => console.log(err.message)
                    })
                });
            },

            onPressSelection: function(){
                const oSelectedKey = this.getOwnerComponent().getModel('parentModel').getProperty("/selectedKey");
                MessageBox.information(`Key ${oSelectedKey} was selected!`);
            }
        });
    }
);
