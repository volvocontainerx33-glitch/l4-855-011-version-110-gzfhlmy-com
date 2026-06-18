(function () {
    function initPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var message = shell.querySelector('[data-player-message]');
        var source = shell.getAttribute('data-src');
        var attached = false;
        var hls = null;

        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.hidden = false;
            }
        }

        function attachSource() {
            if (attached || !video || !source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                attached = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage('视频暂时无法加载，请稍后重试。');
                    }
                });
                attached = true;
                return;
            }

            showMessage('当前浏览器暂不支持在线播放。');
        }

        function startPlayback() {
            attachSource();

            if (!video) {
                return;
            }

            shell.classList.add('is-playing');
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    shell.classList.remove('is-playing');
                    showMessage('请再次点击播放按钮开始播放。');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    shell.classList.remove('is-playing');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(initPlayer);
}());
