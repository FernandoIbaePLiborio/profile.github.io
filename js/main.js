
(function() {
    
    var partialsCache = {};

    function fetchFile(path, callback) {
        var request = new XMLHttpRequest();

        request.onload = function() {
            callback(request.responseText);
        };
        request.open("GET", path);
        request.send(null); 
    }

    function getContent(fragmentId, callback) {
        if (partialsCache[fragmentId]) {
            callback(partialsCache[fragmentId]);
        } else {
            fetchFile(fragmentId + ".html", function(content) {
                partialsCache[fragmentId] = content;
                callback(content);
            });
        }
        fetchFile(fragmentId + ".html", callback);
    }

    if (!location.hash) {
        location.hash = "#home";
    }

    function setActiveLink(fragmentId) {
        var navbarDiv = document.querySelectorAll(".navbar-nav .nav-item .nav-link"),
        links = navbarDiv, i, link, pageName;

        for(i = 0; i < links.length; i++) {
            link = links[i]; 
            pageName = link.getAttribute("href") !== null ? link.getAttribute("href").substring(1) : '';
            if (pageName === fragmentId) {
                link.setAttribute("style", "color: aliceblue; pointer-events: none; cursor: default;");
            } else {
                link.removeAttribute("style");
            }
        }
    }

    function navigate() {
        var contentDiv = document.getElementById("content"),
        fragmentId = location.hash.substring(1);

        getContent(fragmentId, function(content){
            contentDiv.innerHTML = content;
        });
        setActiveLink(fragmentId);
    }
    navigate();
    window.addEventListener("hashchange", navigate);

}());