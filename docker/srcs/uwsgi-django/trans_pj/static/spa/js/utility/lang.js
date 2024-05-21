import { switchPage, renderView } from "../routing/renderView.js";

export async function changingLanguage(url, form, current_uri) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: form,
    });

    const result = await response.text();
    if (result) {
      switchPage(current_uri);
      renderView();
    } else {
      console.error("Failure");
    }

    return response;
  } catch (error) {
    console.error(error);
  }

  return "";
}
