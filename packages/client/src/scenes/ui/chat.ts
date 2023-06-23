import Phaser from "phaser";
import {
  GridTable,
  Sizer,
  WrapExpandText,
} from "phaser3-rex-plugins/templates/ui/ui-components";

import { resolution } from "../../resolution";

export class ChatUI {
  scene: Phaser.Scene;
  gridTable: GridTable;

  constructor({ scene }: { scene: Phaser.Scene }) {
    this.scene = scene;

    // Reference: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-gridtable/
    // @TODO: review types
    this.gridTable = new GridTable(scene, {
      x: 0,
      y: resolution.height,
      width: 400,
      height: 200,
      scrollMode: 0,
      background: scene.add.rectangle(0, 0, 0, 0, 0x000, 0.1),
      table: {
        columns: 1,
        mask: {
          padding: 0,
        },
        reuseCellContainer: true,
      },
      space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },

      createCellContainerCallback: function (cell, cellContainer) {
        if (cellContainer === null) {
          cellContainer = createCellContainer(scene).setOrigin(0);
        }

        cellContainer.setMinWidth(cell.width);
        cellContainer.getElement("content").setText(cell.item.content);

        // Layout manually, to get cell height
        cellContainer
          .setDirty(true)
          .layout() // Run layout manually
          .setDirty(false); // Don't run layout again

        cell.height = cellContainer.height;

        return cellContainer;
      },
      items: [],
    })
      .setOrigin(0, 1)
      .layout();
  }

  addMessage(message: string) {
    Phaser.Utils.Array.Add(this.gridTable.items, { content: message }, 50);
    this.gridTable.refresh();
  }
}

const createCellContainer = function (scene: Phaser.Scene) {
  return new Sizer(scene, {
    orientation: "x",
    space: { left: 0, right: 0, top: 0, bottom: 0, item: 0 },
  }).add(
    WrapExpandText(scene.add.text(0, 0, "")),
    1,
    "center",
    0,
    false,
    "content"
  );
};
