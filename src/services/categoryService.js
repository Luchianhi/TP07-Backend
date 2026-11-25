import * as categoryRepo from '../repositories/categoryRepository.js';
import * as productRepo from '../repositories/productRepository.js';

async function listCategories() {
  return await categoryRepo.getAll();
}

async function getCategory(id) {
  const cat = await categoryRepo.getById(id);
  if (!cat) throw new Error('Category not found');
  return cat;
}

async function createCategory(data) {
  return await categoryRepo.create(data);
}

async function updateCategory(id, data) {
  const existing = await categoryRepo.getById(id);
  if (!existing) throw new Error('Category not found');
  return await categoryRepo.update(id, data);
}

async function deleteCategory(id) {
  // Vérifier qu'aucun produit n'est lié
  const [products] = await productRepo.getAll();
  const linked = products.filter(p => p.category_id === id);
  if (linked.length) throw new Error('Cannot delete category with linked products');
  await categoryRepo.remove(id);
}

export {listCategories, getCategory, createCategory, updateCategory, deleteCategory};
