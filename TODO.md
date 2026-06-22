# TODO - Módulo Horarios

- [x] Confirmar/actualizar SQL para crear tabla `horarios` si no existe (script dedicado)
- [x] Crear modelo `horarioModel.js` con CRUD en PostgreSQL
- [x] Crear servicio `horarioService.js` con validación de existencia (404)
- [x] Crear controlador `horarioController.js` (getAll/getById/create/update/remove)
- [x] Crear validadores `horarioValidators.js` con regla `hora_fin > hora_inicio`
- [x] Crear routes `horarioRoutes.js` protegidas con JWT (`authenticate`)
- [x] Integrar `app.use('/horarios', horarioRoutes)` en `src/app.js`
- [ ] Probar endpoints con Postman (incluye validaciones y JWT)
