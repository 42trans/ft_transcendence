function makeRequest(method, url) {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(" Fetch() Error");
    }
    return response.text();
  });
}

export default async function fetchData(url) {
  try {
    const response_text = await makeRequest("GET", url);
    console.log("Response Text:", response_text); // レスポンスのテキストをコンソールに出力
    return response_text;
  } catch (error) {
    console.error(error);
  }
  return "";
}
