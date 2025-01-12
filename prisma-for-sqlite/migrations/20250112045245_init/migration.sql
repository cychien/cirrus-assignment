-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PerformanceReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    CONSTRAINT "PerformanceReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PerformanceReview_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reviewId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    CONSTRAINT "Assignment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "PerformanceReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assignment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assignmentId" TEXT NOT NULL,
    CONSTRAINT "Feedback_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceReview_revieweeId_key" ON "PerformanceReview"("revieweeId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_assignmentId_key" ON "Feedback"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- Manual Migration
INSERT INTO "Permission" VALUES('cm5s847ob0000ymfb76cf7t5e','create','user','own',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847oh0001ymfb446mkd3j','create','user','any',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847ok0002ymfbm1x46ikn','read','user','own',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847on0003ymfbals0wh3z','read','user','any',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847oq0004ymfbap52s5q3','update','user','own',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847ou0005ymfbp3e30gnn','update','user','any',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847ox0006ymfbocl2f8vp','delete','user','own',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847oz0007ymfbinj8py4j','delete','user','any',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847p10008ymfbt1zi5uqu','create','review','own',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847p30009ymfbev8mhf5f','create','review','any',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847p6000aymfblwgg8jpc','read','review','own',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847p8000bymfb0evu47wu','read','review','any',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847pa000cymfbeb2petsu','update','review','own',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847pc000dymfbamxizzk8','update','review','any',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847pf000eymfbl11hs2s2','delete','review','own',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Permission" VALUES('cm5s847ph000fymfb9kwh76o8','delete','review','any',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Role" VALUES('cm5s847pl000gymfb7cziw75v','admin',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "Role" VALUES('cm5s847pp000hymfbcieyfxbh','employee',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "_PermissionToRole" VALUES('cm5s847oh0001ymfb446mkd3j','cm5s847pl000gymfb7cziw75v');
INSERT INTO "_PermissionToRole" VALUES('cm5s847on0003ymfbals0wh3z','cm5s847pl000gymfb7cziw75v');
INSERT INTO "_PermissionToRole" VALUES('cm5s847ou0005ymfbp3e30gnn','cm5s847pl000gymfb7cziw75v');
INSERT INTO "_PermissionToRole" VALUES('cm5s847oz0007ymfbinj8py4j','cm5s847pl000gymfb7cziw75v');
INSERT INTO "_PermissionToRole" VALUES('cm5s847p30009ymfbev8mhf5f','cm5s847pl000gymfb7cziw75v');
INSERT INTO "_PermissionToRole" VALUES('cm5s847p8000bymfb0evu47wu','cm5s847pl000gymfb7cziw75v');
INSERT INTO "_PermissionToRole" VALUES('cm5s847pc000dymfbamxizzk8','cm5s847pl000gymfb7cziw75v');
INSERT INTO "_PermissionToRole" VALUES('cm5s847ph000fymfb9kwh76o8','cm5s847pl000gymfb7cziw75v');
INSERT INTO "_PermissionToRole" VALUES('cm5s847ob0000ymfb76cf7t5e','cm5s847pp000hymfbcieyfxbh');
INSERT INTO "_PermissionToRole" VALUES('cm5s847ok0002ymfbm1x46ikn','cm5s847pp000hymfbcieyfxbh');
INSERT INTO "_PermissionToRole" VALUES('cm5s847oq0004ymfbap52s5q3','cm5s847pp000hymfbcieyfxbh');
INSERT INTO "_PermissionToRole" VALUES('cm5s847ox0006ymfbocl2f8vp','cm5s847pp000hymfbcieyfxbh');
INSERT INTO "_PermissionToRole" VALUES('cm5s847p10008ymfbt1zi5uqu','cm5s847pp000hymfbcieyfxbh');
INSERT INTO "_PermissionToRole" VALUES('cm5s847p6000aymfblwgg8jpc','cm5s847pp000hymfbcieyfxbh');
INSERT INTO "_PermissionToRole" VALUES('cm5s847pa000cymfbeb2petsu','cm5s847pp000hymfbcieyfxbh');
INSERT INTO "_PermissionToRole" VALUES('cm5s847pf000eymfbl11hs2s2','cm5s847pp000hymfbcieyfxbh'); 
