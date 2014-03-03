var menu, body;

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
});
