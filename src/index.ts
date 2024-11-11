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



async function fetchUserInfo(apiKey: string, username: string) {
  // Construct the Bugzilla API URL to get user info
  const url = `https://bugzilla.mozilla.org/rest/bug?emailassigned_to1=1&list_id=17313317&query_format=advanced&emailtype1=equals&resolution=---&classification=Client%20Software&classification=Developer%20Infrastructure&classification=Components&classification=Server%20Software&classification=Other&email1=AAR.dev%40outlook.com`;

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
  const apiKey = url.searchParams.get("api_key");
  const username = url.searchParams.get("username");

  if (!apiKey || !username) {
    return new Response("API key and username are required", { status: 400 });
  }

  try {
    const userInfo = await fetchUserInfo(apiKey, username);

    // You can now return this data, or process it as needed
    return new Response(
      JSON.stringify(userInfo),
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