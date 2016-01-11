'use strict'

var tabId;
chrome.tabs.onActivated.addListener( function ( info ) { tabId = info.tabId; } );

var captureCode = `
	var a = {
		fromUrl : window.location.toString()
		, selectStr : window.getSelection().toString().trim()
	}; a
`;
// 用於抓取目前瀏覽頁面反白的文字及頁面的網址

chrome.contextMenus.create({
	title : "new word",
	type : "normal",
	contexts : ["selection"],
	onclick : function () {
		chrome.tabs.executeScript(
			tabId,
			{ code : captureCode },
			function(items) {
				var word = items[0].selectStr.trim();
				var url = items[0].fromUrl;
        chrome.storage.sync.get( ["config"], function ( items ) {
  				ajax(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t&dt=bd&dj=1&tl=${items.config.nativeTongue}&q=${word}`,
            'get'
          ).then( function (data) {
            var res = JSON.parse(data.response);
            if ( res.confidence > 0.1 && res.dict ) {
              ajax(
                'https://ankiweb.net/account/login',
                'post',
                {'Content-Type':'application/x-www-form-urlencoded'},
                items.config
              ).then(function () {
                res.dict.forEach( dict => {
                  ajax(
                    'https://ankiweb.net/edit/save',
                    'post',
                    {'Content-Type':'application/x-www-form-urlencoded'},
                    {
                      data: JSON.stringify( [
                        [`${dict.base_form}(${dict.pos})`,dict.terms.join()],
                        dict.pos+' '+url
                      ] ),
                      deck:items.config.deck,
                      mid:1444618253414
                    }
                  );
                });
              });
            }
          });
        } );
			}
		);
	}
});
// 新增右鍵選單的選項，該選項用於擷取使用者反白的單字，判讀為單字並將其保存。
