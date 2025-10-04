import { query } from '../config/database.js';

export async function listDepartments() {
  const { rows } = await query('SELECT id, nombre FROM departments ORDER BY nombre');
  return rows;
}

export async function listMunicipalities(departmentId) {
  const { rows } = await query(
    'SELECT id, nombre FROM municipalities WHERE department_id = $1 ORDER BY nombre',
    [departmentId],
  );
  return rows;
}

export async function listCategories() {
  const { rows } = await query('SELECT id, slug, nombre FROM categories ORDER BY nombre');
  return rows;
}
