const { sql, getPool } = require('../config/db');

// Trae todos los productos (SP simple, sin joins)
async function getProducts(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('usp_GetProducts');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// Trae los productos junto con su categoría y subcategoría (SP con JOIN)
async function getProductsWithCategory(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('usp_GetProductsWithCategory');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// Crea un producto nuevo
async function createProduct(req, res) {
  try {
    const { name, productNumber, color, listPrice, subcategoryId } = req.body;

    // Sin estos datos no tiene sentido seguir
    if (!name || !productNumber || listPrice === undefined) {
      return res.status(400).json({ error: 'name, productNumber y listPrice son obligatorios' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('Name', sql.NVarChar(50), name)
      .input('ProductNumber', sql.NVarChar(25), productNumber)
      .input('Color', sql.NVarChar(15), color || null)
      .input('ListPrice', sql.Money, listPrice)
      .input('ProductSubcategoryID', sql.Int, subcategoryId || null)
      .execute('usp_InsertProduct');

    // El SP nos devuelve el ID que le asignó SQL Server al producto nuevo
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// Actualiza un producto existente
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, color, listPrice } = req.body;

    if (!name || listPrice === undefined) {
      return res.status(400).json({ error: 'name y listPrice son obligatorios' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('ProductID', sql.Int, id)
      .input('Name', sql.NVarChar(50), name)
      .input('Color', sql.NVarChar(15), color || null)
      .input('ListPrice', sql.Money, listPrice)
      .execute('usp_UpdateProduct');

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// Elimina un producto
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('ProductID', sql.Int, id)
      .execute('usp_DeleteProduct');

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getProducts,
  getProductsWithCategory,
  createProduct,
  updateProduct,
  deleteProduct
};