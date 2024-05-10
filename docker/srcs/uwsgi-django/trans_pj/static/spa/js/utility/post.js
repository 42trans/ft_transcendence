import { DataType } from "../const/type.js";

function makeRequest(method, url, data, data_type) {
  return fetch(uri, {
    method: method,
    headers: { "Content-Type": data_type },
    body: data,
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Failure to Post: " + url);
    }
    return response.text();
  });
  /*
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject(new Error("Request failed with status: " + xhr.status));
      }
    };
    xhr.onerror = function () {
      reject(new Error("Request failed"));
    };
    xhr.send();
  });
  */
}

export default async function sendPost(url, data, data_type) {
  try {
    let content_type;

    // jsonでの動作は未確認
    if (data_type === DataType.json) {
      content_type = "application/json";
    } else if (data_type === DataType.text) {
      content_type = "text/html";
    }
    const response = await makeRequest("POST", url, data, content_type);
    //console.log(response);
    return response;
  } catch (error) {
    console.error(error);
  }
  return "";
}
