# Files To G-Drive

Página web estática que sube archivos a Google Drive y da de alta clientes usando la API de [guide-appscript](https://github.com/JoniDG/guide-appscript) (tema 5, Backend: un web app de Apps Script).

## Qué hace

- **Subir archivos:** varios a la vez, un pedido por archivo, con el estado de cada uno (subiendo, link a Drive o el error). Antes de mandar, avisa si el tipo o el tamaño no los acepta la API.
- **Nuevo cliente:** nombre, email, ciudad, monto y activo. Los errores de validación de la API (por ejemplo, un email repetido) se muestran en el formulario.

## Configuración

1. Publicá la API de guide-appscript como web app (ver `src/backend/Conceptos.js` en ese repo), con **Quién tiene acceso: Cualquier persona**, y copiá la URL que termina en `/exec`. Con "Cualquier persona con cuenta de Google" o con la URL `/dev`, los pedidos de esta página terminan en la pantalla de login de Google y fallan.
2. Pegala en `js/config.js`, en `API_URL`.
3. Abrí la página y pegá el **token de la API** en el campo de arriba. Es el `API_TOKEN` que crea `setup()` en guide-appscript: está en el editor de Apps Script, en Configuración del proyecto > Propiedades del script. Con "Recordar en este navegador" queda guardado solo en tu navegador (localStorage), nunca en el código. Ojo: localStorage es por origen, así que otra página que sirvas en el mismo `http://localhost:8000` podría leerlo; si eso te preocupa, no lo recuerdes.

## Uso

Se puede abrir `index.html` directamente, pero se recomienda un servidor local, por ejemplo:

```bash
python3 -m http.server 8000
```

y entrá a <http://localhost:8000>.

## Cómo habla con la API

`js/api.js` resuelve las reglas que impone Apps Script como backend:

- La ruta va en `?ruta=...` (por ejemplo `?ruta=archivos`), no en el path: Google manda al login a los pedidos anónimos a `/exec/<path>`.
- El JSON se manda con `Content-Type: text/plain`: con `application/json` el navegador hace un preflight CORS que Apps Script no responde.
- La respuesta HTTP siempre es 200: el resultado real viene en el JSON `{ ok, status, data | error }`.
- Los archivos viajan en base64 dentro del JSON, porque Apps Script no interpreta `multipart/form-data`.
