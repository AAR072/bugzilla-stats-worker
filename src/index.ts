/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
}
type Bug = {
  assigned_to: {
    email: string;
    name: string;
  };
  status: string;
  type: string;
  priority: string;
};

function cleanBugsData(data: { bugs: any[] }): Bug[] {
  return data.bugs.map((bug) => ({
    assigned_to: {
      email: bug.assigned_to_detail?.email ?? "",
      name: bug.assigned_to_detail?.real_name ?? "",
    },
    status: bug.status ?? "",
    type: bug.type ?? "",
    priority: bug.priority ?? "",
  }));
}


async function fetchUserInfo() {
  // Construct the Bugzilla API URL to get user info
  const url = `https://bugzilla.mozilla.org/rest/bug?query_format=advanced&emailtype1=exact&emailassigned_to1=1&email1=AAR.dev%40outlook.com&list_id=17325891`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Cloudflare Worker',
      'Accept': 'application/json',
    },
  });

  // Log the response status and body for debugging
  console.log('Response Status:', response.status);
  const responseBody = await response.text();
  console.log('Response Body:', responseBody);

  if (!response.ok) {
    throw new Error("Failed to fetch Bugzilla user data");
  }

  return JSON.parse(responseBody);
}

async function handleRequest(request: Request) {
  const url = new URL(request.url);






  try {
    const userInfo = await fetchUserInfo();
    const data = cleanBugsData(userInfo);
    const counts = data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    const logoBase64 =
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLSBUaGlzIFNvdXJjZSBDb2RlIEZvcm0gaXMgc3ViamVjdCB0byB0aGUgdGVybXMgb2YgdGhlIE1vemlsbGEgUHVibGljCiAgIC0gTGljZW5zZSwgdi4gMi4wLiBJZiBhIGNvcHkgb2YgdGhlIE1QTCB3YXMgbm90IGRpc3RyaWJ1dGVkIHdpdGggdGhpcwogICAtIGZpbGUsIFlvdSBjYW4gb2J0YWluIG9uZSBhdCBodHRwOi8vbW96aWxsYS5vcmcvTVBMLzIuMC8uIC0tPgo8c3ZnIHdpZHRoPSI3Ny40MiIgaGVpZ2h0PSI3OS45NyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNzcuNDIgNzkuOTciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogPHRpdGxlPkZpcmVmb3ggQnJvd3NlciBsb2dvPC90aXRsZT4KIDxkZWZzPgogIDxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9IjcwLjc5IiB4Mj0iNi40NDciIHkxPSIxMi4zOSIgeTI9Ijc0LjQ3IiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKC0xLjMgLS4wMDQwODYpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZmY0NGYiIG9mZnNldD0iLjA0OCIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZlODQ3IiBvZmZzZXQ9Ii4xMTEiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmYzgzMCIgb2Zmc2V0PSIuMjI1Ii8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZjk4MGUiIG9mZnNldD0iLjM2OCIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmY4YjE2IiBvZmZzZXQ9Ii40MDEiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmNjcyYSIgb2Zmc2V0PSIuNDYyIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZjM2NDciIG9mZnNldD0iLjUzNCIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZTMxNTg3IiBvZmZzZXQ9Ii43MDUiLz4KICA8L2xpbmVhckdyYWRpZW50PgogIDxyYWRpYWxHcmFkaWVudCBpZD0iYiIgY3g9Ii03OTA3IiBjeT0iLTg1MTUiIHI9IjgwLjgiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzk3NCw4NTI0KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZiZDRmIiBvZmZzZXQ9Ii4xMjkiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmYWMzMSIgb2Zmc2V0PSIuMTg2Ii8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZjlkMTciIG9mZnNldD0iLjI0NyIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmY5ODBlIiBvZmZzZXQ9Ii4yODMiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmNTYzYiIgb2Zmc2V0PSIuNDAzIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZjM3NTAiIG9mZnNldD0iLjQ2NyIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZjUxNTZjIiBvZmZzZXQ9Ii43MSIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZWIwODc4IiBvZmZzZXQ9Ii43ODIiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2U1MDA4MCIgb2Zmc2V0PSIuODYiLz4KICA8L3JhZGlhbEdyYWRpZW50PgogIDxyYWRpYWxHcmFkaWVudCBpZD0iYyIgY3g9Ii03OTM3IiBjeT0iLTg0ODIiIHI9IjgwLjgiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzk3NCw4NTI0KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjOTYwZTE4IiBvZmZzZXQ9Ii4zIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNiMTE5MjciIHN0b3Atb3BhY2l0eT0iLjc0IiBvZmZzZXQ9Ii4zNTEiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2RiMjkzZCIgc3RvcC1vcGFjaXR5PSIuMzQzIiBvZmZzZXQ9Ii40MzUiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2Y1MzM0YiIgc3RvcC1vcGFjaXR5PSIuMDk0IiBvZmZzZXQ9Ii40OTciLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmMzc1MCIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9Ii41MyIvPgogIDwvcmFkaWFsR3JhZGllbnQ+CiAgPHJhZGlhbEdyYWRpZW50IGlkPSJkIiBjeD0iLTc5MjciIGN5PSItODUzMyIgcj0iNTguNTMiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzk3NCw4NTI0KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZmNDRmIiBvZmZzZXQ9Ii4xMzIiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmZGMzZSIgb2Zmc2V0PSIuMjUyIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZjlkMTIiIG9mZnNldD0iLjUwNiIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmY5ODBlIiBvZmZzZXQ9Ii41MjYiLz4KICA8L3JhZGlhbEdyYWRpZW50PgogIDxyYWRpYWxHcmFkaWVudCBpZD0iZSIgY3g9Ii03OTQ2IiBjeT0iLTg0NjEiIHI9IjM4LjQ3IiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDc5NzQsODUyNCkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgPHN0b3Agc3RvcC1jb2xvcj0iIzNhOGVlNiIgb2Zmc2V0PSIuMzUzIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiM1Yzc5ZjAiIG9mZnNldD0iLjQ3MiIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjOTA1OWZmIiBvZmZzZXQ9Ii42NjkiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2MxMzllNiIgb2Zmc2V0PSIxIi8+CiAgPC9yYWRpYWxHcmFkaWVudD4KICA8cmFkaWFsR3JhZGllbnQgaWQ9ImYiIGN4PSItNzkzNiIgY3k9Ii04NDkyIiByPSIyMC40IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KC45NzIgLS4yMzUgLjI3NSAxLjEzOCAxMDA5MCA3ODM0KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjOTA1OWZmIiBzdG9wLW9wYWNpdHk9IjAiIG9mZnNldD0iLjIwNiIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjOGM0ZmYzIiBzdG9wLW9wYWNpdHk9Ii4wNjQiIG9mZnNldD0iLjI3OCIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjNzcxNmE4IiBzdG9wLW9wYWNpdHk9Ii40NSIgb2Zmc2V0PSIuNzQ3Ii8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiM2ZTAwOGIiIHN0b3Atb3BhY2l0eT0iLjYiIG9mZnNldD0iLjk3NSIvPgogIDwvcmFkaWFsR3JhZGllbnQ+CiAgPHJhZGlhbEdyYWRpZW50IGlkPSJnIiBjeD0iLTc5MzgiIGN5PSItODUxOCIgcj0iMjcuNjgiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzk3NCw4NTI0KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZlMjI2IiBvZmZzZXQ9IjAiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmZGIyNyIgb2Zmc2V0PSIuMTIxIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZmM4MmEiIG9mZnNldD0iLjI5NSIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZhOTMwIiBvZmZzZXQ9Ii41MDIiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmN2UzNyIgb2Zmc2V0PSIuNzMyIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZjcxMzkiIG9mZnNldD0iLjc5MiIvPgogIDwvcmFkaWFsR3JhZGllbnQ+CiAgPHJhZGlhbEdyYWRpZW50IGlkPSJoIiBjeD0iLTc5MTYiIGN5PSItODUzNiIgcj0iMTE4LjEiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzk3NCw4NTI0KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZmNDRmIiBvZmZzZXQ9Ii4xMTMiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmOTgwZSIgb2Zmc2V0PSIuNDU2Ii8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZjU2MzQiIG9mZnNldD0iLjYyMiIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmYzNjQ3IiBvZmZzZXQ9Ii43MTYiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2UzMTU4NyIgb2Zmc2V0PSIuOTA0Ii8+CiAgPC9yYWRpYWxHcmFkaWVudD4KICA8cmFkaWFsR3JhZGllbnQgaWQ9ImkiIGN4PSItNzkyNyIgY3k9Ii04NTIzIiByPSI4Ni41IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KC4xMDUgLjk5NSAtLjY1MyAuMDY5IC00Njg1IDg0NzApIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZmY0NGYiIG9mZnNldD0iMCIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZlODQ3IiBvZmZzZXQ9Ii4wNiIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZjODMwIiBvZmZzZXQ9Ii4xNjgiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmOTgwZSIgb2Zmc2V0PSIuMzA0Ii8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZjhiMTYiIG9mZnNldD0iLjM1NiIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmY2NzJhIiBvZmZzZXQ9Ii40NTUiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmMzY0NyIgb2Zmc2V0PSIuNTciLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2UzMTU4NyIgb2Zmc2V0PSIuNzM3Ii8+CiAgPC9yYWRpYWxHcmFkaWVudD4KICA8cmFkaWFsR3JhZGllbnQgaWQ9ImoiIGN4PSItNzkzOCIgY3k9Ii04NTA4IiByPSI3My43MiIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSg3OTc0LDg1MjQpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZmY0NGYiIG9mZnNldD0iLjEzNyIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmY5ODBlIiBvZmZzZXQ9Ii40OCIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmY1NjM0IiBvZmZzZXQ9Ii41OTIiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmMzY0NyIgb2Zmc2V0PSIuNjU1Ii8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNlMzE1ODciIG9mZnNldD0iLjkwNCIvPgogIDwvcmFkaWFsR3JhZGllbnQ+CiAgPHJhZGlhbEdyYWRpZW50IGlkPSJrIiBjeD0iLTc5MTkiIGN5PSItODUwNCIgcj0iODAuNjkiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzk3NCw4NTI0KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZmNDRmIiBvZmZzZXQ9Ii4wOTQiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmZTE0MSIgb2Zmc2V0PSIuMjMxIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZmFmMWUiIG9mZnNldD0iLjUwOSIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmY5ODBlIiBvZmZzZXQ9Ii42MjYiLz4KICA8L3JhZGlhbEdyYWRpZW50PgogIDxsaW5lYXJHcmFkaWVudCBpZD0ibCIgeDE9IjcwLjAxIiB4Mj0iMTUuMjciIHkxPSIxMi4wNiIgeTI9IjY2LjgxIiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKC0xLjMgLS4wMDQwODYpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZmY0NGYiIHN0b3Atb3BhY2l0eT0iLjgiIG9mZnNldD0iLjE2NyIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZmNDRmIiBzdG9wLW9wYWNpdHk9Ii42MzQiIG9mZnNldD0iLjI2NiIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZmNDRmIiBzdG9wLW9wYWNpdHk9Ii4yMTciIG9mZnNldD0iLjQ4OSIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZmNDRmIiBzdG9wLW9wYWNpdHk9IjAiIG9mZnNldD0iLjYiLz4KICA8L2xpbmVhckdyYWRpZW50PgogPC9kZWZzPgogPGcgdHJhbnNmb3JtPSJtYXRyaXgoLjk4MTk4NDMgMCAwIC45ODE5ODQzIC42OTc0ODQ5IC43MTk5MjM5KSI+CiAgPHBhdGggZD0ibTc0LjYyIDI2LjgzYy0xLjY4NC00LjA1Mi01LjEtOC40MjctNy43NzUtOS44MWE0MC4yNyA0MC4yNyAwIDAgMSAzLjkyNSAxMS43Nmw3ZS0zIDAuMDY1Yy00LjM4Mi0xMC45Mi0xMS44MS0xNS4zMy0xNy44OC0yNC45Mi0wLjMwNy0wLjQ4NS0wLjYxNC0wLjk3MS0wLjkxMy0xLjQ4NC0wLjE3MS0wLjI5My0wLjMwOC0wLjU1Ny0wLjQyNy0wLjhhNy4wNTMgNy4wNTMgMCAwIDEtMC41NzgtMS41MzUgMC4xIDAuMSAwIDAgMC0wLjA4OC0wLjEgMC4xMzggMC4xMzggMCAwIDAtMC4wNzMgMGMtNWUtMyAwLTAuMDEzIDllLTMgLTAuMDE5IDAuMDExcy0wLjAxOSAwLjAxMS0wLjAyOCAwLjAxNWwwLjAxNS0wLjAyNmMtOS43MzUgNS43LTEzLjA0IDE2LjI1LTEzLjM0IDIxLjUzYTE5LjM5IDE5LjM5IDAgMCAwLTEwLjY3IDQuMTExIDExLjU5IDExLjU5IDAgMCAwLTEtMC43NTggMTcuOTcgMTcuOTcgMCAwIDEtMC4xMDktOS40NzMgMjguNyAyOC43IDAgMCAwLTkuMzI5IDcuMjFoLTAuMDE4Yy0xLjUzNi0xLjk0Ny0xLjQyOC04LjM2Ny0xLjM0LTkuNzA4YTYuOTI4IDYuOTI4IDAgMCAwLTEuMjk0IDAuNjg3IDI4LjIyIDI4LjIyIDAgMCAwLTMuNzg4IDMuMjQ1IDMzLjg0IDMzLjg0IDAgMCAwLTMuNjIzIDQuMzQ3djZlLTMgLTdlLTNhMzIuNzMgMzIuNzMgMCAwIDAtNS4yIDExLjc0bC0wLjA1MiAwLjI1NmMtMC4wNzMgMC4zNDEtMC4zMzYgMi4wNDktMC4zODEgMi40MiAwIDAuMDI5LTZlLTMgMC4wNTYtOWUtMyAwLjA4NWEzNi45NCAzNi45NCAwIDAgMC0wLjYyOSA1LjM0M3YwLjJhMzguNzYgMzguNzYgMCAwIDAgNzYuOTUgNi41NTRjMC4wNjUtMC41IDAuMTE4LTAuOTk1IDAuMTc2LTEuNWEzOS44NiAzOS44NiAwIDAgMC0yLjUxNC0xOS40N3ptLTQ0LjY3IDMwLjM0YzAuMTgxIDAuMDg3IDAuMzUxIDAuMTgxIDAuNTM3IDAuMjY0bDAuMDI3IDAuMDE3cS0wLjI4Mi0wLjEzNS0wLjU2NC0wLjI4MXptOC44NzgtMjMuMzhtMzEuOTUtNC45MzR2LTAuMDM3bDdlLTMgMC4wNDF6IiBmaWxsPSJ1cmwoI2EpIi8+CiAgPHBhdGggZD0ibTc0LjYyIDI2LjgzYy0xLjY4NC00LjA1Mi01LjEtOC40MjctNy43NzUtOS44MWE0MC4yNyA0MC4yNyAwIDAgMSAzLjkyNSAxMS43NnYwLjAzN2w3ZS0zIDAuMDQxYTM1LjEgMzUuMSAwIDAgMS0xLjIwNiAyNi4xNmMtNC40NDIgOS41MzEtMTUuMTkgMTkuMy0zMi4wMiAxOC44Mi0xOC4xOC0wLjUxNS0zNC4yLTE0LjAxLTM3LjE5LTMxLjY4LTAuNTQ1LTIuNzg3IDAtNC4yIDAuMjc0LTYuNDY1YTI4Ljg4IDI4Ljg4IDAgMCAwLTAuNjIzIDUuMzQ4djAuMmEzOC43NiAzOC43NiAwIDAgMCA3Ni45NSA2LjU1NGMwLjA2NS0wLjUgMC4xMTgtMC45OTUgMC4xNzYtMS41YTM5Ljg2IDM5Ljg2IDAgMCAwLTIuNTE0LTE5LjQ3eiIgZmlsbD0idXJsKCNiKSIvPgogIDxwYXRoIGQ9Im03NC42MiAyNi44M2MtMS42ODQtNC4wNTItNS4xLTguNDI3LTcuNzc1LTkuODFhNDAuMjcgNDAuMjcgMCAwIDEgMy45MjUgMTEuNzZ2MC4wMzdsN2UtMyAwLjA0MWEzNS4xIDM1LjEgMCAwIDEtMS4yMDYgMjYuMTZjLTQuNDQyIDkuNTMxLTE1LjE5IDE5LjMtMzIuMDIgMTguODItMTguMTgtMC41MTUtMzQuMi0xNC4wMS0zNy4xOS0zMS42OC0wLjU0NS0yLjc4NyAwLTQuMiAwLjI3NC02LjQ2NWEyOC44OCAyOC44OCAwIDAgMC0wLjYyMyA1LjM0OHYwLjJhMzguNzYgMzguNzYgMCAwIDAgNzYuOTUgNi41NTRjMC4wNjUtMC41IDAuMTE4LTAuOTk1IDAuMTc2LTEuNWEzOS44NiAzOS44NiAwIDAgMC0yLjUxNC0xOS40N3oiIGZpbGw9InVybCgjYykiLz4KICA8cGF0aCBkPSJtNTUuNzggMzEuMzhjMC4wODQgMC4wNTkgMC4xNjIgMC4xMTggMC4yNDEgMC4xNzdhMjEuMSAyMS4xIDAgMCAwLTMuNi00LjY5NWMtMTIuMDUtMTIuMDUtMy4xNTctMjYuMTItMS42NTgtMjYuODRsMC4wMTUtMC4wMjJjLTkuNzM1IDUuNy0xMy4wNCAxNi4yNS0xMy4zNCAyMS41MyAwLjQ1Mi0wLjAzMSAwLjktMC4wNjkgMS4zNjItMC4wNjlhMTkuNTYgMTkuNTYgMCAwIDEgMTYuOTggOS45MTd6IiBmaWxsPSJ1cmwoI2QpIi8+CiAgPHBhdGggZD0ibTM4LjgyIDMzLjc5Yy0wLjA2NCAwLjk2NC0zLjQ3IDQuMjg5LTQuNjYxIDQuMjg5LTExLjAyIDAtMTIuODEgNi42NjctMTIuODEgNi42NjcgMC40ODggNS42MTQgNC40IDEwLjI0IDkuMTI5IDEyLjY4IDAuMjE2IDAuMTEyIDAuNDM1IDAuMjEzIDAuNjU0IDAuMzEycTAuNTY5IDAuMjUyIDEuMTM4IDAuNDY2YTE3LjI0IDE3LjI0IDAgMCAwIDUuMDQzIDAuOTczYzE5LjMyIDAuOTA2IDIzLjA2LTIzLjEgOS4xMTktMzAuMDdhMTMuMzggMTMuMzggMCAwIDEgOS4zNDUgMi4yNjkgMTkuNTYgMTkuNTYgMCAwIDAtMTYuOTgtOS45MTdjLTAuNDYgMC0wLjkxIDAuMDM4LTEuMzYyIDAuMDY5YTE5LjM5IDE5LjM5IDAgMCAwLTEwLjY3IDQuMTExYzAuNTkxIDAuNSAxLjI1OCAxLjE2OCAyLjY2MyAyLjU1MyAyLjYzIDIuNTkxIDkuMzc1IDUuMjc1IDkuMzkgNS41OXoiIGZpbGw9InVybCgjZSkiLz4KICA8cGF0aCBkPSJtMzguODIgMzMuNzljLTAuMDY0IDAuOTY0LTMuNDcgNC4yODktNC42NjEgNC4yODktMTEuMDIgMC0xMi44MSA2LjY2Ny0xMi44MSA2LjY2NyAwLjQ4OCA1LjYxNCA0LjQgMTAuMjQgOS4xMjkgMTIuNjggMC4yMTYgMC4xMTIgMC40MzUgMC4yMTMgMC42NTQgMC4zMTJxMC41NjkgMC4yNTIgMS4xMzggMC40NjZhMTcuMjQgMTcuMjQgMCAwIDAgNS4wNDMgMC45NzNjMTkuMzIgMC45MDYgMjMuMDYtMjMuMSA5LjExOS0zMC4wN2ExMy4zOCAxMy4zOCAwIDAgMSA5LjM0NSAyLjI2OSAxOS41NiAxOS41NiAwIDAgMC0xNi45OC05LjkxN2MtMC40NiAwLTAuOTEgMC4wMzgtMS4zNjIgMC4wNjlhMTkuMzkgMTkuMzkgMCAwIDAtMTAuNjcgNC4xMTFjMC41OTEgMC41IDEuMjU4IDEuMTY4IDIuNjYzIDIuNTUzIDIuNjMgMi41OTEgOS4zNzUgNS4yNzUgOS4zOSA1LjU5eiIgZmlsbD0idXJsKCNmKSIvPgogIDxwYXRoIGQ9Im0yNC45NiAyNC4zNmMwLjMxNCAwLjIgMC41NzMgMC4zNzQgMC44IDAuNTMxYTE3Ljk3IDE3Ljk3IDAgMCAxLTAuMTA5LTkuNDczIDI4LjcgMjguNyAwIDAgMC05LjMyOSA3LjIxYzAuMTg5LTVlLTMgNS44MTEtMC4xMDYgOC42MzggMS43MzJ6IiBmaWxsPSJ1cmwoI2cpIi8+CiAgPHBhdGggZD0ibTAuMzU0IDQyLjE2YzIuOTkxIDE3LjY3IDE5LjAxIDMxLjE3IDM3LjE5IDMxLjY4IDE2LjgzIDAuNDc2IDI3LjU4LTkuMjk0IDMyLjAyLTE4LjgyYTM1LjEgMzUuMSAwIDAgMCAxLjIwNi0yNi4xNnYtMC4wMzdjMC0wLjAyOS02ZS0zIC0wLjA0NiAwLTAuMDM3bDdlLTMgMC4wNjVjMS4zNzUgOC45NzctMy4xOTEgMTcuNjctMTAuMzMgMjMuNTZsLTAuMDIyIDAuMDVjLTEzLjkxIDExLjMzLTI3LjIyIDYuODM0LTI5LjkxIDVxLTAuMjgyLTAuMTM1LTAuNTY0LTAuMjgxYy04LjEwOS0zLjg3Ni0xMS40Ni0xMS4yNi0xMC43NC0xNy42YTkuOTUzIDkuOTUzIDAgMCAxLTkuMTgxLTUuNzc1IDE0LjYyIDE0LjYyIDAgMCAxIDE0LjI1LTAuNTcyIDE5LjMgMTkuMyAwIDAgMCAxNC41NSAwLjU3MmMtMC4wMTUtMC4zMTUtNi43Ni0zLTkuMzktNS41OS0xLjQwNS0xLjM4NS0yLjA3Mi0yLjA1Mi0yLjY2My0yLjU1M2ExMS41OSAxMS41OSAwIDAgMC0xLTAuNzU4Yy0wLjIzLTAuMTU3LTAuNDg5LTAuMzI3LTAuOC0wLjUzMS0yLjgyNy0xLjgzOC04LjQ0OS0xLjczNy04LjYzNS0xLjczMmgtMC4wMThjLTEuNTM2LTEuOTQ3LTEuNDI4LTguMzY3LTEuMzQtOS43MDhhNi45MjggNi45MjggMCAwIDAtMS4yOTQgMC42ODcgMjguMjIgMjguMjIgMCAwIDAtMy43ODggMy4yNDUgMzMuODQgMzMuODQgMCAwIDAtMy42MzggNC4zMzd2NmUtMyAtN2UtM2EzMi43MyAzMi43MyAwIDAgMC01LjIgMTEuNzRjLTAuMDE5IDAuMDc5LTEuMzk2IDYuMDk5LTAuNzE3IDkuMjIxeiIgZmlsbD0idXJsKCNoKSIvPgogIDxwYXRoIGQ9Im01Mi40MiAyNi44NmEyMS4xIDIxLjEgMCAwIDEgMy42IDQuN2MwLjIxMyAwLjE2MSAwLjQxMiAwLjMyMSAwLjU4MSAwLjQ3NiA4Ljc4NyA4LjEgNC4xODMgMTkuNTUgMy44NCAyMC4zNiA3LjEzOC01Ljg4MSAxMS43LTE0LjU4IDEwLjMzLTIzLjU2LTQuMzg0LTEwLjkzLTExLjgyLTE1LjM0LTE3Ljg4LTI0LjkzLTAuMzA3LTAuNDg1LTAuNjE0LTAuOTcxLTAuOTEzLTEuNDg0LTAuMTcxLTAuMjkzLTAuMzA4LTAuNTU3LTAuNDI3LTAuOGE3LjA1MyA3LjA1MyAwIDAgMS0wLjU3OC0xLjUzNSAwLjEgMC4xIDAgMCAwLTAuMDg4LTAuMSAwLjEzOCAwLjEzOCAwIDAgMC0wLjA3MyAwYy01ZS0zIDAtMC4wMTMgOWUtMyAtMC4wMTkgMC4wMTFzLTAuMDE5IDAuMDExLTAuMDI4IDAuMDE1Yy0xLjQ5OSAwLjcxMS0xMC4zOSAxNC43OSAxLjY2IDI2LjgzeiIgZmlsbD0idXJsKCNpKSIvPgogIDxwYXRoIGQ9Im01Ni42IDMyLjA0Yy0wLjE2OS0wLjE1NS0wLjM2OC0wLjMxNS0wLjU4MS0wLjQ3Ni0wLjA3OS0wLjA1OS0wLjE1Ny0wLjExOC0wLjI0MS0wLjE3N2ExMy4zOCAxMy4zOCAwIDAgMC05LjM0NS0yLjI2OWMxMy45NCA2Ljk3IDEwLjIgMzAuOTctOS4xMTkgMzAuMDdhMTcuMjQgMTcuMjQgMCAwIDEtNS4wNDMtMC45NzNxLTAuNTY5LTAuMjEzLTEuMTM4LTAuNDY2Yy0wLjIxOS0wLjEtMC40MzgtMC4yLTAuNjU0LTAuMzEybDAuMDI3IDAuMDE3YzIuNjk0IDEuODM5IDE2IDYuMzMyIDI5LjkxLTVsMC4wMjItMC4wNWMwLjM0Ny0wLjgxIDQuOTUxLTEyLjI2LTMuODQtMjAuMzZ6IiBmaWxsPSJ1cmwoI2opIi8+CiAgPHBhdGggZD0ibTIxLjM1IDQ0Ljc0czEuNzg5LTYuNjY3IDEyLjgxLTYuNjY3YzEuMTkxIDAgNC42LTMuMzI1IDQuNjYxLTQuMjg5YTE5LjMgMTkuMyAwIDAgMS0xNC41NS0wLjU3MiAxNC42MiAxNC42MiAwIDAgMC0xNC4yNSAwLjU3MiA5Ljk1MyA5Ljk1MyAwIDAgMCA5LjE4MSA1Ljc3NWMtMC43MTggNi4zMzcgMi42MzIgMTMuNzIgMTAuNzQgMTcuNiAwLjE4MSAwLjA4NyAwLjM1MSAwLjE4MSAwLjUzNyAwLjI2NC00LjczMy0yLjQ0NS04LjY0MS03LjA2OS05LjEyOS0xMi42OHoiIGZpbGw9InVybCgjaykiLz4KICA8cGF0aCBkPSJtNzQuNjIgMjYuODNjLTEuNjg0LTQuMDUyLTUuMS04LjQyNy03Ljc3NS05LjgxYTQwLjI3IDQwLjI3IDAgMCAxIDMuOTI1IDExLjc2bDdlLTMgMC4wNjVjLTQuMzgyLTEwLjkyLTExLjgxLTE1LjMzLTE3Ljg4LTI0LjkyLTAuMzA3LTAuNDg1LTAuNjE0LTAuOTcxLTAuOTEzLTEuNDg0LTAuMTcxLTAuMjkzLTAuMzA4LTAuNTU3LTAuNDI3LTAuOGE3LjA1MyA3LjA1MyAwIDAgMS0wLjU3OC0xLjUzNSAwLjEgMC4xIDAgMCAwLTAuMDg4LTAuMSAwLjEzOCAwLjEzOCAwIDAgMC0wLjA3MyAwYy01ZS0zIDAtMC4wMTMgOWUtMyAtMC4wMTkgMC4wMTFzLTAuMDE5IDAuMDExLTAuMDI4IDAuMDE1bDAuMDE1LTAuMDI2Yy05LjczNSA1LjctMTMuMDQgMTYuMjUtMTMuMzQgMjEuNTMgMC40NTItMC4wMzEgMC45LTAuMDY5IDEuMzYyLTAuMDY5YTE5LjU2IDE5LjU2IDAgMCAxIDE2Ljk4IDkuOTE3IDEzLjM4IDEzLjM4IDAgMCAwLTkuMzQ1LTIuMjY5YzEzLjk0IDYuOTcgMTAuMiAzMC45Ny05LjExOSAzMC4wN2ExNy4yNCAxNy4yNCAwIDAgMS01LjA0My0wLjk3M3EtMC41NjktMC4yMTMtMS4xMzgtMC40NjZjLTAuMjE5LTAuMS0wLjQzOC0wLjItMC42NTQtMC4zMTJsMC4wMjcgMC4wMTdxLTAuMjgyLTAuMTM1LTAuNTY0LTAuMjgxYzAuMTgxIDAuMDg3IDAuMzUxIDAuMTgxIDAuNTM3IDAuMjY0LTQuNzMzLTIuNDQ2LTguNjQxLTcuMDctOS4xMjktMTIuNjggMCAwIDEuNzg5LTYuNjY3IDEyLjgxLTYuNjY3IDEuMTkxIDAgNC42LTMuMzI1IDQuNjYxLTQuMjg5LTAuMDE1LTAuMzE1LTYuNzYtMy05LjM5LTUuNTktMS40MDUtMS4zODUtMi4wNzItMi4wNTItMi42NjMtMi41NTNhMTEuNTkgMTEuNTkgMCAwIDAtMS0wLjc1OCAxNy45NyAxNy45NyAwIDAgMS0wLjEwOS05LjQ3MyAyOC43IDI4LjcgMCAwIDAtOS4zMjkgNy4yMWgtMC4wMThjLTEuNTM2LTEuOTQ3LTEuNDI4LTguMzY3LTEuMzQtOS43MDhhNi45MjggNi45MjggMCAwIDAtMS4yOTQgMC42ODcgMjguMjIgMjguMjIgMCAwIDAtMy43ODggMy4yNDUgMzMuODQgMzMuODQgMCAwIDAtMy42MjMgNC4zNDd2NmUtMyAtN2UtM2EzMi43MyAzMi43MyAwIDAgMC01LjIgMTEuNzRsLTAuMDUyIDAuMjU2Yy0wLjA3MyAwLjM0MS0wLjQgMi4wNzMtMC40NDcgMi40NDVhNDUuMDkgNDUuMDkgMCAwIDAtMC41NzIgNS40MDN2MC4yYTM4Ljc2IDM4Ljc2IDAgMCAwIDc2Ljk1IDYuNTU0YzAuMDY1LTAuNSAwLjExOC0wLjk5NSAwLjE3Ni0xLjVhMzkuODYgMzkuODYgMCAwIDAtMi41MTQtMTkuNDd6bS0zLjg0NSAxLjk5MSA3ZS0zIDAuMDQxeiIgZmlsbD0idXJsKCNsKSIvPgogPC9nPgogPG1ldGFkYXRhPgogIDxyZGY6UkRGPgogICA8Y2M6V29yayByZGY6YWJvdXQ9IiI+CiAgICA8ZGM6dGl0bGU+RmlyZWZveCBCcm93c2VyIGxvZ288L2RjOnRpdGxlPgogICA8L2NjOldvcms+CiAgPC9yZGY6UkRGPgogPC9tZXRhZGF0YT4KPC9zdmc+";

  // Generate SVG dynamically
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="140" viewBox="0 0 400 140">
      <!-- Background -->
      <rect width="400" height="140" fill="#282828" rx="10" />

      <!-- Firefox Logo -->
      <image href="${logoBase64}" x="10" y="10" width="40" height="40" />

      <!-- Title -->
      <text x="60" y="40" font-size="18" fill="#ebdbb2" font-family="Arial, sans-serif">
        Firefox Contribution Summary
      </text>

      <!-- Progress Details -->
      <g font-size="16" font-family="Arial, sans-serif" fill="#ebdbb2">
        <text x="20" y="70">Assigned: <tspan fill="#fabd2f">${counts.ASSIGNED || 0}</tspan></text>
        <text x="20" y="90">Resolved: <tspan fill="#b8bb26">${counts.RESOLVED || 0}</tspan></text>
        <text x="20" y="110">New: <tspan fill="#83a598">${counts.NEW || 0}</tspan></text>
      </g>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache"
    }
  });
    // You can now return this data, or process it as needed
    return new Response(
      JSON.stringify(data),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching Bugzilla data:", error);
    return new Response("Error fetching Bugzilla data", { status: 500 });
  }
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});