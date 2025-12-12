import React, { useState } from "react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet.tsx";
import { Typography } from "./ui/Typography.tsx";

// Функция для преобразования camelCase в kebab-case
const toKebabCase = (str: string): string => {
    if (!str) return str;
    // Если уже в kebab-case (содержит дефис), возвращаем как есть
    if (str.includes('-')) {
        return str.toLowerCase();
    }
    // Преобразуем camelCase в kebab-case
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Добавляем дефис перед заглавной буквой
        .toLowerCase();
};

// Используем полный список всех иконок из lucide-react
// iconNames экспортируется из lucide-react/dynamic и содержит все доступные иконки в kebab-case
const ALL_ICONS = (iconNames as string[])
    .filter(icon => icon && icon.trim().length > 0)
    .sort();

interface IconButtonProps {
    iconName: string;
    isSelected: boolean;
    onSelect: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({ iconName, isSelected, onSelect }) => {
    // iconName уже в kebab-case для DynamicIcon
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`
                p-3 rounded-lg transition-all
                hover:bg-tg-theme-secondary-bg-color
                active:scale-95
                flex items-center justify-center
                min-h-[60px] w-full
                ${isSelected 
                    ? "bg-tg-theme-button-color/10" 
                    : ""
                }
            `}
            title={iconName}
        >
            <DynamicIcon 
                name={iconName} 
                className={`w-6 h-6 flex-shrink-0 ${
                    isSelected 
                        ? "text-tg-theme-button-color" 
                        : "text-tg-theme-text-color"
                }`}
                strokeWidth={1.5}
            />
        </button>
    );
};

interface IconPickerProps {
    value?: string;
    onChange: (iconName: string) => void;
    label?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, label = "Icon" }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filteredIcons = React.useMemo(() => {
        const query = searchQuery.toLowerCase();
        const filtered = ALL_ICONS.filter(icon =>
            icon && icon.includes(query)
        );
        return filtered;
    }, [searchQuery]);

    const handleIconSelect = (iconName: string) => {
        // Сохраняем в kebab-case для DynamicIcon
        onChange(iconName);
        setIsOpen(false);
        setSearchQuery("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setSearchQuery("");
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-tg-theme-text-color">{label}</label>
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                {/* Кнопка/иконка для открытия выбора */}
                <SheetTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start gap-2 relative h-10 px-3"
                    >
                        {value ? (
                            <>
                                <DynamicIcon name={toKebabCase(value)} className="w-4 h-4" />
                                <span className="flex-1 text-left">{value}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClear(e);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-tg-theme-secondary-bg-color rounded transition-colors"
                                    title="Clear icon"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <span className="text-tg-theme-hint-color">Select icon</span>
                        )}
                    </Button>
                </SheetTrigger>

                {/* Шторка с сеткой иконок */}
                <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold text-tg-theme-text-color text-left">
                            Select icon
                        </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex flex-col gap-4 mt-4 h-full overflow-hidden">
                        {/* Поиск */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tg-theme-hint-color" />
                            <Input
                                type="text"
                                placeholder="Search icon..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Сетка иконок с прокруткой */}
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {filteredIcons.length > 0 ? (
                                <>
                                    <div className="text-xs text-tg-theme-hint-color mb-2">
                                        Found: {filteredIcons.length} icons
                                    </div>
                                    <div className="grid grid-cols-6 gap-3 pb-4">
                                        {filteredIcons.map((iconName) => (
                                            <IconButton
                                                key={iconName}
                                                iconName={iconName}
                                                isSelected={value ? toKebabCase(value) === iconName : false}
                                                onSelect={() => handleIconSelect(iconName)}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-tg-theme-hint-color py-8">
                                    <div>No icons found</div>
                                    <div className="text-xs mt-2">Total icons: {ALL_ICONS.length}</div>
                                    <div className="text-xs">Filtered: {filteredIcons.length}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

