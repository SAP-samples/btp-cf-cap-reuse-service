sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/sap/demo/ui/reuse/model/models"
], function (UIComponent, models) {
    "use strict";
    return UIComponent.extend("com.sap.demo.ui.reuse.Component", {
        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments); 
            this.setModel(models.createDeviceModel(), "device"); 
            this.getRouter().initialize(); 
        },

        onBeforeRendering: function (oEvent) {
            if(this.oPropagatedProperties.oModels['viewModel']){
                 this.setModel(this.oPropagatedProperties.oModels['viewModel'], "parentModel");
            }
        },

        destroy: function () {
            if (this.routeHandler) {
                this.routeHandler.destroy();
            }
            UIComponent.prototype.destroy.apply(this, arguments);
        }
    });
});
