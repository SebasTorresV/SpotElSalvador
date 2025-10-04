import { Router } from 'express';
import { getDepartments, getMunicipalities, getCategories } from '../controllers/catalog-controller.js';

export const catalogRouter = Router();

catalogRouter.get('/departments', getDepartments);
catalogRouter.get('/departments/:id/municipalities', getMunicipalities);
catalogRouter.get('/categories', getCategories);
