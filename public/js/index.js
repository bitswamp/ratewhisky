var menu, body, filter;

function toggleClass(element, className) {
    if (element.className.indexOf(className) > -1) {
        element.className = element.className.replace(className, "");
    } else {
        element.className += className;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    menu = document.getElementById("menu");
    body = document.getElementsByTagName("body")[0];

    menu.addEventListener("click", function() {
        toggleClass(body, "menu-open");
    });

    filter = document.getElementById("filter");

    filter.addEventListener("click", function(e) {
        var filterClass, sections, active, i;
        if (e.target.tagName.toLowerCase() === "a") {
            e.preventDefault();
            filterClass = e.target.getAttribute("data-filter-class");
            sections = document.getElementsByTagName("section");
            for (i = 0; i < sections.length; i++) {
                if (sections[i].className.indexOf(filterClass) > -1)
                    sections[i].style.display = "block";
                else
                    sections[i].style.display = "none";
            }
            if (e.target.className.indexOf("active") === -1) {
                active = filter.getElementsByClassName("active");
                if (active.length)
                    active[0].className = active[0].className.replace("active", "");
                e.target.className += "active";
            }
        }
    });
});
