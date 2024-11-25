let baseUrl = "The url of your project in app script";
let urlAppScript = new URL(baseUrl);

function enviarData(event) {
  event.preventDefault();
  let params = new URLSearchParams();
  params.append("func", "saveData");
  const fileInput = document.getElementById("fileInput");
  const files = fileInput.files;
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;

  let checkboxFileJson = document.getElementById("chbx1");
  let checkboxFileFormData = document.getElementById("chbx2");
  let checkboxDataJson = document.getElementById("chbx3");
  let checkboxDataQuery = document.getElementById("chbx4");

  if (files.length === 0) {
    alert("Por favor seleccione al menos un archivo.");
    return;
  }

  const promises = [];

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let reader = new FileReader();
    let promise = new Promise((resolve, reject) => {
      reader.onload = function (e) {
        //Se define la funcion que se va a ejecutar si la lectura del archivo sale bien
        const base64String = e.target.result.split(",")[1];
        resolve({
          name: file.name,
          content: base64String,
          mimeType: file.type,
        });
      };
      reader.onerror = function (error) {
        //Se define la funcion que se va a ejecutar si la lectura del archivo sale mal
        reject(error);
      };
      reader.readAsDataURL(file); //Se lee el archivo
    });
    promises.push(promise);
  }
  Promise.allSettled(promises)
    .then((values) => {
      let body = {};
      let formData = new FormData();
      let options = {
        method: "POST",
        //headers: myHeaders,
        redirect: "follow",
      };
      for (let i = 0; i < values.length; i++) {
        if (values[i].status !== "fulfilled") {
          console.error(values[i].reason);
        }

        if (values[i].status === "fulfilled") {
          if (checkboxFileJson.checked) {
            if (!body.files) {
              body.files = [];
            }
            body.files.push(values[i].value);
            options.body = JSON.stringify(body);
          }

          if (checkboxFileFormData.checked) {
            formData.append(`files[${i}]`, JSON.stringify(values[i].value));
            options.body = formData;
          }
        }
      }
      if (checkboxDataJson.checked && !checkboxFileFormData.checked) {
        body.name = name;
        body.age = age;
        options.body = JSON.stringify(body);
      }

      if (checkboxDataQuery.checked) {
        params.append("queryName", name);
        params.append("queryAge", age);
      }
      urlAppScript.search = params.toString();
      return fetch(urlAppScript, options);
    })
    .then((responseFetch) => responseFetch.json())
    .then((responseJson) => {
      console.log("Éxito:", responseJson);
      alert("Archivos y texto subidos con éxito.");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al subir los archivos y el texto.");
    });
}
