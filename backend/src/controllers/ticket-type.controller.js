const ticketTypeService = require('../services/ticket-type.service');

class TicketTypeController {
  async obtenerTodos(req, res, next) {
    try {
      const ticketTypes = await ticketTypeService.obtenerTodos(req.query.includeDeleted === 'true');
      res.status(200).json({ status: 'success', data: ticketTypes });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorIdentificador(req, res, next) {
    try {
      const ticketType = await ticketTypeService.obtenerPorIdentificador(req.params.identifier);
      res.status(200).json({ status: 'success', data: ticketType });
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const ticketType = await ticketTypeService.crear(req.body);
      res.status(201).json({ status: 'success', data: ticketType });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const ticketType = await ticketTypeService.actualizar(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: ticketType });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const ticketType = await ticketTypeService.eliminar(req.params.id);
      res.status(200).json({ status: 'success', data: ticketType });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TicketTypeController();
