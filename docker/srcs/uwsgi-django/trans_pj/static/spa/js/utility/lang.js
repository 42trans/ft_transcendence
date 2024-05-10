import { DataType } from "../const/type.js";
import { navigateTo, router } from "../routing/routing.js";

export async function changingLanguage(url, form, current_uri) {
  try {
    console.log("url:" + url);
    console.log("current_url:" + current_uri);
    //const response = await makeRequestForLang(url, lang);
    //const response = await
    const response = await fetch(url, {
      method: "POST",
      body: form,
    });

    //makeRequestForLang(url, form);
    const result = await response.text();
    console.log("result:" + result);
    if (result) {
      navigateTo(current_uri);
      router();
    } else {
      console.log("Failure");
    }

    //console.log(response);
    return response;
  } catch (error) {
    console.error(error);
  }

  //const uri = getDisplayedURI(tmp_path);

  return "";
}
