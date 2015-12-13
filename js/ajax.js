'use strict';

function ajax(url, method, head, data) {
  return new Promise(function (resolve, reject) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.addEventListener("readystatechange", function () {
      if (xmlhttp.readyState == 4) {
        var result = {
          status: xmlhttp.status,
          response: xmlhttp.response
        };
        if (xmlhttp.status == 200) resolve(result);else reject(result);
      }
    });
    xmlhttp.addEventListener("abort", reject);
    xmlhttp.addEventListener("error", reject);
    xmlhttp.addEventListener("timeout", reject);
    if (/GET/i.test(method)) {
      xmlhttp.open(method, url + param(data));
      for (var name in head) {
        xmlhttp.setRequestHeader(name, head[name]);
      }
      xmlhttp.send();
    } else if (/POST/i.test(method)) {
      xmlhttp.open(method, url, false);
      for (var name in head) {
        xmlhttp.setRequestHeader(name, head[name]);
      }
      if (head && head['Content-Type'] == 'application/x-www-form-urlencoded') xmlhttp.send(param(data));else xmlhttp.send(JSON.stringify(data));
    }
  });

  function param(object) {
    var encodedString = '';
    for (var prop in object) {
      if (object.hasOwnProperty(prop)) {
        if (encodedString.length > 0) {
          encodedString += '&';
        }
        encodedString += encodeURI(prop + '=' + object[prop]);
      }
    }
    return encodedString;
  }
}