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
    const response = await makeRequest("GET", url);
    return response;
  } catch (error) {
    console.error(error);
  }
  return "";
}
