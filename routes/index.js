exports.index = function(req, res) {
    // show full whisky list with filters
    res.render("index", { 
        title: "Rate Whisky - Full List", 
        user: req.user,
        whiskies: req.app.get("whiskies")
    });
};

exports.logout = function(req, res) {
    req.logout();
    res.redirect("/");
};

exports.trylist = function(req, res) {
    // show try list
    res.render("trylist", {
        title: "Rate Whisky - My Try List",
        user: req.user
    });
};

exports.reviews = function(req, res) {
    // show my reviews
    res.render("reviews", { 
        title: "Rate Whisky - My Reviews", 
        user: req.user 
    });
};
