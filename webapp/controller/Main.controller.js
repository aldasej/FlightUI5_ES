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


        onUpdateRecord: function (oEvent) {
            //bind the data of the row to a model to bind it at the Dialog
            var oItem = this.getView().byId("_IDGenTable1").getSelectedItem();
            //if no item selected show  a message text
            if (oItem) {
                var oContext1 = oItem.getBindingContext("flightDataModel").getObject();
            } else {
                MessageToast.show("Select one row from the table !");
                return;
            }

            this.getView().setModel(new sap.ui.model.json.JSONModel({
                    oPayload: oContext1
                }),
                "oPayloadModel"
            );
            //open the dialog
            if (!this.oDialog_u) {
                this.loadFragment({
                    name: "flightui5v2.fragments.UpdateDialog",
                }).then(
                    function (oDialog_u) {
                        this.oDialog_u = oDialog_u;
                        this.oDialog_u.open();
                    }.bind(this)
                );
            } else {
                this.oDialog_u.open();
            }
        },

        //     onSaveRecord: function () {
        //     var oDataModel = this.getOwnerComponent().getModel();
        //     var oRecord = this.getView().getModel("oPayloadModel").getProperty("/oPayload");

        //     // The entity key must be the PRIMARY KEY of your entity
        //     // You have: Carrid + IsActiveEntity (because draft)
        //     var sCarrId = oRecord.Carrid; // take from your model
        //     var sPath = "/FlightES(Carrid='" + sCarrId + "',IsActiveEntity=true)";

        //     var that = this;

        //     oDataModel.update(sPath, oRecord, {
        //         method: "PATCH",               // optional, default is MERGE
        //         success: function () {
        //             that.oDialog_u.close();
        //             that.readFlight();      // refresh table
        //             MessageToast.show("Updated successfully");
        //         },
        //         error: function (oError) {
        //             that.oDialog_u.close();
        //             MessageToast.show("An error has occurred");
        //         }
        //     });
        // },

        onSaveRecord: function () {
            var oDataModel = this.getOwnerComponent().getModel();
            var oRecord = this.getView()
                .getModel("oPayloadModel")
                .getProperty("/oPayload");

            // Key of the airline we are updating
            var sCarrId = oRecord.Carrid;   // or from selected row
            var that = this;

            oDataModel.callFunction("/updateEntry", {
                method: "POST",          // RAP actions are POST in V2
                urlParameters: {
                    // identify which instance to update
                    Carrid: sCarrId,

                    // action parameters (ZC_FLIGHT_NEW_ENTRY_PARAM)
                    Carrname: oRecord.Carrname,
                    Currcode: oRecord.Currcode,
                    Url: oRecord.Url
                },
                success: function (oData, oResponse) {
                    that.oDialog_u.close();
                    that.onreadFlight();      // refresh the main table
                    sap.m.MessageToast.show("Updated successfully");
                },
                error: function (oError) {
                    that.oDialog_u.close();
                    sap.m.MessageToast.show("An error has occurred");
                }
            });
        },

        onCancelRow: function () {
            this.oDialog_u.close();
        },

    });
});