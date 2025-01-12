-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceReview" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,

    CONSTRAINT "PerformanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignmentId" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
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
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "PerformanceReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

INSERT INTO "User" VALUES('cm5t54zgt0000ymhuvq2g3mhs','Wintheiser@eureka.co','Maxie Wintheiser','$2a$10$jCGMPxqfCLCImSp4qms6pOquPKSOa4J/RDBVWCLz9TU8MmytQtv1m',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "User" VALUES('cm5t54zgx0001ymhux5525bkh','Wiegand@eureka.co','Shanna Wiegand','$2a$10$Qs3mKzetZYzmodUJ/hCQCO93k7x8.bU7SM4kNwtCJwZkasFirMvV6',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "User" VALUES('cm5t54zgz0002ymhuhk55ygfx','Kohler@eureka.co','Gavin Kohler','$2a$10$gAItAgTiOjeSEHmQOcADxuzYi2NXXT38tM0AbWsgqB3vB2PlDLCUe',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "User" VALUES('cm5t54zh10003ymhufziezbif','Hauck@eureka.co','Rosanna Hauck','$2a$10$i8IUEr9M5ZgpZM9/2yV/Wu32EwOlw92.KZzmpw60xwlY4Ff2Mqn3W',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "User" VALUES('cm5t54zh30004ymhun1n4v14q','Leffler@eureka.co','Lura Leffler','$2a$10$x9gms.UpzusbMQkkcoD6UOcYbmfFnKt6YVng.7oNNCeHvuzt96gMW',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "User" VALUES('cm5t54zjt0005ymhutporbiab','admin@eureka.co','Admin','$2a$10$xMeIvdy76T2NlPoGYPsoaOknadGwrFiYq6wdsbUXx9GnEnDWrTvO6',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "PerformanceReview" VALUES('cm5t54zju000eymhuo0ks88jo','Review for Maxie Wintheiser','Aranea tondeo casus vorax saepe absum sollicito benevolentia solio aqua. Spiculum comes cavus viduo. Deripio demergo teres asporto.',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'cm5t54zjt0005ymhutporbiab','cm5t54zgt0000ymhuvq2g3mhs');
INSERT INTO "PerformanceReview" VALUES('cm5t54zju000aymhuqgnzf8ov','Review for Shanna Wiegand','Victoria tergeo umerus theatrum crastinus vetus baiulus creta. Congregatio speculum vitium summisse succurro velum ut decumbo candidus. Inventore possimus viridis advenio carcer cavus alter aut beneficium ventosus.',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'cm5t54zjt0005ymhutporbiab','cm5t54zgx0001ymhux5525bkh');
INSERT INTO "PerformanceReview" VALUES('cm5t54zjt0006ymhu1ejuy6vd','Review for Rosanna Hauck','Coniecto desparatus sint abutor admiratio bis praesentium tolero alii. Ullus iure suscipio conicio apto admoveo callide. Victoria valde conqueror spiritus aqua.',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'cm5t54zjt0005ymhutporbiab','cm5t54zh10003ymhufziezbif');

INSERT INTO "Assignment" VALUES('cm5t54zju000gymhu6i8rzhw4',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'cm5t54zju000eymhuo0ks88jo','cm5t54zgx0001ymhux5525bkh');
INSERT INTO "Assignment" VALUES('cm5t54zju000fymhun9rbwr6y',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'cm5t54zju000eymhuo0ks88jo','cm5t54zgz0002ymhuhk55ygfx');
INSERT INTO "Assignment" VALUES('cm5t54zju000dymhuy8ggu8eh',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'cm5t54zju000aymhuqgnzf8ov','cm5t54zh10003ymhufziezbif');
INSERT INTO "Assignment" VALUES('cm5t54zju000bymhuc33pfnuz',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'cm5t54zju000aymhuqgnzf8ov','cm5t54zh30004ymhun1n4v14q');
INSERT INTO "Assignment" VALUES('cm5t54zju0008ymhu4rarbf5i',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'cm5t54zjt0006ymhu1ejuy6vd','cm5t54zgt0000ymhuvq2g3mhs');
INSERT INTO "Assignment" VALUES('cm5t54zjt0007ymhu2fmsegvx',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'cm5t54zjt0006ymhu1ejuy6vd','cm5t54zh10003ymhufziezbif');

INSERT INTO "Feedback" VALUES('cm5t54zju000cymhuown1rv2h','Denego coruscus delectatio odio trans nihil supellex quae. Clementia vis tristis vehemens. Natus solutio altus pauci quae suppono comparo acer.',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'cm5t54zju000bymhuc33pfnuz');
INSERT INTO "Feedback" VALUES('cm5t54zju0009ymhuczdirvrr','Aequus audentia corroboro. Decimus audio facilis vilitas audeo. Cenaculum eligendi alii tremo clibanus ago sperno.',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'cm5t54zju0008ymhu4rarbf5i');

INSERT INTO "_RoleToUser" VALUES('cm5s847pp000hymfbcieyfxbh','cm5t54zgt0000ymhuvq2g3mhs');
INSERT INTO "_RoleToUser" VALUES('cm5s847pp000hymfbcieyfxbh','cm5t54zgx0001ymhux5525bkh');
INSERT INTO "_RoleToUser" VALUES('cm5s847pp000hymfbcieyfxbh','cm5t54zgz0002ymhuhk55ygfx');
INSERT INTO "_RoleToUser" VALUES('cm5s847pp000hymfbcieyfxbh','cm5t54zh10003ymhufziezbif');
INSERT INTO "_RoleToUser" VALUES('cm5s847pp000hymfbcieyfxbh','cm5t54zh30004ymhun1n4v14q');
INSERT INTO "_RoleToUser" VALUES('cm5s847pl000gymfb7cziw75v','cm5t54zjt0005ymhutporbiab');

