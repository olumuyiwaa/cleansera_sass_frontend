/**
 * CleanSera booking widget embed.
 *
 * Usage — drop this on any page of the business's own website:
 *
 *   <div id="cleansera-widget" data-business="acme-cleaning"></div>
 *   <script src="https://widget.cleansera.co/embed.js" async></script>
 *
 * `data-business` is the business's CleanSera subdomain slug (not a
 * secret — it's the same value used in their CleanSera booking link).
 * Multiple widgets on one page are supported; each container needs its
 * own data-business (they can be different businesses or the same one).
 */
(function () {
    var WIDGET_ORIGIN = (function () {
        // Derived from this script's own src so the same embed.js works
        // whether it's served from a staging or production widget domain,
        // without businesses needing to update their embed snippet.
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src || "";
            if (src.indexOf("/embed.js") !== -1) {
                var a = document.createElement("a");
                a.href = src;
                return a.protocol + "//" + a.host;
            }
        }
        return "https://widget.cleansera.co";
    })();

    function mount(container) {
        var subdomain = container.getAttribute("data-business");
        if (!subdomain) {
            console.error("[cleansera-widget] missing data-business attribute");
            return;
        }
        var iframe = document.createElement("iframe");
        iframe.src = WIDGET_ORIGIN + "/book-now/" + encodeURIComponent(subdomain);
        iframe.style.width = "100%";
        iframe.style.border = "0";
        iframe.style.minHeight = "480px";
        iframe.setAttribute("title", "Book a cleaning");
        iframe.setAttribute("loading", "lazy");
        container.appendChild(iframe);
        container.__cleanseraIframe = iframe;
    }

    window.addEventListener("message", function (event) {
        var data = event.data;
        if (!data || data.source !== "cleansera-widget" || !data.height) return;
        var containers = document.querySelectorAll("[data-business]");
        for (var i = 0; i < containers.length; i++) {
            var iframe = containers[i].__cleanseraIframe;
            if (iframe && iframe.contentWindow === event.source) {
                iframe.style.height = data.height + "px";
            }
        }
    });

    function init() {
        var containers = document.querySelectorAll(
            "#cleansera-widget[data-business], .cleansera-widget[data-business]"
        );
        for (var i = 0; i < containers.length; i++) mount(containers[i]);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
