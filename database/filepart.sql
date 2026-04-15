CREATE TABLE `filepart` (
  `fileId` varchar(50) NOT NULL,
  `filepath` varchar(1000) NOT NULL,
  `filepart` int(11) NOT NULL,
  `parts` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
