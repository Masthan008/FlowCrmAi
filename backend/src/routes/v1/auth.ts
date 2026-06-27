import { Router } from 'express';
import { ResponseHelper } from '../../helpers/response';

const router = Router();

router.post('/login', (req, res) => {
  const email = req.body.email || 'admin@flowcrm.ai';
  ResponseHelper.sendSuccess(req, res, 200, 'Mock Login Successful', {
    token: 'mock_jwt_token_flowcrm_ai',
    refreshToken: 'mock_jwt_refresh_token_flowcrm_ai',
    user: {
      id: 'd3b07384-d113-4ec2-a542-3146b4dd546d',
      email: email,
      name: 'Alex Mercer',
      role: 'Super Admin',
      permissions: ['*']
    }
  });
});

router.post('/logout', (req, res) => {
  ResponseHelper.sendSuccess(req, res, 200, 'Mock Logout Successful');
});

router.post('/refresh', (req, res) => {
  ResponseHelper.sendSuccess(req, res, 200, 'Mock Refresh Successful', {
    token: 'mock_jwt_token_flowcrm_ai_rotated'
  });
});

export default router;
