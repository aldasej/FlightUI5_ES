sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "flightui5v2/formatter/Formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, Formatter, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("flightui5v2.controller.Detail", {

        formatter: Formatter,
        
        onInit() {
            debugger
            this.getOwnerComponent().getRouter().getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);
            this.getView().getModel("FlghDetailModel");
        },

         _onObjectMatched: function (oEvent) {
               //read the url parameters
                var sCarrId = oEvent.getParameter("arguments").Carrid;

                var oDetailJSONModel = new sap.ui.model.json.JSONModel();
                var that = this;
                //read the data from Back End (READ_GET_ENTITY)
                var oDataModel = this.getOwnerComponent().getModel();
                var sPath = "/FlightES(Carrid='" + sCarrId + "',IsActiveEntity=true)";

                oDataModel.read(sPath, {
                    urlParameters: {
                        "$expand": "to_FlightDetailsES" // Replace with your navigation property name
                    },

                    success: function (oresponse) {
                        console.log(oresponse);
                        //attach the data to the model
                        oDetailJSONModel.setData(oresponse);
                        //attach the Model to the View
                        that.getView().setModel(oDetailJSONModel, "FlghDetailModel");
                        console.log(that.getView().getModel("FlghDetailModel"));
                    },
                    error: function (oerror) { },
                });
            },


            onDeletePress: function (oEvent) {
                var oButton   = oEvent.getSource();
                var oContext  = oButton.getBindingContext("FlghDetailModel");
                var oFlight   = oContext.getObject();

                var that = this;
                MessageBox.confirm(
                    "Delete flight " + oFlight.Connid + " of airline " + oFlight.Carrid + "?",
                    {
                        title: "Confirm Deletion",
                        onClose: function (sAction) {
                            if (sAction === MessageBox.Action.OK) {
                                var oModel = that.getView().getModel();

                                oModel.callFunction("/deleteEntry", {
                                    method: "POST",
                                    urlParameters: {
                                        Carrid: oFlight.Carrid,
                                        Connid: oFlight.Connid
                                    },
                                    success: function () {
                                        MessageToast.show("Flight deleted successfully");
                                        that.byId("_IDGenTable").getBinding("items").refresh();
                                    },
                                    error: function (oError) {
                                        MessageBox.error("Deletion failed: " + oError.message);
                                    }
                                });
                            }
                        }
                    }
                );
            }
    });
});