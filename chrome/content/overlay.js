var bookmarkhider = {
    prefix: "extensions.bookmarkhider.", //the memory path prefix
    prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch), //memory service
    out: 1, //wheter the mouse is outside of the toolbar
    lastover: 0, //the last time in ms when the mouse was above the toolbar
    hideInterval: 50, //the tick intervall in ms used to slide the toolbar in
    intervalObj: undefined, //the interval object used to animate
    onLoad: function() {
        // initialization code
        this.initialized = true;
    },
    getSlideBool: function() {
        return this.prefs.getBoolPref(this.prefix+"slide");
    },
    getSlidetime: function() {
        return this.prefs.getIntPref(this.prefix+"slidetime");
    },
    getOpentime: function() {
        return this.prefs.getIntPref(this.prefix+"opentime");
    },
    getOpendelay: function() {
        return this.prefs.getIntPref(this.prefix+"opendelay");
    },
    getStyle: function() {
        return this.getToolbar().style;
    },
    getCompHeight: function() {
        var docObj = this.getToolbar();
        return parseFloat(document.defaultView.getComputedStyle(docObj, "").getPropertyValue("height"));
    },
    getToolbar: function() {
        return document.getElementById("PersonalToolbar");
    },
    //check for macos
    isMacOS: function() {
        return navigator.appVersion.toLowerCase().indexOf("mac") > 0;;
    },
    //this function is called whenever the mouse leaves the bookmark toolbar
    mouseout: function() {
        if ( !this.out ) {
            this.out = true;
            var mytime = ( new Date() ).getTime();
            if (mytime - this.lastover < this.getOpentime() ) {
                window.setTimeout('bookmarkhider.hide();', this.getOpentime() - (mytime - this.lastover));
            } else
                this.hide();
        }
    },
    //this function is calles whenever the mouse enters the toolbar
    mouseover: function() {
        if ( this.out ) {
            this.clearInterval();
            this.out = false;
            this.lastover = ( new Date() ).getTime();
            if (this.getOpendelay() > 0) {
                window.setTimeout('bookmarkhider.show();',this.getOpendelay());
            } else {
                this.show();
            }
        }
    },
    //let the toobar stay open
    stayopen: function() {
        this.out = false;
    },
    //this function resets the toolbar stylings (aka, opens the toolbar) 
    resetStyle: function() {
        var style = this.getStyle();
        style.minHeight = "20px";
        style.maxHeight = "";
    },
    //this function sets the interval object
    setInterval: function (func) {
        if ( typeof(this.intervalObj) == 'undefined' )
            this.intervalObj = window.setInterval(func, this.hideInterval );
    },
    //this function cleans the interval object
    clearInterval: function() {
        window.clearInterval(this.intervalObj);
        this.intervalObj = undefined;
    },
    //this function collapses the bar
    collapse: function() {
        this.getToolbar().collapsed=true;
        this.getStyle().visibility="collapse";
    },
    //this function is called whenever the toolbar should show up
    show: function() {
        if ( !this.out ) {
            this.resetStyle();
            this.getToolbar().collapsed = false;
            this.getStyle().visibility = "visible";
        }
    },
    //this function is called whenever the toolbar should hide and performs the movement
    hide: function() {
        if ( this.out ) {
            var style = this.getStyle();
            var curHeight = this.getCompHeight();
            if (curHeight > 0 && this.getSlideBool() ) {
                var stepping = (20/this.getSlidetime())*this.hideInterval;

                if (isNaN(parseFloat(style.minHeight))) {
                    this.resetStyle();
                }

                if (this.isMacOS()) {
                    curHeight = style.minHeight;//macos dirty hack
                }

                var newH = (parseFloat(curHeight)-stepping)+"px";

                if (parseFloat(style.minHeight) >= parseFloat(style.maxHeight))
                    style.minHeight = newH;

                style.maxHeight = newH;

                this.setInterval('bookmarkhider.hide();');
            } else {
                this.clearInterval();
                style.minHeight = "0px";
                style.maxHeight = "0px";
                this.out = true;
                this.lastover = 0;
                this.collapse();
            }
        }
    }
};

window.addEventListener("load", bookmarkhider.onLoad, false);
