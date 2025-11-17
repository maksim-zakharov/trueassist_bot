import React from "react";
import {Button} from "./button.tsx";
import {useLocation, useNavigate} from "react-router-dom";

export const Navbar = ({menuItems}) => {
    const location = useLocation();
    const navigate = useNavigate()

    return <div
        className="menu-container separator-shadow-top flex justify-around items-center [backdrop-filter:blur(5px)] card-bg-color-transparency">
        {menuItems.map(({icon: Icon, label, path}) => (
            <Button
                key={path}
                variant="ghost"
                className="flex flex-col items-center h-auto py-1 gap-1 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 hover:bg-transparent active:bg-transparent"
                onClick={() => navigate(path)}
            >
                <Icon
                    className={`h-[22px] w-[22px] ${location.pathname === path ? 'text-tg-theme-button-color' : 'text-tg-theme-subtitle-text-color'}`}
                />
                <span
                    className={`text-[10px] font-medium ${location.pathname === path ? 'text-tg-theme-button-color' : 'text-tg-theme-subtitle-text-color'}`}
                >
                  {label}
                </span>
            </Button>
        ))}
    </div>
}