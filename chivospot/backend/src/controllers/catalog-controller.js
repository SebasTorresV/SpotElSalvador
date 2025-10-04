import { listDepartments, listMunicipalities, listCategories } from '../repositories/catalog-repository.js';

export async function getDepartments(req, res, next) {
  try {
    const departments = await listDepartments();
    res.json(departments);
  } catch (error) {
    next(error);
  }
}

export async function getMunicipalities(req, res, next) {
  try {
    const municipalities = await listMunicipalities(req.params.id);
    res.json(municipalities);
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await listCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}
