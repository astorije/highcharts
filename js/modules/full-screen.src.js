/* *
 * (c) 2009-2020 Rafal Sebestjanski
 *
 * Full screen for Highcharts
 *
 * License: www.highcharts.com/license
 */
'use strict';
import H from '../parts/Globals.js';
var addEvent = H.addEvent, Chart = H.Chart;
/**
 * The module allows user to enable display chart in full screen mode.
 * Used in StockTools too.
 * Based on default solutions in browsers.
 *
 */
/* eslint-disable no-invalid-this, valid-jsdoc */
/**
 * Handles displaying chart's container in the fullscreen mode.
 *
 * @class
 * @name Highcharts.Fullscreen
 * @hideconstructor
 * @requires modules/full-screen
 */
var Fullscreen = /** @class */ (function () {
    /* *
     *
     *  Constructors
     *
     * */
    function Fullscreen(chart) {
        /**
         * Chart managed by the fullscreen controller.
         * @name Highcharts.Fullscreen#chart
         * @type {Highcharts.Chart}
         */
        this.chart = chart;
        /**
         * The flag is set to `true` when the chart is displayed in
         * the fullscreen mode.
         *
         * @name Highcharts.Fullscreen#isOpen
         * @type {boolean|undefined}
         * @since next
         */
        this.isOpen = false;
        if (!(chart.container.parentNode instanceof Element)) {
            return;
        }
        var container = chart.container.parentNode;
        // Hold event and methods available only for a current browser.
        if (!this.browserProps) {
            if (typeof container.requestFullscreen === 'function') {
                this.browserProps = {
                    fullscreenChange: 'fullscreenchange',
                    requestFullscreen: 'requestFullscreen',
                    exitFullscreen: 'exitFullscreen'
                };
            }
            else if (container.mozRequestFullScreen) {
                this.browserProps = {
                    fullscreenChange: 'mozfullscreenchange',
                    requestFullscreen: 'mozRequestFullScreen',
                    exitFullscreen: 'mozCancelFullScreen'
                };
            }
            else if (container.webkitRequestFullScreen) {
                this.browserProps = {
                    fullscreenChange: 'webkitfullscreenchange',
                    requestFullscreen: 'webkitRequestFullScreen',
                    exitFullscreen: 'webkitExitFullscreen'
                };
            }
            else if (container.msRequestFullscreen) {
                this.browserProps = {
                    fullscreenChange: 'MSFullscreenChange',
                    requestFullscreen: 'msRequestFullscreen',
                    exitFullscreen: 'msExitFullscreen'
                };
            }
        }
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Stops displaying the chart in fullscreen mode.
     * Exporting module required.
     *
     * @since       next
     *
     * @function    Highcharts.Fullscreen#close
     * @return      {void}
     * @requires    modules/full-screen
     */
    Fullscreen.prototype.close = function () {
        var fullscreen = this, chart = fullscreen.chart;
        // Don't fire exitFullscreen() when user exited using 'Escape' button.
        if (fullscreen.isOpen &&
            fullscreen.browserProps &&
            chart.container.ownerDocument instanceof Document) {
            chart.container.ownerDocument[fullscreen.browserProps.exitFullscreen]();
        }
        // Unbind event as it's necessary only before exiting from fullscreen.
        if (fullscreen.unbindFullscreenEvent) {
            fullscreen.unbindFullscreenEvent();
        }
        fullscreen.isOpen = false;
        fullscreen.setButtonText();
    };
    /**
     * Displays the chart in fullscreen mode.
     * When fired customly by user before exporting context button is created,
     * button's text will not be replaced - it's on the user side.
     * Exporting module required.
     *
     * @since       next
     *
     * @function Highcharts.Fullscreen#open
     * @return      {void}
     * @requires    modules/full-screen
     */
    Fullscreen.prototype.open = function () {
        var fullscreen = this, chart = fullscreen.chart;
        // Handle exitFullscreen() method when user clicks 'Escape' button.
        if (fullscreen.browserProps) {
            fullscreen.unbindFullscreenEvent = H.addEvent(chart.container.ownerDocument, // chart's document
            fullscreen.browserProps.fullscreenChange, function () {
                // Handle lack of async of browser's fullScreenChange event.
                if (fullscreen.isOpen) {
                    fullscreen.isOpen = false;
                    fullscreen.close();
                }
                else {
                    fullscreen.isOpen = true;
                    fullscreen.setButtonText();
                }
            });
            if (chart.container.parentNode instanceof Element) {
                var promise = chart.container.parentNode[fullscreen.browserProps.requestFullscreen]();
                if (promise) {
                    promise['catch'](function () {
                        alert(// eslint-disable-line no-alert
                        'Full screen is not supported inside a frame.');
                    });
                }
            }
            H.addEvent(chart, 'destroy', fullscreen.unbindFullscreenEvent);
        }
    };
    /**
     * Replaces the exporting context button's text when toogling the
     * fullscreen mode.
     *
     * @private
     *
     * @since       next
     *
     * @requires modules/full-screen
     * @return {void}
     */
    Fullscreen.prototype.setButtonText = function () {
        var _a, _b, _c, _d;
        var chart = this.chart, exportDivElements = chart.exportDivElements, exportingOptions = chart.options.exporting, menuItems = (_b = (_a = exportingOptions) === null || _a === void 0 ? void 0 : _a.buttons) === null || _b === void 0 ? void 0 : _b.contextButton.menuItems, lang = chart.options.lang;
        if (((_c = exportingOptions) === null || _c === void 0 ? void 0 : _c.menuItemDefinitions) && ((_d = lang) === null || _d === void 0 ? void 0 : _d.exitFullscreen) &&
            lang.viewFullscreen &&
            menuItems &&
            exportDivElements &&
            exportDivElements.length) {
            exportDivElements[menuItems.indexOf('viewFullscreen')]
                .innerHTML = !this.isOpen ?
                (exportingOptions.menuItemDefinitions.viewFullscreen.text ||
                    lang.viewFullscreen) : lang.exitFullscreen;
        }
    };
    /**
     * Toggles displaying the chart in fullscreen mode.
     * By default, when the exporting module is enabled, a context button with
     * a drop down menu in the upper right corner accesses this function.
     * Exporting module required.
     *
     * @since       next
     *
     * @sample      highcharts/members/chart-togglefullscreen/
     *              Toggle fullscreen mode from a HTML button
     *
     * @function Highcharts.Fullscreen#toggle
     * @requires    modules/full-screen
     */
    Fullscreen.prototype.toggle = function () {
        var fullscreen = this;
        if (!fullscreen.isOpen) {
            fullscreen.open();
        }
        else {
            fullscreen.close();
        }
    };
    return Fullscreen;
}());
H.Fullscreen = Fullscreen;
export default H.Fullscreen;
// Initialize fullscreen
addEvent(Chart, 'beforeRender', function () {
    /**
     * @name Highcharts.Chart#fullscreen
     * @type {Highcharts.Fullscreen}
     * @requires modules/full-screen
     */
    this.fullscreen = new H.Fullscreen(this);
});