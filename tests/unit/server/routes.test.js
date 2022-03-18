import { jest, expect, describe, test } from '@jest/globals';
import TestUil from '../_util/testUtil.js';
import config from '../../../server/config.js';
import { handler } from '../../../server/routes.js';
import { Controller } from '../../../server/controller.js';
const { pages, location, constants } = config;

describe('#Routes - test site for api response', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('GET / - should redirect to home page', async () => {
    const params = TestUil.defaultHandleParams();
    params.request.method = 'GET';
    params.request.url = '/';
    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalledWith(302, {
      Location: location.home,
    });

    expect(params.response.end).toHaveBeenCalled();
  });

  test(`GET /home - should response with ${pages.homeHTML} file stream`, async () => {
    const mockFileStream = TestUil.generateReadableStream(['data']);
    const params = TestUil.defaultHandleParams();
    params.request.method = 'GET';
    params.request.url = '/home';

    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValue({
      stream: mockFileStream,
    });

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(pages.homeHTML);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test(`GET /controller - should response with ${pages.controllerHTML} file stream`, async () => {
    const mockFileStream = TestUil.generateReadableStream(['data']);
    const params = TestUil.defaultHandleParams();
    params.request.method = 'GET';
    params.request.url = '/controller';

    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValue({
      stream: mockFileStream,
    });

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(pages.controllerHTML);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test(`GET /file.html - should response with file stream`, async () => {
    const mockFileStream = TestUil.generateReadableStream(['data']);
    const fileName = '/index.html';
    const expectedType = '.html';
    const params = TestUil.defaultHandleParams();
    params.request.url = fileName;
    params.request.method = 'GET';

    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValue({
      stream: mockFileStream,
      type: expectedType,
    });

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(fileName);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': constants.CONTENT_TYPE[expectedType],
    });
  });

  test(`GET /file.ext - should response with file stream`, async () => {
    const mockFileStream = TestUil.generateReadableStream(['data']);
    const fileName = '/file.ext';
    const expectedType = '.ext';
    const params = TestUil.defaultHandleParams();
    params.request.url = fileName;
    params.request.method = 'GET';

    jest.spyOn(Controller.prototype, Controller.prototype.getFileStream.name).mockResolvedValue({
      stream: mockFileStream,
      type: expectedType,
    });

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(fileName);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).not.toHaveBeenCalledWith();
  });

  test(`POST /unknown - given an inexistent route it should response with 404`, async () => {
    const params = TestUil.defaultHandleParams();
    params.request.method = 'POST';
    params.request.url = '/unknown';

    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalledWith(404);
    expect(params.response.end).toHaveBeenCalled();
  });

  describe('exceptions', () => {
    test('given an inexistent file it should respond with 404', async () => {
      const params = TestUil.defaultHandleParams();
      params.request.method = 'GET';
      params.request.url = '/index.png';

      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(
          new Error("error: ENOENT: no such file or directory, open '/index.png'"),
        );

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalled();
    });
    test('given an error it should respond with 500', async () => {
      const params = TestUil.defaultHandleParams();
      params.request.method = 'GET';
      params.request.url = '/index.png';

      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(new Error('Error'));

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(500);
      expect(params.response.end).toHaveBeenCalled();
    });
  });
});
