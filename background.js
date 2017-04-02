chrome.storage.local.get('smdata', function(data) {
  // 初期値
  var smdata = {};
  smdata.sumPx = 0;
  smdata.startDate = new Date();
  smdata.startDate = smdata.startDate.toString();

  if (data.smdata === undefined) {
    chrome.storage.local.set({smdata: smdata}, function() {});
  } else {
    if (data.smdata.sumPx !== undefined) {
      // データが保存されていたら、そのデータを代入
      smdata.sumPx = data.smdata.sumPx;
      smdata.startDate = data.smdata.startDate;
    }
  }
  // スクロールイベントが走ったら、データを更新
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.px !== 'undefined') {
      smdata.sumPx += request.px;
      chrome.storage.local.set({smdata: smdata}, function() {});
      sendResponse({sum: smdata.sumPx, date: smdata.startDate});
    }
  });

  // タブを更新 or 開いたら実行される
  chrome.tabs.onUpdated.addListener(function(tabid, info, tab) {
    if (info.status === 'complete') {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabid, {start: 'start', sum: smdata.sumPx, date: smdata.startDate}, function(response) {});
      });
    }
  });

  // データクリア
  chrome.browserAction.onClicked.addListener(function(tab) {
    console.log(tab.id);
    chrome.storage.local.clear(function() {
      smdata.sumPx = 0;
      smdata.startDate = new Date();
      smdata.startDate = smdata.startDate.toString();
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tab.id, {start: 'start', sum: smdata.sumPx, date: smdata.startDate}, function(response) {});
      });
    });
  });
});
