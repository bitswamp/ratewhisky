function sortWhiskyByName(a, b) {
    if (a.name > b.name)
        return 1;
    else if (a.name == b.name)
        return 0;
    else
        return -1;
}

exports.index = function(type) {
    return function(req, res) {
        var title = "Rate Whisky - Full List";
        // show full whisky list with filters
        if (req.user) {
            var redis = req.app.get("redis");
            var user = req.user.email;

            redis.hgetall(user + ":reviews", function(err, reviews) {
                if (!err) {
                    redis.smembers(user + ":trylist", function(err, trylist) {
                        //console.log(reviews);
                        //console.log(trylist);

                        var whiskies = req.app.get("whiskies");
                        var whiskiesById = req.app.get("whiskiesById");

                        if (type === "reviews" || type === "trylist") {
                            whiskies = {
                                "Scotland": [],
                                "USA": [],
                                "Canada": [],
                                "Ireland": [],
                                "Australia": [],
                                "France": [],
                                "India": []
                            }
                            if (type === "reviews") {
                                title = "Rate Whisky - Reviews";
                                for (var id in reviews)
                                    if (reviews.hasOwnProperty(id))
                                        whiskies[whiskiesById[id].country].push(whiskiesById[id]);
                            } else if (type === "trylist") {
                                title = "Rate Whisky - Try List";
                                for (var i = 0; i < trylist.length; i++)
                                    whiskies[whiskiesById[trylist[i]].country].push(whiskiesById[trylist[i]]);
                            }
                            for (var country in whiskies) {
                                whiskies[country].sort(sortWhiskyByName);
                            }
                        }

                        reviews = reviews || {};
                        trylist = trylist || [];

                        res.render("index", {
                            title: title, 
                            type: type,
                            user:req.user,
                            whiskies: whiskies,
                            reviews: reviews,
                            trylist: trylist
                        });
                    });
                }
            });
        } else {
            res.render("index", { 
                title: "Rate Whisky - Full List", 
                user: null,
                whiskies: req.app.get("whiskies")
            });
        }
    };
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

exports.whisky = function(req, res) {
    var whiskies = req.app.get("whiskiesById");
    var whisky = whiskies[req.params.id];

    var redis = req.app.get("redis");
    var user = req.user.email;

    redis.hget(user + ":reviews", req.params.id, function(err, review) {
        var empty = {
            rating: 0,
            notes: '',
            price: ''
        };

        res.render("whisky", {
            review: review ? JSON.parse(review) : empty,
            whisky: whisky,
            user: req.user
        });
    });
}

exports.review = function(req, res) {
    var whiskies = req.app.get("whiskiesById");
    var whisky = whiskies[req.params.id];
    //console.log("whisky: " + whisky.name);

    var redis = req.app.get("redis");
    var user = req.user.email;

    redis.hget(user + ":reviews", req.params.id, function(err, review) {
        var empty = {
            rating: 0,
            notes: '',
            price: ''
        };

        review = review ? JSON.parse(review) : empty;
        //review.id = whisky.id;
        review.name = whisky.name;

        //console.log("review: " + review);
        res.json(review);
    });
}

exports.save = function(req, res) {
    var redis = req.app.get("redis");
    var user = req.user.email;

    //console.log(req.params.id);
    //console.log(req.body);

    var review = {
        id: req.params.id,
        rating: req.body.rating,
        notes: req.body.notes,
        price: req.body.price
    };

    redis.hset(user + ":reviews", req.params.id, JSON.stringify(review), function(err, result) {
        if (err) {
            res.status(409).json({ error: true });
        } else {
            res.json({ result: result });
        }
    });
}

exports.add = function(req, res) {
    var redis = req.app.get("redis");
    var user = req.user.email;
    var id = req.params.id;

    redis.sadd(user + ":trylist", id, function(err, result) {
        if (err) {
            res.status(409).json({ error: true });
        } else {
            res.json({ result: result });
        }
    });
}

exports.remove = function(req, res) {
    var redis = req.app.get("redis");
    var user = req.user.email;
    var id = req.params.id;

    redis.srem(user + ":trylist", id, function(err, result) {
        if (err) {
            res.status(409).json({ error: true });
        } else {
            res.json({ result: result });
        }
    });
}
