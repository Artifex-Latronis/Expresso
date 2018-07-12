const testUtilities = require('../testUtilities.js');
const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menuItems.js');

const pgm = 'menus.js';

//resolve 'menuId'
menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = `SELECT * FROM Menu WHERE Menu.id = $menuId`;
  const values = {
    $menuId: menuId
  };

  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.status(404).send();
    }
  });
});

//Reroute 'menu-items' requests
menusRouter.use('/:menuId/menu-items', menuItemsRouter);

//GET /api/menus
menusRouter.get('/', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const sql = `SELECT * FROM Menu`;
  db.all(sql, (error, menus) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({
        menus: menus
      });
    }
  });
});

//POST /api/menus
menusRouter.post('/', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const title = req.body.menu.title;

  if (!title) {
    return res.status(400).send();
  }
  const sql = `INSERT INTO menu (
    title
  ) VALUES (
    $title
  )`
  const values = {
    $title: title,
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (error, menu) => {
        res.status(201).json({
          menu: menu
        });
      });
    }
  });
});

//GET /api/menus/:menuId
menusRouter.get('/:menuId', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  res.status(200).json({
    menu: req.menu
  });
});

//PUT /api/menus/:menuId
menusRouter.put('/:menuId', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const title = req.body.menu.title;
  if (!title) {
    return res.status(400).send();
  }

  const sql = `UPDATE Menu SET
    title = $title
    WHERE Menu.id = $menuId`;
  const values = {
    $title: title,
    $menuId: req.params.menuId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (error, menu) => {
        res.status(200).json({
          menu: menu
        });
      });
    }
  });
});

//DELETE /api/menus/:menuId
menusRouter.delete('/:menuId', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const menuItemSql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`;
  const menuItemValues = {
    $menuId: req.params.menuId
  }

  db.get(menuItemSql, menuItemValues, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      res.status(400).send();
    } else {
      const menuSql = `DELETE FROM Menu WHERE Menu.id = $menuId`;
      const menuValues = {
        $menuId: req.params.menuId
      }

      db.run(menuSql, menuValues, (error) => {
        if (error) {
          next(error)
        } else {
          res.status(204).send();
        }
      });
    }
  });
});

//Export the router
module.exports = menusRouter;