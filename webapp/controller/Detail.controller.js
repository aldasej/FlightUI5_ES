sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "flightui5v2/formatter/Formatter",
], (Controller, Formatter) => {
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
    });
});