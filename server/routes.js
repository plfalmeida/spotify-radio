import config from "./config.js";
import { Controller } from "./controller.js";
import { logger } from "./utils.js";

const controller = new Controller();

async function routes(request, response) {
  const { method, url } = request;

  if (method === "GET" && url === "/") {
    response.writeHead(302, {
      Location: config.location.home,
    });
    return response.end();
  }

  if (method === "GET" && url === "/home") {
    const { stream } = await controller.getFileStream(config.pages.homeHTML);
    return stream.pipe(response);
  }

  if (method === "GET" && url === "/controller") {
    const { stream } = await controller.getFileStream(
      config.pages.controllerHTML
    );
    return stream.pipe(response);
  }

  if (method === "GET") {
    const { stream, type } = await controller.getFileStream(url);
    return stream.pipe(response);
  }

  response.writeHead(404);
  return response.end();
}

export function handler(request, response) {
  return routes(request, response).catch((err) =>
    logger.error(`Deu ruimmmm: ${err.stack}`)
  );
}
