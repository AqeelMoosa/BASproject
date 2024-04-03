sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/library",
    "sap/ui/core/Fragment",

], function (BaseController, JSONModel, formatter, mobileLibrary, Fragment) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return BaseController.extend("successfactors.masterdetail.controller.Detail", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data

            var oViewModel = new JSONModel({
                busy : false,
                delay : 0,
                lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
            });

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            this.setModel(oViewModel, "detailView");

            this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onSendEmailPress: function () {
            var oViewModel = this.getModel("detailView");

            URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
        },

        
        /**
         * Updates the item count within the line item table's header
         * @param {object} oEvent an event containing the total number of items in the list
         * @private
         */
        onListUpdateFinished: function (oEvent) {
            var sTitle,
                iTotalItems = oEvent.getParameter("total"),
                oViewModel = this.getModel("detailView");

            // only update the counter if the length is final
            if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
                if (iTotalItems) {
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
                } else {
                    //Display 'Line Items' instead of 'Line items (0)'
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
                }
                oViewModel.setProperty("/lineItemListTitle", sTitle);
            }
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

        /**
         * Binds the view to the object path and expands the aggregated line items.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched: function (oEvent) {
            var objectId1 =  oEvent.getParameter("arguments").objectId1;
            var objectId2 =  oEvent.getParameter("arguments").objectId2;
            var objectId3 =  oEvent.getParameter("arguments").objectId3;

            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            this.getModel().metadataLoaded().then( function() {
                var sObjectPath = `EmpJob(seqNumber=${objectId2}L,startDate=${objectId3},userId='${objectId1}')`
                this._bindView("/" + sObjectPath);

            }.bind(this));
        },


        

        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
        _bindView: function (sObjectPath) {
            // Set busy indicator during view binding
            var oViewModel = this.getModel("detailView");
            this.byId("RegOrTemp").bindElement(sObjectPath + "/jobCodeNav");
            // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
            oViewModel.setProperty("/busy", false);

            this.getView().bindElement({
                path : sObjectPath,
                parameters: {expand:'userNav'},
                events: {
                    change : this._onBindingChange.bind(this),
                    dataRequested : function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },


        _onBindingChange: function () {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("detailObjectNotFound");
                // if object could not be found, the selection in the list
                // does not make sense anymore.
                this.getOwnerComponent().oListSelector.clearMasterListSelection();
                return;
            }

            var sPath = oElementBinding.getPath()
                // oResourceBundle = this.getResourceBundle(),
                // oObject = oView.getModel().getObject(sPath),
                // sObjectId = oObject.userId,
                // sObjectName = oObject.userId,
                // oViewModel = this.getModel("detailView");

            this.getOwnerComponent().oListSelector.selectAListItem(sPath);

        },

        _onMetadataLoaded: function () {
            // Store original busy indicator delay for the detail view
           // var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
             var oViewModel = this.getModel("detailView"),
                oLineItemTable = this.byId("lineItemsList");
                //iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

            // Make sure busy indicator is displayed immediately when
            // detail view is displayed for the first time
            oViewModel.setProperty("/delay", 0);
            oViewModel.setProperty("/lineItemTableDelay", 0);

           // oLineItemTable.attachEventOnce("updateFinished", function() {
                // Restore original busy indicator delay for line item table
             //   oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
            //});

            // Binding the view will set it to not busy - so the view is always busy if it is not bound
            oViewModel.setProperty("/busy", true);
            // Restore original busy indicator delay for the detail view
            oViewModel.setProperty("/delay");
        },

        /**
         * Set the full screen mode to false and navigate to list page
         */
        onCloseDetailPress: function () {
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
            // No item should be selected on list after detail page is closed
            this.getOwnerComponent().oListSelector.clearListListSelection();
            this.getRouter().navTo("list");
        },
        



onEdit: function() {

    var oModel = this.getOwnerComponent().getModel();

    var formatDate = new Date(this.getView().getBindingContext().getProperty("startDate"))
    var uID = this.getView().getBindingContext().getProperty("userId")
    var Sid = this.getView().getBindingContext().getProperty("seqNumber")
    var sDate = "datetime'" + formatDate.toISOString().slice(0, 19).replace('T', 'T') + "'";

    var oinput = this.byId("JobTitle").getValue();
    var pay = this.byId("PayGrade").getValue();
    var workdays = this.byId("WorkingDays").getValue();
    var hours = this.byId("Hours").getValue();
    var ofte = this.byId("FTE").getValue();

    oModel.metadataLoaded().then(function() {
        var payload = {
            
                "__metadata": {
                "uri": 
               `/EmpJob(seqNumber=${Sid}L,startDate=${sDate},userId='${uID}')`,
                "type": "SFOData.EmpJob"
                },

                "jobTitle": oinput,
                "payGrade": pay,
                "workingDaysPerWeek": workdays,
                "standardHours": hours,
                "fte" : ofte,
                
        };

        oModel.create("/upsert", payload, {
            success: function() {


                              sap.m.MessageBox.show("Updated successfully!", {
                                icon: sap.m.MessageBox.Icon.SUCCESS,
                                title: "Info!"
                            });
                       },
                       error: function() {
                        sap.m.MessageBox.show("Sorry,Can not Update the Product! Please try again later.", {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Oops!"
                        });
                    }
                });

                });
            },
onEditDetails: function() {

                var oModel = this.getOwnerComponent().getModel();

                var oUserId = this.getView().getBindingContext.getProperty("userId") 
            
            
                var name = this.byId("Displayname").getValue();
            
                oModel.metadataLoaded().then(function() {
                    var payload = {
                        
                            "__metadata": {
                                "uri": "https://apisalesdemo8.successfactors.com/odata/v2/User('" + oUserId + "')",
                                "type": "SFOData.User"
                            },
            
                            "userNav/displayName": name
                            
                    };
            
                    oModel.create("/upsert", payload, {
                        success: function() {
                                          sap.m.MessageBox.show("Updated successfully!", {
                                            icon: sap.m.MessageBox.Icon.SUCCESS,
                                            title: "Info!"
                                        });
                                   },
                                   error: function() {
                                    sap.m.MessageBox.show("Sorry,Can not Update the Product! Please try again later.", {
                                        icon: sap.m.MessageBox.Icon.ERROR,
                                        title: "Oops!"
                                    });
                                }
                            });
            
                            });
                        },

                        handleEditToggled: function (oEvent) {
                            this.getView().getModel().refresh();
                        },

                        newEdit: function () {

                            
                            const oModel = () => this.getOwnerComponent().getModel();
                     
                            var formatDate = new Date(this.getView().getBindingContext().getProperty("startDate"))
                            var Sid = this.getView().getBindingContext().getProperty("seqNumber")
                            var sDate = "datetime'" + formatDate.toISOString().slice(0, 19).replace('T', 'T') + "'";
                     
                            const oUserId = this.getView().getBindingContext().getProperty("userId");
                            const displayName = this.byId("Displayname").getValue();
                            const gender = this.byId("Gender").getValue();
                            const email = this.byId("Email").getValue();
                            const city = this.byId("City").getValue();
                     
                            var oinput = this.byId("JobTitle").getValue();
                            var pay = this.byId("PayGrade").getValue();
                            var workdays = this.byId("WorkingDays").getValue();
                            var hours = this.byId("Hours").getValue();
                            var ofte = this.byId("FTE").getValue();        
                     
                            const oUserData = {
                                "__metadata": {
                                    "uri": `https://apisalesdemo8.successfactors.com/odata/v2/User('${oUserId}')`,
                                    "type": "SFOData.User"
                                },
                                 "displayName": displayName,
                                 "gender": gender,
                                 "email": email,
                                 "city": city
                            };
                     
                            const oEmpJobData = {
                                "__metadata": {
                                    "uri": `https://apisalesdemo8.successfactors.com/odata/v2/EmpJob(seqNumber=${Sid}L,startDate=${sDate},userId='${oUserId}')`,
                                    "type": "SFOData.EmpJob"
                                },
                                "jobTitle": oinput,
                                "payGrade": pay,
                                "workingDaysPerWeek": workdays,
                                "standardHours": hours,
                                "fte" : ofte,
                            };
                     
                        try {
                                oModel().create("/upsert", oEmpJobData, {
                                    success: () => {
                                        oModel().create("/upsert", oUserData, {
                                            success: () => {
                                                
                                                sap.m.MessageBox.success("Details updated successfully!");  
                                            },
                                            error: (oError) => {
                                                this.getOwnerComponent().getEventBus().publish("successfactors.masterdetail.controller.Detail", "refreshList");
                                                sap.m.MessageBox.error(`Error updating: ${oError}`);  
                                            }
                                        });                                                                                      
                                    },
                                    error: (oError) => {
                                        try {
                                            const errorResponse = JSON.parse(oError.responseText);
                                            const errorMessage = errorResponse.error.message.value;
                                            sap.m.MessageBox.error(`Error occurred during EmpJob upsert:\n ${errorMessage}`);
                                        } catch (error) {
                                            sap.m.MessageBox.error(`Error parsing error response:\n ${error}`);
                                        }                                                                              
                                    }
                                });
                            } catch (error) {
                                sap.m.MessageBox.error(`An error occured:\n ${error}`);
                            }

                            
                        },



            

onOrderDetails: function (Event) {
        const Model =  this.getView().getModel();
        this.openProductQuickView (Event, Model);
    },

    });

});