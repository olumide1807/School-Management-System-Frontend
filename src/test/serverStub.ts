// Stands in for Utils/server (the axios instance) in component tests:
//
//   vi.mock("<path>/Utils/server", () => import("<path>/test/serverStub"));
//
// Records every request. `serverStub.respond` answers GETs by URL;
// `serverStub.refuse` makes the next call of a method fail the way axios
// does for a 400, with the backend's { error } body.

type Method = "GET" | "POST" | "PUT" | "DELETE";

export const serverStub = {
  requests: [] as [Method, string, unknown?][],
  respond: (_url: string): unknown => ({ data: [] }),
  refuse: {} as Partial<Record<Method, string>>,
  reset() {
    this.requests.length = 0;
    this.respond = () => ({ data: [] });
    this.refuse = {};
  },
};

const call = async (method: Method, url: string, body?: unknown) => {
  serverStub.requests.push([method, url, body]);
  const msg = serverStub.refuse[method];
  if (msg) {
    const e: any = new Error("Request failed with status code 400");
    e.response = { status: 400, data: { success: false, error: msg } };
    throw e;
  }
  return { data: method === "GET" ? serverStub.respond(url) : { success: true, data: body } };
};

export default {
  get: (url: string) => call("GET", url),
  post: (url: string, body?: unknown) => call("POST", url, body),
  put: (url: string, body?: unknown) => call("PUT", url, body),
  delete: (url: string) => call("DELETE", url),
};
