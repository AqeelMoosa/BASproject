sap.ui.define([], function () {
    "use strict";



    return {
        /**
         * Rounds the currency value to 2 digits
         *
         * @public
         * @param {string} sValue value to be formatted
         * @returns {string} formatted currency value with 2 digits
         */
        currencyValue : function (sValue) {
            if (!sValue) {
                return "";
            }

            return parseFloat(sValue).toFixed(2);
        },

        MergeID: function (ContactName, OrderID) {

            const name = ContactName.substring (0, 4).toUpperCase();
            const order = OrderID.toString().substring(0, 2);
            const final = OrderID.toString().substring(2, 5);
            return name + order + "-" + final;
         

    
         }
    };
});