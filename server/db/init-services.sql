-- Вставка базовых услуг
INSERT INTO "BaseService" (name) VALUES
('Уборка'),
('Химчистка');

-- Вставка вариантов услуг для Уборки (baseServiceId = 1)
INSERT INTO "ServiceVariant" ("nameAccusative", "basePrice", duration, "baseServiceId", "icon", "name") VALUES
('Поддерживающая', 3000, 120, 1, 'shield-check', 'Maintenance'),
('Генеральная', 5000, 240, 1, 'sparkles', 'Deep'),
('После ремонта', 6000, 300, 1, 'hammer', 'Post-Renovation'),
('Уборка коттеджей', 8000, 180, 1, 'home', 'Cottage'),
('Коммерческие помещения', 10000, 240, 1, 'building', 'Commercial Spaces');

-- Вставка опций для Уборки (baseServiceId = 1)
INSERT INTO "ServiceOption" (name, price, duration, "isPopular", "baseServiceId") VALUES
('Мытье окон', 500, 30, true, 1),
('Глажка белья', 700, 45, true, 1),
('Уборка холодильника', 300, 15, false, 1),
('Уборка кошачьего лотка', 200, 15, false, 1),
('Уборка балкона', 800, 45, false, 1);

-- Вставка вариантов услуг для Химчистки (baseServiceId = 2)
INSERT INTO "ServiceVariant" ("nameAccusative", "basePrice", duration, "baseServiceId", "icon", "name") VALUES
('Химчистка и стирка одежды', 2000, 120, 2, 'shirt', 'Dry Cleaning & Laundry'),
('Чистка ковров', 2500, 60, 2, 'layers', 'Carpet Cleaning'),
('Химчистка мебели', 3500, 90, 2, 'armchair', 'Upholstery'),
('Чистка и ремонт обуви', 1500, 45, 2, 'footprints', 'Shoe Cleaning & Repair');

-- Вставка опций для Химчистки (baseServiceId = 2)
INSERT INTO "ServiceOption" (name, price, duration, "isPopular", "baseServiceId") VALUES
('Срочная чистка', 500, 30, true, 2),
('Выведение пятен', 300, 20, true, 2),
('Дезодорация', 400, 15, false, 2),
('Защитное покрытие', 600, 25, true, 2),
('Глубокая чистка', 800, 45, true, 2),
('Удаление аллергенов', 500, 30, false, 2);