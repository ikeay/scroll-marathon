$(function() {
  var goalPx = 159477367;  // 42.195km
  var lastPx = 0;
  var pointerX = 0;
  var pointerY = 0;
  var stopTimeFlag = false;
  var timer, stopTime;
  var startTime, sumPx;

  // スタートしてから今までの時間を計算する
  function currentRecord() {
    var nowTime = new Date();
    var time = nowTime - startTime;
    var hours = Math.floor(time / (60 * 60 * 1000));
    var minutes = Math.floor(time / (60 * 1000)) % 60;
    var seconds = Math.floor(time / 1000) % 60 % 60;
    return hours.toString() + ':' + minutes.toString() + ':' + seconds.toString();
  }

  // ピクセルをメートル法に
  function pixelToMetric(px) {
    var mm = px * 0.264583;
    if (mm < 10) {
      return mm.toFixed(1).toString() + 'mm'
    } else if (mm < 1000) {
      var cm = mm / 10;
      return cm.toFixed(2).toString() + 'cm';
    } else if (mm < 1000000) {
      var m = mm / 1000;
      return m.toFixed(2).toString() + 'm';
    } else {
      var km = mm / 1000000;
      return km.toFixed(2).toString() + 'km';
    }
  }

  // ログの表示
  function showLog() {
    $('#sm-counter').css('position', 'fixed');
    $('#sm-counter').css('top', pointerY);
    $('#sm-counter').css('left', pointerX);
  }

  // マウスが動いたら
  $(window).mousemove(function(e) {
    pointerX = e.clientX;
    pointerY = e.clientY;
    showLog();
  });

  // 初期化
  function init() {
    lastPx = $(window).scrollTop();
    var distance = pixelToMetric(sumPx);
    var time = currentRecord(startTime);
    var div = '<span id="sm-counter"><span id="sm-distance">' + distance + '</span>,<br><span id="sm-time">' + time + '</span></span>';
    $('#sm-counter').remove();
    $('body').append(div);
  }

  function cronItems() {
    // 100ミリ秒ごとに
    timer = setInterval(function() {
      var time = currentRecord();
      $('#sm-time').text(time);
    }, 100);

    // スクロールごとに
    $(window).scroll(function() {
      if (sumPx >= goalPx) {
        if (!stopTimeFlag) {
          var time = currentRecord();
          stopTime = time;
          stopTimeFlag = true;
          clearInterval(timer);
        }
        $('#sm-counter').html('<span id="sm-distance">Goal!</span>,<br><span id="sm-time">' + stopTime + '</span></span>');
      } else {
        var nowPx = $(window).scrollTop();
        var diff = nowPx - lastPx;
        if (diff > 0 && diff < 50) {
          chrome.runtime.sendMessage({px: diff}, function(response) {
            var distance = pixelToMetric(response.sum);
            $('#sm-distance').text(distance);
          });
        }
        lastPx = nowPx;
      }
    });
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.start === 'start') {
      startTime = Date.parse(request.date);
      sumPx = request.sum;
      init();
      cronItems();
    }
  });

});
