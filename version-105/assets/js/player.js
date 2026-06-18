function initMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var started = false;
    var hls = null;

    if (!video || !cover || !source) {
        return;
    }

    function bindSource() {
        if (started) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        started = true;
    }

    function startPlayback() {
        bindSource();
        cover.hidden = true;
        video.setAttribute("controls", "controls");

        var playPromise = video.play();

        if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
                cover.hidden = false;
            });
        }
    }

    cover.addEventListener("click", startPlayback);

    video.addEventListener("play", function () {
        cover.hidden = true;
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
