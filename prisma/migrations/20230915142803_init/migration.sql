/*
  Warnings:

  - You are about to drop the column `interest` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_UserKeyword` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_UserKeyword` DROP FOREIGN KEY `_UserKeyword_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserKeyword` DROP FOREIGN KEY `_UserKeyword_B_fkey`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `interest`;

-- DropTable
DROP TABLE `_UserKeyword`;

-- CreateTable
CREATE TABLE `Interest` (
    `id` VARCHAR(191) NOT NULL,
    `interest` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Interest_id_key`(`id`),
    UNIQUE INDEX `Interest_interest_key`(`interest`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserInterest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `interestId` VARCHAR(191) NOT NULL,
    `keywordId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserInterest_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_InterestToKeyword` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_InterestToKeyword_AB_unique`(`A`, `B`),
    INDEX `_InterestToKeyword_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserInterest` ADD CONSTRAINT `UserInterest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserInterest` ADD CONSTRAINT `UserInterest_interestId_fkey` FOREIGN KEY (`interestId`) REFERENCES `Interest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserInterest` ADD CONSTRAINT `UserInterest_keywordId_fkey` FOREIGN KEY (`keywordId`) REFERENCES `Keyword`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_InterestToKeyword` ADD CONSTRAINT `_InterestToKeyword_A_fkey` FOREIGN KEY (`A`) REFERENCES `Interest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_InterestToKeyword` ADD CONSTRAINT `_InterestToKeyword_B_fkey` FOREIGN KEY (`B`) REFERENCES `Keyword`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
