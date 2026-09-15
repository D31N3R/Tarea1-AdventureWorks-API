const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

router.get('/with-category', controller.getProductsWithCategory);
router.get('/', controller.getProducts);
router.post('/', controller.createProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;

