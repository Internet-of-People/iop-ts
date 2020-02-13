import express from 'express';
import bodyParser from 'body-parser';

import { IApi } from './api';

type AsyncRequestHandler = (req: express.Request, res: express.Response) => Promise<void>;

const handleAsync = (f: AsyncRequestHandler): express.RequestHandler => {
  return async(req, res, next): Promise<void> => {
    try {
      await f(req, res);
    } catch (err) {
      next(err);
    }
  };
};

const handleError = (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  console.error(err.stack);
  res.status(500).json(err.message);
};

const jsonBody = bodyParser.json({});

export class Server {
  public readonly app: express.Application;
  private readonly api: IApi;

  public constructor(api: IApi) {
    this.api = api;
    this.app = express();
    this.app.use(handleError);

    this.app.get('/processes', handleAsync(async(_, res): Promise<void> => {
      console.log('Serving processes...');
      const processes = await this.api.listProcesses();
      res.status(200).json({ processes });
    }));

    this.app.get('/blob/:contentId', handleAsync(async(req, res): Promise<void> => {
      const { contentId } = req.params;
      console.log(`Serving blob/${contentId}...`);

      try {
        const blob = await this.api.getPublicBlob(contentId);
        res.status(200).json(blob);
      } catch (err) {
        res.status(404).json(err.message);
      }
    }));

    this.app.post('/requests', jsonBody, handleAsync(async(req, res): Promise<void> => {
      try {
        const capabilityLink = await this.api.sendRequest(req.body);
        res.status(202).json({ capabilityLink });
      } catch (err) {
        res.status(400).json(err.message);
      }
    }));

    this.app.get('/requests/:capabilityLink/status', handleAsync(async(req, res): Promise<void> => {
      const { capabilityLink } = req.params;

      try {
        const status = await this.api.getRequestStatus(capabilityLink);
        res.status(200).json(status);
      } catch (err) {
        res.status(404).json(err.message);
      }
    }));

    this.app.get('/requests', handleAsync(async(req, res): Promise<void> => {
      const requests = await this.api.listRequests();
      res.status(200).json({ requests });
    }));

    this.app.post('/requests/:capabilityLink/approve', jsonBody, handleAsync(async(req, res): Promise<void> => {
      const { capabilityLink } = req.params;

      try {
        await this.api.approveRequest(capabilityLink, req.body);
        res.status(200).json({ success: true });
      } catch (err) {
        const { message }: { message: string; } = err;
        const status = message.includes('Unknown') ? 404 : 400;
        res.status(status).json({ error: message });
      }
    }));

    this.app.post('/requests/:capabilityLink/reject', jsonBody, handleAsync(async(req, res): Promise<void> => {
      const { capabilityLink } = req.params;
      const { rejectionReason } = req.body;

      try {
        await this.api.rejectRequest(capabilityLink, rejectionReason);
        res.status(200).json({ success: true });
      } catch (err) {
        const { message }: { message: string; } = err;
        const status = message.includes('Unknown') ? 404 : 400;
        res.status(status).json({ error: message });
      }
    }));

    this.app.get('/private-blob/:contentId', handleAsync(async(req, res): Promise<void> => {
      const { contentId } = req.params;
      console.log(`Serving private blob/${contentId}...`);

      try {
        const blob = await this.api.getPrivateBlob(contentId);
        res.status(200).json(blob);
      } catch (err) {
        res.status(404).json({ error: err.message });
      }
    }));
  }

  public start(port: number, hostname: string): void {
    this.app.listen(port, hostname, (): void => {
      console.log(`Listening on ${hostname}:${port}`);
    });
  }
}
