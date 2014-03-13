var menu, body, filter, main, review;

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
};

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = 0, len = this.length; i < len; i++) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

Element.prototype.addClass = function(className) {
    if (this.className.indexOf(className) === -1)
        this.className = this.className + " " + className;
};

Element.prototype.removeClass = function(className) {
    this.className = this.className.replace(className, "").trim();
};

Element.prototype.toggleClass = function(className) {
    if (this.className.indexOf(className) > -1)
        this.removeClass(className);
    else
        this.addClass(className);
}

function setStars(container, score) {
    var stars = container.getElementsByClassName("fa-star");
    for (var i = 0; i < stars.length; i++) {
        if (i < score - 1) {
            stars[i].className = stars[i].className.replace("selected", "").trim();
            if (stars[i].className.indexOf("lit") === -1) stars[i].className += " lit";
        } else if (i === score - 1) {
            if (stars[i].className.indexOf("selected") === -1) stars[i].className += " selected";
        } else {
            stars[i].className = stars[i].className.replace("selected", "").replace("lit", "").trim();
        }
    }
}

function saveReview(e) {
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
        if (ajax.readyState === 4 && ajax.status === 200) {
            humane.log("Review saved");
            document.getElementById("save").disabled = false;
            closeReview();
            var edit = document.getElementById(id).getElementsByClassName("edit");
            if (edit.length)
                edit[0].addClass("lit");
        } else if (ajax.readyState === 4 && ajax.status !== 200) {
            humane.log("Error saving review");
            document.getElementById("save").disabled = false;
        }
    }

    var id = document.getElementById("whiskyId").value;
    var rating = document.getElementById("rating").value;
    var notes = document.getElementById("notes").value;
    var price = document.getElementById("price").value;

    ajax.open("POST", "/save/" + id, true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify({
        id: id,
        rating: rating,
        notes: notes,
        price: price
    }));

    document.getElementById("save").disabled = true;
    //document.getElementById("close").disabled = true;
}

var clear = function(whisky) { 
    var clear2 = function() {
        whisky.removeClass("last-selected");
    };
    return clear2;
};


function closeReview(e) {
    document.getElementById("hidden").style.display = "none";
    document.getElementById("main").style.display = "block";

    var id = document.getElementById("whiskyId").value;
    var target = document.getElementById(id).previousSibling;
    if (target)
        target.scrollIntoView();

    document.getElementById("whiskyName").innerHTML = "";
    document.getElementById("whiskyId").value = "";
    document.getElementById("rating").value = 0;
    document.getElementById("notes").value = "";
    document.getElementById("price").value = "";

    document.getElementById("price-info").innerHTML = "";
    document.getElementById("table-info").innerHTML = "";

    setStars(document.getElementsByClassName("rating")[0], 0);

    var whisky = document.getElementById(id);
    whisky.addClass("last-selected");
    window.setTimeout(clear(whisky), 100);
}

function editReview(id, existing) {
    var whisky = document.getElementById(id);
    var review = {
        name: whisky.children[0].innerHTML,
        id: id,
        rating: 0,
        notes: "",
        price: "",
        priceInfo: whisky.getAttribute("data-price"),
        tableInfo: whisky.getAttribute("data-table")
    };

    // if review already exists, load it
    if (existing) {
        var ajax = new XMLHttpRequest();

        //humane.log("Loading review");

        ajax.onreadystatechange = function() {
            if (ajax.readyState === 4 && ajax.status === 200) {
                review = JSON.parse(ajax.response);
                showReview(review);
            } else if (ajax.readyState === 4 && ajax.status != 200) {
                humane.log("Error loading existing review");
                showReview(review);
            }
        }

        ajax.open("GET", "/review/" + id, true);
        ajax.send();
    } else {
        showReview(review);
    }
}

function showReview(review) {
    document.getElementById("whiskyName").innerHTML = review.name;
    document.getElementById("whiskyId").value = review.id;
    document.getElementById("rating").value = review.rating;

    document.getElementById("notes").value = review.notes;
    document.getElementById("price").value = review.price;

    setStars(document.getElementsByClassName("rating")[0], review.rating);

    if (review.priceInfo)
        document.getElementById("price-info").innerHTML = "$" + review.priceInfo;
    if (review.tableInfo)
        document.getElementById("table-info").innerHTML = "Table " + review.tableInfo;

    document.getElementById("main").style.display = "none";
    document.getElementById("hidden").style.display = "block";
}

function addToTryList(id) {
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
        if (ajax.readyState === 4 && ajax.status === 200) {
            humane.log("Added to Try List");
            var add = document.getElementById(id).getElementsByClassName("add");
            if (add.length)
                add[0].addClass("lit");
        } else if (ajax.readyState === 4 && ajax.status !== 200) {
            humane.log("Error adding to list");
        }
    }
    
    ajax.open("POST", "/add/" + id, true);
    ajax.send();
}

function removeFromTryList(id, removeFromDom) {
    if (removeFromDom) {
        var del = window.confirm("Delete from list?");
        if (!del) return;
    }

    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
        if (ajax.readyState === 4 && ajax.status === 200) {
            if (removeFromDom)
                document.getElementById(id).remove();
            humane.log("Removed from Try List");
            var add = document.getElementById(id).getElementsByClassName("add");
            if (add.length)
                add[0].removeClass("lit");
        } else if (ajax.readyState === 4 && ajax.status !== 200) {
            humane.log("Error removing entry");
        }
    }
    
    ajax.open("POST", "/remove/" + id, true);
    ajax.send();
}

function filterByCountry(filterValue) {
    sections = document.getElementsByTagName("section");
    for (var i = 0; i < sections.length; i++) {
        if (sections[i].className.indexOf(filterValue) > -1)
            sections[i].style.display = "block";
        else
            sections[i].style.display = "none";
    }
}

function filterByReview(filterValue) {
    if (filterValue === "all") {
        var whiskies = document.getElementsByClassName("whisky");
        for (var i = 0; i < whiskies.length; i++) {
            whiskies[i].style.display = "block";
        }
    } else if (filterValue === "unlit") {
        var reviews = document.getElementsByClassName("edit");
        for (var i = 0; i < reviews.length; i++) {
            if (reviews[i].className.indexOf("lit") > -1)
                reviews[i].parentNode.parentNode.parentNode.style.display = "none";
            else
                reviews[i].parentNode.parentNode.parentNode.style.display = "block";
        }
    } else if (filterValue === "lit") {
        var reviews = document.getElementsByClassName("edit");
        for (var i = 0; i < reviews.length; i++) {
            if (reviews[i].className.indexOf("lit") === -1)
                reviews[i].parentNode.parentNode.parentNode.style.display = "none";
            else
                reviews[i].parentNode.parentNode.parentNode.style.display = "block";
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    humane.clickToClose = true;
    humane.timeout = 1000;

    menu = document.getElementById("menu");
    body = document.getElementsByTagName("body")[0];

    menu.addEventListener("click", function() {
        body.toggleClass("menu-open");
    });

    var getStarted = document.getElementById("getStarted");
    if (getStarted) {
        getStarted.addEventListener("click", function() {
            body.addClass("menu-open");
        });
    }

    filter = document.getElementById("filter");

    if (filter) {
        filter.addEventListener("click", function(e) {
            var filterValue, sections, active;
            if (e.target.tagName.toLowerCase() === "a") {
                e.preventDefault();
                filterValue = e.target.getAttribute("data-filter-country");
                if (filterValue)
                    filterByCountry(filterValue);
                else {
                    filterValue = e.target.getAttribute("data-filter-review");
                    if (filterValue)
                        filterByReview(filterValue);
                }
                if (e.target.className.indexOf("active") === -1) {
                    active = filter.getElementsByClassName("active");
                    if (active.length)
                        active[0].className = active[0].className.replace("active", "");
                    e.target.className += "active";
                }
            }
        });
    }

    review = document.getElementById("review");

    if (review) {
        var rating = review.getElementsByClassName("rating")[0];
        rating.addEventListener("click", function(e) {
            if (e.target.tagName.toLowerCase() === "i") {
                var score;
                if (e.target.className.indexOf("times") > -1) {
                    score = 0;
                } else {
                    score = e.target.id;
                }
                document.getElementById("rating").value = score;
                setStars(rating, score);
            }
        });

        var save = document.getElementById("save");
        save.addEventListener("click", saveReview);

        var close = document.getElementById("close");
        close.addEventListener("click", closeReview);
    }

    main = document.getElementById("main");
    if (main) {
        main.addEventListener("click", function(e) {
            if (e.target.tagName.toLowerCase() !== "i" || !e.target.getAttribute("data-id")) return;

            var id = e.target.getAttribute("data-id");
            var lit = (e.target.className.indexOf("lit") > -1);

            if (e.target.className.indexOf("edit") > -1) {
                e.preventDefault();
                editReview(id, lit);
            } else if (e.target.className.indexOf("add") > -1) {
                e.preventDefault();
                if (!lit)
                    addToTryList(id);
                else
                    removeFromTryList(id, false);
            } else if (e.target.className.indexOf("remove") > -1) {
                e.preventDefault();
                removeFromTryList(id, true);
            }
        });
    }
});
