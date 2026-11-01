-- -------------------------------------------------------------
-- Database: egpbtcappdb (BTC Web Portal Database)
-- Generated for BTC Web Portal
-- -------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `egpbtcappdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `egpbtcappdb`;

SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------
-- Table structure for `users`
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `verifyOtp` VARCHAR(191) NOT NULL DEFAULT '',
    `verifyOtpExpireAt` BIGINT NOT NULL DEFAULT 0,
    `isAccountVerified` BOOLEAN NOT NULL DEFAULT false,
    `resetOtp` VARCHAR(191) NOT NULL DEFAULT '',
    `resetOtpExpireAt` BIGINT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `image` VARCHAR(191) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table structure for `notices`
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `notices`;
CREATE TABLE `notices` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NULL,
    `category` ENUM('LTM', 'OTM', 'LOTTERY_PENDING', 'LOTTERY_RESULT') NOT NULL DEFAULT 'LTM',
    `authorId` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `publishDate` DATETIME(3) NULL,
    `lastDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `tableData` LONGTEXT NULL,
    `type` ENUM('FILE', 'TEXT', 'TABLE') NOT NULL DEFAULT 'FILE',
    `year` VARCHAR(191) NULL,
    `lotteryDate` DATETIME(3) NULL,

    INDEX `notices_createdAt_idx`(`createdAt` DESC),
    INDEX `notices_authorId_fkey`(`authorId`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table structure for `winner_lists`
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `winner_lists`;
CREATE TABLE `winner_lists` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `publishDate` DATETIME(3) NULL,
    `lastDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `winner_lists_createdAt_idx`(`createdAt` DESC),
    INDEX `winner_lists_authorId_fkey`(`authorId`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Foreign Keys
-- -------------------------------------------------------------
ALTER TABLE `notices` ADD CONSTRAINT `notices_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE `winner_lists` ADD CONSTRAINT `winner_lists_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
