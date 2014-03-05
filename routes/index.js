exports.index = function(req, res) {
    // show full whisky list with filters
    if (req.user) {
        var redis = req.app.get("redis");
        var user = req.user.email;

        redis.hgetall(user + ":reviews", function(err, reviews) {
            if (!err) {
                redis.smembers(user + ":trylist", function(err, trylist) {
                    console.log(reviews);
                    console.log(trylist);
                    res.render("index", {
                        title: "Rate Whisky - Full List", 
                        user:req.user,
                        whiskies: req.app.get("whiskies"),
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

    var redis = req.app.get("redis");
    var user = req.user.email;

    redis.hget(user + ":reviews", req.params.id, function(err, review) {
        var empty = {
            rating: 0,
            notes: '',
            price: ''
        };

        review = review || empty;
        review.id = whisky.id;
        review.name = whisky.name;

        res.json(review);
    });
}

exports.save = function(req, res) {
    var redis = req.app.get("redis");
    var user = req.user.email;

    console.log(req.params.id);
    console.log(req.body);

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
