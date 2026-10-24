import { Router } from 'express';
import { COMPANY_BLUEPRINTS } from '../data/companies.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ success: true, companies: COMPANY_BLUEPRINTS });
});

router.get('/:id', (req, res) => {
  const company = COMPANY_BLUEPRINTS.find(item => item.id === req.params.id);
  if (!company) {
    res.status(404).json({ success: false, message: 'Company blueprint not found.' });
    return;
  }
  res.json({ success: true, company });
});

export default router;