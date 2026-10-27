// Stands in for Utils/server (the axios instance) in component tests:
//
//   vi.mock("<path>/Utils/server", () => import("<path>/test/serverStub"));
//
// Records every request. `serverStub.respond` answers GETs by URL;
// `serverStub.refuse` makes calls of a method fail the way axios does:
// a string is a 400 with the backend's { error } body; { status, data }
// is any other answer, e.g. a 409 with a structured body. A function
// decides per request (return undefined to let it through).

type Method = "GET" | "POST" | "PUT" | "DELETE";
type Refusal = string | { status: number; data: unknown };

export const serverStub = {
  requests: [] as [Method, string, unknown?][],
  respond: (_url: string): unknown => ({ data: [] }),
  refuse: {} as Partial<Record<Method, Refusal | ((url: string, body?: unknown) => Refusal | undefined)>>,
  reset() {
    this.requests.length = 0;
    this.respond = () => ({ data: [] });
    this.refuse = {};
  },
};

const call = async (method: Method, url: string, body?: unknown) => {
  serverStub.requests.push([method, url, body]);
  const rule = serverStub.refuse[method];
  const refusal = typeof rule === "function" ? rule(url, body) : rule;
  if (refusal) {
    const { status, data } = typeof refusal === "string"
      ? { status: 400, data: { success: false, error: refusal } }
      : refusal;
    const e: any = new Error(`Request failed with status code ${status}`);
    e.response = { status, data };
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
