var bookmarkhider = {
    prefix: "extensions.bookmarkhider.", //the memory path prefix
    prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch), //memory service
    out: 0, //wheter the mouse is outside of the toolbar
    lastover: 0, //the last time in ms when the mouse was above the toolbar
    hideInverval: 50, //the tick intervall in ms used to slide the toolbar in
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
        bookmarkhider.out = true;
        var mydate = new Date();
        var mytime = mydate.getTime();
        if (mytime - this.lastover < this.getOpentime() ) {
                window.setTimeout('bookmarkhider.hide();', this.getOpentime() - (mytime - this.lastover));
        }else
            this.hide();
    },
    //this function is calles whenever the mouse enters the toolbar
    mouseover: function() {
        this.out = false;
        var date = new Date();
        this.lastover = date.getTime();
        this.show();
    },
    //this function resets the toolbar stylings (aka, opens the toolbar) 
    resetStyle: function() {
        var style = this.getStyle();
        style.minHeight = "20px";
        style.maxHeight = "";
    },
    //this function is called whenever the toolbar should show up
    show: function() {
        this.resetStyle();
        this.getToolbar().collapsed = false;
        this.getStyle().visibility = "visible";
    },
    //this function is called whenever the toolbar should hide and performs the movement
    hide: function() {
        if ( this.out == true ) {
            var stepping = (20/this.getSlidetime())*this.hideInverval;
            var style = this.getStyle();
            var curHeight = this.getCompHeight();
            if (isNaN(parseFloat(style.minHeight))) {
                this.resetStyle();
            }
            if (this.isMacOS()) {
                curHeight = style.minHeight;//macos dirty hack
            }

            if (curHeight > 0) {
                var newH
                if ( this.getSlideBool() )
                    newH = (parseFloat(curHeight)-stepping)+"px";
                else
                    newH = "2px";
                if (parseFloat(style.minHeight) >= parseFloat(style.maxHeight) || !this.getSlideBool())
                    style.minHeight = newH;
                style.maxHeight = newH;
                if ( this.getSlideBool() )
                    window.setTimeout('bookmarkhider.hide();', this.hideInterval );
            }else {
                this.getToolbar().collapsed=true;
                this.getStyle().visibility="collapse";
            }
        }
    }
};

window.addEventListener("load", bookmarkhider.onLoad, false);
