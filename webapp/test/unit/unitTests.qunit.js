/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"success_factors/master_detail/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
