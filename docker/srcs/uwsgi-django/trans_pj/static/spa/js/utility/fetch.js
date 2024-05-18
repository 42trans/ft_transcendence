function makeRequest(method, url) {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(" Fetch() Error");
    }
    return response.text();
  });
}

export default async function fetchData(url) {
  console.log("fetch url:", url); // レスポンスのテキストをコンソールに出力
  try {
    const response_text = await makeRequest("GET", url);
    // console.log("Response Text:", response_text); // レスポンスのテキストをコンソールに出力
    return response_text;
  } catch (error) {
    // console.error(error);
    console.error("Failed to fetch home page");
    return "<p>Failed to load home page</p>";  }
}
