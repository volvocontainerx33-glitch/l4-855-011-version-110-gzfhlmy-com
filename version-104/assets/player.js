(function () {
  window.initPlayer = function (url) {
    var video = document.querySelector('[data-player-video]');
    var start = document.querySelector('[data-player-start]');
    var status = document.querySelector('[data-player-status]');
    var hls = null;
    var loaded = false;

    if (!video || !start || !url) {
      return;
    }

    function message(text) {
      if (status) {
        status.textContent = text;
        status.hidden = !text;
      }
    }

    function attach() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            message('播放暂时不可用');
          }
        });
        return Promise.resolve();
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return Promise.resolve();
      }
      message('播放暂时不可用');
      return Promise.reject(new Error('unsupported'));
    }

    function play() {
      attach().then(function () {
        return video.play();
      }).then(function () {
        start.classList.add('hidden');
        message('');
      }).catch(function () {
        message('点击视频继续播放');
      });
    }

    start.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      start.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        start.classList.remove('hidden');
      }
    });
    video.addEventListener('ended', function () {
      start.classList.remove('hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
