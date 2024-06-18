// static/spa/js/utility/cache.js

const DEBUG_LOG = 0;

export function setNoCache() {
    if (DEBUG_LOG) { console.log("set no cache"); }

    // IE
    if (!window.onbeforeunload) {
        window.onbeforeunload = function() {};
    }

    // IE以外
    if (!window.onload) {
        window.onunload = function() {};
    }
}

export function clearNoCache() {
    if (DEBUG_LOG) { console.log("no cache clear"); }

    window.onbeforeunload = null;
    window.onunload = null;
}
