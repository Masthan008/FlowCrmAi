import { Router } from 'express';
import { ResponseHelper } from '../../helpers/response';

/**
 * Creates an Express Router with boilerplate placeholder endpoints
 */
export const createPlaceholderRouter = (moduleName: string): Router => {
  const router = Router();

  // GET list
  router.get('/', (req, res) => {
    ResponseHelper.sendSuccess(req, res, 200, `Placeholder response: GET list of ${moduleName}`, {
      items: [],
      message: `Database logic for ${moduleName} is not yet implemented.`
    });
  });

  // POST create
  router.post('/', (req, res) => {
    ResponseHelper.sendSuccess(req, res, 201, `Placeholder response: POST create ${moduleName}`, {
      created: true,
      body: req.body
    });
  });

  // GET details
  router.get('/:id', (req, res) => {
    ResponseHelper.sendSuccess(req, res, 200, `Placeholder response: GET details of ${moduleName}`, {
      id: req.params.id
    });
  });

  // PUT update
  router.put('/:id', (req, res) => {
    ResponseHelper.sendSuccess(req, res, 200, `Placeholder response: PUT update ${moduleName}`, {
      id: req.params.id,
      updated: true
    });
  });

  // DELETE soft-delete
  router.delete('/:id', (req, res) => {
    ResponseHelper.sendSuccess(req, res, 200, `Placeholder response: DELETE soft-delete ${moduleName}`, {
      id: req.params.id,
      deleted: true
    });
  });

  return router;
};

export default createPlaceholderRouter;
