var bookmarkhider = function() {
    var me = this;

    me.prefix = "extensions.bookmarkhider."; //the memory path prefix
    me.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch); //memory service
    me.out = true; //wheter the mouse is outside of the toolbar
    me.lastover = 0; //the last time in ms when the mouse was above the toolbar
    me.hideInterval = 50; //the tick interval in ms used to slide the toolbar in
    me.intervalObj = undefined; //the interval object used to animate
    me.curHeight = 0; //the current height, first values is calculated by this.show()
    me.origHeight = 0; //the origial height, first values is calculated by this.show()
    me.overTimer = undefined;
    me.outTimer = undefined;

    me.onLoad = function() {
        // initialization code
        me.initialized = true;
        me.getToolbar().addEventListener("mouseover", function() { return me.mouseover;}(), false);
        me.getToolbar().addEventListener("dragenter", function() { return me.mouseover;}(), false);
        me.getUrlbarContainer().addEventListener("mouseover", function() { return me.mouseover;}(), false);
        me.getUrlbarContainer().addEventListener("dragenter", function() { return me.mouseover;}(), false);
        me.getContent().addEventListener("mouseover", function() { return me.mouseout;}(), false);
    },

    me.getToolbar = function() {
        return document.getElementById("PersonalToolbar");
    };

    me.getUrlbarContainer = function() {
        return document.getElementById("urlbar-container");
    };

    me.getContent = function() {
        return document.getElementById("content");
    };

    me.getSlideBool = function() {
        return me.prefs.getBoolPref(me.prefix+"slide");
    };

    me.getSlidetime = function() {
        return me.prefs.getIntPref(me.prefix+"slidetime");
    };

    me.getOpentime = function() {
        return me.prefs.getIntPref(me.prefix+"opentime");
    };

    me.getOpendelay = function() {
        return me.prefs.getIntPref(me.prefix+"opendelay");
    };

    me.getStyle = function() {
        return me.getToolbar().style;
    };

    me.getCompHeight = function() {
        var docObj = me.getToolbar();
	var height = parseFloat(document.defaultView.getComputedStyle(docObj, "").getPropertyValue("height"));
        return height;  
    };

    //check for macos
    me.isMacOS = function() {
        return navigator.appVersion.toLowerCase().indexOf("mac") > 0;;
    };

    me.useMultiBmToolbar = function() {
	var ret = false;
	try {
	    ret = me.prefs.getBoolPref("extensions.multibmtoolbar.enable");
	} catch(e) { }
	return ret;
    };

    //let the toobar stay open
    me.stayopen = function() {
        me.out = false;
    };

    //this function resets the toolbar stylings (aka, opens the toolbar) 
    me.resetStyle = function() {
        var style = me.getStyle();
        style.minHeight = "5px";
        style.maxHeight = "";
	style.height = "";
        style.overflow = "";
	//fixing the multibar issues
	if ( me.useMultiBmToolbar() ) {
	    style.setProperty("overflow-y","visible",null);
	}

    };

    //this function sets the interval object
    me.setMyInterval = function (cb) {
        if ( "undefined" == typeof(me.intervalObj) ) {
            me.intervalObj = window.setInterval(cb, me.hideInterval );
        }
    };

    //this function cleans the interval object
    me.clearMyInterval = function() {
        if("undefined" !== typeof(me.intervalObj)) {
            window.clearInterval(me.intervalObj);
            me.intervalObj = undefined;
        }
    };

    //this function collapses the bar
    me.collapse = function() {
        me.getToolbar().collapsed=true;
        me.getStyle().visibility="collapse";
    };

    //this function is called whenever the toolbar should show up
    me.show = function() {
        if ( !me.out ) {
            me.resetStyle();
            me.getToolbar().collapsed = false;
            me.getStyle().visibility = "visible";
	    me.curHeight = me.getCompHeight();
	    me.origHeight = me.getCompHeight();
        }
    };

    //this function is called whenever the toolbar should hide and performs the movement
    me.hide = function() {
        if ( me.out ) {
            var style = me.getStyle();
            if (me.curHeight > 1 && me.getSlideBool() ) {
                var stepping = (me.origHeight/me.getSlidetime())*me.hideInterval;

                if (isNaN(parseFloat(style.minHeight))) {
                    me.resetStyle();
                }

                if (me.isMacOS()) {
                    me.curHeight = style.minHeight;//macos dirty hack
                }

                var newH = (me.curHeight-stepping)+"px";

                style.minHeight = newH;
                style.maxHeight = newH;
                style.height = newH;
                style.overflow = "hidden";

		if ( me.useMultiBmToolbar() ) {
		    style.setProperty("overflow-y","hidden",null);
		}

                me.setMyInterval(function() { return me.hide;}());
		me.curHeight = parseFloat(newH);
		if ( me.curHeight < 1 ) {
		    me.curHeight = 0.1;
		}
            } else {
                me.clearMyInterval();
                style.minHeight = "0px";
                style.maxHeight = "0px";
                me.out = true;
                me.lastover = 0;
                me.collapse();
            }
        }
    }

    //this function is called whenever the mouse leaves the bookmark toolbar
    me.mouseout = function() {
        if ( !me.out ) {
	    if ( me.outTimer)
	        window.clearTimeout( me.outTimer );
            me.out = true;
            var mytime = ( new Date() ).getTime();
            if (mytime - me.lastover < me.getOpentime() ) {
                me.outTimer = window.setTimeout(function() { return me.hide;}(), me.getOpentime() - (mytime - me.lastover));
            } else {
                me.hide();
            }
        }
    };

    //this function is calles whenever the mouse enters the toolbar
    me.mouseover = function() {
        me.lastover = ( new Date() ).getTime();
        if ( me.out ) {
	    if ( "undefined" !== typeof me.overTimer )
	        window.clearTimeout( me.overTimer );
            me.clearInterval();
            me.out = false;
            if (me.getOpendelay() > 0) {
                me.overTimer = window.setTimeout(function() { return me.show;}(),me.getOpendelay());
            } else {
                //me.show();
            }
        }
    };

    window.addEventListener("load", function () { return me.onLoad; }(), false);

    //no public interface
    return {};

}();
