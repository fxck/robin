import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import destr from 'file:///Users/fxck/www/robin/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, sendRedirect, proxyRequest, getRequestURL, getRequestHeader, getResponseHeader, getRequestHeaders, setResponseHeaders, setResponseStatus, send, appendResponseHeader, removeResponseHeader, createError, setResponseHeader, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getRouterParam, readBody, getQuery as getQuery$1, toWebRequest, getHeaders, readMultipartFormData, getValidatedQuery } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/h3@1.15.4/node_modules/h3/dist/index.mjs';
import { createHooks } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/node-mock-http@1.0.3/node_modules/node-mock-http/dist/index.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, decodePath, withLeadingSlash, withoutTrailingSlash } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs';
import { createStorage, prefixStorage } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/unstorage@1.17.2_db0@0.3.4_better-sqlite3@12.4.1_drizzle-orm@0.44.7_@neondatabase+serverless@_7h4gtasmmf32wwxhde6lnvk5iy/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file:///Users/fxck/www/robin/node_modules/.pnpm/unstorage@1.17.2_db0@0.3.4_better-sqlite3@12.4.1_drizzle-orm@0.44.7_@neondatabase+serverless@_7h4gtasmmf32wwxhde6lnvk5iy/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getContext } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs';
import defu, { defuFn } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs';
import { toRouteMatcher, createRouter } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import consola, { consola as consola$1 } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/youch-core@0.3.3/node_modules/youch-core/build/index.js';
import { Youch } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/youch@4.1.0-beta.12/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/source-map@0.7.6/node_modules/source-map/source-map.js';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/pathe@2.0.3/node_modules/pathe/dist/index.mjs';
import { Server } from 'node:http';
import nodeCrypto from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { and, eq, isNull, sql as sql$1, desc, inArray } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/drizzle-orm@0.44.7_@neondatabase+serverless@1.0.2_@prisma+client@5.22.0_prisma@5.22.0__@types_gvpe6c2y24xmceuuswt7uvdtue/node_modules/drizzle-orm/index.js';
import { z } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/zod@4.1.12/node_modules/zod/index.js';
import { ulid } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/ulidx@2.4.1/node_modules/ulidx/dist/node/index.js';
import nodemailer from 'file:///Users/fxck/www/robin/node_modules/.pnpm/nodemailer@7.0.10/node_modules/nodemailer/lib/nodemailer.js';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/@aws-sdk+client-s3@3.931.0/node_modules/@aws-sdk/client-s3/dist-cjs/index.js';
import Redis from 'file:///Users/fxck/www/robin/node_modules/.pnpm/ioredis@5.8.2/node_modules/ioredis/built/index.js';
import { klona } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs';
import { snakeCase } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/scule@1.3.0/node_modules/scule/dist/index.mjs';
import { drizzle } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/drizzle-orm@0.44.7_@neondatabase+serverless@1.0.2_@types+pg@8.15.6_kysely@0.28.8_postgres@3.4.7/node_modules/drizzle-orm/postgres-js/index.js';
import postgres from 'file:///Users/fxck/www/robin/node_modules/.pnpm/postgres@3.4.7/node_modules/postgres/src/index.js';
import { pgTable, timestamp, jsonb, text, boolean, integer, index, uniqueIndex } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/drizzle-orm@0.44.7_@neondatabase+serverless@1.0.2_@types+pg@8.15.6_kysely@0.28.8_postgres@3.4.7/node_modules/drizzle-orm/pg-core/index.js';
import { relations, sql } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/drizzle-orm@0.44.7_@neondatabase+serverless@1.0.2_@types+pg@8.15.6_kysely@0.28.8_postgres@3.4.7/node_modules/drizzle-orm/index.js';
import { betterAuth } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/better-auth@1.4.0-beta.20_react-dom@19.2.0_react@19.2.0__react@19.2.0_solid-js@1.9.10/node_modules/better-auth/dist/index.mjs';
import { drizzleAdapter } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/better-auth@1.4.0-beta.20_react-dom@19.2.0_react@19.2.0__react@19.2.0_solid-js@1.9.10/node_modules/better-auth/dist/adapters/drizzle-adapter/index.mjs';
import { openAPI } from 'file:///Users/fxck/www/robin/node_modules/.pnpm/better-auth@1.4.0-beta.20_react-dom@19.2.0_react@19.2.0__react@19.2.0_solid-js@1.9.10/node_modules/better-auth/dist/plugins/index.mjs';

const serverAssets = [{"baseName":"server","dir":"/Users/fxck/www/robin/apps/api/src/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/fxck/www/robin/apps/api"}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/fxck/www/robin/apps/api/src"}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/fxck/www/robin/apps/api/.nitro"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/fxck/www/robin/apps/api/.nitro/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"/Users/fxck/www/robin/apps/api/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {}
  },
  "database": {
    "url": "postgresql://db:9VR1p2z8yZaQt3Nddv40Vazd@db:5432/db"
  },
  "redis": {
    "url": "redis://redis:6379"
  },
  "s3": {
    "endpoint": "https://storage-prg1.zerops.io",
    "region": "us-east-1",
    "bucket": "",
    "accessKeyId": "4gkq6-6egl5gha4n8pb2evijaeijlfrp",
    "secretAccessKey": "p66Nwv593VUwOehG"
  },
  "public": {
    "apiBase": "http://localhost:3000",
    "appUrl": "http://localhost:5173"
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage: AsyncLocalStorage 
});

const config$2 = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config$2.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json || !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const plugins = [
  
];

const assets = {
  "/index.mjs": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14ecd-m9pefIX434RdaNkE3/iHmYV0JIQ\"",
    "mtime": "2025-11-14T22:07:12.784Z",
    "size": 85709,
    "path": "index.mjs"
  },
  "/index.mjs.map": {
    "type": "application/json",
    "etag": "\"4b92f-+pkhtudOaOKrcBZEAGuF+SKIQRE\"",
    "mtime": "2025-11-14T22:07:12.784Z",
    "size": 309551,
    "path": "index.mjs.map"
  }
};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _2VOKOA = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _MZKvDP = defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const origin = event.node.req.headers.origin || "";
  const localhostPattern = /^http:\/\/localhost:\d+$/;
  const isAllowed = localhostPattern.test(origin) || origin === config.public.appUrl ;
  if (isAllowed) {
    event.node.res.setHeader("Access-Control-Allow-Origin", origin);
    event.node.res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    event.node.res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    event.node.res.setHeader("Access-Control-Allow-Credentials", "true");
    event.node.res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (event.node.req.method === "OPTIONS") {
    event.node.res.statusCode = 204;
    event.node.res.end();
  }
});

const _ch0SOz = defineEventHandler(async (event) => {
  try {
    await Promise.resolve();
  } catch (error) {
    const err = error;
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";
    console.error("[Error Handler]", {
      statusCode,
      message,
      stack: err.stack,
      path: event.path,
      method: event.method
    });
    return {
      statusCode,
      message,
      error: {
        stack: err.stack,
        details: err
      } ,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      path: event.path
    };
  }
});

const _lazy_qpvBcU = () => Promise.resolve().then(function () { return ____all_$1; });
const _lazy_338pkd = () => Promise.resolve().then(function () { return _id__delete$1; });
const _lazy_kdAgH_ = () => Promise.resolve().then(function () { return _id__get$1; });
const _lazy_lzxb9Y = () => Promise.resolve().then(function () { return _id__patch$1; });
const _lazy_ZbktRH = () => Promise.resolve().then(function () { return like_post$1; });
const _lazy_eYtjRg = () => Promise.resolve().then(function () { return index_get$3; });
const _lazy_tIBajb = () => Promise.resolve().then(function () { return index_post$1; });
const _lazy_fURMOI = () => Promise.resolve().then(function () { return trending_get$1; });
const _lazy_AsnYaT = () => Promise.resolve().then(function () { return testEmail_post$1; });
const _lazy_wP1A4P = () => Promise.resolve().then(function () { return upload_post$1; });
const _lazy_s0jfBJ = () => Promise.resolve().then(function () { return index_get$1; });
const _lazy_056Ckl = () => Promise.resolve().then(function () { return me_get$1; });
const _lazy_ItjnhM = () => Promise.resolve().then(function () { return health_get$1; });

const handlers = [
  { route: '', handler: _2VOKOA, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _MZKvDP, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _ch0SOz, lazy: false, middleware: true, method: undefined },
  { route: '/api/auth/**:all', handler: _lazy_qpvBcU, lazy: true, middleware: false, method: undefined },
  { route: '/api/posts/:id', handler: _lazy_338pkd, lazy: true, middleware: false, method: "delete" },
  { route: '/api/posts/:id', handler: _lazy_kdAgH_, lazy: true, middleware: false, method: "get" },
  { route: '/api/posts/:id', handler: _lazy_lzxb9Y, lazy: true, middleware: false, method: "patch" },
  { route: '/api/posts/:id/like', handler: _lazy_ZbktRH, lazy: true, middleware: false, method: "post" },
  { route: '/api/posts', handler: _lazy_eYtjRg, lazy: true, middleware: false, method: "get" },
  { route: '/api/posts', handler: _lazy_tIBajb, lazy: true, middleware: false, method: "post" },
  { route: '/api/posts/trending', handler: _lazy_fURMOI, lazy: true, middleware: false, method: "get" },
  { route: '/api/test-email', handler: _lazy_AsnYaT, lazy: true, middleware: false, method: "post" },
  { route: '/api/upload', handler: _lazy_wP1A4P, lazy: true, middleware: false, method: "post" },
  { route: '/api/users', handler: _lazy_s0jfBJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/users/me', handler: _lazy_056Ckl, lazy: true, middleware: false, method: "get" },
  { route: '/health', handler: _lazy_ItjnhM, lazy: true, middleware: false, method: "get" }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  {
    const _handler = h3App.handler;
    h3App.handler = (event) => {
      const ctx = { event };
      return nitroAsyncContext.callAsync(ctx, () => _handler(event));
    };
  }
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  // Better Auth requires name to be notNull
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  // Better Auth requires notNull
  image: text("image"),
  metadata: jsonb("metadata").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull()
});
const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts)
}));
const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date()).notNull()
});
const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));
const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  // Provider-specific account ID
  providerId: text("provider_id").notNull(),
  // Authentication provider ID
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  // Hashed password for email/password auth
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date()).notNull()
});
const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  // Email or phone number
  value: text("value").notNull(),
  // Verification code or token
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull()
});
const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}));

const posts = pgTable(
  "posts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    coverImage: text("cover_image"),
    // S3 URL
    coverImageThumb: text("cover_image_thumb"),
    // Thumbnail URL
    status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
    views: integer("views").notNull().default(0),
    likesCount: integer("likes_count").notNull().default(0),
    publishedAt: timestamp("published_at"),
    deletedAt: timestamp("deleted_at"),
    // Soft delete
    // Full-text search vector (populated via trigger or app)
    searchVector: text("search_vector"),
    // Optimistic locking
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull()
  },
  (table) => ({
    // Index for user's posts
    userIdIdx: index("posts_user_id_idx").on(table.userId),
    // Unique slug per user (allows different users to have same slug)
    slugIdx: uniqueIndex("posts_slug_idx").on(table.userId, table.slug),
    // Index for published posts (most common query)
    statusPublishedIdx: index("posts_status_published_idx").on(table.status, table.publishedAt),
    // Index for soft deletes
    deletedAtIdx: index("posts_deleted_at_idx").on(table.deletedAt),
    // Full-text search index (GIN index for tsvector)
    searchVectorIdx: index("posts_search_vector_idx").using(
      "gin",
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.content})`
    )
  })
);
const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id]
  }),
  likes: many(postLikes)
}));
const postLikes = pgTable(
  "post_likes",
  {
    id: text("id").primaryKey(),
    postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => ({
    // Unique constraint: one like per user per post
    uniqueLike: uniqueIndex("post_likes_unique_idx").on(table.postId, table.userId),
    // Index for user's likes
    userIdIdx: index("post_likes_user_id_idx").on(table.userId),
    // Index for post's likes
    postIdIdx: index("post_likes_post_id_idx").on(table.postId)
  })
);
const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id]
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id]
  })
}));

const schema = /*#__PURE__*/Object.freeze({
  __proto__: null,
  accounts: accounts,
  accountsRelations: accountsRelations,
  postLikes: postLikes,
  postLikesRelations: postLikesRelations,
  posts: posts,
  postsRelations: postsRelations,
  sessions: sessions,
  sessionsRelations: sessionsRelations,
  users: users,
  usersRelations: usersRelations,
  verifications: verifications
});

let connection;
let db$1;
function getDb(connectionString) {
  if (!connection) {
    connection = postgres(connectionString, {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10
    });
    db$1 = drizzle(connection, { schema });
  }
  return db$1;
}

async function sendEmail(message, config) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure || false,
    auth: config.user && config.password ? {
      user: config.user,
      pass: config.password
    } : void 0
  });
  await transporter.sendMail({
    from: config.from,
    to: message.to,
    subject: message.subject,
    html: message.html
  });
}
function createAuth(db, config) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications
      }
    }),
    baseURL: config.baseURL,
    secret: config.secret,
    trustedOrigins: config.trustedOrigins || [],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      // Set to true to enable email verification
      autoSignIn: true,
      sendResetPassword: async ({ user, url, token }) => {
        if (config.emailConfig) {
          await sendEmail({
            to: user.email,
            subject: "Reset your password - Robin",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #8b5cf6;">Reset your password</h1>
                <p>Hi ${user.name || "there"},</p>
                <p>We received a request to reset your password. Click the button below to reset it:</p>
                <a href="${url}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #6b7280; word-break: break-all;">${url}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
                <p style="color: #6b7280; font-size: 12px;">Sent from Robin App</p>
              </div>
            `
          }, config.emailConfig);
        }
      }
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        enabled: !!process.env.GITHUB_CLIENT_ID
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        enabled: !!process.env.GOOGLE_CLIENT_ID
      }
    },
    plugins: [
      openAPI()
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      // 7 days
      updateAge: 60 * 60 * 24,
      // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5
        // 5 minutes
      }
    },
    rateLimit: {
      window: 60,
      max: 10
    }
  });
}

const config$1 = useRuntimeConfig();
const db = getDb(config$1.database.url);

const config = useRuntimeConfig();
const auth = createAuth(db, {
  baseURL: config.public.apiBase,
  secret: process.env.AUTH_SECRET || "development-secret-change-in-production-make-it-at-least-32-chars",
  trustedOrigins: [config.public.appUrl],
  emailConfig: process.env.SMTP_HOST ? {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "1025", 10),
    secure: process.env.SMTP_SECURE === "true",
    from: process.env.EMAIL_FROM || "noreply@robin.local",
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD
  } : void 0
});

const ____all_ = defineEventHandler(async (event) => {
  return auth.handler(toWebRequest(event));
});

const ____all_$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: ____all_
});

async function requireAuth(event) {
  const session = await auth.api.getSession({ headers: getHeaders(event) });
  if (!session) {
    throw createError({
      statusCode: 401,
      message: "Authentication required"
    });
  }
  return session.user;
}

const logger = consola$1.create({
  level: 4,
  formatOptions: {
    date: true,
    colors: true,
    compact: false
  }
});
const log = {
  info: (message, ...args) => logger.info(message, ...args),
  error: (message, ...args) => logger.error(message, ...args),
  warn: (message, ...args) => logger.warn(message, ...args),
  debug: (message, ...args) => logger.debug(message, ...args),
  success: (message, ...args) => logger.success(message, ...args),
  start: (message, ...args) => logger.start(message, ...args),
  ready: (message, ...args) => logger.ready(message, ...args)
};

let redisClient = null;
let redisPubClient = null;
let redisSubClient = null;
function getRedis() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2e3);
        return delay;
      },
      lazyConnect: false,
      enableReadyCheck: true
    });
    redisClient.on("connect", () => {
      log.info("Redis client connected");
    });
    redisClient.on("error", (err) => {
      log.error("Redis client error:", err);
    });
    redisClient.on("ready", () => {
      log.info("Redis client ready");
    });
  }
  return redisClient;
}
function getRedisPubSub() {
  if (!redisPubClient || !redisSubClient) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    redisPubClient = new Redis(redisUrl, {
      lazyConnect: false
    });
    redisSubClient = new Redis(redisUrl, {
      lazyConnect: false
    });
    redisPubClient.on("connect", () => {
      log.info("Redis pub client connected");
    });
    redisSubClient.on("connect", () => {
      log.info("Redis sub client connected");
    });
  }
  return { pub: redisPubClient, sub: redisSubClient };
}
async function getCache(key, options) {
  const redis = getRedis();
  const fullKey = key;
  try {
    const value = await redis.get(fullKey);
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    log.error(`Cache get error for key ${fullKey}:`, error);
    return null;
  }
}
async function setCache(key, value, options) {
  const redis = getRedis();
  const fullKey = options?.prefix ? `${options.prefix}:${key}` : key;
  const ttl = options?.ttl || 300;
  try {
    await redis.setex(fullKey, ttl, JSON.stringify(value));
  } catch (error) {
    log.error(`Cache set error for key ${fullKey}:`, error);
  }
}
async function deleteCache(pattern, options) {
  const redis = getRedis();
  const fullPattern = pattern;
  try {
    if (fullPattern.includes("*")) {
      const keys = await scanKeys(fullPattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(fullPattern);
    }
  } catch (error) {
    log.error(`Cache delete error for pattern ${fullPattern}:`, error);
  }
}
async function scanKeys(pattern) {
  const redis = getRedis();
  const keys = [];
  let cursor = "0";
  do {
    const [newCursor, scannedKeys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100
    );
    cursor = newCursor;
    keys.push(...scannedKeys);
  } while (cursor !== "0");
  return keys;
}
async function incrementCounter(key, by = 1) {
  const redis = getRedis();
  return await redis.incrby(key, by);
}
async function checkRateLimit(key, limit, windowSeconds) {
  const redis = getRedis();
  const now = Date.now();
  const windowStart = now - windowSeconds * 1e3;
  try {
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);
    if (count >= limit) {
      const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
      const resetAt = oldest.length > 1 ? parseInt(oldest[1]) + windowSeconds * 1e3 : now + windowSeconds * 1e3;
      return {
        allowed: false,
        remaining: 0,
        resetAt
      };
    }
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, windowSeconds);
    return {
      allowed: true,
      remaining: limit - count - 1,
      resetAt: now + windowSeconds * 1e3
    };
  } catch (error) {
    log.error(`Rate limit error for key ${key}:`, error);
    return {
      allowed: true,
      remaining: limit,
      resetAt: now + windowSeconds * 1e3
    };
  }
}
async function getTopFromSortedSet(key, count = 10, withScores = false) {
  const redis = getRedis();
  if (withScores) {
    const results = await redis.zrevrange(key, 0, count - 1, "WITHSCORES");
    const parsed = [];
    for (let i = 0; i < results.length; i += 2) {
      parsed.push({
        member: results[i],
        score: parseFloat(results[i + 1])
      });
    }
    return parsed;
  }
  return await redis.zrevrange(key, 0, count - 1);
}
async function incrementSortedSetScore(key, member, increment = 1) {
  const redis = getRedis();
  const newScore = await redis.zincrby(key, increment, member);
  return parseFloat(newScore);
}
async function removeFromSortedSet(key, member) {
  const redis = getRedis();
  await redis.zrem(key, member);
}
async function publish(channel, message) {
  const { pub } = getRedisPubSub();
  try {
    await pub.publish(channel, JSON.stringify(message));
  } catch (error) {
    log.error(`Pub/Sub publish error on channel ${channel}:`, error);
  }
}

let s3Client = null;
function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ""
      },
      forcePathStyle: true
      // Required for Minio
    });
    log.info("S3 client initialized");
  }
  return s3Client;
}
async function uploadFile(options) {
  const client = getS3Client();
  const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_ASSETS || "assets";
  const filename = options.filename || `${ulid()}.${getExtensionFromMimeType(options.contentType)}`;
  const key = options.folder ? `${options.folder}/${filename}` : filename;
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: options.buffer,
        ContentType: options.contentType
      })
    );
    const endpoint = process.env.S3_ENDPOINT || "";
    const publicUrl = `${endpoint}/${bucket}/${key}`;
    log.info(`File uploaded to S3: ${key}`);
    return publicUrl;
  } catch (error) {
    log.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
}
async function deleteFile(url) {
  const client = getS3Client();
  const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_ASSETS || "assets";
  try {
    const key = extractKeyFromUrl(url);
    if (!key) {
      log.warn(`Could not extract key from URL: ${url}`);
      return;
    }
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );
    log.info(`File deleted from S3: ${key}`);
  } catch (error) {
    log.error("S3 delete error:", error);
  }
}
function extractKeyFromUrl(url) {
  try {
    const bucket = process.env.S3_BUCKET || process.env.S3_BUCKET_ASSETS || "assets";
    const parts = url.split(`/${bucket}/`);
    return parts.length > 1 ? parts[1] : null;
  } catch {
    return null;
  }
}
function getExtensionFromMimeType(mimeType) {
  const mimeMap = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
    "video/mp4": "mp4",
    "video/webm": "webm"
  };
  return mimeMap[mimeType] || "bin";
}
function validateImageFile(mimeType) {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  return allowedTypes.includes(mimeType);
}
function validateFileSize(size, maxSizeMB = 10) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size <= maxBytes;
}

const _id__delete = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Post ID is required"
    });
  }
  const user = await requireAuth(event);
  const [post] = await db.select().from(posts).where(and(eq(posts.id, id), isNull(posts.deletedAt))).limit(1);
  if (!post) {
    throw createError({
      statusCode: 404,
      message: "Post not found"
    });
  }
  if (post.userId !== user.id) {
    throw createError({
      statusCode: 403,
      message: "You do not have permission to delete this post"
    });
  }
  await db.update(posts).set({
    deletedAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(posts.id, id));
  if (post.coverImage) {
    await deleteFile(post.coverImage);
  }
  if (post.coverImageThumb) {
    await deleteFile(post.coverImageThumb);
  }
  await deleteCache(`post:${id}`);
  await deleteCache("posts:list:*");
  await deleteCache(`posts:user:${user.id}:*`);
  await removeFromSortedSet("trending:posts", id);
  await publish("posts:deleted", {
    id: post.id,
    userId: user.id
  });
  log.info(`Post deleted: ${id} by user ${user.id}`);
  return {
    success: true,
    message: "Post deleted successfully"
  };
});

const _id__delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete
});

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Post ID is required"
    });
  }
  const cacheKey = `post:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    await incrementCounter(`post:${id}:views`);
    log.debug(`Cache hit for post: ${id}`);
    return cached;
  }
  const [post] = await db.select({
    id: posts.id,
    userId: posts.userId,
    title: posts.title,
    slug: posts.slug,
    content: posts.content,
    excerpt: posts.excerpt,
    coverImage: posts.coverImage,
    coverImageThumb: posts.coverImageThumb,
    status: posts.status,
    views: posts.views,
    likesCount: posts.likesCount,
    publishedAt: posts.publishedAt,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    version: posts.version,
    author: {
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image
    }
  }).from(posts).innerJoin(users, eq(posts.userId, users.id)).where(and(eq(posts.id, id), isNull(posts.deletedAt))).limit(1);
  if (!post) {
    throw createError({
      statusCode: 404,
      message: "Post not found"
    });
  }
  await incrementCounter(`post:${id}:views`);
  const result = { post };
  await setCache(cacheKey, result, { ttl: 900 });
  log.debug(`Post fetched: ${id}`);
  return result;
});

const _id__get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5e4).optional(),
  coverImage: z.string().url().optional(),
  status: z.enum(["draft", "published"]).optional(),
  version: z.number().int()
  // For optimistic locking
});
const _id__patch = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Post ID is required"
    });
  }
  const user = await requireAuth(event);
  const body = await readBody(event);
  const data = updatePostSchema.parse(body);
  const [existingPost] = await db.select().from(posts).where(and(eq(posts.id, id), isNull(posts.deletedAt))).limit(1);
  if (!existingPost) {
    throw createError({
      statusCode: 404,
      message: "Post not found"
    });
  }
  if (existingPost.userId !== user.id) {
    throw createError({
      statusCode: 403,
      message: "You do not have permission to edit this post"
    });
  }
  if (existingPost.version !== data.version) {
    throw createError({
      statusCode: 409,
      message: "Post has been modified by another process. Please refresh and try again."
    });
  }
  const updateData = {
    version: existingPost.version + 1,
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (data.title !== void 0) {
    updateData.title = data.title;
    updateData.slug = generateSlug$1(data.title);
  }
  if (data.content !== void 0) {
    updateData.content = data.content;
    updateData.excerpt = data.content.substring(0, 200).trim() + (data.content.length > 200 ? "..." : "");
  }
  if (data.coverImage !== void 0) {
    updateData.coverImage = data.coverImage;
  }
  if (data.status !== void 0) {
    updateData.status = data.status;
    if (data.status === "published" && !existingPost.publishedAt) {
      updateData.publishedAt = /* @__PURE__ */ new Date();
    }
  }
  const [updatedPost] = await db.update(posts).set(updateData).where(eq(posts.id, id)).returning();
  await deleteCache(`post:${id}`);
  await deleteCache("posts:list:*");
  await deleteCache(`posts:user:${user.id}:*`);
  await publish("posts:updated", {
    id: updatedPost.id,
    title: updatedPost.title,
    slug: updatedPost.slug,
    userId: user.id,
    updatedAt: updatedPost.updatedAt
  });
  log.info(`Post updated: ${id} by user ${user.id}`);
  return {
    post: {
      ...updatedPost,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    }
  };
});
function generateSlug$1(title) {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 100);
}

const _id__patch$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__patch
});

const like_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Post ID is required"
    });
  }
  const user = await requireAuth(event);
  const [post] = await db.select({ id: posts.id }).from(posts).where(and(eq(posts.id, id), isNull(posts.deletedAt))).limit(1);
  if (!post) {
    throw createError({
      statusCode: 404,
      message: "Post not found"
    });
  }
  const [existingLike] = await db.select().from(postLikes).where(and(eq(postLikes.postId, id), eq(postLikes.userId, user.id))).limit(1);
  let liked = false;
  if (existingLike) {
    await db.delete(postLikes).where(eq(postLikes.id, existingLike.id));
    await db.update(posts).set({
      likesCount: sql$1`${posts.likesCount} - 1`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(posts.id, id));
    await incrementSortedSetScore("trending:posts", id, -1);
    log.debug(`Post unliked: ${id} by user ${user.id}`);
  } else {
    await db.insert(postLikes).values({
      id: ulid(),
      postId: id,
      userId: user.id
    });
    await db.update(posts).set({
      likesCount: sql$1`${posts.likesCount} + 1`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(posts.id, id));
    await incrementSortedSetScore("trending:posts", id, 1);
    liked = true;
    log.debug(`Post liked: ${id} by user ${user.id}`);
  }
  await deleteCache(`post:${id}`);
  await deleteCache("posts:list:*");
  await publish("posts:like", {
    postId: id,
    userId: user.id,
    liked
  });
  return {
    liked,
    message: liked ? "Post liked" : "Post unliked"
  };
});

const like_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: like_post
});

const querySchema$2 = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["draft", "published", "all"]).default("published"),
  userId: z.string().optional(),
  search: z.string().optional()
});
const index_get$2 = defineEventHandler(async (event) => {
  const query = getQuery$1(event);
  const params = querySchema$2.parse(query);
  const offset = (params.page - 1) * params.limit;
  const cacheKey = `posts:list:${params.page}:${params.limit}:${params.status}:${params.userId || "all"}:${params.search || "none"}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    log.debug(`Cache hit for posts list: ${cacheKey}`);
    return cached;
  }
  const conditions = [isNull(posts.deletedAt)];
  if (params.status !== "all") {
    conditions.push(eq(posts.status, params.status));
  }
  if (params.userId) {
    conditions.push(eq(posts.userId, params.userId));
  }
  if (params.search) {
    const searchCondition = sql$1`to_tsvector('english', ${posts.title} || ' ' || ${posts.content}) @@ plainto_tsquery('english', ${params.search})`;
    conditions.push(searchCondition);
  }
  const posts$1 = await db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    excerpt: posts.excerpt,
    coverImage: posts.coverImage,
    coverImageThumb: posts.coverImageThumb,
    status: posts.status,
    views: posts.views,
    likesCount: posts.likesCount,
    publishedAt: posts.publishedAt,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    author: {
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image
    }
  }).from(posts).innerJoin(users, eq(posts.userId, users.id)).where(and(...conditions)).orderBy(desc(posts.publishedAt), desc(posts.createdAt)).limit(params.limit).offset(offset);
  const [{ count }] = await db.select({ count: sql$1`cast(count(*) as integer)` }).from(posts).where(and(...conditions));
  const result = {
    posts: posts$1,
    pagination: {
      page: params.page,
      limit: params.limit,
      total: count,
      totalPages: Math.ceil(count / params.limit)
    }
  };
  await setCache(cacheKey, result, { ttl: 300 });
  log.debug(`Posts list fetched: ${posts$1.length} posts`);
  return result;
});

const index_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_get$2
});

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5e4),
  coverImage: z.string().url().optional(),
  status: z.enum(["draft", "published"]).default("draft")
});
const index_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const rateLimitKey = `rate-limit:posts:create:${user.id}`;
  const rateLimit = await checkRateLimit(rateLimitKey, 10, 3600);
  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      message: `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1e3 / 60)} minutes.`
    });
  }
  const body = await readBody(event);
  const data = createPostSchema.parse(body);
  const slug = generateSlug(data.title);
  const postId = ulid();
  const excerpt = data.content.substring(0, 200).trim() + (data.content.length > 200 ? "..." : "");
  const [post] = await db.insert(posts).values({
    id: postId,
    userId: user.id,
    title: data.title,
    slug,
    content: data.content,
    excerpt,
    coverImage: data.coverImage,
    status: data.status,
    publishedAt: data.status === "published" ? /* @__PURE__ */ new Date() : null
  }).returning();
  await deleteCache("posts:list:*");
  await deleteCache(`posts:user:${user.id}:*`);
  if (data.status === "published") {
    await publish("posts:new", {
      id: post.id,
      title: post.title,
      slug: post.slug,
      userId: user.id,
      createdAt: post.createdAt
    });
  }
  log.info(`Post created: ${postId} by user ${user.id}`);
  return {
    post: {
      ...post,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    }
  };
});
function generateSlug(title) {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 100);
}

const index_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_post
});

const querySchema$1 = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10)
});
const trending_get = defineEventHandler(async (event) => {
  const query = getQuery$1(event);
  const params = querySchema$1.parse(query);
  const trendingIds = await getTopFromSortedSet("trending:posts", params.limit);
  if (trendingIds.length === 0) {
    return {
      posts: []
    };
  }
  const posts$1 = await db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    excerpt: posts.excerpt,
    coverImage: posts.coverImage,
    coverImageThumb: posts.coverImageThumb,
    status: posts.status,
    views: posts.views,
    likesCount: posts.likesCount,
    publishedAt: posts.publishedAt,
    createdAt: posts.createdAt,
    author: {
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image
    }
  }).from(posts).innerJoin(users, eq(posts.userId, users.id)).where(and(inArray(posts.id, trendingIds), isNull(posts.deletedAt))).limit(params.limit);
  const postsMap = new Map(posts$1.map((p) => [p.id, p]));
  const sortedPosts = trendingIds.map((id) => postsMap.get(id)).filter(Boolean);
  log.debug(`Trending posts fetched: ${sortedPosts.length} posts`);
  return {
    posts: sortedPosts
  };
});

const trending_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: trending_get
});

const testEmail_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { to, subject = "Test Email from Robin" } = body;
  if (!to) {
    throw createError({
      statusCode: 400,
      message: "Email recipient (to) is required"
    });
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mailpit",
    port: parseInt(process.env.SMTP_PORT || "1025", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    } : void 0
  });
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@robin.local",
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6;">Test Email from Robin</h1>
          <p>This is a test email to verify your SMTP configuration is working correctly.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>SMTP Host: ${process.env.SMTP_HOST || "mailpit"}</li>
            <li>SMTP Port: ${process.env.SMTP_PORT || "1025"}</li>
            <li>From: ${process.env.EMAIL_FROM || "noreply@robin.local"}</li>
          </ul>
          <p style="color: #10b981;">\u2705 If you're seeing this, your email setup is working!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 14px;">
            Sent at: ${(/* @__PURE__ */ new Date()).toISOString()}<br>
            Environment: ${"development"}
          </p>
        </div>
      `
    });
    return {
      success: true,
      message: "Test email sent successfully",
      info: {
        messageId: info.messageId,
        to,
        from: process.env.EMAIL_FROM || "noreply@robin.local"
      }
    };
  } catch (error) {
    log.error("Failed to send test email:", error);
    throw createError({
      statusCode: 500,
      message: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`
    });
  }
});

const testEmail_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: testEmail_post
});

const upload_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const rateLimitKey = `rate-limit:upload:${user.id}`;
  const rateLimit = await checkRateLimit(rateLimitKey, 20, 3600);
  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      message: `Upload rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1e3 / 60)} minutes.`
    });
  }
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: "No file uploaded"
    });
  }
  const file = formData[0];
  if (!file || !file.data) {
    throw createError({
      statusCode: 400,
      message: "Invalid file data"
    });
  }
  const contentType = file.type || "application/octet-stream";
  if (!validateImageFile(contentType)) {
    throw createError({
      statusCode: 400,
      message: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
    });
  }
  if (!validateFileSize(file.data.length, 10)) {
    throw createError({
      statusCode: 400,
      message: "File size exceeds 10 MB limit"
    });
  }
  try {
    const url = await uploadFile({
      buffer: file.data,
      contentType,
      folder: "posts/covers"
    });
    log.info(`File uploaded by user ${user.id}: ${url}`);
    return {
      url,
      contentType,
      size: file.data.length
    };
  } catch (error) {
    log.error("Upload error:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to upload file"
    });
  }
});

const upload_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: upload_post
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional()
});
const index_get = defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse);
  const users = [
    {
      id: "1",
      email: "demo@example.com",
      name: "Demo User",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  return {
    data: users,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: users.length,
      pages: Math.ceil(users.length / query.limit)
    }
  };
});

const index_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_get
});

const me_get = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  return {
    user
  };
});

const me_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: me_get
});

const health_get = defineEventHandler(() => {
  return {
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "robin-api"
  };
});

const health_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: health_get
});
//# sourceMappingURL=index.mjs.map
