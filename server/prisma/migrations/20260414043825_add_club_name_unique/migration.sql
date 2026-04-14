/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `clubs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "clubs_name_key" ON "clubs"("name");
