-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "isRevealManito" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Group" ("id", "name", "password") SELECT "id", "name", "password" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
