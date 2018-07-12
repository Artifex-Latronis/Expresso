const testUtilities = require('../testUtilities.js');
const express = require('express');
const menuItemsRouter = express.Router({
  mergeParams: true
});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const pgm = 'menuItems.js';

//resolve 'menuItemId'
menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = `SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId`;
  const values = {
    $menuItemId: menuItemId
  };

  db.get(sql, values, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.status(404).send();
    }
  });
});

//GET /api/menus/:menuId/menu-items
menuItemsRouter.get('/', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const sql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`;
  const values = {
    $menuId: req.params.menuId
  };
  db.all(sql, values, (error, menuItems) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({
        menuItems: menuItems
      });
    }
  });
});

//POST /api/menus/:menuId/menu-items
menuItemsRouter.post('/', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;

  const menuSql = `SELECT * FROM Menu WHERE Menu.id = $menuId`;
  const menuValues = {
    $menuId: menuId
  };

  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else {
      if (!name || !inventory || !price || !menu) {
        return res.status(400).send();
      }

      const menuItemSql = `INSERT INTO MenuItem (
        name,
        description,
        inventory,
        price,
        menu_id
      ) VALUES (
        $name,
        $description,
        $inventory,
        $price,
        $menuId
      )`;

      const menuItemValues = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId
      };

      db.run(menuItemSql, menuItemValues, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (error, menuItem) => {
            res.status(201).json({
              menuItem: menuItem
            });
          });
        }
      });
    }
  });
});

//PUT /api/menus/:menuId/menu-items/:menuItemId
menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;

  const menuSql = `SELECT * FROM Menu WHERE Menu.id = $menuId`;
  const menuValues = {
    $menuId: menuId
  };

  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else {
      if (!name || !inventory || !price || !menu) {
        return res.status(400).send();
      }

      const menuItemSql = `UPDATE MenuItem SET
        name = $name,
        description = $description,
        inventory = $inventory,
        price = $price,
        menu_id = $menuId
        WHERE MenuItem.id = $menuItemId`;

      const menuItemValues = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId,
        $menuItemId: req.params.menuItemId
      };

      db.run(menuItemSql, menuItemValues, (error) => {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, (error, menuItem) => {
            res.status(200).json({
              menuItem: menuItem
            });
          });
        }
      });
    }
  });
});

//DELETE /api/menus/:menuId/menu-items/:menuItemId
menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  testUtilities.reqConsoleOutput(pgm, req);

  const sql = `DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId`;
  const values = {
    $menuItemId: req.params.menuItemId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.status(204).send();
    }
  });
});

//Export the router
module.exports = menuItemsRouter;