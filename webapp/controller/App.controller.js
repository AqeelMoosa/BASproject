sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel"
], function (BaseController, JSONModel, ResourceModel) {
    "use strict";

    return BaseController.extend("successfactors.masterdetail.controller.App", {

        onInit : function ()
        
        {

            var oViewModel,
                fnSetAppNotBusy,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            oViewModel = new JSONModel({
                busy : true,
                delay : 0,
                layout : "OneColumn",
                previousLayout : "",
                actionButtonsInfo : {
                    midColumn : {
                        fullScreen : false
                    }
                }
            });
            this.setModel(oViewModel, "appView");

            fnSetAppNotBusy = function() {
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            };

            // since then() has no "reject"-path attach to the MetadataFailed-Event to disable the busy indicator in case of an error
            this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);
            this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());


            // var oResource = new ResourceModel({

            
            // bundleName: "test.project1.i18n.i18n",
            // supportedLocales: ["en","fr"],
            // fallbackLocale: "en"
            
            // });

            // this.setModel(oResource, "i18n");
            
        }

    });
});