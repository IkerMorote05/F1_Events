const shopService = require('../services/shop.service');

class ShopController {
  async home(req, res, next) {
    try {
      const data = await shopService.obtenerHome(req.params.resource);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const result = await shopService.listar(req.query);
      res.status(200).json({
        status: 'success',
        data: result.items,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async detalle(req, res, next) {
    try {
      const data = await shopService.obtenerDetalle(req.params.slug);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ShopController();
