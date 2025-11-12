sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("flightui5v2.controller.Main", {
        onInit() {

            var oFlightJSONModel = new sap.ui.model.json.JSONModel();
            var that = this;
            //read the data from Back End (READ_GET_ENTITYSET)
            var oDataModel = this.getOwnerComponent().getModel();
            var sPath = "/FlightES";

            oDataModel.read(sPath, {
                sorters: [new sap.ui.model.Sorter("Carrname", false)],
                success: function (oresponse) {
                    console.log(oresponse);
                    //attach the data to the model
                    oFlightJSONModel.setData(oresponse.results);
                    //attach the Model to the View
                    that.getView().setModel(oFlightJSONModel, "flightDataModel");
                },
                error: function (oerror) { },
            });
        },

        onListItemPress: function (oItem) {
            this.getOwnerComponent().getRouter().navTo("Detail", {
                Carrid: oItem.getSource().getBindingContext("flightDataModel").getProperty().Carrid
            });
        },

        //***************************************************
        //********************Open Create Dialog*************
        //************************************************** */
        onAddNewRecord: function () {
            if (!this.oDialog) {
                this.loadFragment({
                    name: "flightui5v2.fragments.CreateDialog",
                }).then(
                    function (oDialog) {
                        this.oDialog = oDialog;
                        this.oDialog.open();
                    }.bind(this)
                );
            } else {
                this.oDialog.open();
            }
        },


        //***************************************************
        //********************CREATE||POST Operation*********
        //************************************************** */
        onCreateNewRecord: function () {
            //Set condition when CarrId empty
            var sCarrId = this.getView().byId("carrIDInput").getValue();

            if (!sCarrId) {
                MessageToast.show("The CarrId should not empty");
                return;
            };

            
            var mParams = {
                Carrid: this.getView().byId("carrIDInput").getValue(),
                Carrname: this.getView().byId("carrNameInput").getValue(),
                Currcode: this.getView().byId("currCodeInput").getValue(),
                Url: this.getView().byId("URLInput").getValue()
            };
            
            var that = this;
            var oDataModel = this.getOwnerComponent().getModel();
            this.oDialog.setBusy(true);
            oDataModel.callFunction("/createNewEntry", {
                method: "POST",
                urlParameters: mParams,
                success: function (oData, response) {
                    //close the dialog
                    that.oDialog.close();
                    //set  dialog busy false
                    that.oDialog.setBusy(false);
                    //update your model
                    that.readFlight(that);
                    MessageToast.show("Airline created successfuly");
                },
                error: function (oError) {
                    MessageToast.show("There was an error");
                    that.oDialog.close();
                }
            });
        },

        //on Close Dialog
        onCancelRecord: function () {
            this.oDialog.close();
        },

        readFlight: function (that) {
            var oFlightModel = that.getView().getModel("flightDataModel");
            var oDataModel = that.getOwnerComponent().getModel();
            var sPath = "/FlightES";

            oDataModel.read(sPath, {
                sorters: [new sap.ui.model.Sorter("Carrname", false)],
                success: function (oresponse) {
                    console.log(oresponse);
                    //attach the data to the model
                    oFlightModel.setData(oresponse.results);
                },
                error: function (oerror) { },
            });
        },

        ///////////////////////////////////////////////////////
        ////////////////END OF CREATE DIALOG///////////////////
        ///////////////////////////////////////////////////////

    });
});