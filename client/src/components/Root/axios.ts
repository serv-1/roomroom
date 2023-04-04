import _axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const xsrfHeaderName = "x-csrf-token";

const _a = _axios.create({ withCredentials: true, xsrfHeaderName });

interface Options<D> {
  data?: D | undefined;
  config?: AxiosRequestConfig<D> | undefined;
  csrf?: boolean;
}

type Fn = <T = unknown, R = AxiosResponse<T, unknown>, D = unknown>(
  url: string,
  opts?: Options<D>,
) => Promise<R>;

const functions = (["get", "post", "put", "delete"] as const).map((method) => {
  const fn: Fn = async (url, opts = {}) => {
    const headers = { ...opts.config?.headers };

    if (opts.csrf) {
      const { token } = (await _a.get<{ token: string }>("/csrf")).data;
      headers[xsrfHeaderName] = token;
    }

    if (method === "delete" || method === "get") {
      return await _a[method](url, { ...opts.config, headers });
    }

    return await _a[method](url, opts.data, { ...opts.config, headers });
  };

  return [method, fn] as const;
});

const axios = Object.fromEntries(functions) as {
  get: Fn;
  post: Fn;
  put: Fn;
  delete: Fn;
};

export default axios;
