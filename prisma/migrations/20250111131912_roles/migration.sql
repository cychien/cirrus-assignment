-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "roleId" TEXT,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- Manual Migration
INSERT INTO Permission VALUES('cm5s847ob0000ymfb76cf7t5e','create','user','own',1736602208219,1736602208219);
INSERT INTO Permission VALUES('cm5s847oh0001ymfb446mkd3j','create','user','any',1736602208225,1736602208225);
INSERT INTO Permission VALUES('cm5s847ok0002ymfbm1x46ikn','read','user','own',1736602208228,1736602208228);
INSERT INTO Permission VALUES('cm5s847on0003ymfbals0wh3z','read','user','any',1736602208231,1736602208231);
INSERT INTO Permission VALUES('cm5s847oq0004ymfbap52s5q3','update','user','own',1736602208235,1736602208235);
INSERT INTO Permission VALUES('cm5s847ou0005ymfbp3e30gnn','update','user','any',1736602208238,1736602208238);
INSERT INTO Permission VALUES('cm5s847ox0006ymfbocl2f8vp','delete','user','own',1736602208241,1736602208241);
INSERT INTO Permission VALUES('cm5s847oz0007ymfbinj8py4j','delete','user','any',1736602208243,1736602208243);
INSERT INTO Permission VALUES('cm5s847p10008ymfbt1zi5uqu','create','reviews','own',1736602208246,1736602208246);
INSERT INTO Permission VALUES('cm5s847p30009ymfbev8mhf5f','create','reviews','any',1736602208248,1736602208248);
INSERT INTO Permission VALUES('cm5s847p6000aymfblwgg8jpc','read','reviews','own',1736602208250,1736602208250);
INSERT INTO Permission VALUES('cm5s847p8000bymfb0evu47wu','read','reviews','any',1736602208252,1736602208252);
INSERT INTO Permission VALUES('cm5s847pa000cymfbeb2petsu','update','reviews','own',1736602208254,1736602208254);
INSERT INTO Permission VALUES('cm5s847pc000dymfbamxizzk8','update','reviews','any',1736602208256,1736602208256);
INSERT INTO Permission VALUES('cm5s847pf000eymfbl11hs2s2','delete','reviews','own',1736602208259,1736602208259);
INSERT INTO Permission VALUES('cm5s847ph000fymfb9kwh76o8','delete','reviews','any',1736602208261,1736602208261);

INSERT INTO Role VALUES('cm5s847pl000gymfb7cziw75v','admin',1736602208265,1736602208265);
INSERT INTO Role VALUES('cm5s847pp000hymfbcieyfxbh','employee',1736602208269,1736602208269);

INSERT INTO _PermissionToRole VALUES('cm5s847oh0001ymfb446mkd3j','cm5s847pl000gymfb7cziw75v');
INSERT INTO _PermissionToRole VALUES('cm5s847on0003ymfbals0wh3z','cm5s847pl000gymfb7cziw75v');
INSERT INTO _PermissionToRole VALUES('cm5s847ou0005ymfbp3e30gnn','cm5s847pl000gymfb7cziw75v');
INSERT INTO _PermissionToRole VALUES('cm5s847oz0007ymfbinj8py4j','cm5s847pl000gymfb7cziw75v');
INSERT INTO _PermissionToRole VALUES('cm5s847p30009ymfbev8mhf5f','cm5s847pl000gymfb7cziw75v');
INSERT INTO _PermissionToRole VALUES('cm5s847p8000bymfb0evu47wu','cm5s847pl000gymfb7cziw75v');
INSERT INTO _PermissionToRole VALUES('cm5s847pc000dymfbamxizzk8','cm5s847pl000gymfb7cziw75v');
INSERT INTO _PermissionToRole VALUES('cm5s847ph000fymfb9kwh76o8','cm5s847pl000gymfb7cziw75v');
INSERT INTO _PermissionToRole VALUES('cm5s847ob0000ymfb76cf7t5e','cm5s847pp000hymfbcieyfxbh');
INSERT INTO _PermissionToRole VALUES('cm5s847ok0002ymfbm1x46ikn','cm5s847pp000hymfbcieyfxbh');
INSERT INTO _PermissionToRole VALUES('cm5s847oq0004ymfbap52s5q3','cm5s847pp000hymfbcieyfxbh');
INSERT INTO _PermissionToRole VALUES('cm5s847ox0006ymfbocl2f8vp','cm5s847pp000hymfbcieyfxbh');
INSERT INTO _PermissionToRole VALUES('cm5s847p10008ymfbt1zi5uqu','cm5s847pp000hymfbcieyfxbh');
INSERT INTO _PermissionToRole VALUES('cm5s847p6000aymfblwgg8jpc','cm5s847pp000hymfbcieyfxbh');
INSERT INTO _PermissionToRole VALUES('cm5s847pa000cymfbeb2petsu','cm5s847pp000hymfbcieyfxbh');
INSERT INTO _PermissionToRole VALUES('cm5s847pf000eymfbl11hs2s2','cm5s847pp000hymfbcieyfxbh'); 

